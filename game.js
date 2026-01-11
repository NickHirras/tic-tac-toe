const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let scale;

function setCanvasSize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    scale = canvas.width / 600;
}

setCanvasSize();
window.addEventListener('resize', () => { setCanvasSize(); render(); });
const singleBtn = document.getElementById('single-player');
const twoBtn = document.getElementById('two-player');
const status = document.getElementById('status');
const gameButtons = document.getElementById('game-buttons');
const playAgainBtn = document.getElementById('play-again');
const resetBtn = document.getElementById('reset');

const audioContext = new AudioContext();

function playBeep(frequency = 440, duration = 0.2) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameMode = null;
let gameOver = false;
let humanTurn = true;
let difficulty = 1; // 0=easy, 1=medium, 2=hard
let gameHistory = []; // Array of last 10 outcomes: 'win', 'loss', 'draw' from human perspective

function loadFromStorage() {
    const savedDifficulty = localStorage.getItem('ticTacToeDifficulty');
    const savedHistory = localStorage.getItem('ticTacToeHistory');
    if (savedDifficulty !== null) {
        difficulty = parseInt(savedDifficulty, 10);
    }
    if (savedHistory !== null) {
        gameHistory = JSON.parse(savedHistory);
    }
}

function saveToStorage() {
    localStorage.setItem('ticTacToeDifficulty', difficulty.toString());
    localStorage.setItem('ticTacToeHistory', JSON.stringify(gameHistory));
}

loadFromStorage(); // Load data on startup

function drawGrid() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, scale * 200);
    ctx.lineTo(canvas.width, scale * 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, scale * 400);
    ctx.lineTo(canvas.width, scale * 400);
    ctx.stroke();
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(scale * 200, 0);
    ctx.lineTo(scale * 200, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(scale * 400, 0);
    ctx.lineTo(scale * 400, canvas.height);
    ctx.stroke();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (let i = 0; i < 9; i++) {
        if (board[i]) {
            const x = (i % 3) * scale * 200 + scale * 100;
            const y = Math.floor(i / 3) * scale * 200 + scale * 125;
            ctx.font = `bold ${scale * 100}px monospace`;
            ctx.fillStyle = '#00FF00';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 5;
            ctx.fillText(board[i], x - scale * 25, y);
            ctx.shadowBlur = 0; // reset
        }
    }
}

function checkWin() {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let win of wins) {
        if (board[win[0]] && board[win[0]] === board[win[1]] && board[win[1]] === board[win[2]]) {
            return win;
        }
    }
    return false;
}

function drawWinLine(win, duration = 1000) {
    const start = win[0];
    const end = win[2];
    const startX = (start % 3) * scale * 200 + scale * 100;
    const startY = Math.floor(start / 3) * scale * 200 + scale * 100;
    const endX = (end % 3) * scale * 200 + scale * 100;
    const endY = Math.floor(end / 3) * scale * 200 + scale * 100;
    let progress = 0;
    const animate = () => {
        progress += 16 / duration;
        if (progress > 1) progress = 1;
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
}

function evaluateBoard(board) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let win of wins) {
        if (board[win[0]] && board[win[0]] === board[win[1]] && board[win[1]] === board[win[2]]) {
            return board[win[0]] === 'O' ? 10 : -10; // AI wins: +10, Human wins: -10
        }
    }
    return 0; // Draw or ongoing
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    const score = evaluateBoard(board);
    if (score !== 0 || depth === 0 || board.every(cell => cell !== null)) {
        return score;
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                const eval = minimax(board, depth - 1, false, alpha, beta);
                board[i] = null;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                const eval = minimax(board, depth - 1, true, alpha, beta);
                board[i] = null;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function getBestMove(board) {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            const score = minimax(board, 9, false, -Infinity, Infinity);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function getAiMove(board, difficulty) {
    let available = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) available.push(i);
    }
    if (available.length === 0) return -1;

    if (difficulty === 0) {
        // Easy: random move
        return available[Math.floor(Math.random() * available.length)];
    } else if (difficulty === 1) {
        // Medium: 50% chance optimal, 50% random
        if (Math.random() < 0.5) {
            return getBestMove(board);
        } else {
            return available[Math.floor(Math.random() * available.length)];
        }
    } else {
        // Hard: always optimal
        return getBestMove(board);
    }
}

function aiMove() {
    let available = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) available.push(i);
    }
    if (available.length > 0) {
        const move = getAiMove(board, difficulty);
        board[move] = 'O';
        playBeep(550);
        render();
        const win = checkWin();
        if (win) {
            gameOver = true;
            status.textContent = 'Computer wins!';
            drawWinLine(win);
            gameButtons.style.display = 'block';
            updateGameHistory('loss');
            adjustDifficulty();
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            status.textContent = 'Draw!';
            gameButtons.style.display = 'block';
            updateGameHistory('draw');
            adjustDifficulty();
        } else {
            currentPlayer = 'X';
            status.textContent = `Player's turn (${getDifficultyText()} difficulty)`;
            humanTurn = true;
        }
    }
}

function updateGameHistory(outcome) {
    gameHistory.push(outcome);
    if (gameHistory.length > 10) {
        gameHistory.shift();
    }
    saveToStorage();
}

function calculateWinRate() {
    if (gameHistory.length === 0) return 0;
    const wins = gameHistory.filter(o => o === 'win').length;
    return wins / gameHistory.length;
}

function adjustDifficulty() {
    const winRate = calculateWinRate();
    if (winRate > 0.7 && difficulty < 2) {
        difficulty++;
        saveToStorage();
    } else if (winRate < 0.3 && difficulty > 0) {
        difficulty--;
        saveToStorage();
    }
}

function getDifficultyText() {
    return ['Easy', 'Medium', 'Hard'][difficulty];
}

canvas.addEventListener('click', (e) => {
    if (gameOver || !gameMode || (!humanTurn && gameMode === 'single')) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = scale * 200;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const index = cellY * 3 + cellX;
    if (board[index] === null) {
        board[index] = currentPlayer;
        playBeep();
        render();
        const win = checkWin();
        if (win) {
            gameOver = true;
            status.textContent = `${currentPlayer} wins!`;
            drawWinLine(win);
            gameButtons.style.display = 'block';
            updateGameHistory('win');
            adjustDifficulty();
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            status.textContent = 'Draw!';
            gameButtons.style.display = 'block';
            updateGameHistory('draw');
            adjustDifficulty();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (gameMode === 'single' && currentPlayer === 'O') {
                humanTurn = false;
                status.textContent = 'Computer is thinking...';
                setTimeout(aiMove, 1000);
            } else {
                status.textContent = `Player's turn (${getDifficultyText()} difficulty)`;
            }
        }
    }
});

singleBtn.addEventListener('click', () => {
    gameMode = 'single';
    saveToStorage();
    startGame();
});

twoBtn.addEventListener('click', () => {
    gameMode = 'two';
    startGame();
});

function startGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    humanTurn = true;
    if (audioContext.state === 'suspended') audioContext.resume();
    render();
    status.textContent = `Player's turn (${getDifficultyText()} difficulty)`;
    document.getElementById('mode-selection').style.display = 'none';
    gameButtons.style.display = 'none';
}

playAgainBtn.addEventListener('click', () => {
    startGame();
});

resetBtn.addEventListener('click', () => {
    document.getElementById('mode-selection').style.display = 'block';
    gameButtons.style.display = 'none';
    status.textContent = 'Select mode to begin.';
    gameMode = null;
    difficulty = 1;
    gameHistory = [];
    saveToStorage();
});
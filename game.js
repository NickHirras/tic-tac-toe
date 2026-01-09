const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const singleBtn = document.getElementById('single-player');
const twoBtn = document.getElementById('two-player');
const status = document.getElementById('status');
const reset = document.getElementById('reset');

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

function drawGrid() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(600, 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(600, 400);
    ctx.stroke();
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 600);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.stroke();
}

function render() {
    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    for (let i = 0; i < 9; i++) {
        if (board[i]) {
            const x = (i % 3) * 200 + 100;
            const y = Math.floor(i / 3) * 200 + 125;
            ctx.font = 'bold 100px monospace';
            ctx.fillStyle = '#00FF00';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 5;
            ctx.fillText(board[i], x - 25, y);
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
    const startX = (start % 3) * 200 + 100;
    const startY = Math.floor(start / 3) * 200 + 100;
    const endX = (end % 3) * 200 + 100;
    const endY = Math.floor(end / 3) * 200 + 100;
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

function aiMove() {
    let available = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) available.push(i);
    }
    if (available.length > 0) {
        const move = available[Math.floor(Math.random() * available.length)];
        board[move] = 'O';
        playBeep(550);
        render();
        const win = checkWin();
        if (win) {
            gameOver = true;
            status.textContent = 'Computer wins!';
            drawWinLine(win);
            reset.style.display = 'block';
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            status.textContent = 'Draw!';
            reset.style.display = 'block';
        } else {
            currentPlayer = 'X';
            status.textContent = "Player's turn";
            humanTurn = true;
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameOver || !gameMode || (!humanTurn && gameMode === 'single')) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellX = Math.floor(x / 200);
    const cellY = Math.floor(y / 200);
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
            reset.style.display = 'block';
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            status.textContent = 'Draw!';
            reset.style.display = 'block';
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (gameMode === 'single' && currentPlayer === 'O') {
                humanTurn = false;
                status.textContent = 'Computer is thinking...';
                setTimeout(aiMove, 1000);
            } else {
                status.textContent = `${currentPlayer}'s turn`;
            }
        }
    }
});

singleBtn.addEventListener('click', () => {
    gameMode = 'single';
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
    status.textContent = "Player's turn";
    document.getElementById('mode-selection').style.display = 'none';
    reset.style.display = 'none';
}

reset.addEventListener('click', () => {
    document.getElementById('mode-selection').style.display = 'block';
    reset.style.display = 'none';
    status.textContent = 'Select mode to begin.';
    gameMode = null;
});
# How the CPU AI Works

This document explains the logic behind the "Single Player" mode in this Tic-Tac-Toe game.

## 1. The Core Brain: Minimax Algorithm
The AI uses the **Minimax algorithm** to determine its moves. Minimax is a recursive strategy used in two-player games to find the optimal move by simulating all possible future game states.

- **How it works**: The AI simulates every possible move it could make, followed by every possible response from the human player, and so on, until the game reaches an end (win, loss, or draw).
- **Scoring**:
  - **+10**: The AI wins.
  - **-10**: The human player wins.
  - **0**: The game is a draw.
- **Alpha-Beta Pruning**: To ensure the game runs smoothly, the algorithm uses Alpha-Beta pruning. This optimization allows the AI to stop exploring "branches" of the game tree once it's clear they are worse than options already discovered.

## 2. Difficulty Levels
The AI's intelligence is adjusted based on the current difficulty setting:

| Difficulty Level | Name | Technical Logic |
| :--- | :--- | :--- |
| **0** | **Easy** | Picks a random available square. |
| **1** | **Medium** | 50% chance to play the optimal Minimax move; 50% chance to pick randomly. |
| **2** | **Hard** | Always plays the optimal Minimax move. It is mathematically impossible to beat the AI in this mode. |

## 3. Dynamic Difficulty Adjustment (Adaptive AI)
The game monitors your performance to keep the gameplay engaging. After every game, the `adjustDifficulty` function checks your win rate over the last 10 matches:

- **Promoting**: If your win rate is above **70%**, the difficulty level increases.
- **Demoting**: If your win rate falls below **30%**, the difficulty level decreases.

## 4. Implementation Details
The AI logic is primarily contained within the following functions in `game.js`:
- `minimax()`: The recursive engine.
- `getBestMove()`: The entry point for the Minimax calculation.
- `getAiMove()`: Decides whether to use Minimax or random logic based on difficulty.
- `aiMove()`: Handles the high-level flow (thinking delay, making the move, checking for win).

---
*Refer to [game.js](file:///home/nick/Work/tic-tac-toe/game.js) for the full source code.*

# tic-tac-toe

Play a vintage looking tic-tac-toe game in your browser. 1 player (you vs the computer), or 2 player modes available. This is a vanilla javascript app, using Canvas to draw the graphics, and includes simple sound effects.  Enjoy :)

[Click to play](https://nickhirras.github.io/tic-tac-toe/)

<img width="893" height="995" alt="image" src="https://github.com/user-attachments/assets/b8ef5b9f-28f0-458e-b26c-8b68d85cae62" />

## AI Player Logic

The AI for player 2 (the computer, playing as 'O') uses a minimax algorithm with alpha-beta pruning to determine optimal moves, adapted to three difficulty levels that adjust based on your win history.

**Core AI Components**

Board Evaluation (evaluateBoard): Assigns scores to board states:
- +10 if 'O' (AI) has a winning line
- -10 if 'X' (human) has a winning line  
- 0 for draws or ongoing games
  
Minimax Algorithm (minimax): Recursively explores all possible future game states to find the best move. It maximizes the AI's score while minimizing the human's potential score, using alpha-beta pruning to skip branches that won't improve the outcome.

Best Move Selection (getBestMove): Tests each available move by temporarily placing 'O', running minimax to score it, then selecting the highest-scoring move.

**Difficulty Levels**

Easy (0): Purely random move from available spots.
Medium (1): 50% chance to play the optimal move (via getBestMove), 50% random.
Hard (2): Always plays the optimal move using minimax.

**Adaptive Difficulty**

The AI tracks your last 10 game outcomes ('win', 'loss', 'draw' from your perspective). If your win rate exceeds 70%, difficulty increases; if below 30%, it decreases. This keeps games challenging but winnable.

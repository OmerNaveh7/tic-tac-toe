
## Entities and Game Flow

- **Game State**: Maintained on the server and includes:
  - **board**: An array of 9 cells (null if empty, 'X' or 'O' if occupied).
  - **currentTurn**: A value ('X' or 'O') indicating whose turn it is.
  - **players**: An object mapping socket IDs to their assigned symbol. The first two players are 'X' and 'O'; additional connections are spectators.
  - **gameOver** and **winner**: Flags to indicate if the game is over and who won.
  
- **Game Flow**:
  1. A client connects to the server and is assigned a symbol.
  2. The server sends the initial game state.
  3. A player clicks on a cell, emitting a `makeMove` event.
  4. The server validates the move (e.g., correct turn, cell is empty), updates the board, and checks for a win or tie.
  5. The updated state is broadcast to all connected clients.
  6. The game continues until a win or tie is reached.

## Checking Win Conditions

The server uses the `checkWin` function to iterate over all possible win patterns (rows, columns, and diagonals). If any pattern contains the same non-null symbol, that player is declared the winner. If all cells are filled and no win is detected, the game is declared a tie.

## How to Run the Game

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/tic-tac-toe.git
    cd tic-tac-toe
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start the server**:
    ```bash
    npm start
    ```

4. **Open the game in your browser**:
   - Navigate to `http://localhost:3000`
   - Open the URL in two different browser windows or tabs to simulate two players.

5. **Playing the Game**:
   - Click on an empty cell to make a move.
   - The game board will update in real-time across both players’ screens.
   - Use the "Reset Game" button to start a new game.

Enjoy playing Tic Tac Toe!

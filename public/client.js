const socket = io();
let mySymbol = null;

const statusDiv = document.getElementById('status');
const gameDiv = document.getElementById('game');
const resetButton = document.getElementById('reset');

// Create 9 cells for the board
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.setAttribute('data-index', i);
  cell.addEventListener('click', () => {
    socket.emit('makeMove', { index: i });
  });
  gameDiv.appendChild(cell);
}

// Listen for initial state from the server
socket.on('init', (data) => {
  mySymbol = data.symbol;
  updateBoard(data.board);
  updateStatus(data);
});

// Listen for state updates
socket.on('update', (gameState) => {
  updateBoard(gameState.board);
  updateStatus(gameState);
});

// Reset button sends a reset event to the server
resetButton.addEventListener('click', () => {
  socket.emit('resetGame');
});

function updateBoard(board) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.textContent = board[index] ? board[index] : '';
  });
}

function updateStatus(gameState) {
  // Count active players (only X and O)
  const activePlayers = Object.values(gameState.players || {}).filter(s => s === 'X' || s === 'O').length;
  
  if (activePlayers < 2) {
    statusDiv.textContent = "Waiting for a player to join...";
  } else if (gameState.gameOver) {
    statusDiv.textContent = gameState.winner === 'Tie' 
      ? "Game over: It's a tie!" 
      : `Game over: ${gameState.winner} wins!`;
  } else {
    if (mySymbol === 'spectator') {
      statusDiv.textContent = "Spectating game";
    } else {
      statusDiv.textContent = gameState.currentTurn === mySymbol ? "Your turn" : "Opponent's turn";
    }
  }
}

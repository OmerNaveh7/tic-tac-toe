const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Initialize game state
let gameState = {
  board: Array(9).fill(null),   // 9 cells for the board
  currentTurn: 'X',             // X always starts
  players: {},                  // Maps socket IDs to player symbols
  gameOver: false,
  winner: null
};

// Check win condition for the board
function checkWin(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Returns 'X' or 'O'
    }
  }
  return null;
}

function checkTie(board) {
  return board.every(cell => cell !== null);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Assign player symbol: first two players get 'X' and 'O', others are spectators
  if (!Object.values(gameState.players).includes('X')) {
    gameState.players[socket.id] = 'X';
  } else if (!Object.values(gameState.players).includes('O')) {
    gameState.players[socket.id] = 'O';
  } else {
    gameState.players[socket.id] = 'spectator';
  }
  
  // Send the initial game state and assigned symbol to the client
  socket.emit('init', { 
    board: gameState.board, 
    symbol: gameState.players[socket.id],
    currentTurn: gameState.currentTurn,
    gameOver: gameState.gameOver,
    winner: gameState.winner,
    players: gameState.players // include players info
  });
  
  // Broadcast updated state to all connected clients
  io.emit('update', gameState);
  
  // Handle move events from clients
  socket.on('makeMove', (data) => {
    const { index } = data;
    const playerSymbol = gameState.players[socket.id];
    
    // Validate move: game must not be over, it must be the player's turn,
    // cell must be empty, and spectators cannot make moves
    if (gameState.gameOver || playerSymbol !== gameState.currentTurn || gameState.board[index] !== null || playerSymbol === 'spectator') {
      return;
    }
    
    // Update board and check win/tie conditions
    gameState.board[index] = playerSymbol;
    const winner = checkWin(gameState.board);
    if (winner) {
      gameState.gameOver = true;
      gameState.winner = winner;
    } else if (checkTie(gameState.board)) {
      gameState.gameOver = true;
      gameState.winner = 'Tie';
    } else {
      // Switch turn
      gameState.currentTurn = gameState.currentTurn === 'X' ? 'O' : 'X';
    }
    
    io.emit('update', gameState);
  });
  
  // Handle game reset (optional feature)
  socket.on('resetGame', () => {
    gameState.board = Array(9).fill(null);
    gameState.currentTurn = 'X';
    gameState.gameOver = false;
    gameState.winner = null;
    io.emit('update', gameState);
  });
  
  // Clean up when a player disconnects
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete gameState.players[socket.id];
    io.emit('update', gameState);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

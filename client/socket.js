// client/socket.js

// ⚠️ Replace this with your actual server URL when deployed
const SERVER_URL = 'https://chess-game-server-sz0q.onrender.com';

const socket = io(SERVER_URL);

// ── SEND FUNCTIONS (Client → Server) ──────
function createRoom() {
  socket.emit('createRoom');
}

function joinRoom(roomId) {
  socket.emit('joinRoom', roomId);
}

function sendMove(roomId, move, fen) {
  socket.emit('move', { roomId, move, fen });
}

function sendGameOver(roomId, result) {
  socket.emit('gameOver', { roomId, result });
}

// ── RECEIVE EVENTS (Server → Client) ──────

// Room was successfully created
socket.on('roomCreated', ({ roomId, color }) => {
  const inviteLink = `${window.location.origin}?room=${roomId}`;
  document.getElementById('inviteLink').value = inviteLink;
  document.getElementById('inviteBox').classList.remove('hidden');

  // Store room info for when opponent joins
  socket._roomId = roomId;
  socket._color  = color;
});

// You successfully joined a room
socket.on('roomJoined', ({ roomId, color }) => {
  socket._roomId = roomId;
  socket._color  = color;
});

// Both players are in — game starts!
socket.on('gameStart', ({ roomId }) => {
  initGame(socket._color, roomId);  // In game.js
  initChat(roomId, socket);         // In chat.js
});

// Opponent made a move
socket.on('opponentMove', ({ move, fen }) => {
  applyOpponentMove(move, fen);     // In game.js
});

// Game over signal from opponent
socket.on('gameOver', (result) => {
  if (result === 'resign') {
    showOverlay('win', 'Opponent resigned! You win! 🏆');
  }
});

// Opponent disconnected
socket.on('opponentLeft', () => {
  showOverlay('win', 'Opponent left the game!');
});

// Server error
socket.on('error', (msg) => {
  alert('Error: ' + msg);
});
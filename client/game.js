// client/game.js

let board = null;      // The visual chessboard
let game = null;       // Chess logic engine
let playerColor = 'w'; // 'w' for white, 'b' for black
let roomId = null;

// Called from socket.js when the game is ready to start
function initGame(color, room) {
  playerColor = color === 'white' ? 'w' : 'b';
  roomId = room;
  document.getElementById('playerColor').textContent = color;

  game = new Chess(); // Start a new chess game

  const config = {
    draggable: true,
    position: 'start',
    orientation: color, // Board flips for black player
    pieceTheme: getPieceTheme(),

    // Called when you START dragging a piece
    onDragStart: function(source, piece) {
      // Don't allow moves if game is over
      if (game.game_over()) return false;
      // Don't allow moving opponent's pieces
      if (game.turn() !== playerColor) return false;
      // Don't drag enemy pieces
      if ((playerColor === 'w' && piece.startsWith('b')) ||
          (playerColor === 'b' && piece.startsWith('w'))) return false;
    },

    // Called when you DROP a piece on a square
    onDrop: function(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  // 🎵 Sound + effects
  if (move.captured) {
    playCaptureSound();
    flashCapture();
  } else {
    playMoveSound();
  }

  // ✨ Move trail highlight
  showMoveTrail(source, target);

  // 📜 Move history
  addMoveToHistory(move.san);

  board.position(game.fen());
  sendMove(roomId, move, game.fen());
  checkGameStatus(move);
},

    onSnapEnd: function() {
      board.position(game.fen());
    }
  };

  board = Chessboard('board', config);

  // Apply board colors from CSS theme
  applyBoardColors();
  init3DTilt();

  // Show game screen
  document.getElementById('homeScreen').classList.add('hidden');
  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.remove('hidden');
}

// Called when opponent makes a move (received from server)
function applyOpponentMove(move, fen) {
  game.move(move);
  board.position(fen);
  checkGameStatus(move);
}

// Check if game is over after each move
function checkGameStatus(move) {
  if (game.in_checkmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White';
    const iWon = (winner === 'White' && playerColor === 'w') ||
                 (winner === 'Black' && playerColor === 'b');
    showOverlay(iWon ? 'win' : 'lose', 'Checkmate!');
    sendGameOver(roomId, winner + ' wins');
    return;
  }
  if (game.in_draw())      { showOverlay('draw', 'Draw!'); return; }
  if (game.in_stalemate()) { showOverlay('draw', 'Stalemate!'); return; }

  if (game.in_check()) {
    document.getElementById('statusMsg').textContent = '⚠️ CHECK!';
    document.getElementById('statusMsg').classList.add('in-check');
    flashCheck();        // 🔴 Red border flash
    playCheckSound();    // 🔊 Check sound
  } else {
    document.getElementById('statusMsg').textContent =
      game.turn() === 'w' ? "⬜ White's turn" : "⬛ Black's turn";
    document.getElementById('statusMsg').classList.remove('in-check');
  }
}


// ── MOVE HISTORY ──────────────────────────
let moveCount = 1;
let whiteMoved = false;

function addMoveToHistory(san) {
  const history = document.getElementById('moveList');
  if (!history) return;

  if (!whiteMoved) {
    const row = document.createElement('div');
    row.className = 'move-item';
    row.id = `move-${moveCount}`;
    row.innerHTML = `
      <span class="move-num">${moveCount}.</span>
      <span class="move-white">${san}</span>
      <span class="move-black"></span>
    `;
    history.appendChild(row);
    whiteMoved = true;
  } else {
    const row = document.getElementById(`move-${moveCount}`);
    if (row) row.querySelector('.move-black').textContent = san;
    moveCount++;
    whiteMoved = false;
  }
  history.scrollTop = history.scrollHeight;
}
// ── PIECE THEME ────────────────────────────
function getPieceTheme() {
  // You can swap this URL for any custom piece set!
  // This uses the default Wikipedia pieces
  return 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';
}

// ── BOARD COLOR CUSTOMIZATION ──────────────
function applyBoardColors() {
  const style = document.createElement('style');
  const light = getComputedStyle(document.body).getPropertyValue('--board-light').trim() || '#f0d9b5';
  const dark  = getComputedStyle(document.body).getPropertyValue('--board-dark').trim()  || '#b58863';
  style.textContent = `
    .white-1e1d7 { background-color: ${light} !important; }
    .black-3c85d { background-color: ${dark}  !important; }
  `;
  document.head.appendChild(style);
}

// ── THEME SWITCHER ─────────────────────────
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    document.body.className = `theme-${theme}`;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (board) applyBoardColors(); // Re-apply board colors
  });
});

// ── HOME SCREEN BUTTONS ────────────────────
document.getElementById('createBtn').addEventListener('click', () => {
  createRoom(); // Defined in socket.js
});

document.getElementById('joinBtn').addEventListener('click', () => {
  const roomId = document.getElementById('joinInput').value.trim();
  if (roomId) joinRoom(roomId);
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const link = document.getElementById('inviteLink').value;
  navigator.clipboard.writeText(link);
  document.getElementById('copyBtn').textContent = '✓ Copied!';
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  location.reload(); // Simple: just refresh the page
});

// ── CHECK FOR ROOM ID IN URL ───────────────
// If someone opens the invite link, auto-fill the room ID
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get('room');
  if (roomFromUrl) {
    document.getElementById('joinInput').value = roomFromUrl;
  }
  // Set default theme
  document.body.className = 'theme-dark';
});
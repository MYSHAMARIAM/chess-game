// server/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// This object stores all active game rooms in memory
// Structure: { roomId: { players: [], gameState: '', chat: [] } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // ─── CREATE ROOM ──────────────────────────────────────────
  socket.on('createRoom', () => {
    const roomId = uuidv4().slice(0, 8); // Short unique ID e.g. "a3f9b2c1"
    
    rooms[roomId] = {
      players: [{ id: socket.id, color: 'white' }],
      gameState: null, // Will store chess.js FEN string
      chat: []
    };

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, color: 'white' });
    console.log(`Room created: ${roomId}`);
  });

  // ─── JOIN ROOM ────────────────────────────────────────────
  socket.on('joinRoom', (roomId) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit('error', 'Room not found!');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Room is full!');
      return;
    }

    // Second player always gets black
    room.players.push({ id: socket.id, color: 'black' });
    socket.join(roomId);
    socket.emit('roomJoined', { roomId, color: 'black' });

    // Tell BOTH players the game can start now
    io.to(roomId).emit('gameStart', { roomId });
    console.log(`Player joined room: ${roomId}`);
  });

  // ─── MOVE ─────────────────────────────────────────────────
  socket.on('move', ({ roomId, move, fen }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Save game state (FEN = chess position string)
    room.gameState = fen;

    // Send move to the OTHER player only
    socket.to(roomId).emit('opponentMove', { move, fen });
  });

  // ─── CHAT ─────────────────────────────────────────────────
  socket.on('chatMessage', ({ roomId, message, sender }) => {
    const room = rooms[roomId];
    if (!room) return;

    const chatData = { message, sender, time: new Date().toLocaleTimeString() };
    room.chat.push(chatData);

    // Send message to EVERYONE in the room (including sender)
    io.to(roomId).emit('chatMessage', chatData);
  });

  // ─── GAME OVER ────────────────────────────────────────────
  socket.on('gameOver', ({ roomId, result }) => {
    io.to(roomId).emit('gameOver', result);
  });

  // ─── DISCONNECT ───────────────────────────────────────────
  socket.on('disconnect', () => {
    // Find which room this player was in and notify opponent
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        socket.to(roomId).emit('opponentLeft');
        delete rooms[roomId]; // Clean up the room
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
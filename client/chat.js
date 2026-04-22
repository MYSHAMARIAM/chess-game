// client/chat.js

let _chatRoomId = null;
let _socket = null;
let mySocketId = null;

function initChat(roomId, socket) {
  _chatRoomId = roomId;
  _socket = socket;
  mySocketId = socket.id;

  // Listen for incoming messages
  socket.on('chatMessage', ({ message, sender, time }) => {
    displayMessage(message, sender, time, sender === mySocketId);
  });

  // Send button click
  document.getElementById('sendBtn').addEventListener('click', sendChatMessage);

  // Send on Enter key
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  _socket.emit('chatMessage', {
    roomId: _chatRoomId,
    message: message,
    sender: mySocketId
  });

  input.value = '';
}

function displayMessage(message, sender, time, isMe) {
  const chatBox = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${isMe ? 'me' : 'them'}`;
  div.innerHTML = `
    <div>${message}</div>
    <div class="time">${time}</div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}
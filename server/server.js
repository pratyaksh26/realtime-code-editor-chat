const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration for Render backend to allow Vercel frontend
const io = new Server(server, {
  cors: {
    origin: 'https://realtime-code-editor-chat.vercel.app', // your Vercel URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});



app.use(cors());

const userSocketMap = {};

// Helper to get all connected clients in a room

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
}

// Socket.IO logic

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SEND_MSG, ({ roomId, username, text }) => {
    socket.in(roomId).emit(ACTIONS.RECEIVE_MSG, { username, text });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

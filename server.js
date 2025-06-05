const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // Optional: Set specific origins if needed

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://chatappbackend-u8qn.onrender.com', // Your frontend URL
    methods: ['GET', 'POST']
  }
});

const users = {}; // Mapping userId -> socket.id

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  // Register a user
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`✅ Registered user: ${userId} -> ${socket.id}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const { to, from, message } = data;
    const targetSocketId = users[to];
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_message', { from, message });
      console.log(`📨 Message from ${from} to ${to}: ${message}`);
    } else {
      console.log(`⚠️ User ${to} not connected`);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        console.log(`🔴 User disconnected: ${userId}`);
        delete users[userId];
        break;
      }
    }
  });
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('🚀 Chat Server is running...');
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});

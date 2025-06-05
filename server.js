const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

let users = {}; 

io.on('connection', (socket) => {
  console.log('New user connected: ' + socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  socket.on('send_message', (data) => {
    const { to, from, message } = data;
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_message', { from, message });
    }
  });

  socket.on('disconnect', () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        console.log(`User disconnected: ${userId}`);
        delete users[userId];
        break;
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('Chat Server is running...');
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});

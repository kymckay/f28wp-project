const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

// Start hourly background generation
require('./starfield').starGeneration(60);

const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

app.post('/play', (req, res) => {
  // TODO Check if guest name set, or logged in

  res.sendFile(path.join(__dirname, '../public/dist/play.html'));
});

app.post('/login', (req, res) => {
  // TODO Login existing user if exists, refuse otherwise
  console.log(req, res);
});

app.post('/register', (req, res) => {
  // TODO Register new user, check if already exists, handle client side after register
  console.log(req, res);
});

// Files stored statically in public folder (this comes last so routes take precedence)
app.use(express.static(path.join(__dirname, '../public/')));

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

let i = 0;
setInterval(() => {
  io.sockets.emit('server tick', i);
  i += 1;
}, 200);

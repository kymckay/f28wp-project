/*
  File: Main entry point for the server, handles setup for serving files
  Author(s): Kyle, Tom
*/

const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const Lobby = require('./classes/lobby');

// Start hourly background generation
require('./starfield').starGeneration(60);

// Heroku sets the environment variable PORT (must bind to it)
const port = process.env.PORT || 8080; // Backup for locally ran testing

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

// Block clients trying to access the unprocessed files
// Comment this out if you want to test HTML changes rapidly
app.use(
  ['/index.html', '/play.html'],
  (req, res) => {
    res.status(403).end();
  }
);

// Files stored statically in public folder
app.use(express.static(path.join(__dirname, '../public/')));

// Play submission sends client to the game
app.post('/play', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/play.html'));
});

app.post('/login', (req, res) => {
  // TODO use actual DB
  const payload = {};
  if (Math.random() < 0.5) {
    payload.user = 'dave';
    payload.msg = 'Login successful';
  } else {
    // Always send incorrect password even if user doesn't exist
    // Don't give attackers any information about the DB
    payload.msg = 'Incorrect password';
  }

  res.send(payload);
});

app.post('/register', (req, res) => {
  // TODO check against actual DB
  const payload = {};
  if (Math.random() < 0.5) {
    payload.user = 'dave';
    payload.msg = 'Registration successful';
  } else {
    payload.msg = 'User already exists';
  }

  res.send(payload);
});

// Track lobbies which exist and their state
let currentLobby = new Lobby(io);

io.on('connection', (socket) => {
  // Need a new lobby if game already started
  currentLobby = currentLobby.inProgress ? new Lobby(io) : currentLobby;
  currentLobby.join(socket);
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

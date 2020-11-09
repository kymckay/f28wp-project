const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const Ship = require('./classes/ship');
const Asteroid = require('./classes/asteroid');

// Start hourly background generation
require('./starfield').starGeneration(60);

const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

// Block clients trying to access the unprocessed files
// Comment this out if you want to test HTML changes rapidly
app.use([
  '/index.html',
  '/play.html',
],
  (req, res) => {
    res.status(403).end();
  });

// Files stored statically in public folder
app.use(express.static(path.join(__dirname, '../public/')));

// Play submission sends client to the game
app.post('/play', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/play.html'));
});

// TODO Login submission returns success or not (and client updates page)
app.post('/login', (req, res) => {
  console.log(req, res);
});

// TODO Register submission returns success or not (and client updates page)
app.post('/register', (req, res) => {
  console.log(req, res);
});

let gameInProgress = false;
let gameRequested = false;
let lobbyClients = [];
let matchClients = [];

// TODO when a lobby has enough player or 30s passed, send the start signal

function startGame() {
  gameRequested = false;
  gameInProgress = true;
  const lobby = io.sockets.adapter.rooms['lobby'];
  console.log(lobby.length);
  console.log(Object.keys(lobby));
  for (var id in lobby) {
    console.log(`${id} is in the lobby`);
  }
  io.to('match').emit('game start');
}

function endGame() {
  gameInProgress = false;
}

io.on('connection', (socket) => {
  // TODO
  // Start tracking client and also provide them initial conditions
  // (their position and ID, the world size)
  console.log(`${socket.id} has connected`);
  socket.join('lobby');
  const lobbyCount = io.sockets.adapter.rooms['lobby'].length;
  io.to('lobby').emit('joined lobby', lobbyCount);

  // TODO lobbies
  // socket.join('some room');

  // TODO emulating a delay at start for now
  if (!gameRequested) {
    gameRequested = true;
    setTimeout(() => startGame(), 10000);
  }

  socket.emit('player setup', {
    id: theirShip.id,
    // TODO allocate pos based on minimum world size
    // and expand world if more players join
    pos: theirShip.pos,
    dir: theirShip.angle,
  });

  // TODO emulating a delay at start for now
  // this should actually only run once for everyone, not for each join
  setTimeout(() => {
    const asteroids = [];
    for (let i = 0; i < 10; i += 1) {
      const ast = new Asteroid(
        [Math.random() * 1000, Math.random() * 1000],
        50 + Math.random() * 50
      );
      asteroids.push({
        id: ast.id,
        pos: ast.pos,
        vel: ast.velocity,
        size: ast.size,
      });
    }

    socket.emit('game start', {
      world: [1000, 1000],
      asteroids,
    });
  }, 8000);

  socket.on('disconnecting', () => {
    // TODO take over with an AI or remove from game
    // Object.keys(socket.rooms) gives rooms socket was part of
  });
});

// let i = 0;
// setInterval(() => {
//   io.sockets.emit('server tick', i);
//   i += 1;
// }, 200);

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

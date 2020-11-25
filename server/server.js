/*
  File: Main entry point for the server, handles setup for serving files
  Author(s): Kyle, Tom
*/

const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const database = require('./database');

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

// Bodyparser is express middleware that reads POST request bodies
app.post('/login', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const { user, pass } = req.body;

  if (!database.isValidUsername(user)) {
    res.send({
      msg: 'Invalid username. Alphanumeric characters only.',
    });
    return;
  }

  database.userLogin(user, pass).then((success) => {
    const payload = {};

    if (success) {
      payload.user = user;
    } else {
      // Always send incorrect password even if user doesn't exist
      // Don't give attackers any information about the DB
      payload.msg = 'Incorrect password.';
    }

    res.send(payload);
  }).catch(() => {
    res.send({
      msg: 'Internal server error.  Try again later.',
    });
  });
});

// Bodyparser is express middleware that reads POST request bodies
app.post('/register', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const { user, pass } = req.body;

  if (!(database.isValidUsername(user))) {
    res.send({
      msg: 'Invalid username. Alphanumeric characters only and max length 25.',
    });
    return;
  }

  if (!(database.isValidPassword(pass))) {
    res.send({
      msg: 'Invalid password. Must be between 8 and 50 characters.',
    });
    return;
  }

  database.userRegister(user, pass).then((success) => {
    const payload = {};

    if (success) {
      payload.user = user;
      payload.msg = 'Registration successful.';
    } else {
      payload.msg = 'User already exists.';
    }

    res.send(payload);
  }).catch(() => {
    res.send({
      msg: 'Internal server error. Try again later.',
    });
  });
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

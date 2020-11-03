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

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

let i = 0;
setInterval(() => {
  io.sockets.emit('server tick', i);
  i += 1;
}, 200);

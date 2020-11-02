// const { isObject } = require('core-js/fn/object');
const express = require('express');
const path = require('path');

const app = express();
const io = require('socket.io').listen(app, { log: false });

const port = 8080;
app.listen(port);

// Files stored statically in public folder
app.use(express.static(path.join(__dirname, '../public/')));

app.post('/play', (req, res) => {
  // TODO Check if guest name set, or logged in

  res.sendFile(path.join(__dirname, '../public/play.html'));
});

app.post('/login', (req, res) => {
  // TODO Login existing user if exists, refuse otherwise
  console.log(req, res);
});

app.post('/register', (req, res) => {
  // TODO Register new user, check if already exists, handle client side after register
  console.log(req, res);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

let i = 0;
setInterval(() => {
  io.sockets.emit('server tick', i);
  i += 1;
}, 200);

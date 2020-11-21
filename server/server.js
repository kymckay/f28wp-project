const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const Lobby = require('./classes/lobby');

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
app.use(
  ['/index.html', '/play.html'],
  (req, res) => {
    res.status(403).end();
  }
);

// Files stored statically in public folder
app.use(express.static(path.join(__dirname, '../public/')));

app.use(bodyParser.urlencoded({ extended: false }));

// Play submission sends client to the game
app.post('/play', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/play.html'));
});

// following block of code creates the database and its tables locally.
// Must do it outside post to avoid overwrite.
const con = mysql.createConnection({
  host: 'localhost', // use your own hostname
  user: 'root', // use your mysql username
  password: 'Aceg0864', // use your password
});

con.connect((err) => {
  if (err) throw err;
  console.log('Connected!');

  con.query('DROP DATABASE IF EXISTS steak', (err, result) => {
    if (err) throw err;
  });

  con.query('CREATE DATABASE steak', (err, result) => {
    if (err) throw err;
    console.log('Database created');
  });

  con.query('USE steak', (err, result) => {
    if (err) throw err;
    console.log('Using Database steak');
  });

  const query1 = 'CREATE TABLE players (username VARCHAR(50) NOT NULL PRIMARY KEY, password VARCHAR(50) NOT NULL)';

  con.query(query1, (err, result) => {
    if (err) throw err;
    console.log('Table created');
  });
});

app.post('/register', (req, res) => {
  const name = req.body.user;
  const pass = req.body.pword;
  const query2 = 'INSERT INTO players (username, password) VALUES (?, ?)';

  con.connect((err) => {
    con.query(query2, [name, pass], (err, results, fields) => {
      if (err) {
        console.log('Failed to register: ' + err);
        // res.send(<script>alert("Username already exists.");
        // window.location.href = "index.html"; </script>);
        res.sendStatus(500);
        // res.render('index.html', {alertMsg:"Username already exists."});
        // assuming only error possible is violation of primary key
        return;
      }
      console.log('Registered new user successfully.');
      res.redirect('index.html');
      res.end();
    });
  });
});

app.post('/login', (req, res) => {
  const name = req.body.user;
  const pass = req.body.pword;
  const credentials = 'SELECT * FROM players WHERE username = ? AND password = ?';

  con.connect((err) => {
    con.query(credentials, [name, pass], (err, data, fields) => {
      if (err) {
        console.log("Failed to login: " + err);
      } else if (data.length > 0) {
        console.log('Successfully logged in.');
        res.redirect('/play');
      } else {
        console.log('Incorrect username or password.');
        // alert('Incorrect username or password.');
        // res.sendStatus(500);
        // return;
      }
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

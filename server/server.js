const express = require('express');

const path = require('path');

const app = express();
const port = 8070;
const mysql = require('mysql');
const alert = require('alert');

const bodyParser = require('body-parser');

const { check } = require('express-validator');

app.use(bodyParser.urlencoded({ extended: false }));

// Files stored statically in public folder
app.use(express.static(path.join(__dirname, '../public/')));

app.post('/play', (req, res) => {
// TODO Check if guest name set, or logged in

  res.sendFile(path.join(__dirname, '../public/play.html'));
});

// following block of code creates the database and its tables locally.
// Must do it outside post to avoid overwrite.
const con = mysql.createConnection({
  host: 'localhost', // use your own hostname
  user: 'root', // use your mysql username
  password: 'Aceg0864', //use your password
});

con.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');

  con.query('DROP DATABASE IF EXISTS steak', function (err, result) {
      if (err) throw err;
  });

  con.query('CREATE DATABASE steak', function (err, result) {
    if (err) throw err;
    console.log('Database created');
  });

  con.query('USE steak', function (err, result) {
    if (err) throw err;
    console.log('Using Database steak');
  });

  const query1 = 'CREATE TABLE players (username VARCHAR(50) NOT NULL PRIMARY KEY, password VARCHAR(50) NOT NULL)';

  con.query(query1, function (err, result) {
    if (err) throw err;
    console.log('Table created');
  });
    
});

app.post('/register', (req, res) => {
  // TODO Register new user, check if already exists, handle client side after register

  const name = req.body.user;
  const pass = req.body.pword;
  const query2 = 'INSERT INTO players (username, password) VALUES (?, ?)';

  con.connect(function (err) {

      con.query(query2, [name, pass], (err, results, fields) => {
          if (err) {
              console.log("Failed to register: " + err);
              //res.send(<script>alert("Username already exists."); window.location.href = "index.html"; </script>);
              res.sendStatus(500);
              //res.render('index.html', {alertMsg:"Username already exists."}); //assuming only error possible is violation of primary key
              return;
            }
                console.log("Registered new user successfully.");
                res.redirect("index.html");
                res.end()

        });
    });
});

app.post('/login', (req, res) => {
    // TODO Login existing user if exists, refuse otherwise

    const name = req.body.user
    const pass = req.body.pword
    const credentials = "SELECT * FROM players WHERE username = ? AND password = ?";

    con.connect(function(err) {

        con.query(credentials, [name, pass], (err, data, fields) => {

            if (err) {
                console.log("Failed to login: " + err)
            } else if (data.length > 0) {
                console.log("Successfully logged in.")
                res.redirect("play.html");
            } else {
                console.log("Incorrect username or password.")
                //alert("Incorrect username or password.")
                //res.sendStatus(500)
                //return
            }

        })
    })

})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})


const mysql = require('mysql');
const fs = require('fs');

let config = JSON.parse(fs.readFileSync('./server/db.json'));

const con = mysql.createConnection(config);

// Database should persist between server restarts
con.query(
  'CREATE DATABASE IF NOT EXISTS steak',
  (err) => {
    if (err) throw err;
    console.log('Database created');
  }
);
con.query('USE steak', (err) => { if (err) throw err; });

con.query(
  'CREATE TABLE IF NOT EXISTS players (username VARCHAR(50) NOT NULL PRIMARY KEY, password VARCHAR(50) NOT NULL)',
  (err) => {
    if (err) throw err;
    console.log('Table created');
  }
);

module.exports = {
  userLogin(name, pass, res) {
    con.query(
      // Using placeholders "?" escapes user input to prevent SQL injection
      'SELECT * FROM players WHERE username = ? AND password = ?',
      [name, pass],
      (err, result) => {
        if (err) {
          console.log(`Failed to login: ${err}`);
        } else if (result.length === 1) {
          console.log('Successfully logged in.');
          res.redirect('/');
        } else {
          console.log('Incorrect username or password.');
          // alert('Incorrect username or password.');
          // res.sendStatus(500);
          // return;
        }
      }
    );
  },

  userRegister(name, pass, res) {
    con.query(
      // Using placeholders "?" escapes user input to prevent SQL injection
      'INSERT INTO players (username, password) VALUES (?, ?)',
      [name, pass],
      (err) => {
        if (err) {
          console.log(`Failed to register: ${err}`);
          // res.send(<script>alert("Username already exists.");
          // window.location.href = "index.html"; </script>);
          res.sendStatus(500);
          // res.render('index.html', {alertMsg:"Username already exists."});
          // assuming only error possible is violation of primary key
          return;
        }
        console.log('Registered new user successfully.');
        res.redirect('/');
        res.end();
      }
    );
  },
};

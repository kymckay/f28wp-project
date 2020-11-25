/*
  File: Handles initialising and interfacing with the MySQL database

  Author(s): Sharick, Kyle
*/

const mysql = require('mysql');
const fs = require('fs');

// When running on Heroku the DB config is set in an environment variable
let config;
if (process.env.CLEARDB_DATABASE_URL) {
  // Username, password and database name all in the connection string
  config = process.env.CLEARDB_DATABASE_URL;
} else {
  config = JSON.parse(fs.readFileSync('./server/db.json'));
}

// Database will be connected to via config, must exist already
const con = mysql.createConnection(config);

con.query(
  [
    'CREATE TABLE IF NOT EXISTS players (username VARCHAR(25) NOT NULL PRIMARY KEY',
    'password VARCHAR(50) NOT NULL',
    'highscore INT UNSIGNED NOT NULL',
    'kills INT UNSIGNED NOT NULL',
    'deaths INT UNSIGNED NOT NULL)',
  ].join(','),
  (err) => {
    if (err) {
      console.log(err.code);
    }
  }
);

module.exports = {
  isValidUsername(name) {
    // Basically, names can't have symbols
    return /^\w{1,25}$/.test(name);
  },

  isValidPassword(pass) {
    return /^.{8,50}$/.test(pass);
  },

  userLogin(name, pass) {
    // Resolves true/false as logged in state, rejects on error
    return new Promise((resolve, reject) => {
      con.query(
        // Using placeholders "?" escapes user input to prevent SQL injection
        'SELECT username FROM players WHERE username = ? AND password = ?',
        [name, pass],
        (err, result) => {
          if (err) {
            console.log(err.code);
            reject(err);
          } else if (result.length === 1) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  },

  userRegister(name, pass) {
    // Resolves true/false as registration success, rejects on error
    return new Promise((resolve, reject) => {
      con.query(
        // Using placeholders "?" escapes user input to prevent SQL injection
        'INSERT INTO players (username, password, highscore, kills, deaths) VALUES (?, ?, ?, ?, ?)',
        [name, pass, 0, 0, 0],
        (err) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              resolve(false);
            } else {
              console.log(err.code);
              reject(err);
            }
          }

          resolve(true);
        }
      );
    });
  },
};

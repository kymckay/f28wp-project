/*
  File: Handles initialising and interfacing with the MySQL database

  Author(s): Sharick, Kyle
*/

const mysql = require('mysql');
const fs = require('fs');

// When running on Heroku the DB config is set in environment variables
let config = {};
if (process.env.CLEARDB_DATABASE_URL) {
  config.host = process.env.CLEARDB_DATABASE_URL;
  config.user = process.env.CLEARDB_DATABASE_USER;
  config.password = process.env.CLEARDB_DATABASE_PASS;
} else {
  config = JSON.parse(fs.readFileSync('./server/db.json'));
}

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
  isValidUsername(name) {
    // Basically, names can't have symbols
    return name.match(/^\w+$/);
  },

  userLogin(name, pass) {
    // Resolves true/false as logged in state, rejects on error
    return new Promise((resolve, reject) => {
      con.query(
        // Using placeholders "?" escapes user input to prevent SQL injection
        'SELECT * FROM players WHERE username = ? AND password = ?',
        [name, pass],
        (err, result) => {
          if (err) {
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
        'INSERT INTO players (username, password) VALUES (?, ?)',
        [name, pass],
        (err) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              resolve(false);
            } else {
              reject(err);
            }
          }

          resolve(true);
        }
      );
    });
  },
};

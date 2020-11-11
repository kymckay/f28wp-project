const express = require('express');
const path = require('path');
const app = express();
const port = 8070;
const mysql = require("mysql");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

// Files stored statically in public folder
app.use(express.static(path.join(__dirname,'../public/')))

app.post('/play', (req, res) => {
    // TODO Check if guest name set, or logged in

    res.sendFile(path.join(__dirname,'../public/play.html'))
})

app.post('/register', (req, res) => {
    // TODO Register new user, check if already exists, handle client side after register
    console.log("trying to post")
    console.log('Username is: ' + req.body.user)
    const name = req.body.user
    const pass = req.body.pword

    const con = mysql.createConnection({
        host: "localhost", // use your own hostname
        user: "root", // use your mysql username
        password: "Aceg0864", //use your password
      })

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");

        con.query("DROP DATABASE IF EXISTS steak", function (err, result) {
            if (err) throw err;
        })

        con.query("CREATE DATABASE steak", function (err, result) {
          if (err) throw err;
          console.log("Database created");
        })

        con.query("USE steak", function (err,result) {
            if (err) throw err;
            console.log("Using Database steak");
        })

        const query1 = "CREATE TABLE players (username VARCHAR(50) NOT NULL, password VARCHAR(50) NOT NULL)";

        con.query(query1, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        })

        const query2 = "INSERT INTO players (username, password) VALUES (?, ?)"
        con.query(query2, [name, pass], (err, results, fields) => {
            if (err) {
                console.log("Failed to register: " + err)
                res.sendStatus(500)
                return
            }

            console.log("Registered new user successfully.");
            res.end()
        })


    //res.end()
    })
})


app.post('/login', (req, res) => {
    // TODO Login existing user if exists, refuse otherwise
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

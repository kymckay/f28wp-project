const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Files stored statically in public folder
app.use(express.static(path.join(__dirname,'../public/')))

app.post('/play', (req, res) => {
    // TODO Check if guest name set, or logged in

    res.sendFile(path.join(__dirname,'../public/play.html'))
})

app.post('/login', (req, res) => {
    // TODO Login existing user if exists, refuse otherwise
})

app.post('/register', (req, res) => {
    // TODO Register new user, check if already exists, handle client side after register
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

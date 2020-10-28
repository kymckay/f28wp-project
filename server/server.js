const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Files stored statically in public folder
app.use(express.static(path.join(__dirname,'../public/')))

app.get('/play', (req, res) => {
    // TODO Return game page if logged in otherwise ask to play as guest
    // if (loggedIn || guest_cookie_set) {
    //     res.send(game_page);
    // }
    // res.send(guest_question_page);

})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

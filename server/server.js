const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Pages and assets stored statically in public folder
app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

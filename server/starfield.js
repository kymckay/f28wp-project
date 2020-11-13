const path = require('path');
const fs = require('fs');

// resolution of image will effect performance
const resolution = 500;

function generateStars(res) {
  const stars = [];

  for (let i = 0; i < 150; i += 1) {
    // Most stars are distant (small)
    let scale = Math.floor(Math.random() * 2) + 1;

    // Most distant stars aren't bright
    let brightness = '#ddd';

    // Some can be bright
    if (i > 75) {
      brightness = ['#fff', '#eee', '#ddd'][Math.floor(Math.random() * 3)];

      // Half of them can be closer
      if (i > 100) {
        scale = Math.floor(Math.random() * 4) + 1;
      }
    }

    const x = Math.floor(Math.random() * res);
    const y = Math.floor(Math.random() * res);

    // Dots that are white and fade outward look like stars
    stars.push(`radial-gradient(${scale}px ${scale}px at ${x}px ${y}px, ${brightness}, rgba(0,0,0,0))`);
  }

  return stars.join(',');
}

// Expects a <div id="stars"> point in the page
function addStars(file, stars) {
  const srcDir = '../public/';
  const distDir = '../public/dist/';

  return fs.promises.readFile(
    path.join(__dirname, srcDir, file),
    'utf-8'
  ).then((content) => {
    // Insert custom style attribute into the div tag
    const insertAt = content.indexOf('<div id="stars">') + 15;

    let out = content.substring(0, insertAt);
    out += 'style="';
    out += 'background-repeat: repeat;';
    out += `background-size: ${resolution}px ${resolution}px;`;
    out += `background-image: ${stars};"`;
    out += content.substring(insertAt);

    return out;
  }).then((content) => fs.promises.writeFile(
    path.join(__dirname, distDir, file),
    content,
    'utf-8'
  ));
}

function newGeneration() {
  const menuFile = 'index.html';
  const gameFile = 'play.html';
  const generation = generateStars(resolution);

  addStars(menuFile, generation);
  addStars(gameFile, generation);
}

module.exports = {
  starGeneration(every) {
    newGeneration();
    setInterval(newGeneration, every * 60000);
  },
};

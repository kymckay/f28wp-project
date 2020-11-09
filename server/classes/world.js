const Ship = require('./ship');

class World {
  constructor(width, height) {
    // world has a spatial extent
    this.width = width;
    this.height = height;
    this.gameObjects = {};
  }

  addPlayer(id) {
    const pos = [];
    this.gameObjects[id] = new Ship(pos, 0, true);
  }

  start() {
  }

  simulate(dT) {
  }

  end() {
  }
}

module.exports = World;

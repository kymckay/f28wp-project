const Entity = require('./entity');

class Asteroid extends Entity {
  constructor(pos, size) {
    super(pos, [0, 0]);

    this.size = size;
  }
}

module.exports = Asteroid;

const Entity = require('./entity');

class Asteroid extends Entity {
  constructor(pos, scale) {
    super(pos, [0, 0]);

    this.scale = scale;
  }
}

module.exports = Asteroid;

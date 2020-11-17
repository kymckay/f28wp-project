const Entity = require('./entity');

class Asteroid extends Entity {
  constructor(pos, vel, size) {
    super(pos, vel);

    this.size = size;
  }

  serialize() {
    const s = super.serialize();
    s.size = this.size;
    return s;
  }
}

Asteroid.minSize = 40; // px (diameter)
Asteroid.maxSize = 100; // px (diameter)

module.exports = Asteroid;

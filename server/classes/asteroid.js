const Entity = require('./entity');

class Asteroid extends Entity {
  constructor(pos, vel, size) {
    super(pos, vel);

    this.size = size;
  }

  serialize() {
    return {
      id: this.id,
      pos: this.pos,
      size: this.size,
    };
  }
}
Asteroid.minSize = 40; // px (diameter)
Asteroid.maxSize = 100; // px (diameter)

module.exports = Asteroid;

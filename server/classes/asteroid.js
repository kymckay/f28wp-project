const Entity = require('./entity');

class Asteroid extends Entity {
  constructor(pos, size) {
    super(pos, [0, 0]);

    this.size = size;
  }

  serialize() {
    return {
      id: this.id,
      pos: this.pos,
      vel: this.velocity,
      size: this.size,
    };
  }
}
Asteroid.minSize = 40; // px (diameter)
Asteroid.maxSize = 100; // px (diameter)

module.exports = Asteroid;

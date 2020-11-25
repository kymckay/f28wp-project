/*
  File: Asteroid class

  - Handles asteroid serialisation

  Author(s): Kyle, Tom
*/

const Entity = require('./entity');
const Vector = require('./vector');

class Asteroid extends Entity {
  // Start with random speed and size
  constructor(pos) {
    const vel = Vector.polarToCart(
      Math.random() * Math.PI * 2,
      Asteroid.maxSpeed * Math.random()
    );

    super(pos, vel);

    this.size = Asteroid.minSize
      + (Asteroid.maxSize - Asteroid.minSize) * Math.random();
  }

  serialize() {
    const s = super.serialize();
    s.size = this.size;
    return s;
  }
}

Asteroid.minSize = 40; // px (diameter)
Asteroid.maxSize = 100; // px (diameter)
Asteroid.maxSpeed = 700; // px/s

module.exports = Asteroid;

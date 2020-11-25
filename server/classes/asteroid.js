/*
  File: Asteroid class

  - Handles asteroid serialisation

  Author(s): Kyle, Tom
*/

const Entity = require('./entity');

function polarToCart(v) {
  const [theta, z] = v;

  return [
    // Angles in this world are measured clockwise from x-axis
    Math.cos(theta) * z, // x
    Math.sin(theta) * z, // y
  ];
}

class Asteroid extends Entity {
  constructor(pos, size, speed) {
    const vel = polarToCart([
      Math.random() * Math.PI * 2,
      speed,
    ]);

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
Asteroid.maxSpeed = 700; // px/s

module.exports = Asteroid;

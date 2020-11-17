const { performance } = require('perf_hooks');
const Entity = require('./entity');
const Projectile = require('./projectile');

function vectorAdd(v1, v2) {
  return [
    v1[0] + v2[0],
    v1[1] + v2[1],
  ];
}

function polarToCart(theta, z) {
  return [
    // Angles in this world are measured clockwise from x-axis
    Math.cos(theta) * z,
    Math.sin(theta) * z,
  ];
}

class Ship extends Entity {
  constructor(pos, isPlayer) {
    // Ships start without velocity
    super(pos, [0, 0]);

    // Initial orientation is superficial (radians)
    this.dir = Math.random() * Math.PI * 2;
    this.isPlayer = isPlayer;

    this.lastShot = performance.now();
  }

  turn(anticlockwise) {
    this.angle += (anticlockwise ? -1 : 1) * Ship.turnSpeed;
  }

  accelerate() {
    const v = this.vel;

    // Differential velocity vector
    const dv = polarToCart(this.dir, Ship.acceleration);

    // Ships cannot infinitely speed up
    this.vel = [
      Math.max(Math.min(v[0] + dv[0], 5), -5),
      Math.max(Math.min(v[1] + dv[1], 5), -5),
    ];
  }

  brake() {
    const v = this.vel;

    // Differential velocity vector
    const dv = polarToCart(
      // Braking always opposes current velocity
      Math.atan2(v[1], v[0]) + Math.PI,
      Ship.deceleration
    );

    // Can't decelerate past 0
    this.vel = [
      (Math.abs(dv[0]) > Math.abs(v[0])) ? 0 : v[0] + dv[0],
      (Math.abs(dv[1]) > Math.abs(v[1])) ? 0 : v[1] + dv[1],
    ];
  }

  shoot() {
    // Cooldown between shots of 5s (5000ms)
    if (performance.now() - this.lastShot < Ship.shotCooldown) {
      return null;
    }
    this.lastShot = performance.now();

    // Projectile appears ahead of ship
    const pos = vectorAdd(this.pos, polarToCart(this.dir, Ship.shotOffset));

    // Projectile inherits ship velocity plus firing velocity
    const vel = vectorAdd(this.vel, polarToCart(this.dir, Ship.shotSpeed));

    return new Projectile(pos, this.dir, vel);
  }

  serialize() {
    return {
      pos: this.pos,
      dir: this.dir,
    };
  }
}

// Constants control ship handling
Ship.turnSpeed = 0.05;
Ship.acceleration = 0.1;
Ship.deceleration = 0.05;

// Constants for cannon behaviour
Ship.shotSpeed = 5; // px/s
Ship.shotOffset = 10; // px ahead of ship centre
Ship.shotCooldown = 5000; // ms between cannon shots

module.exports = Ship;

/*
  File: Ship class

  - Handles ship controls
  - Handles ship collision and serialisation

  Author(s): Kyle, Tom
*/

const { performance } = require('perf_hooks');
const Entity = require('./entity');
const Projectile = require('./projectile');
const Vector = require('./vector');

class Ship extends Entity {
  constructor(pos, isPlayer) {
    // Ships start without velocity
    super(pos, new Vector(0, 0));

    // Initial orientation is superficial (radians)
    this.dir = Math.random() * Math.PI * 2;
    this.isPlayer = isPlayer;

    this.controls = {};
    this.lastShot = performance.now();
  }

  turn(anticlockwise, normCoef) {
    this.dir += (anticlockwise ? -1 : 1) * Ship.turnSpeed * normCoef;
  }

  accelerate(normCoef) {
    // Differential velocity vector in direction ship faces
    const dv = Vector.polarToCart(this.dir, Ship.acceleration * normCoef);

    // Use polar to easily limit new speed direction independently
    const newV = Vector.add(this.vel, dv);
    const magnitude = Math.min(newV.z, Ship.maxSpeed);

    this.vel = Vector.polarToCart(newV.theta, magnitude);
  }

  brake(normCoef) {
    const v = this.vel;

    // Differential velocity vector
    // Braking always opposes current velocity
    const dv = Vector.polarToCart(
      v.theta + Math.PI,
      Ship.deceleration * normCoef
    );

    // Can't decelerate past 0
    this.vel = new Vector(
      (Math.abs(dv.x) > Math.abs(v.x)) ? 0 : v.x + dv.x,
      (Math.abs(dv.y) > Math.abs(v.y)) ? 0 : v.y + dv.y
    );
  }

  shoot() {
    // Cooldown between shots of 5s (5000ms)
    if (performance.now() - this.lastShot < Ship.shotCooldown) {
      return null;
    }
    this.lastShot = performance.now();

    // Projectile appears ahead of ship
    const pos = Vector.add(
      this.pos,
      Vector.polarToCart(this.dir, Ship.shotOffset)
    );

    // Projectile inherits ship velocity plus firing velocity
    const vel = Vector.add(
      this.vel,
      Vector.polarToCart(this.dir, Ship.shotSpeed)
    );

    return new Projectile(pos, this.dir, vel);
  }

  getTriangle() {
    // Ship is 60px by 30px in the CSS (would be nice to not hardcode this)
    const halfLength = 30;
    const halfWidth = 15;

    const ortho = this.dir + Math.PI / 2;

    const tip = Vector.add(this.pos, Vector.polarToCart(this.dir, halfLength));
    const backM = Vector.diff(this.pos, Vector.polarToCart(this.dir, halfLength));
    const backL = Vector.diff(backM, Vector.polarToCart(ortho, halfWidth));
    const backR = Vector.add(backM, Vector.polarToCart(ortho, halfWidth));

    return [tip, backL, backR];
  }

  // Returns an asteroid the ship is colliding with (or null)
  collision(asteroids) {
    for (let i = 0; i < asteroids.length; i++) {
      const e = asteroids[i];
      const radiusA = e.size / 2;

      // Quick square collision check before more accurate (but costly) check
      // Ship's longest dimension is 60px in the CSS (would be nice to not hardcode this)
      if (
        Math.abs(e.x - this.x) < radiusA + 30
        && Math.abs(e.y - this.y) < radiusA + 30
      ) {
        const points = this.getTriangle();

        // Find distance from outer points of the ship to the asteroid center
        // Collide if less than asteroid radius
        const collide = points.some((p) => {
          const diff = Vector.diff(p, e.pos);
          const distSqr = diff.zSqr;
          // It's quicker to exponent than sqrt
          return distSqr < radiusA * radiusA;
        });

        if (collide) {
          // When a ship collides it dies, no point checking further
          return e;
        }
      }
    }

    return null;
  }

  serialize() {
    const s = super.serialize();
    s.dir = this.dir;
    return s;
  }
}

// Constants control ship handling
Ship.turnSpeed = Math.PI; // rad/s
Ship.acceleration = 300; // px/s
Ship.deceleration = 300; // px/s
Ship.maxSpeed = 600; // px/s

// Constants for cannon behaviour
Ship.shotSpeed = 1000; // px/s
Ship.shotOffset = 40; // px ahead of ship centre
Ship.shotCooldown = 800; // ms between cannon shots

module.exports = Ship;

const { performance } = require('perf_hooks');
const Entity = require('./entity');
const Projectile = require('./projectile');

function vectorAdd(v1, v2) {
  return [
    v1[0] + v2[0],
    v1[1] + v2[1],
  ];
}

function polarToCart(v) {
  const [theta, z] = v;

  return [
    // Angles in this world are measured clockwise from x-axis
    Math.cos(theta) * z, // x
    Math.sin(theta) * z, // y
  ];
}

function cartToPolar(v) {
  const [x, y] = v;

  return [
    Math.atan2(y, x), // theta
    Math.sqrt(x * x + y * y), // z
  ];
}

class Ship extends Entity {
  constructor(pos, isPlayer) {
    // Ships start without velocity
    super(pos, [0, 0]);

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
    const dv = polarToCart([this.dir, Ship.acceleration * normCoef]);

    // Use polar to easily limit new speed direction independently
    const polarV = cartToPolar(vectorAdd(this.vel, dv));
    polarV[1] = Math.min(polarV[1], Ship.maxSpeed);

    this.vel = polarToCart(polarV);
  }

  brake(normCoef) {
    const v = this.vel;

    // Differential velocity vector
    const dv = polarToCart([
      // Braking always opposes current velocity
      Math.atan2(v[1], v[0]) + Math.PI,
      Ship.deceleration * normCoef,
    ]);

    // Can't decelerate past 0
    this.vel = [
      (Math.abs(dv[0]) > Math.abs(v[0])) ? 0 : v[0] + dv[0],
      (Math.abs(dv[1]) > Math.abs(v[1])) ? 0 : v[1] + dv[1],
    ];
  }

  shoot() {
    // Cooldown between shots of 5s (5000ms)
    if (performance.now() - this.lastShot < Ship.shotCooldown) {
      return;
    }
    this.lastShot = performance.now();

    // Projectile appears ahead of ship
    const pos = vectorAdd(this.pos, polarToCart([this.dir, Ship.shotOffset]));

    // Projectile inherits ship velocity plus firing velocity
    const vel = vectorAdd(this.vel, polarToCart([this.dir, Ship.shotSpeed]));

    this.fired = new Projectile(pos, this.dir, vel);
  }

  simulate(maxX, maxY, margin, normCoef) {
    // Ship can't thrust and break together (hence XOR)
    const control = this.controls;
    if (control.ArrowUp ? !control.ArrowDown : control.ArrowDown) {
      if (control.ArrowUp) {
        this.accelerate(normCoef);
      } else {
        this.brake(normCoef);
      }
    }

    // Ship can't turn boths ways at once (hence XOR)
    if (control.ArrowLeft ? !control.ArrowRight : control.ArrowRight) {
      this.turn(control.ArrowLeft, normCoef);
    }

    if (control.Space) {
      this.shoot();
    }

    super.simulate(maxX, maxY, margin, normCoef);
  }

  getOuterPoints() {
    // TODO return world coords of ships outer 3 points
    return [this.pos];
  }

  collisions(asteroids) {
    for (let i = 0; i < asteroids.length; i++) {
      const e = asteroids[i];
      const points = this.getOuterPoints();

      // Using hardcoded values based on asteroid max size and ship's longest dimension
      // Ship's longest dimension is 60px in the CSS (would be nice to not hardcode this)
      // Quick distance check before more accurate (but costly) check
      if (
        Math.abs(e.x - this.x) < 80
        || Math.abs(e.y - this.y) < 80
      ) {
        // Find distance from outer points of the ship to the asteroid center
        // Collide if less than asteroid radius
        const collide = points.some((p) => {
          const distSqr = Math.pow(p[0] - e.x, 2) + Math.pow(p[1] - e.y, 2);
          // It's quicker to exponent than sqrt
          return distSqr <= Math.pow(e.size / 2, 2);
        });

        if (collide) {
          // When a ship collides it dies, no point checking further
          this.dead = true;
          return;
        }
      }
    }
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

const Entity = require('./entity');

class Projectile extends Entity {
  constructor(pos, dir, vel) {
    super(pos, vel);

    this.dir = dir;
    this.time = Projectile.lifetime;
  }

  simulate(maxX, maxY, margin, normCoef, fps) {
    // Projectiles expire when no lifetime remains
    this.time -= 1 / fps;
    if (this.time <= 0) {
      console.log(`${this.id} has expired`);
      this.dead = true;
    }

    super.simulate(maxX, maxY, margin, normCoef);
  }

  collisions(asteroids, ships) {
  }

  serialize() {
    const s = super.serialize();
    s.dir = this.dir;
    return s;
  }
}

Projectile.lifetime = 1; // in seconds

module.exports = Projectile;

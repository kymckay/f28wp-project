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
    } else {
      super.simulate(maxX, maxY, margin, normCoef);
    }
  }

  // Returns an asteroid or ship the projectile is colliding with (or null)
  collision(asteroids, ships) {
    for (let i = 0; i < asteroids.length; i++) {
      const e = asteroids[i];
      const radiusSqr = Math.pow(e.size / 2, 2);

      // Asteroids are circular so this is a simple distance check
      const dx = this.x - e.x;
      const dy = this.y - e.y;
      if (dx * dx + dy * dy < radiusSqr) {
        this.dead = true;
        return e;
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

Projectile.lifetime = 1; // in seconds

module.exports = Projectile;

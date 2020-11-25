/*
  File: Projectile class

  - Handles projectile simulation behaviour (e.g. lifetime)

  Author(s): Kyle, Tom
*/

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
      this.dead = true;
    } else {
      super.simulate(maxX, maxY, margin, normCoef);
    }
  }

  // Returns an asteroid or ship the projectile is colliding with (or null)
  collision(asteroids, ships) {
    // More simple asteroid colisions first
    for (let i = 0; i < asteroids.length; i++) {
      const e = asteroids[i];
      const radiusSqr = Math.pow(e.size / 2, 2);

      // Asteroids are circular so this is a simple distance check
      const dx = this.x - e.x;
      const dy = this.y - e.y;
      if (dx * dx + dy * dy < radiusSqr) {
        // Projectiles only destroy one entity at a time
        this.dead = true;
        return e;
      }
    }

    // More complex "point in triangle" collision with ships
    for (let i = 0; i < ships.length; i++) {
      const e = ships[i];

      // Quick square collision before more accurate (but costly) check
      // Ship's longest dimension is 60px in the CSS (would be nice to not hardcode this)
      if (
        Math.abs(e.x - this.x) < 30
        && Math.abs(e.y - this.y) < 30
      ) {
        // Using the dot product method (points must be ordered counterclockwise)
        const [p1, p2, p3] = e.getTriangle();

        // Orthogonal vectors (outside triangle)
        const v1 = [p2[1] - p1[1], -p2[0] + p1[0]];
        const v2 = [p3[1] - p2[1], -p3[0] + p2[0]];
        const v3 = [p1[1] - p3[1], -p1[0] + p3[0]];

        // Vector diff from triangle points
        const vp1 = [this.x - p1[0], this.y - p1[1]];
        const vp2 = [this.x - p2[0], this.y - p2[1]];
        const vp3 = [this.x - p3[0], this.y - p3[1]];

        // Dot products
        const dot1 = v1[0] * vp1[0] + v1[1] * vp1[1];
        const dot2 = v2[0] * vp2[0] + v2[1] * vp2[1];
        const dot3 = v3[0] * vp3[0] + v3[1] * vp3[1];

        // The dot product condition
        if (
          dot1 > 0
          && dot2 > 0
          && dot3 > 0
        ) {
          this.dead = true;
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

Projectile.lifetime = 1; // in seconds

module.exports = Projectile;

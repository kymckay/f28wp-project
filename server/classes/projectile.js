/*
  File: Projectile class

  - Handles projectile lifetime tracking
  - Handles projectile collision and serialisation

  Author(s): Kyle, Tom
*/

const Entity = require('./entity');
const Vector = require('./vector');

class Projectile extends Entity {
  constructor(pos, dir, vel) {
    super(pos, vel);

    this.dir = dir;
    this.time = Projectile.lifetime;
  }

  tick(fps) {
    // Projectiles expire when no lifetime remains
    this.time -= 1 / fps;
    return this.time <= 0;
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

        // Orthogonal vectors (to triangle sides)
        const v1 = new Vector(p2.y - p1.y, -p2.x + p1.x);
        const v2 = new Vector(p3.y - p2.y, -p3.x + p2.x);
        const v3 = new Vector(p1.y - p3.y, -p1.x + p3.x);

        // Vector diff from triangle points
        const vp1 = Vector.diff(this.pos, p1);
        const vp2 = Vector.diff(this.pos, p2);
        const vp3 = Vector.diff(this.pos, p3);

        // Dot products
        const dot1 = Vector.dot(v1, vp1);
        const dot2 = Vector.dot(v2, vp2);
        const dot3 = Vector.dot(v3, vp3);

        // The dot product condition
        if (
          dot1 > 0
          && dot2 > 0
          && dot3 > 0
        ) {
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

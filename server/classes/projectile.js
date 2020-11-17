const Entity = require('./entity');

class Projectile extends Entity {
  constructor(pos, dir, vel) {
    super(pos, vel);

    this.dir = dir;
    this.time = Projectile.lifetime;
  }

  serialize() {
    const s = super.serialize();
    s.dir = this.dir;
    return s;
  }
}

Projectile.lifetime = 2; // in seconds

module.exports = Projectile;

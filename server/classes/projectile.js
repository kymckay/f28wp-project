const Entity = require('./entity');

class Projectile extends Entity {
  constructor(pos, dir, vel) {
    super(pos, vel);

    this.dir = dir;
  }

  serialize() {
    return {
      pos: this.pos,
      dir: this.dir,
    };
  }
}

Projectile.lifetime = 2; // in seconds

module.exports = Projectile;

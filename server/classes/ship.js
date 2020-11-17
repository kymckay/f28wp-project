const Entity = require('./entity');

class Ship extends Entity {
  constructor(pos, isPlayer) {
    // Ships start without velocity
    super(pos, [0, 0]);

    // Initial orientation is superficial (radians)
    this.dir = Math.random() * Math.PI * 2;
    this.isPlayer = isPlayer;
  }

  serialize() {
    return {
      pos: this.pos,
      dir: this.dir,
    };
  }
}

module.exports = Ship;
class Entity {
  // all entities exist somewhere in space
  constructor(pos, vel) {
    this.pos = pos; // [x, y] vector
    this.vel = vel; // [x, y] vector

    // all entites must be identifyable for logic
    this.id = Entity.newId();
  }

  get x() { return this.pos[0]; }

  set x(x) { this.pos[0] = x; }

  get y() { return this.pos[1]; }

  set y(y) { this.pos[1] = y; }

  static newId() {
    Entity.id += 1;
    return Entity.id;
  }

  simulate(maxX, maxY, margin, normCoef) {
    this.x += this.vel[0] * normCoef;
    this.y += this.vel[1] * normCoef;

    // Entities all wrap to other side of world
    // Margin hides teleportation below border
    if (this.x < -margin) {
      this.x += maxX + margin;
    } else if (this.x > maxX + margin) {
      this.x -= maxX + margin;
    }

    if (this.y < -margin) {
      this.y += maxY + margin;
    } else if (this.y > maxY + margin) {
      this.y -= maxY + margin;
    }
  }

  serialize() {
    const s = {
      pos: this.pos,
    };
    if (this.dead) s.dead = true;
    return s;
  }
}
Entity.id = 0;

module.exports = Entity;

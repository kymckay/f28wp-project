class Entity {
  // all entities exist somewhere in space
  constructor(pos, velocity) {
    this.pos = pos; // [x, y] vector
    this.velocity = velocity; // [x, y] vector

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
}
Entity.id = 0;

module.exports = Entity;

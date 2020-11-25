/*
  File: Entity class

  - Common anscestor to all world entities
  - Has all shared logic/behaviour
  - Generates the entity IDs

  Author(s): Kyle, Tom
*/

class Entity {
  // all entities exist somewhere in space
  constructor(pos, vel) {
    this.pos = pos; // vector
    this.vel = vel; // vector

    // all entites must be identifyable for logic
    this.id = Entity.newId();
  }

  get x() { return this.pos.x; }

  set x(x) { this.pos.x = x; }

  get y() { return this.pos.y; }

  set y(y) { this.pos.y = y; }

  static newId() {
    Entity.id++;
    return Entity.id;
  }

  serialize() {
    const s = {
      pos: [this.pos.x, this.pos.y],
    };
    if (this.dead) s.dead = true;
    return s;
  }
}
Entity.id = 0;

module.exports = Entity;

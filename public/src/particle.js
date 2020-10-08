import PhysicsObject from './physicsObject.js';
import Vector from './vector.js';

export default class Particle extends PhysicsObject {
  constructor(parent, creator, velocity, lifetime) {
    super(parent, Vector.copy(creator.pos), velocity, 10, 0.05);
    this.collidable = true;
    this.lifetime = lifetime;
  }

  update(dT) {
    super.update(dT);
    this.lifetime -= dT;
    if (this.lifetime <= 0) this.destroyNextFrame = true;
  }
}

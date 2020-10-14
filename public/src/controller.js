import Vector from './vector.js';
import Particle from './particle.js';

export default class Controller {
  constructor(environment, objects, controls, inputs) {
    this.environment = environment;
    this.objects = objects;
    this.target = objects[controls];
    this.bindings = inputs;
    this.moveForce = 320;
    this.turnSpeed = 0.05;
    this.fireDelay = 380;
    this.lastFire = 0;
  }

  handleInput(key) {
    const action = this.bindings.map(key);
    if (action) action();
  }

  shoot() {
    const now = Date.now();
    if ((now - this.lastFire) >= this.fireDelay) {
      const { angle } = this.target;
      const velocity = Vector.fromAngle(angle, 5.2);
      velocity.add(this.target.velocity());
      const obj = new Particle(this.environment, this.target, velocity, 1.4);
      obj.div.classList.add('laser');
      obj.addTag('projectile');
      obj.angle = angle;
      this.objects[obj.id] = obj;

      this.lastFire = now;
    }
  }

  forward() {
    const force = Vector.fromAngle(this.target.angle, this.moveForce);
    this.target.applyForce(force);
  }

  backward() {
    const force = Vector.fromAngle(this.target.angle + Math.PI, this.moveForce);
    this.target.applyForce(force);
  }

  left() {
    this.target.angle -= this.turnSpeed;
  }

  right() {
    this.target.angle += this.turnSpeed;
  }
}

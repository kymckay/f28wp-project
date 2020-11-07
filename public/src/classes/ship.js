import Entity from './entity';
import Projectile from './projectile';
import { vectorAdd, polarToCart } from '../coordinates';

export default class Ship extends Entity {
  constructor(container, id, pos, isPlayer) {
    super(container, id, pos, [0, 0]);

    this.element.classList.add('ship');

    // Need to track projectiles shot for ID generation
    this.projectiles = 0;

    // Differentiate the player's ship
    if (isPlayer) {
      this.element.classList.add('player');
    }

    // Start facing a random direction (radians)
    this.angle = Math.random() * Math.PI * 2;
  }

  render(screenOX, screenOY) {
    super.render(screenOX, screenOY);

    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }

  turn(anticlockwise) {
    this.angle += (anticlockwise ? -1 : 1) * Ship.turnSpeed;
  }

  accelerate() {
    const v = this.velocity;

    // Differential velocity vector
    const dv = polarToCart(this.angle, Ship.acceleration);

    // Ships cannot infinitely speed up
    this.velocity = [
      Math.max(Math.min(v[0] + dv[0], 5), -5),
      Math.max(Math.min(v[1] + dv[1], 5), -5),
    ];
  }

  brake() {
    const v = this.velocity;

    // Differential velocity vector
    const dv = polarToCart(
      // Deceleration is just acceleration in opposite direction
      this.angle + Math.PI,
      Ship.deceleration
    );

    // Can't decelerate if velocity and differential vectors are aligned
    dv[0] = (v[0] * dv[0] > 0) ? 0 : dv[0];
    dv[1] = (v[1] * dv[1] > 0) ? 0 : dv[1];

    // Can't decelerate past 0
    this.velocity = [
      (Math.abs(dv[0]) > Math.abs(v[0])) ? 0 : v[0] + dv[0],
      (Math.abs(dv[1]) > Math.abs(v[1])) ? 0 : v[1] + dv[1],
    ];
  }

  shoot() {
    // Projectile appears ahead of ship
    const pos = vectorAdd(this.pos, polarToCart(this.angle, 10));

    // Projectile inherits ship velocity plus firing velocity
    const vel = vectorAdd(this.velocity, polarToCart(this.angle, 1));

    const id = `${this.id}-p${this.projectiles}`;
    this.projectiles += 1;

    return new Projectile(this.parent, id, pos, this.angle, vel);
  }
}

// Constants control ship handling
Ship.turnSpeed = 0.05;
Ship.acceleration = 0.1;
Ship.deceleration = 0.05;

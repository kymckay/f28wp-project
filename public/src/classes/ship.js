import Entity from './entity';
import Projectile from './projectile';
import { vectorAdd, polarToCart } from '../coordinates';

export default class Ship extends Entity {
  constructor(container, id, pos, angle, isPlayer) {
    super(container, id, pos, [0, 0]);

    // Ship's heading is significant (rads)
    this.angle = angle;

    this.element.classList.add('ship');

    // Need to track projectiles shot for ID generation
    this.projectiles = 0;

    // Differentiate the player's ship
    if (isPlayer) {
      this.element.classList.add('player');
    }

    // Cooldown between cannon shots
    this.lastShot = performance.now();
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
      // Braking always opposes current velocity
      Math.atan2(v[1], v[0]) + Math.PI,
      Ship.deceleration
    );

    // Can't decelerate past 0
    this.velocity = [
      (Math.abs(dv[0]) > Math.abs(v[0])) ? 0 : v[0] + dv[0],
      (Math.abs(dv[1]) > Math.abs(v[1])) ? 0 : v[1] + dv[1],
    ];
  }

  shoot() {
    // Cooldown between shots of 5s (5000ms)
    if (performance.now() - this.lastShot < Ship.shotCooldown) {
      return null;
    }
    this.lastShot = performance.now();

    // Projectile appears ahead of ship
    const pos = vectorAdd(this.pos, polarToCart(this.angle, Ship.shotOffset));

    // Projectile inherits ship velocity plus firing velocity
    const vel = vectorAdd(this.velocity, polarToCart(this.angle, Ship.shotSpeed));

    const id = `${this.id}-p${this.projectiles}`;
    this.projectiles += 1;

    return new Projectile(this.parent, id, pos, this.angle, vel);
  }
}

// Constants control ship handling
Ship.turnSpeed = 0.05;
Ship.acceleration = 0.1;
Ship.deceleration = 0.05;

// Constants for cannon behaviour
Ship.shotSpeed = 5; // px/s
Ship.shotOffset = 10; // px ahead of ship centre
Ship.shotCooldown = 5000; // ms between cannon shots
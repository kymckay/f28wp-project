import Entity from './entity';

export default class Ship extends Entity {
  constructor(container, id, x, y, isPlayer) {
    super(container, id, x, y, [0, 0]);

    this.element.classList.add('ship');

    this.isPlayer = isPlayer;

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
    const [vx, vy] = this.velocity;

    // Differential vector magnitude
    const z = Ship.acceleration;

    // Remember this angle is clockwise from north
    const rads = this.angle;

    const vdx = Math.sin(rads) * z;
    const vdy = Math.cos(rads) * z;

    // Ships cannot infinitely speed up
    const vx2 = Math.max(Math.min(vx + vdx, 5), -5);
    const vy2 = Math.max(Math.min(vy + vdy, 5), -5);

    this.velocity = [vx2, vy2];
  }

  brake() {
    const [vx, vy] = this.velocity;

    // Differential vector magnitude
    const z = Ship.deceleration;

    // Remember this angle is clockwise from north
    const rads = this.angle;

    // Deceleration is just acceleration in opposite direction
    let vdx = Math.sin(rads + Math.PI) * z;
    let vdy = Math.cos(rads + Math.PI) * z;

    // Can't decelerate if velocity and heading vectors are opposed
    vdx = (vx * vdx > 0) ? 0 : vdx;
    vdy = (vy * vdy > 0) ? 0 : vdy;

    // Can't decelerate past 0
    const vx2 = (Math.abs(vdx) > Math.abs(vx)) ? 0 : vx + vdx;
    const vy2 = (Math.abs(vdy) > Math.abs(vy)) ? 0 : vy + vdy;

    this.velocity = [vx2, vy2];
    console.log(this.velocity);
  }
}

// Constants control ship handling
Ship.turnSpeed = 0.05;
Ship.acceleration = 0.1;
Ship.deceleration = 0.05;

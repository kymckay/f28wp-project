import Entity from './entity';

export default class Projectile extends Entity {
  constructor(container, id, x, y, angle, velocity) {
    super(container, id, x, y, velocity);
    this.angle = angle;

    this.element.classList.add('projectile');
  }

  render(screenOX, screenOY) {
    super.render(screenOX, screenOY);

    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }
}

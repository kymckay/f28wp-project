import Entity from './entity';

export default class Projectile extends Entity {
  constructor(container, id, pos, angle, velocity) {
    super(container, id, pos, velocity);
    this.angle = angle;

    this.element.classList.add('projectile');
  }

  render(screenOX, screenOY) {
    super.render(screenOX, screenOY);

    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }
}

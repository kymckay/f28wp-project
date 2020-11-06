import Entity from './entity';

export default class Ship extends Entity {
  constructor(container, id, x, y, isPlayer) {
    super(container, id, x, y, 0);

    this.element.classList.add('ship');

    this.isPlayer = isPlayer;

    this.angle = Math.random() * 360;
  }

  render(screenOX, screenOY) {
    super.render(screenOX, screenOY);

    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }
}

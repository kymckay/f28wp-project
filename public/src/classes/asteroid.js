import Entity from './entity';

export default class Asteroid extends Entity {
  constructor(container, id, pos, velocity, size) {
    super(container, id, pos, velocity);

    this.element.classList.add('asteroid');

    // Asteroids are not all the same size
    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;
  }
}

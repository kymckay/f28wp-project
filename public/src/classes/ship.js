import Entity from './entity';

export default class Ship extends Entity {
  constructor(container, id, x, y, isPlayer) {
    super(container, id, x, y, 0);
    super.createElement(100, 200, Ship.svg());

    this.isPlayer = isPlayer;
  }

  static svg() {
    const triangle = [
      '<polygon points="0,50 100,100 0,100, 0,50" ',
      'style="fill:yellow;" />',
    ].join('');

    return `<svg viewBox="0 0 100 100" width="100%" height="100%">${triangle}</svg>`;
  }
}

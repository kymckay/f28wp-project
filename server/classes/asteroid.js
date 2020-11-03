import Entity from './entity';

export default class Asteroid extends Entity {
  constructor(x, y, scale) {
    super(x, y, 0);

    this.scale = scale;
  }
}

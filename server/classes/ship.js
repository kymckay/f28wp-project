import Entity from './entity';

export default class Ship extends Entity {
  constructor(x, y, isPlayer) {
    super(x, y, 0);

    this.isPlayer = isPlayer;
  }
}

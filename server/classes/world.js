const Ship = require('./ship');
const Asteroid = require('./asteroid');

class World {
  constructor() {
    // Need at least enough cells for minPlayers
    const gridDims = Math.ceil(Math.sqrt(World.minPlayers));

    // World spatial extent starts square
    this.width = gridDims * World.cellSize;
    this.height = this.width;

    // Players will spawn spaced out
    this.spawnPositions = [];
    for (let i = 0; i < gridDims; i++) {
      for (let j = 0; j < gridDims; j++) {
        this.spawnPositions.push([
          i * World.cellSize + World.cellSize / 2,
          j * World.cellSize + World.cellSize / 2,
        ]);
      }
    }

    this.allEntities = {};
  }

  addPlayer(id) {
    if (this.spawnPositions.length === 0) {
      this.expandWorld();
    }

    // Players should not be spawned in any particular pattern
    const pos = this.spawnPositions.splice(
      Math.floor(Math.random() * this.spawnPositions.length),
      1
    )[0];

    const ship = new Ship(pos, true);

    this.allEntities[id] = ship;

    return ship;
  }

  removePlayer(id) {
    // TODO free spawn pos if game not yet started
    delete this.allEntities[id];
  }

  // If more space is needed another column and row are added
  expandWorld() {
    this.width += World.cellSize;
    this.height += World.cellSize;

    // Will always be a multiple so this is an int
    const gridDims = this.width / World.cellSize;
    const offset = this.width - World.cellSize / 2;

    for (let i = 0; i < gridDims; i++) {
      // All new column cells
      this.spawnPositions.push([
        offset,
        i * World.cellSize + World.cellSize / 2,
      ]);

      // Lower right cell is in both column and row
      // Don't duplicate
      if (i === gridDims - 1) {
        break;
      }

      // All new row cells
      this.spawnPositions.push([
        i * World.cellSize + World.cellSize / 2,
        offset,
      ]);
    }
  }

  start() {
  }

  simulate(dT) {
  }

  end() {
  }

  serialize() {
    const asteroids = Object.values(this.allEntities)
      .filter((e) => e instanceof Asteroid)
      .map((e) => e.serialize());
    const ships = Object.values(this.allEntities)
      .filter((e) => e instanceof Ship)
      .map((e) => e.serialize());

    return {
      world: [this.width, this.height],
      asteroids,
      ships,
    };
  }
}
World.minPlayers = 10; // AI will fill slots up to this many players
World.cellSize = 2000; // px (player starts in each cell)

module.exports = World;

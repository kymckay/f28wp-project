const Ship = require('./ship');
const Asteroid = require('./asteroid');

class World {
  constructor() {
    // Need at least enough cells for minPlayers
    const gridDims = Math.ceil(Math.sqrt(World.minPlayers));

    // World spatial extent always square
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

    // Entites stores in objects as they'll be accessed by ID
    this.asteroids = {};
    this.ships = {};
    this.projectiles = {};
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
    ship.id = id;

    this.ships[id] = ship;
  }

  removePlayer(id) {
    // TODO free spawn pos if game not yet started
    delete this.ships[id];
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

  genAsteroids() {
    // Generate asteroids in each cell (avoiding spawn position)
    for (let a = 0; a < World.astFrequency; a++) {
      for (let i = 0; i < this.width; i += World.cellSize) {
        for (let j = 0; j < this.height; j += World.cellSize) {
          // rejection sampling to find points away from cell centre
          let x;
          let y;
          do {
            x = Math.random() * World.cellSize;
            y = Math.random() * World.cellSize;
          } while (
            Math.abs(World.cellSize / 2 - x) < World.clearRadius
            || Math.abs(World.cellSize / 2 - y) < World.clearRadius
          );

          // All asteroids start randomly sized and distributed
          const ast = new Asteroid(
            [i + x, j + y],
            [Math.random() * 6 - 3, Math.random() * 6 - 3], // x,y are within the cell i,j
            Asteroid.minSize + Math.random() * (Asteroid.maxSize - Asteroid.minSize)
          );

          this.asteroids[ast.id] = ast;
        }
      }
    }
  }

  genAIShips() {
    // Any remaining spawn positions become an AI
    this.spawnPositions.forEach((pos) => {
      const ai = new Ship(pos, false);

      this.ships[ai.id] = ai;
    });
  }

  playerInput(playerID, input) {
    const ship = this.ships[playerID];

    // TODO track active input of the ships and simulate their controls
  }

  start() {
    // this.genAIShips();
    this.genAsteroids();

    // FPS determines time between frames
    this.loopInterval = setInterval(this.simulate.bind(this), 1000 / World.fps);
  }

  simulate() {
    this.asteroids.forEach((e) => {
      e.x += e.vel[0] * World.velNorm;
      e.y += e.vel[1] * World.velNorm;

      // Asteroids wrap to other side of world
      // 100 px outside world before wrapping (to hide from clients)
      if (e.x < -100) {
        e.x += this.width + 100;
      } else if (e.x > this.width + 100) {
        e.x -= this.width + 100;
      }

      if (e.y < -100) {
        e.y += this.height + 100;
      } else if (e.y > this.height + 100) {
        e.y -= this.height + 100;
      }
    });

    this.ships.forEach((e) => {
      e.x += e.vel[0] * World.velNorm;
      e.y += e.vel[1] * World.velNorm;
    });

    this.projectiles.forEach((e) => {
      e.x += e.vel[0] * World.velNorm;
      e.y += e.vel[1] * World.velNorm;
    });

    // TODO send snapshots when simulation occurs (and when events occur)
  }

  end() {
    clearInterval(this.loopInterval);
  }

  // addEntity() {}

  // removeEntity() {}

  serialize() {
    // Using ES6 computed property names and the spread operator
    // We essentially have a .map method for objects
    const asteroids = Object.assign(
      {},
      ...Object.keys(this.asteroids).map(
        (k) => ({ [k]: this.asteroids[k].serialize() })
      )
    );
    const ships = Object.assign(
      {},
      ...Object.keys(this.ships).map(
        (k) => ({ [k]: this.ships[k].serialize() })
      )
    );
    const projectiles = Object.assign(
      {},
      ...Object.keys(this.projectiles).map(
        (k) => ({ [k]: this.projectiles[k].serialize() })
      )
    );

    return {
      asteroids,
      ships,
      projectiles,
    };
  }
}
World.minPlayers = 10; // a world will scale for at least this many players
World.cellSize = 2000; // px (player starts in each cell)
World.clearRadius = 100; // px (clear space around spawn positions)
World.astFrequency = 5; // asteroids per grid cell

// determines how often simulation occurs and snapshots are sent
World.fps = 30; // 30 fps ~ 33ms between frames

// Normalise velocities to m/s using time between frames as a percentage of a second
World.velNorm = 1000 / (World.fps * 1000);

module.exports = World;

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
    this.destroyed = [];
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
            [i + x, j + y], // x,y are within the cell i,j
            Asteroid.minSize + Math.random() * (Asteroid.maxSize - Asteroid.minSize),
            // 5% chance asteroid starts stationary
            Math.random() < 0.05 ? 0 : Asteroid.maxSpeed * Math.random()
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

  playerInput(playerID, input, released = false) {
    const ship = this.ships[playerID];
    console.log(`${ship.id} ship -> ${input}`);

    if (released) {
      delete ship.controls[input];
    } else {
      ship.controls[input] = true;
    }
  }

  start() {
    // this.genAIShips();
    this.genAsteroids();
  }

  simulate() {
    this.destroyed.forEach((id) => {
      delete this.asteroids[id];
      delete this.ships[id];
      delete this.projectiles[id];
    });
    this.destroyed = [];

    const asteroids = Object.values(this.asteroids);
    const ships = Object.values(this.ships);
    const projectiles = Object.values(this.projectiles);

    asteroids.forEach((e) => {
      e.simulate(
        this.width,
        this.height,
        World.margin,
        World.normCoef
      );
    });

    ships.forEach((e) => {
      e.simulate(
        this.width,
        this.height,
        World.margin,
        World.normCoef
      );

      // Ship may have fired a new projectile
      if (e.fired) {
        this.projectiles[e.fired.id] = e.fired;
        e.fired = null;
      }

      // Ships die if hit by an asteroid
      e.collisions(asteroids);
    });

    projectiles.forEach((e) => {
      e.simulate(
        this.width,
        this.height,
        World.margin,
        World.normCoef,
        World.fps
      );

      // Projectiles can destroy asteroids and ships
      e.collisions(asteroids, ships);

      // Projectile may expire this frame
      if (e.dead) {
        this.destroyed.push(e.id);
      }
    });
  }

  // end() {
  // }

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

// Normalise any unit to per second using time between frames as a percentage of a second
World.normCoef = 1000 / (World.fps * 1000);

// Entities that wrap (mostyl asteroids) go this far outside world bounds before "teleporting"
World.margin = Asteroid.maxSize / 2 + 1;

module.exports = World;

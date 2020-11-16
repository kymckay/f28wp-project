/* global io */
import Ship from './classes/ship';
import Asteroid from './classes/asteroid';
import { vectorAdd, vectorDiff } from './coordinates';
import { hudMsg } from './hud';

// Server sends game events/state via socket
const socket = io();

// All objects must be tracked for rendering (and any client simulation)
const allEntities = {};

// Track which keys are pressed
const keysDown = {};

// Controls are enabled at different setup stages (this object tracks them)
const handledKeys = {};

window.addEventListener('keydown', (e) => {
  // e.code corresponds to keyboard position
  // and will work the same for any layout
  if (e.code in handledKeys) {
    keysDown[e.code] = true;
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  delete keysDown[e.code];
});

// Dimensions to enforce boundary and simulate wrap-around
const world = [0, 0];

// Screen origin (top left) in world coordinates for rendering
let screenO = [0, 0];

// Player's ship is signifcant in multiple places
let playerId;

function render() {
  // Screen origin (top left) moves with ship (always centered)
  screenO = vectorDiff(
    allEntities[playerId].pos,
    [window.innerWidth / 2, window.innerHeight / 2]
  );

  Object.values(allEntities).forEach((e) => e.render(screenO));
  requestAnimationFrame(render);
}

function keyHandler() {
  // Player ship may be a new object on repsawn
  const playerShip = allEntities[playerId];

  // Ship can't thrust and break together (hence XOR)
  if (keysDown.ArrowUp ? !keysDown.ArrowDown : keysDown.ArrowDown) {
    if (keysDown.ArrowUp) {
      playerShip.accelerate();
    } else {
      playerShip.brake();
    }
  }

  // Ship can't turn boths ways at once (hence XOR)
  if (keysDown.ArrowLeft ? !keysDown.ArrowRight : keysDown.ArrowRight) {
    playerShip.turn(keysDown.ArrowLeft);
  }

  if (keysDown.Space) {
    const proj = playerShip.shoot();

    if (proj) {
      allEntities[proj.id] = proj;
    }
  }
}

// Updates all entity positions in the world
function simulate() {
  Object.values(allEntities).forEach((e) => {
    // TODO prevent exiting world boundary
    e.pos = vectorAdd(e.pos, e.velocity);

    // Asteroids wrap to other side of world
    if (e instanceof Asteroid) {
      if (e.x < 0) {
        e.x += world[0];
      } else if (e.x > world[0]) {
        e.x -= world[0];
      } else if (e.y < 0) {
        e.y += world[1];
      } else if (e.y > world[1]) {
        e.y -= world[1];
      }
    }
  });
}

function preGameSetup(playArea, data) {
  playerId = data.id;

  // Ship always starts centered
  allEntities[playerId] = new Ship(
    playArea,
    data.id,
    data.pos,
    data.dir,
    true // this is the player's ship
  );

  // Rendering loop starts
  requestAnimationFrame(render);

  // Client side logic loop
  setInterval(() => {
    keyHandler();
    simulate();
  }, 10);

  // Enable only ship rotation until game starts
  handledKeys.ArrowLeft = true;
  handledKeys.ArrowRight = true;
}

function onGameStart(playArea, data) {
  // Game starting message no longer applies
  hudMsg('game-start-msg', null);

  // This changes based on players
  [world[0], world[1]] = data.world;

  // All asteroids initialised at game start
  data.asteroids.forEach((astData) => {
    allEntities[astData.id] = new Asteroid(
      playArea,
      astData.id,
      astData.pos,
      astData.vel,
      astData.size
    );
  });

  // All other ships initialised at game start
  data.ships.forEach((shipData) => {
    // Player ship already exists
    if (shipData.id === playerId) {
      return;
    }

    allEntities[shipData.id] = new Ship(
      playArea,
      shipData.id,
      shipData.pos,
      shipData.dir,
      false
    );
  });

  // Enable rest of ship controls now
  handledKeys.ArrowDown = true;
  handledKeys.ArrowUp = true;
  handledKeys.Space = true;

  // Inform server about player's position
  setInterval(() => {
    const playerShip = allEntities[playerId];

    socket.emit('client tick', {
      pos: playerShip.pos,
      vel: playerShip.velocity,
      dir: playerShip.angle,
    });
  }, 10);
}

function onGameTick(playArea, data) {
  data.asteroids.forEach((ast) => {
    allEntities[ast.id].pos = ast.pos;
    allEntities[ast.id].velocity = ast.vel;
  });

  data.ships.forEach((ship) => {
    allEntities[ship.id].pos = ship.pos;
    allEntities[ship.id].angle = ship.dir;
    allEntities[ship.id].velocity = ship.vel;
  });
}

// Page must be ready before we can start interacting with it
window.addEventListener('load', () => {
  const playArea = document.getElementById('playArea');

  // Client should know why they're waiting (and how long's left)
  hudMsg('game-start-msg', 'Game loading...');
  socket.on('prestart count', (remaining) => hudMsg('game-start-msg', `Game loading in ${remaining} seconds`));

  socket.on('player setup', (data) => preGameSetup(playArea, data));

  socket.on('game start', (data) => onGameStart(playArea, data));

  socket.on('game tick', (data) => onGameTick(playArea, data));
});

/* global io */
import Ship from './classes/ship';
// import Asteroid from './classes/asteroid';
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

// Screen origin (top left) in world coordinates for rendering
let screenO = [0, 0];

function render() {
  Object.values(allEntities).forEach((e) => e.render(screenO));
  requestAnimationFrame(render);
}

function keyHandler(playerId) {
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
function simulate(playerId) {
  Object.values(allEntities).forEach((e) => {
    // Screen moves with player's ship (always centered)
    if (e === allEntities[playerId]) {
      screenO = vectorAdd(screenO, e.velocity);
    }

    // TODO prevent exiting world boundary
    e.pos = vectorAdd(e.pos, e.velocity);
  });
}

function preGameSetup(playArea, data) {
  // Top left of screen initial coordinates found from initial ship coordinates
  screenO = vectorDiff(
    data.pos,
    [window.innerWidth / 2, window.innerHeight / 2]
  );

  // Ship always starts centered
  allEntities[data.id] = new Ship(
    playArea,
    data.id,
    data.pos,
    data.dir,
    true // this is the player's ship
  );

  // Client side logic loop
  setInterval(() => {
    keyHandler(data.id);
    simulate(data.id);
  }, 10);

  // Enable only ship rotation until game starts
  handledKeys.ArrowLeft = true;
  handledKeys.ArrowRight = true;
}

function onGameStart(playArea, data) {
  // Game starting message no longer applies
  hudMsg('game-start-msg', null);

  // TODO store world boundary (for screen position bounding)
  // TODO create all asteroid objects and store them

  // Enable rest of ship controls now
  handledKeys.ArrowDown = true;
  handledKeys.ArrowUp = true;
  handledKeys.Space = true;
}

// Page must be ready before we can start interacting with it
window.addEventListener('load', () => {
  const playArea = document.getElementById('playArea');

  // Rendering loop
  requestAnimationFrame(render);

  hudMsg('game-start-msg', 'Game loading...');

  socket.on('player setup', (data) => preGameSetup(playArea, data));

  socket.on('game start', (data) => onGameStart(playArea, data));
});

/* global io */
import Ship from './classes/ship';
import Asteroid from './classes/asteroid';
import { vectorAdd } from './coordinates';
import { hudMsg } from './hud';

// Server sends game events/state via socket
const socket = io();

// All objects must be tracked for rendering (and any client simulation)
const allEntities = {};

// Track which keys are pressed
const keysDown = {};

// Use this object to ignore other key codes in the event
// Only let player rotate their ship initially (until game start)
const handledKeys = {
  ArrowLeft: true,
  ArrowRight: true,
};

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

// Page must be ready before we can start interacting with it
window.addEventListener('load', () => {
  const playArea = document.getElementById('playArea');

  hudMsg('game-start-msg', 'Game loading...');

  // Ship always starts centered
  const playerShip = new Ship(
    playArea,
    // Ship ID is just placeholder until server sends true ID
    -1,
    // Coordindates here are bogus just to get the ship centered before server sends true position
    [window.innerWidth / 2, window.innerHeight / 2],
    true // this is the player's ship
  );
  allEntities[-1] = playerShip;

  function keyHandler() {
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
      // Screen moves when player moves
      if (e === playerShip) {
        screenO = vectorAdd(screenO, e.velocity);
      }

      e.pos = vectorAdd(e.pos, e.velocity);
    });
  }

  socket.on('initial conditions', () => {
    // TODO set screens starting position
    // TODO set ships real position and ID
    // TODO store world boundary (for screen position bounding)
    // TODO create all asteroid objects and store them

    // TODO remove when done for testing purposes
    for (let i = 0; i < 5; i += 1) {
      allEntities[`a${i}`] = new Asteroid(
        playArea,
        `a${i}`,
        [Math.random() * window.innerWidth, Math.random() * window.innerHeight],
        [Math.random(), Math.random()],
        20 + Math.random() * 100
      );
    }
  });

  // Client side logic loop
  setInterval(() => {
    keyHandler();
    simulate();
  }, 10);

  // Rendering loop
  requestAnimationFrame(render);
});

socket.on('game start', () => {
  // Game starting message no longer applies
  hudMsg('game-start-msg', null);

  // Enable rest of ship controls now
  handledKeys.ArrowDown = true;
  handledKeys.ArrowUp = true;
  handledKeys.Space = true;
});

// TODO remove when done testing
socket.on('new connect', (x) => { console.log(x); });

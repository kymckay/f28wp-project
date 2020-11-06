/* global io */
import Ship from './classes/ship';

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
  ArrowDown: true,
  ArrowUp: true,
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

// Position of screen origin in world coordinates (for rendering)
const screenX = 0;
const screenY = 0;

function render() {
  Object.values(allEntities).forEach((e) => e.render(screenX, screenY));
  requestAnimationFrame(render);
}

// Page must be ready before we can start interacting with it
window.addEventListener('load', () => {
  const playArea = document.getElementById('playArea');

  // Ship always starts centered
  const playerShip = new Ship(
    playArea,
    // Ship ID is just placeholder until server sends true ID
    -1,
    // All coordindates here are bogus just to get the ship centered before server sends position
    window.innerWidth / 2,
    window.innerHeight / 2
  );
  allEntities[-1] = playerShip;

  function keyHandler() {
    // Ship can't thrust and break together (hence XOR)
    if (keysDown.ArrowUp ? !keysDown.ArrowDown : keysDown.ArrowDown) {
      const [vx, vy] = playerShip.velocity;

      // Remember this angle is clockwise from north
      const rads = playerShip.angle;

      // Differential vector of magnitude 0.1
      const z = 0.1;

      // Thrusting and braking behave slightly differently
      let vx2 = vx;
      let vy2 = vy;
      if (keysDown.ArrowUp) {
        const vdx = Math.sin(rads) * z;
        const vdy = Math.cos(rads) * z;

        // Ships cannot infinitely speed up
        vx2 = Math.max(Math.min(vx + vdx, 5), -5);
        vy2 = Math.max(Math.min(vy + vdy, 5), -5);
      } else {
        // Deceleration is just acceleration in opposite direction
        let vdx = Math.sin(rads + Math.PI) * z;
        let vdy = Math.cos(rads + Math.PI) * z;

        // Can't decelerate if velocity and heading vectors are opposed
        vdx = (vx * vdx > 0) ? 0 : vdx;
        vdy = (vy * vdy > 0) ? 0 : vdy;

        // Can't decelerate past 0
        vx2 = vx + ((vdx > Math.abs(vx)) ? -vx : vdx);
        vy2 = vy + ((vdy > Math.abs(vy)) ? -vy : vdy);
      }

      playerShip.velocity = [vx2, vy2];
      console.log(playerShip.velocity);
    }

    // Ship can't turn boths ways at once (hence XOR)
    if (keysDown.ArrowLeft ? !keysDown.ArrowRight : keysDown.ArrowRight) {
      playerShip.angle += (keysDown.ArrowLeft ? -0.05 : 0.05);
    }

    if (keysDown.Space) {
      // TODO shoot
      console.log('shooting');
    }
  }

  socket.on('initial conditions', () => {
    // TODO set screens starting position
    // TODO set ships real position and ID
    // TODO store world boundary (for screen position bounding)
    // TODO create all asteroid objects and store them
  });

  // Client side logic loop
  setInterval(() => {
    keyHandler();
  }, 10);

  // Rendering loop
  requestAnimationFrame(render);
});

socket.on('game start', () => {
  // TODO remove the "game starting" message

  // Enable rest of ship controls now
  handledKeys.ArrowDown = true;
  handledKeys.ArrowUp = true;
  handledKeys.Space = true;
});

// TODO remove when done testing
socket.on('new connect', (x) => { console.log(x); });

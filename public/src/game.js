/* global io */
import { vectorDiff } from './coordinates';
import { hudMsg } from './hud';

// Server sends game events/state via socket
const socket = io();

// Track which keys are pressed
const keysDown = {};

// Controls are enabled at different setup stages (this object tracks them)
const handledKeys = {};

window.addEventListener('keydown', (e) => {
  // e.code corresponds to keyboard position
  // and will work the same for any layout
  if (e.code in handledKeys) {
    // Only need to tell server when key starts being held
    if (!(e.code in keysDown)) {
      socket.emit('keydown', e.code);
    }

    keysDown[e.code] = true;
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  delete keysDown[e.code];
  socket.emit('keyup', e.code);
});

// TODO server handle these ship controls
// function keyHandler() {
//   // Ship can't thrust and break together (hence XOR)
//   if (keysDown.ArrowUp ? !keysDown.ArrowDown : keysDown.ArrowDown) {
//     if (keysDown.ArrowUp) {
//       playerShip.accelerate();
//     } else {
//       playerShip.brake();
//     }
//   }

//   // Ship can't turn boths ways at once (hence XOR)
//   if (keysDown.ArrowLeft ? !keysDown.ArrowRight : keysDown.ArrowRight) {
//     playerShip.turn(keysDown.ArrowLeft);
//   }

//   if (keysDown.Space) {
//     const proj = playerShip.shoot();

//     if (proj) {
//       allEntities[proj.id] = proj;
//     }
//   }
// }

function render(now) {
  // Use cumulative time between frames for interpolation
  render.deltaT += now - render.then; // TODO init `then` properly

  // TODO take from front of buffer (until a recent snapshot is found)
  let snapshot = render.buffer.shift();
  // recent when performance.now() - offset is close (offset found via initial call/response with server)

  // TODO Interpolate until next snapshot reached

  // Percentage to interpolate by
  const interp = deltaT / (nextSnapshot.time - lastSnapshot.time);

  // Screen origin (top left) moves with ship (always centered)
  // Used to convert world coordinates to screen coordinates
  render.screenO = vectorDiff(
    snapshot.ships[render.playerId].pos,
    [window.innerWidth / 2, window.innerHeight / 2]
  );

  // Object.values(allEntities).forEach((e) => e.render(screenO));
  // TODO interpolate/render everything in each snapshot

  render.then = now;
  requestAnimationFrame(render);
}
render.deltaT = 0; // No time passed yet

// Snapshot interpolation buffer
// https://gafferongames.com/post/snapshot_interpolation
render.buffer = [];

// Server sends out timestamped game state snapshots, rendering interpolates between them
function onGameTick(snapshot) {
  render.buffer.append(snapshot); // Store in buffer for interpolation
}

// TODO server sends timestamp, use that to store offset, send offset to server
// (timestamps are needed for interpolation)
function preGameSetup(data) {
  // Player ID lets renderer track screen's world position
  // Also to render the player's ship differently
  render.playerId = data.id;

  // Rendering loop starts
  requestAnimationFrame(render);

  // Enable only ship rotation until game starts
  handledKeys.ArrowLeft = true;
  handledKeys.ArrowRight = true;
}

function onGameStart(data) {
  // Game starting message no longer applies
  hudMsg('game-start-msg', null);

  // Enable rest of ship controls now
  handledKeys.ArrowDown = true;
  handledKeys.ArrowUp = true;
  handledKeys.Space = true;
}

// Page must be ready before we can start interacting with it
window.addEventListener('load', () => {
  // Rendering will require the right div later
  render.playArea = document.getElementById('playArea');

  // Client should know why they're waiting (and how long's left)
  hudMsg('game-start-msg', 'Game loading...');
  socket.on('prestart count', (remaining) => hudMsg('game-start-msg', `Game loading in ${remaining} seconds`));

  socket.on('player setup', preGameSetup);

  socket.on('game start', onGameStart);

  socket.on('game tick', onGameTick);
});

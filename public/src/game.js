/* global io */
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

function vectorDiff(v1, v2) {
  return [
    v1[0] - v2[0],
    v1[1] - v2[1],
  ];
}

function worldToScreen(worldCoord, screenO) {
  // Convert coordinate system by subtracting new origin vector
  return vectorDiff(worldCoord, screenO);
}

function render(snapshot) {
  // Screen origin (top left) moves with ship (always centered)
  // Used to convert world coordinates to screen coordinates
  const screenO = vectorDiff(
    snapshot.ships[render.playerId].pos,
    [window.innerWidth / 2, window.innerHeight / 2]
  );

  Object.keys(snapshot.ships).forEach((k) => {
    const e = snapshot.asteroids[k];

    let div = render.divs[k];
    if (!div) {
      div = document.createElement('div');
      render.divs[k] = div;

      // May need to retrieve this div by ID
      div.id = `entity${k}`;

      // Apply ship styling/positioning rules
      div.classList.add('entity');
      div.classList.add('ship');

      render.playArea.appendChild(div);

      // Differentiate the player's ship
      if (k == render.playerId) {
        div.classList.add('player');
      }
    }

    const [x, y] = worldToScreen(e.pos, screenO);

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;
  });

  Object.keys(snapshot.asteroids).forEach((k) => {
    const e = snapshot.asteroids[k];

    let div = render.divs[k];
    if (!div) {
      div = document.createElement('div');
      render.divs[k] = div;

      // May need to retrieve this div by ID
      div.id = `entity${k}`;

      // Apply asteroid styling/positioning rules
      div.classList.add('entity');
      div.classList.add('asteroid');

      // Asteroids are not all the same size
      div.style.width = `${e.size}px`;
      div.style.height = `${e.size}px`;

      render.playArea.appendChild(div);
    }

    const [x, y] = worldToScreen(e.pos, screenO);

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
  });

  // TODO render projectiles
}
render.divs = {};

function preGameSetup(data) {
  // Player ID lets renderer track screen's world position
  // Also to render the player's ship differently
  render.playerId = data.id;

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

  socket.on('game tick', render);
});

/*
  File: Client side game flow
  - Sends player input to server
  - Handles rendering incoming world frames

  Author(s): Kyle
*/

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
  if (e.code in handledKeys) {
    socket.emit('keyup', e.code);

    delete keysDown[e.code];
    e.preventDefault();
  }
});

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

function explosion(x, y, size, playArea, list) {
  const div = document.createElement('div');
  div.classList.add('entity');
  div.classList.add('explosion');

  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;
  div.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

  playArea.appendChild(div);

  // explosions will be removed after some time
  list.push([div, performance.now()]);
}

function render(snapshot) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Screen origin (top left) moves with ship (always centered)
  // Used to convert world coordinates to screen coordinates
  const screenO = vectorDiff(
    snapshot.ships[render.playerId].pos,
    [screenW / 2, screenH / 2]
  );

  // Boundaries let players see where world ends (once it exists)
  if (render.world) {
    const top = screenH - (0 - screenO[1]);
    const bottom = render.world[1] - screenO[1];
    const left = screenW - (0 - screenO[0]);
    const right = render.world[0] - screenO[0];

    render.boundt.style.bottom = `${top}px`;
    render.boundb.style.top = `${bottom}px`;
    render.boundl.style.right = `${left}px`;
    render.boundr.style.left = `${right}px`;
  }

  // First remove any expired explosions (don't iterate over new ones)
  // Loop backwards to safely remove from array while iterating
  const time = performance.now();
  for (let i = render.explosions.length - 1; i >= 0; i--) {
    const exp = render.explosions[i];

    // Explosions last 1s each
    if (time - exp[1] > 1000) {
      exp[0].remove();
      // NOTE could be optimised to a single splice since they're stored in order
      render.explosions.splice(i, 1);
    }
  }

  Object.keys(snapshot.ships).forEach((k) => {
    const e = snapshot.ships[k];
    const [x, y] = worldToScreen(e.pos, screenO);

    let div = render.divs[k];

    if (e.dead) {
      if (div) {
        explosion(x, y, 60, render.playArea, render.explosions);
        div.remove();
      }
      return;
    }

    if (!div) {
      div = document.createElement('div');
      render.divs[k] = div;

      // May need to retrieve this div by ID
      div.id = `entity${k}`;

      // Apply ship styling/positioning rules
      div.classList.add('entity');
      div.classList.add('ship');

      // Differentiate the player's ship
      if (k === render.playerId) {
        div.classList.add('player');
      }

      // Position before appending to avoid visual artifacts
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;

      render.playArea.appendChild(div);
    }

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;
  });

  Object.keys(snapshot.asteroids).forEach((k) => {
    const e = snapshot.asteroids[k];
    const [x, y] = worldToScreen(e.pos, screenO);

    let div = render.divs[k];

    if (e.dead) {
      if (div) {
        explosion(x, y, e.size, render.playArea, render.explosions);
        div.remove();
      }
      return;
    }

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

      // Position before appending to avoid visual artifacts
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;

      render.playArea.appendChild(div);
    }

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
  });

  Object.keys(snapshot.projectiles).forEach((k) => {
    const e = snapshot.projectiles[k];

    let div = render.divs[k];

    // Projectiles just disappear instantly
    if (e.dead) {
      if (div) div.remove();
      return;
    }

    const [x, y] = worldToScreen(e.pos, screenO);

    if (!div) {
      div = document.createElement('div');
      render.divs[k] = div;

      // May need to retrieve this div by ID
      div.id = `entity${k}`;

      // Apply ship styling/positioning rules
      div.classList.add('entity');
      div.classList.add('projectile');

      // Position before appending to avoid visual artifacts
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;

      render.playArea.appendChild(div);
    }

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;
  });
}
render.divs = {};
render.explosions = [];

function preGameSetup(data) {
  // Player ID lets renderer track screen's world position
  // Also to render the player's ship differently
  render.playerId = data.id;

  // World bounds allow rendering the edge of the world
  render.world = data.world;

  // Enable only ship rotation until game starts
  handledKeys.ArrowLeft = true;
  handledKeys.ArrowRight = true;
}

function onGameStart() {
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
  // Rendering will update the boundaries
  render.boundt = document.getElementById('boundt');
  render.boundb = document.getElementById('boundb');
  render.boundl = document.getElementById('boundl');
  render.boundr = document.getElementById('boundr');

  // Client should know why they're waiting (and how long's left)
  hudMsg('game-start-msg', 'Game loading...');
  socket.on('prestart count', (remaining) => hudMsg('game-start-msg', `Game loading in ${remaining} seconds`));

  socket.on('player setup', preGameSetup);

  socket.on('game start', onGameStart);

  socket.on('snapshot', render);
});

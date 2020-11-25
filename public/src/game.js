/*
  File: Client side game flow
  - Sends player input to server
  - Handles rendering incoming world frames

  Author(s): Kyle, Tom
*/

/* global io */
import { hudMsg, scoreboard } from './hud';

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

// Within this function "this" refers to itself (bound on call)
function render(snapshot) {
  function newEntity(id, type, x, y, r = null, size = null) {
    const div = document.createElement('div');
    render.divs[id] = div;

    // May need to retrieve this div by ID
    div.id = `entity${id}`;

    // Apply ship styling/positioning rules
    div.classList.add('entity');
    div.classList.add(type);

    // Differentiate the player's ship
    if (id === render.playerId) {
      div.classList.add('player');

      // If a new ship is created player has respawned
      hudMsg('respawn-msg', null);
    }

    // Position before appending to avoid visual artifacts
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;

    // Not everything has a rotation
    if (r) {
      div.style.transform = `translate(-50%, -50%) rotate(${r}rad)`;
    }

    // Not everything has a size
    if (size) {
      div.style.width = `${size}px`;
      div.style.height = `${size}px`;
    }

    render.parent.appendChild(div);

    return div;
  }

  function renderEntities(entityObj, type, explode = true) {
    Object.keys(entityObj).forEach((k) => {
      const e = entityObj[k];
      const div = render.divs[k];
      const [x, y] = worldToScreen(e.pos, render.screenO);

      if (e.dead) {
        if (div) {
          if (explode) {
            explosion(x, y, 60, render.parent, render.explosions);
          }

          delete render.divs[k];
          div.remove();
        }

        // If the player ship just got removed, they're respawning
        if (k === render.playerId) {
          hudMsg('respawn-msg', 'Respawning...');
        }

        return;
      }

      if (!div) {
        // Size and dir won't exist for everything
        newEntity(k, type, x, y, e.dir, e.size);
      } else {
        // Update existing
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        if (e.dir) {
          div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;
        }
      }
    });
  }

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Screen origin (top left) moves with ship (always centered)
  // Used to convert world coordinates to screen coordinates
  if (this.playerId in snapshot.ships) {
    // Persist screenO for cases where ship no longer exists
    // Screen will remain in place until respwn
    this.screenO = vectorDiff(
      snapshot.ships[this.playerId].pos,
      [screenW / 2, screenH / 2]
    );
  }

  // Boundaries let players see where world ends (once it exists)
  if (this.world) {
    const { screenO } = this;
    const top = screenH - (0 - screenO[1]);
    const bottom = this.world[1] - screenO[1];
    const left = screenW - (0 - screenO[0]);
    const right = this.world[0] - screenO[0];

    this.boundt.style.bottom = `${top}px`;
    this.boundb.style.top = `${bottom}px`;
    this.boundl.style.right = `${left}px`;
    this.boundr.style.left = `${right}px`;
  }

  // First remove any expired explosions (don't iterate over new ones)
  // Loop backwards to safely remove from array while iterating
  const time = performance.now();
  for (let i = this.explosions.length - 1; i >= 0; i--) {
    const exp = this.explosions[i];

    // Explosions last 1s each
    if (time - exp[1] > 1000) {
      exp[0].remove();
      // NOTE could be optimised to a single splice since they're stored in order
      this.explosions.splice(i, 1);
    }
  }

  // Render everything the server says exists
  renderEntities(snapshot.ships, 'ship');
  renderEntities(snapshot.asteroids, 'asteroid');
  renderEntities(snapshot.projectiles, 'projectile', false);
}
render.divs = {};
render.explosions = [];
render.screenO = [0, 0]; // Need some initial value until ship exists

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
  render.parent = document.getElementById('playArea');
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

  // Bind so render can access its own storage
  socket.on('snapshot', render.bind(render));

  // When game ends scoreboard will be shown which offers to play again
  socket.on('game over', scoreboard);
});

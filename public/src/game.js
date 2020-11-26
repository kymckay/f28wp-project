/*
  File: Client side game flow
  - Sends player input to server
  - Handles rendering incoming world frames

  Author(s): Kyle
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

// Within this function "this" refers to itself (bound on call)
function render(snapshot) {
  function worldToScreen(worldCoord) {
    // Convert coordinate system by subtracting new origin vector
    return vectorDiff(worldCoord, render.screenO);
  }

  // Instantiates entity divs in the rendering system
  function newEntity(id, type, x, y, r = null, size = null) {
    const div = document.createElement('div');
    render.divs[id] = div;

    // May need to retrieve this div by ID
    div.id = `entity${id}`;

    // Apply ship styling/positioning rules
    div.classList.add('entity');
    div.classList.add(type);

    // Differentiate the player's ship
    if (id === render.pid) {
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

  // Instantiate a temporary static div in the render system
  // (explosions and player trail)
  function newStatic(type, x, y, size, life) {
    const div = document.createElement('div');
    const id = render.staticID++;

    div.id = `static${id}`;

    div.classList.add('entity');
    div.classList.add(type);

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;

    if (size) {
      div.style.width = `${size}px`;
      div.style.height = `${size}px`;
    }

    // Currently all statics are okay to rotate randomly
    div.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

    render.parent.appendChild(div);

    // Reverse the screen transformation to store static in world
    const wx = x + render.screenO[0];
    const wy = y + render.screenO[1];

    // Statics are all temporary
    render.statics[id] = {
      div,
      wx,
      wy,
      life,
    };
  }

  // Updates entity divs in the rendering system to match the snapshot object
  function renderEntities(entityObj, type, explode = true) {
    Object.keys(entityObj).forEach((k) => {
      const e = entityObj[k];
      const div = render.divs[k];
      const [x, y] = worldToScreen(e.pos);

      if (e.dead) {
        if (div) {
          if (explode) {
            newStatic('explosion', x, y, e.size ? e.size : 60, 1000);
          }

          delete render.divs[k];
          div.remove();
        }

        // If the player ship just got removed, they're respawning
        if (k === render.pid) {
          hudMsg('respawn-msg', 'Respawning...');
        }

        return;
      }

      if (!div) {
        // Size and dir won't exist for everything
        newEntity(k, type, x, y, e.dir, e.size);
      } else {
        // If player ship is moving create trail behind
        if (k === render.pid) {
          // These calcs must be done in world coords
          // Screen moves with ship, so no difference
          const diff = vectorDiff(e.pos, render.position);
          const [diffX, diffY] = diff;

          // 1600 is 40^2, make trail every 40px
          render.distanceSqr += (diffX * diffX) + (diffY * diffY);
          if (render.distanceSqr >= 1600) {
            render.distanceSqr = 0;

            const [oldX, oldY] = worldToScreen(render.position);
            newStatic('trail', oldX, oldY, null, 3000);
          }

          // Cache true position between frames for distance calcs
          render.position = e.pos;
        }

        // Update existing
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        if (e.dir) {
          div.style.transform = `translate(-50%, -50%) rotate(${e.dir}rad)`;
        }
      }
    });
  }

  // Update static entities in the render system
  // These are temporary client-side visuals
  function renderStatics() {
    const dt = performance.now() - render.time;

    Object.keys(render.statics).forEach((k) => {
      const {
        div, wx, wy, life,
      } = render.statics[k];

      // Static expired
      if (life <= 0) {
        div.remove();
        delete render.statics[k];
        return;
      }

      const [x, y] = worldToScreen([wx, wy]);

      div.style.left = `${x}px`;
      div.style.top = `${y}px`;

      render.statics[k].life -= dt;
    });
  }

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Screen origin (top left) moves with ship (always centered)
  // Used to convert world coordinates to screen coordinates
  if (this.pid in snapshot.ships) {
    // Persist screenO for cases where ship no longer exists
    // Screen will remain in place until respwn
    this.screenO = vectorDiff(
      snapshot.ships[this.pid].pos,
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

  // Render everything the server says exists
  renderEntities(snapshot.ships, 'ship');
  renderEntities(snapshot.asteroids, 'asteroid');
  renderEntities(snapshot.projectiles, 'projectile', false);

  // Update client-side statics
  renderStatics();

  // For tracking time between frames
  render.time = performance.now();
}
render.divs = {};
render.statics = {};
render.staticID = 0;
render.time = performance.now();
render.position = [0, 0]; // Cache player position between frames
render.distanceSqr = 0; // Tracking cumulative player distance moved
render.screenO = [0, 0]; // Need some initial value until ship exists

function preGameSetup(data) {
  // Player ID lets renderer track screen's world position
  // Also to render the player's ship differently
  render.pid = data.id;

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

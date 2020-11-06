/* global io */

import Controller from './controller';
import PhysicsObject from './physicsObject';
import Particle from './particle';
import Vector from './vector';
import circleCircle from './collision';

const gameObjects = {};
const playerID = 0;

let [width, height] = [0, 0];
let gameWindow;
let lastFrame;

// TODO: move all this logic to server
function loop() {
  // CALCULATE ELAPSED TIME SINCE LAST FRAME
  const now = Date.now();
  const dT = Math.min((now - lastFrame) / 1000, 200);
  lastFrame = now;

  // UPDATE ALL PHYSICS OBJECTS
  const objsToDestroy = [];
  Object.values(gameObjects).forEach((obj) => {
    obj.update(dT);
    if (obj.destroyNextFrame) objsToDestroy.push(obj.id);
  });

  Object.keys(gameObjects).forEach((objID) => {
    const obj = gameObjects[objID];

    Object.keys(gameObjects).forEach((otherID) => {
      // Can't collide with self
      if (objID === otherID) {
        return;
      }

      const other = gameObjects[otherID];

      if (circleCircle(obj, other)) {
        if (obj.hasTag('projectile') && other.hasTag('asteroid')) {
          objsToDestroy.push(obj.id);
          objsToDestroy.push(other.id);
          const explosion = new Particle(gameWindow, obj, Vector.zero, 1);
          explosion.div.classList.add('explosion');
          explosion.addTag('effect');
          gameObjects[explosion.id] = explosion;
        }
      }
    });

    obj.bounds(true);
  });

  objsToDestroy.forEach((id) => {
    gameObjects[id].cleanUp();
    delete gameObjects[id];
  });
}

// TODO: render all objects server says exist using screen coordinate conversion
function render() {
  // ITERATE THROUGH ALL gameObjects
  Object.values(gameObjects).forEach((obj) => obj.render());
  requestAnimationFrame(render);
}

// TODO: Place player in center of window always
// TODO: Set player's unique ship start coordinate when server sends them
// TODO: Enable controls after game start signal from server (everyone start "paused")
function setup() {
  gameWindow = document.getElementById('playArea');

  width = window.innerWidth;
  height = window.innerHeight;

  const center = new Vector(width / 2, height / 2);
  lastFrame = Date.now();

  const playerObj = new PhysicsObject(gameWindow,
    new Vector(width / 2, height / 2),
    new Vector(),
    32);

  playerObj.div.classList.add('player');
  playerObj.addTag('ship');
  playerObj.collidable = true;
  gameObjects[playerObj.id] = playerObj;

  for (let i = 0; i < 8; i += 1) {
    const position = Vector.randomUnit();
    position.mul(width / 2);
    position.add(center);
    const velocity = Vector.fromAngle(Math.random() * Math.PI * 2, 2);
    const rockObj = new PhysicsObject(gameWindow, position, velocity, 40);
    rockObj.div.classList.add('rock');
    rockObj.addTag('asteroid');
    rockObj.canRotate = true;
    rockObj.pangle -= (Math.random() * 0.0872665) - 0.0436332;
    gameObjects[rockObj.id] = rockObj;
  }

  setInterval(mainLoop, 10);
  requestAnimationFrame(render);
}

function mainLoop() {
  keyHandler();
}

// Track which keys are pressed
const keysDown = {};

function keyHandler() {
  // Ship can't thrust and break together (hence XOR)
  if (keysDown['ArrowUp'] ? !keysDown['ArrowDown'] : keysDown['ArrowDown']) {
    // TODO thurst/slow
    console.log('throttling');
  }

  // Ship can't turn boths ways at once (hence XOR)
  if (keysDown['ArrowLeft'] ? !keysDown['ArrowRight'] : keysDown['ArrowRight']) {
    // TODO turn ship
    console.log('turning');
  }

  if (keysDown['Space']) {
    // TODO shoot
    console.log('shooting');
  }
}

// Use this object to prevent the event firing for the given key codes
const handledKeys = {
  'ArrowLeft': true,
  'ArrowDown': true,
  'ArrowRight': true,
  'ArrowUp': true,
  'Space': true,
}

function onKeyDown(e) {
  // e.code corresponds to keyboard position
  // and will work the same for any layout
  keysDown[e.code] = true;

  if (e.code in handledKeys) {
    e.preventDefault();
  }
}

function onKeyUp(e) {
  delete keysDown[e.code];
}

// Await events from server for setup
const socket = io();

// Prepare the play area initially
window.addEventListener('load', setup);

// Let player rotate their ship initially
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

socket.on('game start', () => {
  // TODO Only add thrust and shoot controls after game starts
});


socket.on('initial conditions', () => {
  // TODO set ship position
  // TODO set world boundary
  // TODO start rendering asteroids
});

// TODO remove when done testing
socket.on('server tick', (x) => { console.log(x); });

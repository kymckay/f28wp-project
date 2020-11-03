/* global io */

import ActionMap from './actionMap';
import Controller from './controller';
import PhysicsObject from './physicsObject';
import Particle from './particle';
import Vector from './vector';
import circleCircle from './collision';

const gameObjects = {};
const playerID = 0;
const bindings = new ActionMap();
const keyState = {};

let [width, height] = [0, 0];
let gameWindow;
let lastFrame;
let playerController;

// TODO: separate out and fix movement controls
// TODO: move all this logic to server
function loop() {
  // CALCULATE ELAPSED TIME SINCE LAST FRAME
  const now = Date.now();
  const dT = Math.min((now - lastFrame) / 1000, 200);
  lastFrame = now;

  // HANDLE INPUTS
  Object.keys(bindings.mappings).forEach((key) => {
    if (keyState[key]) playerController.handleInput(key);
  });

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

  playerController = new Controller(gameWindow, gameObjects, playerID, bindings);
  bindings.add('ArrowUp', playerController.forward);
  bindings.add('ArrowDown', playerController.backward);
  bindings.add('ArrowLeft', playerController.left);
  bindings.add('ArrowRight', playerController.right);
  bindings.add(' ', playerController.shoot);

  setInterval(loop, 10);
  requestAnimationFrame(render);
}

function keydownEvent(e) {
  keyState[e.key] = true;
}

function keyupEvent(e) {
  keyState[e.key] = false;
}

window.addEventListener('load', setup);
window.addEventListener('keyDown', keydownEvent);
window.addEventListener('keyUp', keyupEvent);

const socket = io();

socket.on('server tick', (x) => { console.log(x); });

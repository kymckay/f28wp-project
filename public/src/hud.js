/*
  File: Contains functions for manipulating the player HUD
  Author(s): Kyle
*/

export function hudMsg(id, msg) {
  // Message elements are added to a stacked column
  if (!(id in hudMsg.elements)) {
    const list = document.getElementById('msg-list');
    const e = document.createElement('p');
    list.appendChild(e);

    hudMsg.elements[id] = e;
  }

  // Messages can be updated or removed
  const e = hudMsg.elements[id];

  if (msg === null) {
    e.remove();
  } else {
    e.innerHTML = msg;
  }
}
// Store added messages for removal
hudMsg.elements = {};

export function hudLives(num) {
  console.log(num);
  // TODO reflect remaining number of lives in the HUD
}

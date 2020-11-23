/*
  File: Contains functions for manipulating the player HUD
  Author(s): Kyle
*/

export default function hudMsg(id, msg) {
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
    delete hudMsg.elements[id];
  } else {
    e.innerHTML = msg;
  }
}
// Store added messages for removal
hudMsg.elements = {};

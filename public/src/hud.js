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
    delete hudMsg.elements[id];
  } else {
    e.innerHTML = msg;
  }
}
// Store added messages for removal
hudMsg.elements = {};

export function scoreboard(data) {
  // Delete any on screen messages when scoreboard is shown
  document.getElementById('msg-list').remove();

  // Use document fragment to trigger reflow only once later
  const sb = document.createDocumentFragment();

  // Scoreboard will have a title, table, and button
  const title = document.createElement('h1');
  const table = document.createElement('table');
  const form = document.createElement('form');
  const button = document.createElement('input');

  sb.appendChild(title);
  sb.appendChild(table);
  sb.appendChild(form);
  form.appendChild(button);

  // Title informs user game ended
  title.innerHTML = 'Game Results';

  // Table headings
  const thr = document.createElement('tr');
  ['Player', 'Kills', 'Deaths', 'Score'].forEach((h) => {
    const th = document.createElement('th');
    th.innerHTML = h;

    thr.appendChild(th);
  });
  table.appendChild(thr);

  // Data will be pre-sorted by score (winner at top)
  Object.keys(data).forEach((k) => {
    const tr = document.createElement('tr');

    const player = document.createElement('td');
    const kills = document.createElement('td');
    const deaths = document.createElement('td');
    const score = document.createElement('td');

    player.innerHTML = k;
    kills.innerHTML = data[k].kills;
    deaths.innerHTML = data[k].deaths;
    score.innerHTML = data[k].score;

    tr.appendChild(player);
    tr.appendChild(kills);
    tr.appendChild(deaths);
    tr.appendChild(score);
    table.appendChild(tr);
  });

  // Hitting play again just reloads the page for ease
  form.setAttribute('action', '/play');
  form.setAttribute('method', 'post');
  button.setAttribute('value', 'PLAY AGAIN');
  button.setAttribute('type', 'submit');

  document.getElementById('scoreboard').appendChild(sb);
}

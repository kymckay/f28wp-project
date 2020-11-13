import { worldToScreen } from '../coordinates';

export default class Entity {
  // entity attributes supplied by server
  constructor(container, id, pos, velocity) {
    this.id = id;
    this.pos = pos; // [x, y] vector
    this.velocity = velocity; // [x, y] vector

    // Consider splitting graphic into seperate class wrapped by this one
    this.parent = container;
    this.element = this.createElement(container);
  }

  // Child classes must call createElement with their desired svg
  createElement(parent) {
    const div = document.createElement('div');

    // May need to retrieve this div by ID
    div.id = `entity${this.id}`;

    // Apply entity styling/positioning rules
    div.classList.add('entity');

    parent.appendChild(div);

    return div;
  }

  get x() { return this.pos[0]; }

  set x(x) { this.pos[0] = x; }

  get y() { return this.pos[1]; }

  set y(y) { this.pos[1] = y; }

  // All entites will be rendered on screen in some way
  render(screenO) {
    const div = this.element;

    const [xPx, yPx] = worldToScreen(this.pos, screenO);

    div.style.left = `${xPx}px`;
    div.style.top = `${yPx}px`;
  }
}

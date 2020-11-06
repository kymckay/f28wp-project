import worldToScreen from '../coordinates';

export default class Entity {
  // entity attributes supplied by server
  constructor(container, id, x, y, velocity) {
    this.id = id;
    this.pos = [x, y];
    this.velocity = velocity;

    // Consider splitting graphic into seperate class wrapped by this one
    this.parent = container;
  }

  // Child classes must call createElement with their desired svg
  createElement(width, height, svg = '') {
    const div = document.createElement('div');

    // May need to retrieve this div by ID
    div.id = `entity${this.id}`;

    div.style.width = `${width}px`;
    div.style.height = `${height}px`;

    // Apply entity styling/positioning rules
    div.classList.add('entity');

    // Add the graphics inside
    div.innerHTML = svg;

    this.parent.appendChild(div);

    this.element = div;
  }

  get x() { return this.pos[0]; }

  set x(x) { this.pos[0] = x; }

  get y() { return this.pos[1]; }

  set y(y) { this.pos[1] = y; }

  // All entites will be rendered on screen in some way
  render(screenOX, screenOY) {
    const div = this.element;

    const [xPx, yPx] = worldToScreen(this.x, this.y, screenOX, screenOY);

    div.style.left = `${xPx}px`;
    div.style.top = `${yPx}px`;
  }
}
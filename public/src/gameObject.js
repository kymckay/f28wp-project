export default class GameObject {
  constructor(parent) {
    this.div = document.createElement('div');
    this.id = GameObject.newId();
    this.div.id = this.id;
    this.div.classList.add('gameObject');
    this.tags = [];

    this.envWidth = window.innerWidth;
    this.envHeight = window.innerHeight;

    parent.appendChild(this.div);
  }

  cleanUp() {
    this.div.remove();
  }

  hasTag(t) {
    return this.tags.includes(t);
  }

  addTag(t) {
    this.tags.push(t);
  }

  setPos(x, y) {
    this.div.style.left = `${x}px`;
    this.div.style.top = `${y}px`;
  }

  setRot(a) {
    this.div.style.transform = `translate(-50%, -50%) rotate(${a}rad)`;
  }

  setSize(w, h) {
    this.div.style.width = `${w}px`;
    this.div.style.height = `${h}px`;
    this.div.style.lineHeight = `${h}px`;
  }

  setColour(c) {
    this.div.style.background = c;
  }

  static newId() {
    GameObject.ID += 1;
    return GameObject.ID;
  }
}
GameObject.ID = 0;

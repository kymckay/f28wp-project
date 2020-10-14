export default class ActionMap {
  constructor() {
    this.mappings = {};
  }

  map(key) {
    return this.mappings[key];
  }

  add(key, action) {
    if (key in this.mappings) throw new Error('Key already bound');
    this.mappings[key] = action;
  }

  remove(key) {
    delete this.mappings[key];
  }
}

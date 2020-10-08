export default class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static randomUnit() {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    return new Vector(x, y);
  }

  static fromAngle(a = 0, r = 1) {
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    return new Vector(x, y);
  }

  static copy(v) {
    return new Vector(v.x, v.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  mul(s) {
    this.x *= s;
    this.y *= s;
  }

  div(s) {
    this.x /= s;
    this.y /= s;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalise() {
    const l = this.length();
    if (l === 0) this.zero();
    else this.div(this.length());
  }

  normalised() {
    const l = this.length();
    if (l === 0) return new Vector(0, 0);
    return new Vector(this.x / l, this.y / l);
  }

  right() {
    return new Vector(-this.y, this.x);
  }

  left() {
    return new Vector(this.y, -this.x);
  }

  zero() {
    this.x = 0;
    this.y = 0;
  }
}
Vector.zero = new Vector(0, 0);

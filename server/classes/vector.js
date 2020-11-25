/*
  File: Vector class

  - Makes position/velocity storage all consistent
  - Static methods for vector operations used often

  Author(s): Kyle
*/

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get theta() { return Math.atan2(this.y, this.x); }

  get z() { return Math.sqrt(this.zSqr); }

  // Sometimes you only want the magnitude squared for comparison
  get zSqr() { return this.x * this.x + this.y * this.y; }
}

Vector.add = (v1, v2) => new Vector(v1.x + v2.x, v1.y + v2.y);
Vector.diff = (v1, v2) => new Vector(v1.x - v2.x, v1.y - v2.y);
Vector.mult = (v, s) => new Vector(v.x * s, v.y * s);

Vector.dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

// Angles in this world are measured clockwise from x-axis
Vector.polarToCart = (theta, z) => new Vector(Math.cos(theta) * z, Math.sin(theta) * z);

module.exports = Vector;

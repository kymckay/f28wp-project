import GameObject from './gameObject';
import Vector from './vector';

export default class PhysicsObject extends GameObject {
  constructor(parent, position, velocity, radius = 50, mass = 1) {
    super(parent);

    this.pos = position;
    this.ppos = new Vector(position.x - velocity.x, position.y - velocity.y);
    this.acceleration = new Vector();
    this.thrust = 0;
    this.angle = 0;
    this.pangle = 0;
    this.mass = mass;
    this.radius = radius;
    super.setSize(radius * 2, radius * 2);
    this.pinned = false;
    this.canRotate = false;
    this.removeNextFrame = false;
  }

  applyForce(f) {
    // NEWTONS 2ND LAW OF MOTION
    // F = m * a -> a = F / m
    f.div(this.mass);
    this.acceleration.add(f);
  }

  velocity() {
    return new Vector(this.pos.x - this.ppos.x, this.pos.y - this.ppos.y);
  }

  update(dT) {
    this.thrust = this.acceleration.length();
    if (!this.pinned) {
      this.acceleration.mul(dT * dT);
      const newPos = Vector.copy(this.pos);
      newPos.mul(2);
      newPos.sub(this.ppos);
      newPos.add(this.acceleration);
      this.ppos = Vector.copy(this.pos);
      this.pos = newPos;
      this.acceleration.zero();

      this.moving = this.velocity().length() > 0.05;
    }
    if (this.canRotate) {
      const angularVel = this.angle - this.pangle;
      this.pangle = this.angle;
      this.angle += angularVel;// * dT;
    }
  }

  bounds(wrap = false) {
    const vel = this.velocity();

    if (wrap) {
      if (this.pos.x < 0) {
        this.pos.x = this.envWidth;
        this.ppos.x = this.envWidth - vel.x;
      } else if (this.pos.x > this.envWidth) {
        this.pos.x = vel.x;
        this.ppos.x = 0;
      }
      if (this.pos.y < 0) {
        this.pos.y = this.envHeight;
        this.ppos.y = this.envHeight - vel.y;
      } else if (this.pos.y > this.envHeight) {
        this.pos.y = vel.y;
        this.ppos.y = 0;
      }
    } else {
      if (this.pos.x <= this.radius) {
        this.pos.x = this.radius - vel.x;
        this.ppos.x = this.radius;
      } else if (this.pos.x >= this.envWidth - this.radius) {
        this.pos.x = this.envWidth - this.radius - vel.x;
        this.ppos.x = this.envWidth - this.radius;
      }

      if (this.pos.y <= this.radius) {
        this.pos.y = this.radius - vel.y;
        this.ppos.y = this.radius;
      } else if (this.pos.y >= this.envHeight - this.radius) {
        this.pos.y = this.envHeight - this.radius - vel.y;
        this.ppos.y = this.envHeight - this.radius;
      }
    }
  }

  render() {
    this.setPos(this.pos.x, this.pos.y);
    this.setRot(this.angle);
  }

  move(v) {
    this.pos.add(v);
    this.ppos.add(v);
  }

  moveTo(v) {
    const vel = this.velocity();
    this.pos = Vector.copy(v);
    this.ppos = Vector.copy(v).sub(vel);
  }
}

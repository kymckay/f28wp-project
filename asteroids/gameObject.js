class gameObject {
    static ID = 0;
    id; div; tags = [];

    constructor(parent) {
        this.div = document.createElement("div");
        this.id = gameObject.ID++;
        this.div.id = this.id;
        this.div.classList.add("gameObject");
        //this.div.innerHTML = "&#x2192";
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
        this.div.style.left = x + "px";
        this.div.style.top = y + "px";
    }

    setRot(a) {
        this.div.style.transform = "translate(-50%, -50%) rotate(" + a + "rad)";
    }

    setSize(w, h) {
        this.div.style.width = w + "px";
        this.div.style.height = h + "px";
        this.div.style.lineHeight = h + "px";
    }

    setColour(c) {
        this.div.style.background = c;
    }
}

class physicsObject extends gameObject {
    pos;
    ppos;
    acceleration;
    thrust;
    angle;
    pangle;
    mass;
    radius;
    pinned;
    canRotate;
    moving;
    collidable;
    destroyNextFrame;

    constructor(parent, position, velocity, radius = 50, mass = 1, collidable = false) {
        super(parent);

        this.pos = position;
        this.ppos = new vector(position.x - velocity.x, position.y - velocity.y);
        this.acceleration = new vector();
        this.thrust = 0;
        this.angle = 0;
        this.pangle = 0;
        this.mass = mass;
        this.radius = radius;
        super.setSize(radius * 2, radius * 2);
        this.pinned = false;
        this.canRotate = false;
        this.collidable = false;
        this.removeNextFrame = false;
    }

    applyForce(f) {
        // NEWTONS 2ND LAW OF MOTION
        // F = m * a -> a = F / m
        f.div(this.mass);
        this.acceleration.add(f);
    }

    velocity() {
        return new vector(this.pos.x - this.ppos.x, this.pos.y - this.ppos.y);
    }

    update(dT) {
        this.thrust = this.acceleration.length();
        if (!this.pinned) {
            this.acceleration.mul(dT * dT);
            let newPos = vector.copy(this.pos);
            newPos.mul(2);
            newPos.sub(this.ppos);
            newPos.add(this.acceleration);
            this.ppos = vector.copy(this.pos);
            this.pos = newPos;
            this.acceleration.zero();

            this.moving = this.velocity().length() > 0.05;
        }
        if (this.canRotate) {
            let angularVel = this.angle - this.pangle;
            this.pangle = this.angle;
            this.angle += angularVel;// * dT;
        }
    }

    bounds(wrap = false) {
        let vel = this.velocity();

        if (wrap) {
            if (this.pos.x < 0) {
                this.pos.x = width;
                this.ppos.x = width - vel.x;
            }
            else if (this.pos.x > width) {
                this.pos.x = vel.x;
                this.ppos.x = 0;
            }
            if (this.pos.y < 0) {
                this.pos.y = height;
                this.ppos.y = height - vel.y;
            }
            else if (this.pos.y > height) {
                this.pos.y = vel.y;
                this.ppos.y = 0;
            }
        }
        else {
            if (this.pos.x <= this.radius) {
                this.pos.x = this.radius - vel.x;
                this.ppos.x = this.radius;
            }
            else if (this.pos.x >= width - this.radius) {
                this.pos.x = width - this.radius - vel.x;
                this.ppos.x = width - this.radius;
            }

            if (this.pos.y <= this.radius) {
                this.pos.y = this.radius - vel.y;
                this.ppos.y = this.radius;
            }
            else if (this.pos.y >= height - this.radius) {
                this.pos.y = height - this.radius - vel.y;
                this.ppos.y = height - this.radius;
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
        let vel = this.velocity();
        this.pos = vector.copy(v);
        this.ppos = vector.copy(v).sub(vel);
    }
}

class particle extends physicsObject {

    creator;
    lifetime;

    constructor(parent, creator, velocity, lifetime) {
        super(parent, vector.copy(creator.pos), velocity, 10, 0.05);
        this.collidable = true;
        this.lifetime = lifetime;
    }

    update(dT) {
        super.update(dT);
        this.lifetime -= dT;
        if (this.lifetime <= 0)
            this.destroyNextFrame = true;
    }
}
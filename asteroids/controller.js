class controller {
    target;
    bindings;
    moveForce;
    turnSpeed;
    fireDelay;
    lastFire;

    constructor(target, inputs) {
        this.target = target;
        this.bindings = inputs;
        this.moveForce = 320;
        this.turnSpeed = 0.05;
        this.fireDelay = 380;
        this.lastFire = 0;
    }

    handleInput(key) {
        let action = this.bindings.map(key);
        if (action)
            action(this);
    }

    shoot(c) {
        let now = Date.now();
        if ((now - c.lastFire) >= c.fireDelay) {
            let angle = c.target.angle;
            let velocity = vector.fromAngle(angle, 5.2);
            velocity.add(c.target.velocity());
            let obj = new particle(gameWindow, c.target, velocity, 1.4);
            obj.div.classList.add("laser");
            obj.addTag("projectile");
            obj.angle = angle;
            gameObjects[obj.id] = obj;

            c.lastFire = now;
        }
    }

    forward(c) {
        let force = vector.fromAngle(c.target.angle, c.moveForce);
        c.target.applyForce(force);
    }

    backward(c) {
        let force = vector.fromAngle(c.target.angle + Math.PI, c.moveForce);
        c.target.applyForce(force);
    }

    left(c) {
        c.target.angle -= c.turnSpeed;
    }

    right(c) {
        c.target.angle += c.turnSpeed;
    }

    test() {
        console.log("Test was called from: ");
        console.log(this);
    }
}

class actionMap {
    mappings;

    constructor() {
        this.mappings = {};
    }

    map(key) {
        return this.mappings[key];
    }

    add(key, action) {
        if (key in this.mappings)
            throw "this key is already bound";
        this.mappings[key] = action;
    }

    remove() {
        delete this.mappings[key];
    }
}
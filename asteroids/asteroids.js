let width = 0, height = 0;
let gameWindow;
var lastFrame;
var gameObjects = {};
const playerID = 0;
let playerController;
let bindings = new actionMap();
let keyState = {};

function setup() {
    gameWindow = document.getElementById("gameWindow");
    width = gameWindow.style.width.slice(0, -2);
    height = gameWindow.style.height.slice(0, -2);
    const center = new vector(width / 2, height / 2);
    lastFrame = Date.now();

    let obj = new physicsObject(gameWindow, new vector(width / 2, height / 2),
        new vector(), 32);
    obj.div.classList.add("player");
    obj.addTag("ship");
    obj.collidable = true;
    gameObjects[obj.id] = obj;

    for (let i = 0; i < 8; i++) {
        let position = vector.randomUnit();
        position.mul(width / 2);
        position.add(center);
        let velocity = vector.fromAngle(Math.random() * Math.PI * 2, 2);
        let obj = new physicsObject(gameWindow, position, velocity, 40);
        obj.div.classList.add("rock");
        obj.addTag("asteroid");
        obj.canRotate = true;
        obj.pangle -= (Math.random() * 0.0872665) - 0.0436332;
        gameObjects[obj.id] = obj;
    }

    playerController = new controller(gameObjects[playerID], bindings);
    bindings.add("ArrowUp", playerController.forward);
    bindings.add("ArrowDown", playerController.backward);
    bindings.add("ArrowLeft", playerController.left);
    bindings.add("ArrowRight", playerController.right);
    bindings.add(" ", playerController.shoot)

    setInterval(loop, 10);
    requestAnimationFrame(render);
}

function loop() {
    // CALCULATE ELAPSED TIME SINCE LAST FRAME
    let now = Date.now();
    let dT = Math.min((now - lastFrame) / 1000, 200);
    lastFrame = now;

    // HANDLE INPUTS
    for (const [key, action] of Object.entries(bindings.mappings)) {
        if (keyState[key])
            playerController.handleInput(key);
    }

    // UPDATE ALL PHYSICS OBJECTS
    let objsToDestroy = [];
    for (const [id, obj] of Object.entries(gameObjects)) {
        obj.update(dT);
        if (obj.destroyNextFrame)
            objsToDestroy.push(obj.id);
    }

    for (const [objID, obj] of Object.entries(gameObjects)) {
        for (const [otherID, other] of Object.entries(gameObjects)) {
            if (objID == otherID)
                break;
            if (circleCircle(obj, other)) {
                console.log("Collision between: " + obj.id + " & " + other.id);
                if (obj.hasTag("projectile") && other.hasTag("asteroid")) {
                    objsToDestroy.push(obj.id);
                    objsToDestroy.push(other.id);
                    let explosion = new particle(gameWindow, obj, vector.zero, 1);
                    explosion.div.classList.add("explosion");
                    explosion.addTag("effect");
                    gameObjects[explosion.id] = explosion;
                }
            }

        }
        obj.bounds(true);
    }
    objsToDestroy.forEach(id => {
        gameObjects[id].cleanUp();
        delete gameObjects[id];
    });
}

function render() {
    // ITERATE THROUGH ALL gameObjects
    for (const [id, obj] of Object.entries(gameObjects)) {
        obj.render();
    }

    requestAnimationFrame(render);
}

function mouseEvent(e) {
    console.log(e);
    let element = document.elementFromPoint(e.pageX, e.pageY);
}

function keydownEvent(e) {
    keyState[e.key] = true;
}

function keyupEvent(e) {
    keyState[e.key] = false;
}
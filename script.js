const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//World properties
let drag = 0.05;

//Player input
let left, right, down, up;
let movementSpeed = 1;
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowRight':
            right = true;
            break;
        case 'ArrowLeft':
            left = true;
            break;
        case 'ArrowUp':
            up = true;
            break;
        case 'ArrowDown':
            down = true;
            break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.key) {
        case 'ArrowRight':
            right = false;
            break;
        case 'ArrowLeft':
            left = false;
            break;
        case 'ArrowUp':
            up = false;
            break;
        case 'ArrowDown':
            down = false;
            break;
    }
});
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
    scaleBy(number) {
        return new Vector(this.x * number, this.y * number);
    }
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    normalize() {
        if (this.magnitude() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
        }
    }
    normal() {
        return new Vector(-this.y, this.x).normalize();
    }
    draw(startX, startY, n, color) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + this.x * n, startY + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    static dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }
}
class Body {
    constructor(x, y, radius, mass, color) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        } else {
            this.inverseMass = 1 / this.mass;
        }
        this.elasticity = 1;
        this.radius = radius;
        this.color = color;
        this.control = false;
        objects.push(this);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    drawDebugInfo() {
        this.velocity.draw(this.position.x, this.position.y, 15, 'green');
        this.acceleration.normalize().draw(this.position.x, this.position.y, 100, 'blue');
        ctx.fillStyle = 'black';
        ctx.font = '20px Consolas';
        ctx.textAlign = 'center';
        ctx.fillText("m = " + this.mass, this.position.x, this.position.y - 8);
        ctx.fillText("e = " + this.elasticity, this.position.x, this.position.y + 8);
    }
    switchControl() {
        objects.forEach((object) => object.control = false);
        this.control = true;
    }
    playerControl() {
        //Control the object
        if (left) {
            this.acceleration.x = -movementSpeed;
        }
        if (right) {
            this.acceleration.x = movementSpeed;
        }
        if (up) {
            this.acceleration.y = -movementSpeed;
        }
        if (down) {
            this.acceleration.y = movementSpeed;
        }
        if (!up && !down) {
            this.acceleration.y = 0;
        }
        if (!right && !left) {
            this.acceleration.x = 0;
        }
    }
    calculate() {
        //Calculate Velocity
        this.acceleration = this.acceleration.normalize();
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.scaleBy(1 - drag);
        //Calculate Position
        this.position = this.position.add(this.velocity);
    }
}
class Wall {
    constructor(x1, y1, x2, y2) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        walls.push(this);
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.closePath();
    }
    wallVectorNormalized() {
        return this.end.subtract(this.start).normalize();
    }
}
//Rounding function
function round(number, precision) {
    let factor = 10 ** precision;
    return Math.round(number * factor) / factor;
}
//Collision detection
function objCollisionDetection(obj1, obj2) {
    let distance = obj1.position.subtract(obj2.position).magnitude();
    if (obj1.radius + obj2.radius >= distance) {
        return true;
    } else {
        return false;
    }
}
function wallCollisionDetection(obj, wall) {
    let objToWallVector = closestPointToWall(obj, wall).subtract(obj.position);
    if (objToWallVector.magnitude() <= obj.radius) {
        return true;
    }
}
function objCollisionResolution(obj1, obj2) {
    let normalVector = obj1.position.subtract(obj2.position).normalize();
    let relativeVelocityVector = obj1.velocity.subtract(obj2.velocity);
    let separatingVelocity = Vector.dot(relativeVelocityVector, normalVector);

    let impulse = ((separatingVelocity * (Math.min(obj1.elasticity, obj2.elasticity)) * -1) - separatingVelocity) / (obj1.inverseMass + obj2.inverseMass);
    let impulseVector = normalVector.scaleBy(impulse);

    obj1.velocity = obj1.velocity.add(impulseVector.scaleBy(obj1.inverseMass));
    obj2.velocity = obj2.velocity.add(impulseVector.scaleBy(-obj2.inverseMass));
}
function wallCollisionResolution(obj, wall) {
    let normalVector = obj.position.subtract(closestPointToWall(obj, wall)).normalize();
    let separatingVelocity = Vector.dot(obj.velocity, normalVector);
    let separatingVelocityDifference = separatingVelocity - (-separatingVelocity * obj.elasticity);
    obj.velocity = obj.velocity.add(normalVector.scaleBy(-separatingVelocityDifference));
}
//Penetration resolution
function objPenetrationResolution(obj1, obj2) {
    let distanceVector = obj1.position.subtract(obj2.position);
    let penetrationDepth = obj1.radius + obj2.radius - distanceVector.magnitude();
    let penetrationResolutionVector = distanceVector.normalize().scaleBy(penetrationDepth / (obj1.inverseMass + obj2.inverseMass));
    obj1.position = obj1.position.add(penetrationResolutionVector.scaleBy(obj1.inverseMass));
    obj2.position = obj2.position.add(penetrationResolutionVector.scaleBy(-obj2.inverseMass));
}
function wallPenetrationResolution(obj, wall) {
    let penetrationVector = obj.position.subtract(closestPointToWall(obj, wall));
    obj.position = obj.position.add(penetrationVector.normalize().scaleBy(obj.radius - penetrationVector.magnitude()));
}
function closestPointToWall(obj, wall) {
    let wallStartToObjVector = wall.start.subtract(obj.position);
    if (Vector.dot(wall.wallVectorNormalized(), wallStartToObjVector) > 0) {
        return wall.start;
    }
    let wallEndToObjVector = obj.position.subtract(wall.end);
    if (Vector.dot(wall.wallVectorNormalized(), wallEndToObjVector) > 0) {
        return wall.end;
    }
    let shortestDistance = Vector.dot(wall.wallVectorNormalized(), wallStartToObjVector);
    let shortestVector = wall.wallVectorNormalized().scaleBy(shortestDistance);
    return wall.start.subtract(shortestVector);
}
const randColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}
const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawn() {
    let sizeAndMass = randInt(10, 50);
    let newBody = new Body(randInt(0, 600), randInt(0, 600), sizeAndMass, sizeAndMass, randColor());
    newBody.elasticity = randInt(0, 10) / 10;
}
//Simulation---------------------
function simulate(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    objects.forEach((obj, index) => {
        obj.draw();
        obj.drawDebugInfo();
        if (obj.control) {
            obj.playerControl();
        }
        walls.forEach((wall) => {
            if (wallCollisionDetection(objects[index], wall)) {
                wallPenetrationResolution(objects[index], wall);
                wallCollisionResolution(objects[index], wall);
            }
        });
        for (let i = index + 1; i < objects.length; i++) {
            if (objCollisionDetection(objects[index], objects[i])) {
                objPenetrationResolution(objects[index], objects[i]);
                objCollisionResolution(objects[index], objects[i]);
            }
        }
        obj.calculate();
    });
    walls.forEach((obj, index) => {
        obj.draw();
    });
    requestAnimationFrame(simulate);
}
requestAnimationFrame(simulate);
//--------------------------------

let objects = [];
let walls = [];
let ball1 = new Body(100, 100, 40, 40, 'red');
let staticBall = new Body(200, 200, 30, 0, 'white');
ball1.switchControl();

let wallTop = new Wall(0, 0, 600, 0);
let wallBottom = new Wall(0, 600, 600, 600);
let wallRight = new Wall(600, 0, 600, 600);
let wallLeft = new Wall(0, 0, 0, 600);
let wall5 = new Wall(300, 300, 400, 400);

for (let i = 0; i < 50; i++) {
    spawn();
}
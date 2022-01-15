const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//World properties
let drag = 0.02;

//Rounding function
function round(number, precision) {
    let factor = 10 ** precision;
    return Math.round(number * factor) / factor;
}
//Collision detection
function checkForCollisions(obj1, obj2) {
    if (obj1.radius + obj2.radius >= obj2.position.subtract(obj1.position).magnitude()) {
        return true;
    } else {
        return false;
    }
}
function collisionResolution(obj1, obj2) {
    let normalVector = obj1.position.subtract(obj2.position).normalize();
    let relativeVelocityVector = obj1.velocity.subtract(obj2.velocity);
    let separatingVelocity = Vector.dot(relativeVelocityVector, normalVector);
    let separatingVelocityVector = normalVector.scaleBy(-separatingVelocity);

    obj1.velocity = obj1.velocity.add(separatingVelocityVector);
    obj2.velocity = obj2.velocity.add(separatingVelocityVector.scaleBy(-1));
}
//Penetration resolution
function penetrationResolution(obj1, obj2) {
    let distance = obj1.position.subtract(obj2.position);
    let penetrationDepth = obj1.radius + obj2.radius - distance.magnitude();
    let penetrationResolution = distance.normalize().scaleBy(penetrationDepth / 2);
    obj1.position = obj1.position.add(penetrationResolution);
    obj2.position = obj2.position.add(penetrationResolution.scaleBy(-1));
}

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
    constructor(x, y, radius, color) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.radius = radius;
        this.color = color;
        this.control = false;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    drawVectors() {
        this.velocity.draw(this.position.x, this.position.y, 10, 'green');
        this.acceleration.normalize().draw(this.position.x, this.position.y, 100, 'blue');
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

//Simulation
function simulate(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    objects.forEach((obj, index) => {
        obj.draw();
        obj.drawVectors();
        if (obj.control) {
            obj.playerControl();
        }
        for (let i = index + 1; i < objects.length; i++) {
            if (checkForCollisions(objects[index], objects[i])) {
                penetrationResolution(objects[index], objects[i]);
                collisionResolution(objects[index], objects[i]);
            }
        }
        obj.calculate();
    });
    requestAnimationFrame(simulate);
}
requestAnimationFrame(simulate);

const randColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}

function spawn() {
    objects.push(new Body(Math.floor(Math.random() * 601), Math.floor(Math.random() * 601), Math.floor(Math.random() * 60) + 10, randColor()));
}

let objects = [];
let ball1 = new Body(100, 100, 40, 'red');
objects.push(ball1);
ball1.switchControl();

for (let i = 0; i < 5; i++) {
    spawn();
}
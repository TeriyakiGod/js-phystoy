const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//World properties
let drag = 0.1;

//Simulation
function simulate() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    objects.forEach((obj) => {
        obj.calculate();
        obj.draw();
        obj.drawVectors();
        if (obj.control) {
            obj.playerControl();
        }
    });
    requestAnimationFrame(simulate);
}
requestAnimationFrame(simulate);

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

//Objects
let objects = [];

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
        return Math.hypot(this.x, this.y);
    }
    normalize() {
        if (this.magnitude() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
        }
    }
    draw(startX, startY, n, color) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + this.x * n, startY + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
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
        objects.push(this);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    drawVectors() {
        this.velocity.draw(this.position.x, this.position.y, 10, 'green');
        this.acceleration.draw(this.position.x, this.position.y, 100, 'blue');
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

let playerBall = new Body(100, 100, 20, 'red');
playerBall.switchControl();

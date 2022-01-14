const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//Simulation
function simulate() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    objects.forEach((object) => {
        object.draw();
        if (object.control) {
            control(object);
        }
    });
    requestAnimationFrame(simulate);
}
requestAnimationFrame(simulate);

//Player input
let left, right, down, up;
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
function control(obj) {
    if (left) {
        obj.posX -= obj.velocity;
    }
    if (right) {
        obj.posX += obj.velocity;
    }
    if (up) {
        obj.posY -= obj.velocity;
    }
    if (down) {
        obj.posY += obj.velocity;
    }
}

//Objects
let objects = [];

class Ball {
    constructor(posX, posY, radius, color) {
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.color = color;
        this.velocity = 3;
        this.control = false;
        objects.push(this);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    switchControl() {
        objects.forEach((object) => object.control = false);
        this.control = true;
    }
}

let playerBall = new Ball(100, 100, 20, 'red');
let ball2 = new Ball(200, 200, 10, 'blue');
playerBall.switchControl();

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Ball {
    constructor(posX, posY, radius, color) {
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

ball = new Ball(100, 100, 20, 'red');
ball.draw();
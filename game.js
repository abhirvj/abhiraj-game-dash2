const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PASTEL_COLORS = [
    'rgb(173, 216, 230)',  // Light Blue
    'rgb(144, 238, 144)',  // Light Green
    'rgb(255, 182, 193)',  // Light Pink
    'rgb(255, 255, 224)',  // Light Yellow
    'rgb(216, 191, 216)',  // Light Purple
    'rgb(255, 218, 185)',  // Light Orange
    'rgb(240, 255, 240)'   // Light Mint
];

const SHAPES = ['rect', 'circle', 'triangle'];
let player, level, obstacles, score, gameOver, startTime, topObstacle, levelNum, colorScheme;

document.getElementById('continueButton').addEventListener('click', startGame);
document.getElementById('retryButton').addEventListener('click', resetGame);

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    initGame();
    gameLoop();
}

function initGame() {
    levelNum = 0;
    score = 0;
    gameOver = false;
    startTime = Date.now();
    colorScheme = generateColorScheme();
    player = new Player();
    level = new Level(levelNum);
    obstacles = [];
    generateObstacles();
    topObstacle = { x: 0, y: 0, width: WIDTH, height: 10 };
}

function resetGame() {
    document.getElementById('retryScreen').classList.add('hidden');
    initGame();
    gameLoop();
}

function generateColorScheme() {
    return PASTEL_COLORS.sort(() => Math.random() - 0.5).slice(0, 3);
}

class Player {
    constructor() {
        this.x = 100;
        this.y = HEIGHT - 100;
        this.size = 40;
        this.velY = 0;
        this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        this.rotation = 0;
        this.rotationSpeed = levelNum * 2;
    }

    update() {
        this.velY += 0.8;
        this.y += this.velY;
        if (this.y > HEIGHT - this.size) {
            this.y = HEIGHT - this.size;
            this.velY = 0;
        }
        this.rotation += this.rotationSpeed;
    }

    jump() {
        this.velY = -15;
    }

    changeShape() {
        this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.translate(-this.size / 2, -this.size / 2);
        ctx.fillStyle = colorScheme[2];
        if (this.shape === 'rect') {
            ctx.fillRect(0, 0, this.size, this.size);
        } else if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(this.size, this.size);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    update() {
        this.x -= 5;
    }

    draw() {
        ctx.fillStyle = colorScheme[1];
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Level {
    constructor(levelNum) {
        this.levelNum = levelNum;
    }
}

function generateObstacles() {
    let numObstacles = 10 + levelNum;
    let spacing = Math.max(300, 500 - levelNum * 20);
    for (let i = 0; i < numObstacles; i++) {
        let x = WIDTH + i * spacing;
        let y = Math.random() * (HEIGHT - 200) + 200;
        let width = Math.random() * 50 + 20;
        let height = HEIGHT - y;
        obstacles.push(new Obstacle(x, y, width, height));
    }
}

function gameLoop() {
    if (gameOver) {
        document.getElementById('retryScreen').classList.remove('hidden');
        return;
    }

    ctx.fillStyle = colorScheme[0];
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    player.update();
    player.draw();

    ctx.fillStyle = 'red';
    ctx.fillRect(topObstacle.x, topObstacle.y, topObstacle.width, topObstacle.height);

    obstacles.forEach((obs) => {
        obs.update();
        obs.draw();
        if (collisionDetection(player, obs) || collisionDetection(player, topObstacle)) {
            gameOver = true;
        }
    });

    obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);

    score++;
    drawHUD();

    requestAnimationFrame(gameLoop);
}

function collisionDetection(player, obstacle) {
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.size > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.size > obstacle.y
    );
}

function drawHUD() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillText(`Time: ${elapsedTime}`, WIDTH - 100, 20);
    ctx.fillText(`Level: ${levelNum + 1}`, 10, 50);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        player.jump();
    }
});
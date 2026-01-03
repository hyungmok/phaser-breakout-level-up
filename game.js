class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.ball = null;
        this.bricks = null;
        this.cursors = null;
        this.scoreText = null;
        this.levelText = null;

        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.initialBallSpeed = 350;
    }

    preload() {
        // Preload assets - for this simple game, we'll create graphics dynamically
    }

    create() {
        // --- World and Physics Setup ---
        this.physics.world.setBoundsCollision(true, true, true, false); // Collide with all walls except the bottom

        // --- Create Game Objects ---
        this.createPlayer();
        this.createBall();
        this.createBricks();

        // --- Setup Collisions ---
        this.physics.add.collider(this.ball, this.player, this.hitPlayer, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

        // --- Setup Input ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointermove', (pointer) => {
            this.player.x = Phaser.Math.Clamp(pointer.x, 50, 750);
        });
        
        // --- UI Text ---
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
        this.levelText = this.add.text(600, 16, 'Level: 1', { fontSize: '32px', fill: '#FFF' });
        this.livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#FFF' });

        // --- Start Game ---
        this.resetBall();
    }

    update() {
        if (this.ball.y > 600) {
            this.loseLife();
        }
    }
    
    createPlayer() {
        this.player = this.physics.add.sprite(400, 550, 'player').setImmovable(true);
        // Create a dynamic texture for the player paddle
        let graphics = this.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 100, 20);
        graphics.generateTexture('player', 100, 20);
        graphics.destroy();
        this.player.setTexture('player');
        this.player.setCollideWorldBounds(true);
    }

    createBall() {
        this.ball = this.physics.add.sprite(400, 300, 'ball');
        // Create a dynamic texture for the ball
        let graphics = this.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('ball', 20, 20);
        graphics.destroy();
        this.ball.setTexture('ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
    }
    
    createBricks() {
        this.bricks = this.physics.add.staticGroup();
        // Create a dynamic texture for the bricks
        let graphics = this.make.graphics();
        graphics.fillStyle(0x00ff00); // Green bricks
        graphics.fillRect(0, 0, 64, 32);
        graphics.generateTexture('brick', 64, 32);
        graphics.destroy();

        const brickConfig = {
            rows: 4,
            cols: 10,
            padding: 10,
            offsetX: 60,
            offsetY: 100
        };

        for (let r = 0; r < brickConfig.rows; r++) {
            for (let c = 0; c < brickConfig.cols; c++) {
                const x = (c * (64 + brickConfig.padding)) + brickConfig.offsetX;
                const y = (r * (32 + brickConfig.padding)) + brickConfig.offsetY;
                this.bricks.create(x, y, 'brick').setOrigin(0);
            }
        }
    }

    hitPlayer(ball, player) {
        let diff = 0;
        if (ball.x < player.x) {
            diff = player.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > player.x) {
            diff = ball.x - player.x;
            ball.setVelocityX(10 * diff);
        } else {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    hitBrick(ball, brick) {
        brick.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.bricks.countActive() === 0) {
            this.levelUp();
        }
    }
    
    resetBall() {
        this.ball.setPosition(400, 300);
        this.ball.setVelocity(0, 0);

        this.time.delayedCall(1000, () => {
            const initialVelocityX = Math.random() < 0.5 ? -150 : 150;
            const ballSpeed = this.initialBallSpeed + (this.level - 1) * 35; // Increase speed per level
            this.ball.setVelocity(initialVelocityX, -ballSpeed);
        }, [], this);
    }

    loseLife() {
        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);
        if (this.lives === 0) {
            this.gameOver();
        } else {
            this.resetBall();
        }
    }

    levelUp() {
        this.level++;
        this.levelText.setText('Level: ' + this.level);
        this.score += 1000; // Level clear bonus
        this.scoreText.setText('Score: ' + this.score);
        this.resetBall();
        
        // Re-enable all bricks for the new level
        this.bricks.children.each(child => {
            child.enableBody(true, child.x, child.y, true, true);
        });
    }
    
    gameOver() {
        this.physics.pause();
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.ball.setData('isDead', true);
        
        this.time.delayedCall(2000, () => {
            this.score = 0;
            this.level = 1;
            this.lives = 3;
            this.scene.restart();
        }, [], this);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

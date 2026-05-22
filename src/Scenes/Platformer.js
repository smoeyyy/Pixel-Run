class Platformer extends Phaser.Scene {

    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.MAX_HEALTH = 3;
        this.health = this.MAX_HEALTH;
        this.invulnerable = false;
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createCollectibles();
        this.createCamera();
        this.createControls();
        this.createAnimations();
        this.createWalkParticles();
        this.createSigns();
        this.add.text(50, 150, "ARROW KEYS TO MOVE\nR TO RESTART", {
            fontSize: '12px',
            fill: '#000000'
        });
        this.physics.add.collider(
            this.player,
            this.waterLayer,
            this.hitWater,
            null,
            this
        );
    }

    createSigns() {

        this.signs = this.physics.add.staticGroup();

        const signObjects = this.map.getObjectLayer('Signs').objects;

        signObjects.forEach(obj => {

            const sign = this.signs.create(obj.x, obj.y, 'sign');

            sign.setOrigin(0, 1);

            sign.body.setSize(obj.width, obj.height);

            sign.message = obj.properties?.find(
                p => p.name === 'text'
            )?.value || '...';

            sign.dialogue = this.add.text(
                obj.x,
                obj.y - 50,
                sign.message,
                {
                    fontSize: '12px',
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    padding: {
                        x: 8,
                        y: 4
                    }
                }
            );

            sign.dialogue
                .setOrigin(0.5)
                .setVisible(false)
                .setDepth(100);
        });

        this.physics.add.overlap(
            this.player,
            this.signs,
            this.readSign,
            null,
            this
        );
    }

    readSign(player, sign) {
        sign.dialogue.setVisible(true);
    }

    hitWater(player, tile) {
        this.loseHealth();
    }

    loseHealth() {
        if (this.invulnerable) return;

        this.invulnerable = true;

        this.health--;

        this.healthText.setText('❤'.repeat(this.health));

        this.player.setVelocityY(-300);
        this.cameras.main.flash(200, 255, 0, 0);

        if (this.health <= 0) {
            this.gameOver();
            return;
        }

        this.respawnPlayer();

        this.time.delayedCall(1000, () => {
            this.invulnerable = false;
        });
    }

    respawnPlayer() {
        this.player.setPosition(30, 200);
        this.player.setVelocity(0, 0);

        this.invulnerable = true;

        this.time.delayedCall(800, () => {
            this.invulnerable = false;
        });
    }

    gameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);

        console.log("Game Over");
    }

    createAnimations() {
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('platformer_characters', { start: 0, end: 1 }),
                frameRate: 15,
                repeat: -1
            });
        }

        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'platformer_characters', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('jump')) {
            this.anims.create({
                key: 'jump',
                frames: [{ key: 'platformer_characters', frame: 1 }],
                frameRate: 1
            });
        }
    }

    createMap() {
        this.map = this.make.tilemap({ key: "platformer-level-1" });

        const tilesetTiles = this.map.addTilesetImage("pixel-platformer", "pixel-platformer");
        const tilesetFarm = this.map.addTilesetImage("farm-expansion", "farm-expansion");
        const tilesetBackgrounds = this.map.addTilesetImage("pixel-platformer-backgrounds", "pixel-platformer-backgrounds");

        this.backgroundLayer = this.map.createLayer("Background", [tilesetBackgrounds]);
        this.decorationLayer = this.map.createLayer("Decorations", [tilesetBackgrounds, tilesetTiles, tilesetFarm]);
        this.groundLayer = this.map.createLayer("Ground-n-Platformers", [tilesetTiles, tilesetFarm]);
        this.secretLayer = this.map.createLayer("Secret-Paths", [tilesetFarm]);
        this.waterLayer = this.map.createLayer("WaterLayer", [tilesetTiles]);

        this.waterLayer.setCollisionByProperty({ water: true });

        this.backgroundLayer.setDepth(0);
        this.decorationLayer.setDepth(1);
        this.groundLayer.setDepth(2);
        this.secretLayer.setDepth(2);

        this.secretLayer.setVisible(false);
        this.secretLayer.setCollisionByExclusion([-1]);

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.groundLayer.setCollisionByExclusion([-1]);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    createCollectibles(){
        this.collectibles = this.physics.add.staticGroup();
        const coinObjects = this.map.getObjectLayer('Collectibles').objects;
        coinObjects.forEach(obj => {
            const coin = this.collectibles.create(obj.x, obj.y, 'coin', 0);

            coin.setOrigin(0, 1);

            coin.body.setSize(obj.width, obj.height);
        });
        this.physics.add.overlap(
            this.player,
            this.collectibles,
            this.collectCoin,
            null,
            this
        );
        this.collectedCount = 0;
        this.totalCoins = this.collectibles.getChildren().length;
    }

    collectCoin(player, coin) {
        coin.destroy();

        this.collectedCount++;

        console.log(`Coins: ${this.collectedCount}/${this.totalCoins}`);

        if (this.collectedCount === this.totalCoins) {
            this.winGame();
        }
    }
    winGame() {
        console.log("Secret paths unlocked!");

        this.secretLayer.setVisible(true);

        this.physics.add.collider(this.player, this.secretLayer);

        this.cameras.main.flash(300, 255, 255, 255);
    }

    createPlayer() {
        const startX = 30;
        const startY = 345;

        this.player = this.physics.add.sprite(startX, startY, "platformer_characters");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(this.DRAG);
        this.player.setMaxVelocity(300, 900);
        this.player.body.setSize(12, 18);
        this.player.body.setOffset(3, 1);

        this.physics.add.collider(this.player, this.groundLayer);
        this.player.setDepth(10);

        //health
        this.healthText = this.add.text(
        this.player.x,
        this.player.y-25,
        `❤❤❤`,
        {
            fontSize: '10px',
            color: '#a82323',
            stroke: '#000000',
            strokeThickness: 3
        }

    );

    this.healthText.setOrigin(0.5);
    this.healthText.setDepth(1000);
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    createWalkParticles() {
        this.walkEmitter = this.add.particles(0, 0, "particle_smoke", {
            frame: [10, 11, 12, 13, 14],
            scale: { start: 0.05, end: 0.01 },
            speed: { min: 20, max: 80 },
            lifespan: 800,
            alpha: { start: 0.9, end: 0 },
            quantity: 1,
            frequency: 120,
            follow: this.player,
            followOffset: { x: 0, y: 22 }
        });
        this.walkEmitter.stop();
    }

    createCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.roundPixels = true;
    }

    update() {
        const onGround = this.player.body.onFloor();

        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.resetFlip();
            this.player.anims.play("walk", true);
            this.walkEmitter.start();
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlip(true, false);
            this.player.anims.play("walk", true);
            this.walkEmitter.start();
        } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(this.DRAG);
            this.player.anims.play("idle", true);
            this.walkEmitter.stop();
        }

        if (!onGround) {
            this.player.anims.play("jump", true);
        }

        if (onGround && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        this.signs.getChildren().forEach(sign => {

        const overlapping = Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                sign.getBounds()
            );

            sign.dialogue.setVisible(overlapping);
        });
        this.healthText.setPosition(
            this.player.x,
            this.player.y - 25
        );
    }
}
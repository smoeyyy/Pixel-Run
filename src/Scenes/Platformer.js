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
        this.createWater();
        this.createCollectibles();
        this.createCamera();
        this.createHealthUI();
        this.createControls();
        this.createAnimations();
        this.createWalkParticles();
        this.createDebugToggle();
        this.physics.add.overlap(
            this.player,
            this.waterZones,
            this.hitWater,
            null,
            this
        );
    }

    createHealthUI() {
        this.hearts = [];

        for (let i = 0; i < this.MAX_HEALTH; i++) {
            const heart = this.add.image(50 + (i * 50), 40, 'heart');
            heart.setScrollFactor(0);
            heart.setDepth(1000);
            heart.setScale(2.0);
            this.hearts.push(heart);
        }
    }

    loseHealth() {
        if (this.invulnerable) return;

        this.invulnerable = true;

        this.health--;

        if (this.hearts[this.health]) {
            this.hearts[this.health].setVisible(false);
        }

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
        this.player.setPosition(30, 345);
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

    createWater(){
        this.waterObjects = this.map.getObjectLayer('water').objects;

        this.waterZones = this.physics.add.staticGroup();

        this.waterObjects.forEach(obj => {
            const zone = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0x0000ff, 0);

            this.physics.add.existing(zone, true);

            this.waterZones.add(zone);
        });
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

    createDebugToggle() {
        this.input.keyboard.on("keydown-D", () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);
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
    }
}
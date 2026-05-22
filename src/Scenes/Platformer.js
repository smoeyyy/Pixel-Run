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
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createControls();
        this.createAnimations();
        this.createWalkParticles();
        this.createCamera();
        this.createDebugToggle();
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

        this.backgroundLayer.setDepth(0);
        this.decorationLayer.setDepth(1);
        this.groundLayer.setDepth(2);

        if (!this.groundLayer) {
            throw new Error("Tilemap ground layer not found: Ground-n-Platformers");
        }

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.groundLayer.setCollisionByExclusion([-1]);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
            frame: [0, 1],
            scale: { start: 0.15, end: 0.3 },
            speed: { min: 10, max: 50 },
            lifespan: 350,
            alpha: { start: 1, end: 0 },
            quantity: 1,
            frequency: 120,
            follow: this.player,
            followOffset: { x: 0, y: 18 }
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
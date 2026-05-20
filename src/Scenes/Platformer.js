class Platformer extends Phaser.Scene {

    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createControls();
        this.createWalkParticles();
        this.createCamera();
        this.createDebugToggle();
    }

    createMap() {
        this.map = this.make.tilemap({ key: "platformer-level-1" });

        const tilesetTiles = this.map.addTilesetImage("pixel-platformer", "tilemap_packed");
        const tilesetFarm = this.map.addTilesetImage("farm-expansion", "tilemap_packed");
        const tilesetBackgrounds = this.map.addTilesetImage("pixel-platformer-backgrounds", "tilemap_packed");

        this.backgroundLayer = this.map.createLayer("Background", [tilesetBackgrounds, tilesetTiles, tilesetFarm], 0, 0);
        this.decorationLayer = this.map.createLayer("Decorations", [tilesetBackgrounds, tilesetTiles, tilesetFarm], 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platformers", [tilesetBackgrounds, tilesetTiles, tilesetFarm], 0, 0);

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

        this.player = this.physics.add.sprite(startX, startY, "platformer_characters", 0);
        this.player.setScale(this.SCALE);
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(this.DRAG);
        this.player.setMaxVelocity(300, 900);
        this.player.body.setSize(12, 18);
        this.player.body.setOffset(3, 1);

        this.physics.add.collider(this.player, this.groundLayer);
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    createWalkParticles() {
        this.walkParticles = this.add.particles("particle_smoke");
        this.walkEmitter = this.walkParticles.createEmitter({
            frame: [0, 1],
            scale: { start: 0.05, end: 0.12 },
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
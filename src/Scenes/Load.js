class Load extends Phaser.Scene {

    constructor() {
        super("loadScene");
    }


    preload() {
        this.load.setPath("./assets/");
        this.load.spritesheet("platformer_characters", "tilemap-characters_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.image("tilemap_packed", "tilemap_packed.png");
        this.load.spritesheet("particle_smoke", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('platformer_characters', {
                start: 0,
                end: 1
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                { frame: 0 }
            ],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                { frame: 1 }
            ],
            frameRate: 1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    update() {
    }
}
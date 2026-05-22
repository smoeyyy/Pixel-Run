class Load extends Phaser.Scene {

    constructor() {
        super("loadScene");
    }


    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("pixel-platformer", "platformer_tilemap_packed.png");
        this.load.image("farm-expansion", "farm_tilemap_packed.png");
        this.load.image("pixel-platformer-backgrounds", "tilemap-backgrounds_packed.png");
        this.load.spritesheet("particle_smoke", "platformer_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    update() {
    }
}
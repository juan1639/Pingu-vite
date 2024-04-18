import { matrixLevels } from "../scenes/matrixLevels.js";
import { Settings } from "../scenes/settings.js";

export class Jewels
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        const strJewels = ['diamond_', 'prism_', 'ruby_', 'square_', 15, 6, 6, 14];
        // const target = Phaser.Math.Between(0, strJewels.length - 1);
        const target = 3; // Square

        if (Settings.getNivel() > 1) this.anims.remove('jewels-anim');
        
        this.relatedScene.anims.create(
        {
            key: 'jewels-anim',
            frames: this.relatedScene.anims.generateFrameNames('tiles-jewels', {
                prefix: strJewels[target], end: strJewels[target + 4], zeroPad: 4 }),
            frameRate: 20,
            repeat: -1
        });

        this.jewels = this.relatedScene.physics.add.group();

        for (let i = 0; i < 3; i ++)
        {
            const nivel = Settings.getNivel();
            const matrix = matrixLevels.array_levels[nivel];
            let x;
            let y;

            do {
                // Random: start 2 --> end: lenght - 3 (no jewels at limits/borders)
                // Valid position --> matrix[y][x]=0 ... else while ...
                x = Phaser.Math.Between(2, matrix[0].length - 3);
                y = Phaser.Math.Between(2, matrix.length - 3);

            } while (matrix[y][x] !== 0 || (y === Settings.jugador.posIniY && x === Settings.jugador.posIniX));

            this.jewels.create(
                x * Settings.tileXY.x, y * Settings.tileXY.y, 'tiles-jewels', 'square_0000'
            ).setImmovable(true).refreshBody().setDepth(Settings.depth.bloques).setScale(0.75); // Scale 48/64
        }

        this.jewels.children.iterate((gem, index) =>
        {
            // gem.play('jewels-anim', true);
            gem.setData('id', index);
            gem.setData('vel-x', 0).setData('vel-y', 0);
        });

        console.log(this.jewels);
    }

    update()
    {
        this.jewels.children.iterate((block, index) =>
        {
            if (block.getData('vel-x') !== 0 || block.getData('vel-y') !== 0)
            {
                block.setX(block.x + block.getData('vel-x'));
                block.setY(block.y + block.getData('vel-y'));
            }
        });
    }

    get()
    {
        return this.jewels;
    }
}

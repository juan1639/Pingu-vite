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
                x = Phaser.Math.Between(1, matrix[0].length - 2);
                y = Phaser.Math.Between(1, matrix.length - 2);

            } while (matrix[y][x] !== 6 || (y === Settings.jugador.posIniY && x === Settings.jugador.posIniX));

            this.jewels.create(x * Settings.tileXY.x, y * Settings.tileXY.y).setScale(0.75); // Scale 48/64
        }

        this.jewels.children.iterate((gem, index) =>
        {
            gem.play('jewels-anim', true);
            gem.setData('id', index);
        });

        console.log(this.jewels);
    }

    update()
    {

    }

    get()
    {
        return this.jewels;
    }
}

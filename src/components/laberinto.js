import { Settings } from "../scenes/settings.js";
import { matrixLevels } from "../scenes/matrixLevels.js";

export class Laberinto
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.tile = this.relatedScene.physics.add.group();

        const nivel = Settings.getEscenario();

        for (let i = 0; i < matrixLevels.array_levels[nivel].length; i ++)
        {
            for (let ii = 0; ii < matrixLevels.array_levels[nivel][i].length; ii ++)
            {
                const valor = matrixLevels.array_levels[nivel][i][ii];

                this.elegir_tilesNiveles(valor, i, ii);
            }
        }

        this.tile.children.iterate((block, index) =>
        {
            block.setScale(0.75).setImmovable(true).refreshBody().setDepth(Settings.depth.bloques);
            // block.setCollideWorldBounds(true);
            block.setData('index', index);
            block.setData('vel-x', 0).setData('vel-y', 0);
            block.setData('puntos', Settings.bloques.puntos);
        });
    }

    update()
    {
        this.tile.children.iterate((block, index) =>
        {
            if (block.getData('vel-x') !== 0 || block.getData('vel-y') !== 0)
            {
                block.setX(block.x + block.getData('vel-x'));
                block.setY(block.y + block.getData('vel-y'));
            }
        });
    }

    elegir_tilesNiveles(valor, i, ii)
    {
        // 0 = vacio, 1 = block-blue, 2,3,4,5 = block-limits/borders
        if (valor > 0 && valor < 6)
        {
            const blockAzul = 1;

            this.tile.create(
                ii * Settings.tileXY.x, i * Settings.tileXY.y, `tile${blockAzul}`
            ).setData('id', valor);
        }
        // Scale 0.75 = 48 / 64 --> (tileXY) / (img.png width or height)
    }

    get()
    {
        return this.tile;
    }
}

// =============================================================================
export class BrokenBlock
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create(x, y, firstTime)
    {
        this.broken = this.relatedScene.physics.add.sprite(x, y, 'tile-broken', 0);
        this.broken.setScale(0.75).setImmovable(true);
        this.broken.setDepth(Settings.depth.bloques).setVisible(true);

        // Las animaciones son globales: en el segundo nivel ya existe
        if (firstTime && !this.relatedScene.anims.exists('broken-block-anim'))
        {
            this.relatedScene.anims.create(
            {
                key: 'broken-block-anim',
                frames: this.relatedScene.anims.generateFrameNumbers('tile-broken', {frames: [0, 1, 2, 3, 4, 5]}),
                // msPerFrame: 140,
                frameRate: 5,
                hideOnComplete: true
            });
        }

        this.broken.play('broken-block-anim', true);
    }

    get()
    {
        return this.broken;
    }
}

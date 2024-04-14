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

        const nivel = Settings.getNivel();

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
            block.setData('id', index);
            block.setData('vel-x', 0).setData('vel-y', 0);
            block.setData('recorrido', 0);
            // console.log(block.getData('id'));
        });

        console.log(this.tile);
    }

    update()
    {
        this.tile.children.iterate((block, index) =>
        {
            if (block.getData('vel-x') !== 0 || block.getData('vel-y') !== 0)
            {
                block.setX(block.x + block.getData('vel-x'));
                block.setY(block.y + block.getData('vel-y'));
                block.setData('recorrido', block.getData('recorrido') + 1);
            }
        });
    }

    static check_colision(x, y)
    {
        const nivel = Settings.getNivel();

        if (matrixLevels.array_levels[nivel][y][x] === 9) return true;
        return false;
    }

    elegir_tilesNiveles(valor, i, ii)
    {
        // 6 = vacio, 1 = tile-azul, 2 = tile-limit, 3 = tile-marron, 4 = tile-blanco
        if (valor !== 6)
        {
            this.tile.create(
                ii * Settings.tileXY.x, i * Settings.tileXY.y, `tile${valor}`
            );
        }
        // Scale 0.75 = 48 / 64 --> (tileXY) / (img.png width or height)
    }

    set_idFormat(index)
    {
        const nivel = Settings.getNivel();

        const y = Math.floor(index / Settings.matrixLevels.array_levels[nivel][0].length);
        const x = index - y * Settings.matrixLevels.array_levels[nivel][0].length;

        return [y, x];
    }

    get()
    {
        return this.tile;
    }
}

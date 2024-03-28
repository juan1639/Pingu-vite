import { Settings } from "../scenes/settings.js";

export class Laberinto
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.tile = this.relatedScene.physics.add.group();

        for (let i = 0; i < Settings.array_laberinto.length; i ++)
        {
            for (let ii = 0; ii < Settings.array_laberinto[i].length; ii ++)
            {
                const valor = Settings.array_laberinto[i][ii];

                this.elegir_tilesNiveles(valor, i, ii);
            }
        }

        console.log(this.tile);
    }

    static check_colision(x, y)
    {
        if (Settings.array_laberinto[y][x] === 9) return true;
        return false;
    }

    elegir_tilesNiveles(valor, i, ii)
    {
        if (valor !== 1)
        {
            this.tile.create(
                ii * Settings.tileXY.x,
                i * Settings.tileXY.y,
                `tile${valor}`
            ).setDepth(Settings.depth.bloques).refreshBody();
        }
    }

    get()
    {
        return this.tile;
    }
}

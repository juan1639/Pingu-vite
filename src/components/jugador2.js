import { matrixLevels } from '../scenes/matrixLevels.js';
import { Settings } from '../scenes/settings.js';

export class Jugador
{
    constructor(scene, args)
    {
        this.relatedScene = scene;
        this.args = args;
    }

    create()
    {
        const {x, y, oriX, oriY} = this.args;

        this.jugador = this.relatedScene.physics.add.sprite(x, y, 'pengo-ssheet');

        this.jugador.setOrigin(oriX, oriY);
        this.jugador.setAngle(0).setDepth(Settings.depth.jugador).setScale(0.9);

        this.jugador.setCircle(Math.floor(Settings.tileXY.y / 2));

        this.jugador.setData('direccion', 'ri');// por defecto
        this.jugador.setData('anima', this.jugador.getData('direccion'));

        // this.set_velocity();

        // this.relatedScene.anims.remove('le-ri-up-do');

        const animas = [
            ['le', 2, 3],
            ['ri', 6, 7],
            ['up', 4, 5],
            ['do', 0, 1]
        ];

        for (let i = 0; i < animas.length; i ++)
        {
            this.relatedScene.anims.create(
            {
                key: animas[i][0], 
                frames: this.relatedScene.anims.generateFrameNumbers(
                    'pengo-ssheet', {start: animas[i][1], end: animas[i][2]}
                ),
                frameRate: 5,
                yoyo: true,
                repeat: -1
            });
        }

        this.relatedScene.anims.create(
        {
            key: 'turn',
            frames: [{key: 'pengo-ssheet', frame: 23}],
            frameRate: 20,
        });
        
        this.jugador.anims.play(this.jugador.getData('anima'), true);

        this.controles = this.relatedScene.input.keyboard.createCursorKeys();

        console.log(this.jugador);
    }

    update()
    {
        if (this.jugador.x % Settings.tileXY.x === 0 && this.jugador.y % Settings.tileXY.y === 0)
        {
            Settings.setJugadorMoving(false);
            this.viejaX = this.jugador.x;
            this.viejaY = this.jugador.y;
        }

        const direcc = Settings.jugador.direccion;

        if (!Settings.isJugadorMoving())
        {
            Object.keys(Settings.jugador.direccion).forEach(direcc =>
            {
                const tecla = Settings.jugador.teclas[direcc];
    
                if (this.controles[tecla].isDown || this.relatedScene.joystickCursors[tecla].isDown)
                {
                    Settings.setJugadorMoving(true);
                    this.jugador.setData('direccion', direcc);
                    this.jugador.setData('anima', this.jugador.getData('direccion'));
                    this.jugador.anims.play(this.jugador.getData('anima'), true);
                    this.jugador.setAngle(Settings.jugador.direccion[this.jugador.getData('direccion')][2]);
                    this.set_velocity();
                }
            });
    
            if (this.controles.space.isDown)
            {
                // this.handlePushBlock();
            }
        }
        else
        {
            this.set_velocity();
        }

        // console.log(this.jugador.x, this.jugador.y);
    }

    set_velocity()
    {
        const dirX = Settings.jugador.direccion[this.jugador.getData('direccion')][0];
        const dirY = Settings.jugador.direccion[this.jugador.getData('direccion')][1];

        this.jugador.x += dirX * Settings.jugador.velX;
        this.jugador.y += dirY * Settings.jugador.velY;
    }

    handlePushBlock()
    {
        // Push Block...
        const x = Math.floor(this.jugador.x / Settings.tileXY.x) + Settings.jugador.direccion[this.jugador.getData('direccion')][0];
        const y = Math.floor(this.jugador.y / Settings.tileXY.y) + Settings.jugador.direccion[this.jugador.getData('direccion')][1];

        const nivel = Settings.getNivel();
        const checkBlock = matrixLevels.array_levels[nivel][y][x];

        if (checkBlock !== 6) console.log(`empujar:${y}${x}`);

        // Push Jewel...
        const contiguaX = this.jugador.x + Settings.jugador.direccion[this.jugador.getData('direccion')][0] * Settings.tileXY.x;
        const contiguaY = this.jugador.y + Settings.jugador.direccion[this.jugador.getData('direccion')][1] * Settings.tileXY.y;

        this.relatedScene.jewels.get().children.iterate((gem, index) =>
        {
            if (contiguaX === gem.x && contiguaY === gem.y)
            {
                console.log('empujarJewel' + index);
            }
        });
    }

    get()
    {
        return this.jugador;
    }
}

// ================================================================================
export class JugadorDies
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create(x, y)
    {
        this.jugadordies = this.relatedScene.physics.add.sprite(x, y, 'pacman');

        this.jugadordies.setFrame(4);

        this.relatedScene.tweens.add(
        {
            targets: this.jugadordies,
            angle: 359,
            duration: 1000,
            repeat: 2
        });

        console.log(this.jugadordies);
    }

    get()
    {
        return this.jugadordies;
    }
}

// ================================================================================
export class JugadorShowVidas
{
    constructor(scene, args)
    {
        this.relatedScene = scene;
        this.args = args;
    }

    create()
    {
        const { left, top } = this.args;

        this.jugadorshowvidas = this.relatedScene.physics.add.group(
        {
            key: ['pacman'],
            frameQuantity: Settings.getVidas(),
            setXY: {
                x: left,
                y: top,
                stepX: Settings.tileXY.x
            },
            frame: 4
        });

        this.jugadorshowvidas.children.iterate(vida =>
        {
            vida.setOrigin(0.5, 0).setScale(1, 0.7).setBlendMode(Phaser.BlendModes.ADD);
        });

        console.log(this.jugadorshowvidas);
    }

    get()
    {
        return this.jugadorshowvidas;
    }
}

// ================================================================================
export class JugadorPreGame
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create(x, y)
    {
        this.jugadorpregame = this.relatedScene.physics.add.sprite(x, y, 'pacman');

        this.jugadorpregame.setAngle(0);

        this.relatedScene.anims.create(
        {
            key: 'le-ri-up-do', 
            frames: this.relatedScene.anims.generateFrameNumbers('pacman', {start: 0, end: 6}),
            frameRate: 30,
            yoyo: true,
            repeat: -1
        });

        this.jugadorpregame.anims.play('le-ri-up-do', true);

        const duracionTotal = 8000;

        this.relatedScene.tweens.add(
        {
            targets: this.jugadorpregame,
            x: this.relatedScene.sys.game.config.width + Settings.tileXY.x * 2,
            yoyo: true,
            duration: duracionTotal,
            repeat: -1
        });

        setInterval(() => {this.jugadorpregame.setFlipX(!this.jugadorpregame.flipX)}, duracionTotal);

        console.log(this.jugadorpregame);
    }
}

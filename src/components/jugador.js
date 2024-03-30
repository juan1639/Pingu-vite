import { Settings } from '../scenes/settings.js';

export class Jugador
{
    static VEL = 4;

    // [velX, velY, addWidth, addHeight, angle, anima]
    static INFO_DIRECCION = {
        left: [-1, 0, 0, 0, 0, 'le'],
        right: [1, 0, 1, 0, 0, 'ri'],
        up: [0, -1, 0, 0, 0, 'up'],
        down: [0, 1, 0, 1, 0, 'do']
    };

    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create(x, y)
    {
        this.jugador = this.relatedScene.physics.add.sprite(x, y, 'pengo-ssheet');

        this.jugador.setAngle(0).setDepth(Settings.depth.jugador).setScale(1).setCircle(
            Math.floor(Settings.tileXY.y / 3),
            Math.floor(Settings.tileXY.x / 6),
            Math.floor(Settings.tileXY.y / 6)
        );

        this.intentoGiro = 'right';
        this.direccion = this.intentoGiro;
        this.anima = this.direccion.slice(0, 2);

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
        
        this.jugador.anims.play(this.anima, true);

        this.controles = this.relatedScene.input.keyboard.createCursorKeys();

        console.log(this.jugador);
    }

    update()
    {
        const direcc = Jugador.INFO_DIRECCION;

        Object.keys(Jugador.INFO_DIRECCION).forEach(tecla =>
        {
            if (this.controles[tecla].isDown || this.relatedScene.joystickCursors[tecla].isDown) this.intentoGiro = tecla;
        });

        if (this.jugador.x % Settings.tileXY.x === 0 && this.jugador.y % Settings.tileXY.y === 0)
        {
            const x = Math.floor(this.jugador.x / Settings.tileXY.x) + direcc[this.intentoGiro][0];
            const y = Math.floor(this.jugador.y / Settings.tileXY.y) + direcc[this.intentoGiro][1];
            
            if (Settings.array_laberinto[y][x] !== 9)
            {
                this.direccion = this.intentoGiro;
                this.anima = this.direccion.slice(0, 2);
                this.jugador.anims.play(this.anima, true);
                this.jugador.setAngle(direcc[this.direccion][4]);
            }
        }

        const ancho = direcc[this.direccion][2] * (Settings.tileXY.x - Jugador.VEL);
        const alto = direcc[this.direccion][3] * (Settings.tileXY.y - Jugador.VEL);
        const offsetX = direcc[this.direccion][0] * Jugador.VEL;
        const offsetY = direcc[this.direccion][1] * Jugador.VEL;
        
        const x = Math.floor((this.jugador.x + offsetX + ancho) / Settings.tileXY.x);
        const y = Math.floor((this.jugador.y + offsetY + alto) / Settings.tileXY.y);

        if (Settings.array_laberinto[y][x] !== 9)
        {
            this.jugador.x += direcc[this.direccion][0] * Jugador.VEL;
            this.jugador.y += direcc[this.direccion][1] * Jugador.VEL;

            // Escapatorias
            if (this.jugador.x > Settings.array_laberinto[0].length * Settings.tileXY.x && direcc[this.direccion][0] > 0) this.jugador.x = -Settings.tileXY.x;
            if (this.jugador.x < -Settings.tileXY.x && direcc[this.direccion][0] < 0) this.jugador.x = (Settings.array_laberinto[0].length - 1) * Settings.tileXY.x;
        }

        // console.log(this.jugador.x, this.jugador.y);
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

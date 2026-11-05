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

        // Las animaciones le/ri/up/do se crean en JugadorPreGame (MainMenu)
        this.jugador.anims.play(this.jugador.getData('anima'), true);

        // Las animaciones son globales: solo se crea la primera vez
        if (!this.relatedScene.anims.exists('jugador-muerte'))
        {
            this.relatedScene.anims.create({
                key: 'jugador-muerte',
                frames: this.relatedScene.anims.generateFrameNumbers('pengo-ssheet', { frames: Settings.jugador.framesMuerte }),
                frameRate: 6,
                repeat: -1
            });
        }

        this.empujandoHasta = 0;

        this.controles = this.relatedScene.input.keyboard.createCursorKeys();
    }

    update()
    {
        if (this.jugador.x % Settings.tileXY.x === 0 && this.jugador.y % Settings.tileXY.y === 0)
        {
            Settings.setJugadorMoving(false);
            this.viejaX = this.jugador.x;
            this.viejaY = this.jugador.y;
        }

        // Tras empujar se queda quieto un momento
        if (this.empujandoHasta > 0)
        {
            if (this.relatedScene.time.now < this.empujandoHasta) return;

            this.empujandoHasta = 0;
            this.jugador.anims.play(this.jugador.getData('anima'), true);
        }

        if (!Settings.isJugadorMoving())
        {
            for (const direcc of Object.keys(Settings.jugador.direccion))
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
                    // Solo una direccion por frame: con dos teclas a la vez se movia en diagonal y salia de la cuadricula
                    break;
                }
            }
        }
        else
        {
            this.set_velocity();
        }
    }

    // Llamado al empujar un bloque o una joya
    // direccion: 'le' | 'ri' | 'up' | 'do'
    empujar(direccion)
    {
        this.empujandoHasta = this.relatedScene.time.now + Settings.jugador.pausaEmpujar;
        this.jugador.anims.stop();
        this.jugador.setFrame(Settings.jugador.frameEmpujar[direccion]);
    }

    morir()
    {
        this.empujandoHasta = 0;
        this.jugador.anims.play('jugador-muerte', true);
    }

    // Vuelve a la casilla (x, y) listo para jugar
    reaparecer(x, y)
    {
        this.empujandoHasta = 0;
        this.jugador.setPosition(x, y);
        this.jugador.anims.play(this.jugador.getData('anima'), true);
        this.viejaX = x;
        this.viejaY = y;
        Settings.setJugadorMoving(false);
    }

    set_velocity()
    {
        const dirX = Settings.jugador.direccion[this.jugador.getData('direccion')][0];
        const dirY = Settings.jugador.direccion[this.jugador.getData('direccion')][1];

        this.jugador.x += dirX * Settings.jugador.velX;
        this.jugador.y += dirY * Settings.jugador.velY;
    }

    get()
    {
        return this.jugador;
    }
}

// ================================================================================
export class JugadorPreGame
{
    constructor(scene, args)
    {
        this.relatedScene = scene;
        this.args = args;
    }

    create()
    {
        const {x, y, oriX, oriY} = this.args;

        this.jugadorpregame = this.relatedScene.physics.add.sprite(x, y, 'pengo-ssheet');

        this.jugadorpregame.setOrigin(oriX, oriY);
        this.jugadorpregame.setAngle(0).setDepth(Settings.depth.jugador).setScale(1.2);

        this.jugadorpregame.setData('direccion', 'ri');// por defecto
        this.jugadorpregame.setData('anima', this.jugadorpregame.getData('direccion'));

        this.jugadorpregame.setVelocityX(90);
        this.currentAnima = 0;

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
            key: 'culete', 
            frames: this.relatedScene.anims.generateFrameNumbers(
                'pengo-ssheet', {frames: [20, 21]}
            ),
            frameRate: 5,
            yoyo: true,
            repeat: 2
        });

        this.relatedScene.anims.create(
            {
                key: 'sentadilla', 
                frames: this.relatedScene.anims.generateFrameNumbers(
                    'pengo-ssheet', {frames: [22, 23]}
                ),
                frameRate: 5,
                yoyo: true,
                repeat: 2
            });

        this.jugadorpregame.anims.play(this.jugadorpregame.getData('anima'), true);
    }

    update()
    {
        if (this.jugadorpregame.x >= 400 && this.currentAnima === 0)
        {
            this.currentAnima = 1;
            this.jugadorpregame.anims.play('culete', true);
            this.jugadorpregame.setVelocityX(0);
        }

        if (this.currentAnima === 1 && !this.jugadorpregame.anims.isPlaying)
        {
            this.currentAnima = 2;
            this.jugadorpregame.anims.play('sentadilla', true);
            this.jugadorpregame.setVelocityX(0);
        }

        if (this.currentAnima === 2 && !this.jugadorpregame.anims.isPlaying)
        {
            this.currentAnima = 3;
            this.jugadorpregame.anims.play('ri', true);
            this.jugadorpregame.setVelocityX(0);
        }
    }

    get()
    {
        return this.jugadorpregame;
    }
}

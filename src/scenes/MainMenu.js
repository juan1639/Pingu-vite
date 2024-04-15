import { Scene } from 'phaser';
import { JugadorPreGame } from '../components/jugador2.js';
import { Textos } from '../components/textos.js';
import { play_sonidos } from '../functions/functions.js';
import { BotonNuevaPartida } from '../components/boton-nuevapartida.js';
import { Settings } from './settings.js';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    init()
    {
        this.marioTuberias = this.sound.add('mario-tuberias');

        this.jugador = new JugadorPreGame(this, {
            // x: Math.floor(this.sys.game.config.width / 2),
            x: 0,
            y: Math.floor(this.sys.game.config.height / 2),
            oriX: Settings.jugador.oriX,
            oriY: Settings.jugador.oriY,
        });

        this.botoninicio = new BotonNuevaPartida(this, {
            left: Math.floor(this.sys.game.config.width / 2),
            top: Math.floor(this.sys.game.config.height / 1.3),
            id: 'boton-nueva-partida',
            scX: 0.6, scY: 0.5, angle: 1, originX: 0.5, originY: 0.5,
            texto: ' New Game ', nextScene: 'PreGame'
        });

        this.txt = new Textos(this, {
            x: Math.floor(this.sys.game.config.width / 2),
            y: 0,
            txt: ' PinguClon ',
            size: 100, color: '#ffa', style: 'bold',
            stroke: '#1ca', sizeStroke: 16,
            shadowOsx: 2, shadowOsy: 2, shadowColor: '#111',
            bool1: false, bool2: true, origin: [0.5, 0.5],
            elastic: Math.floor(this.sys.game.config.height / 4), dura: 3000
        });
    }

    preload() {}

    create ()
    {
        const aparecerBoton = 1800; // 1800

        this.add.image(0, 0, 'fondo').setOrigin(0, 0).setDepth(Settings.depth.fondo);

        this.jugador.create();

        this.txt.create();

        const basedOn = this.add.text(
            Math.floor(this.sys.game.config.width / 4),
            Math.floor(this.sys.game.config.height / 1.04),
            'Based on classic arcade game Pengo of Sega 1982',
            {fontSize: '16px', color: '#9ff', align: 'justify', fontFamily: 'Arial'}
        );

        const timeline = this.add.timeline([
            {
                at: aparecerBoton,
                run: () =>
                {
                    this.botoninicio.create('PreGame', false);
                }
            }
        ]);

        timeline.play();

        play_sonidos(this.marioTuberias, false, 0.6);
        
        console.log(this.txt);
    }

    update()
    {
        this.jugador.update();
    }
}

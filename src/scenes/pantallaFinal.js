import { Scene } from 'phaser';
import { Settings } from './settings.js';
import { Textos } from '../components/textos.js';
import { BotonNuevaPartida } from '../components/boton-nuevapartida.js';
import { play_sonidos } from '../functions/functions.js';

// Se muestra al superar el ultimo nivel de matrixLevels
export class PantallaFinal extends Scene
{
  constructor()
  {
    super('PantallaFinal');
  }

  init()
  {
    const ancho = this.sys.game.config.width;
    const alto = this.sys.game.config.height;

    this.txtTitulo = new Textos(this, {
      x: Math.floor(ancho / 2), y: 0,
      txt: ' Game Completed! ',
      size: 78, color: '#ffa', style: 'bold',
      stroke: '#1cb', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: Math.floor(alto / 4), dura: 3000
    });

    this.txtPuntos = new Textos(this, {
      x: Math.floor(ancho / 2), y: Math.floor(alto / 2),
      txt: `${Settings.getTxtScore()}${Settings.getPuntos()} `,
      size: 50, color: '#fff', style: 'bold',
      stroke: '#af1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });

    this.botoninicio = new BotonNuevaPartida(this, {
      left: Math.floor(ancho / 2),
      top: Math.floor(alto / 1.3),
      id: 'boton-nueva-partida',
      scX: 0.6, scY: 0.5, angle: 1, originX: 0.5, originY: 0.5,
      texto: ' New Game ', nextScene: 'PreGame'
    });
  }

  create()
  {
    const aparecerBoton = 3200;

    this.add.image(0, 0, 'fondo').setOrigin(0, 0).setDepth(Settings.depth.fondo);

    this.txtTitulo.create();
    this.txtTitulo.get().setDepth(Settings.depth.textos);
    this.txtPuntos.create();
    this.txtPuntos.get().setDepth(Settings.depth.textos);

    this.time.delayedCall(aparecerBoton, () => this.botoninicio.create());

    const sonidoFinal = this.sound.add('congrats-voice');
    play_sonidos(sonidoFinal, false, 0.9);

    // Los sonidos son del sound manager global: no se paran solos al cambiar de escena
    this.events.once('shutdown', () => sonidoFinal.destroy());
  }
}

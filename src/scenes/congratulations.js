import { Settings } from './settings.js';
import { Textos } from '../components/textos.js';
import { BotonNuevaPartida } from "../components/boton-nuevapartida.js";
import { JugadorPreGame } from '../components/jugador2.js';
import { play_sonidos } from '../functions/functions.js';

export class Congratulations extends Phaser.Scene
{
  constructor()
  {
    super({ key: 'Congratulations' });
  }

  init()
  {
    // El mismo pinguino que en el titulo: entra por la izquierda, anda hasta el centro y hace sus animaciones.
    // El boton "Next Level" cambia de escena en cuanto se pulsa, aunque no haya terminado
    this.jugador = new JugadorPreGame(this, {
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
      texto: ' Next Level ', nextScene: 'Game'
    });
  }

  create()
  {
    this.add.image(0, 0, 'fondo').setOrigin(0, 0).setDepth(Settings.depth.fondo);
    this.jugador.create();

    const aparecerBoton = 3200;
    this.incremento_nivel = Settings.getNivel() + 1;
    Settings.setNivelSuperado(false);
    
    this.sonido_intermision = this.sound.add('musica-menu');

    this.txt = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: Math.floor(this.sys.game.config.height / 3.5),
      txt: ' Level Up! ',
      size: 86, color: '#ffa', style: 'bold',
      stroke: '#1cb', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });

    this.txt.create();
    this.txt.get().setDepth(Settings.depth.textos).setAlpha(1);

    this.timeline = this.add.timeline([
        {
          at: aparecerBoton,
          run: () => {
            Settings.setNivel(this.incremento_nivel);
            this.botoninicio.create('Game', false);
          }
        }
    ]);
    
    this.timeline.play();

    play_sonidos(this.sonido_intermision, false, 0.8);

    // Los sonidos son del sound manager global: no se paran solos al cambiar de escena
    this.events.once('shutdown', () => this.sonido_intermision.destroy());
  }

  update()
  {
    this.jugador.update();
  }
}

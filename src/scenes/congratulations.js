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
    const alto = this.sys.game.config.height;

    // Con tabla de bonus de tiempo todo se recoloca para que quepa
    this.resultado = Settings.resultadoNivel;
    this.pos = this.resultado
      // El boton gira de vez en cuando: el pinguino va lo bastante arriba para que no lo tape
      ? { titulo: 50, pinguino: 350, boton: 485 }
      : { titulo: Math.floor(alto / 3.5), pinguino: Math.floor(alto / 2), boton: Math.floor(alto / 1.3) };

    // El mismo pinguino que en el titulo: entra por la izquierda, anda hasta el centro y hace sus animaciones.
    // El boton "Next Level" cambia de escena en cuanto se pulsa, aunque no haya terminado
    this.jugador = new JugadorPreGame(this, {
      x: 0,
      y: this.pos.pinguino,
      oriX: Settings.jugador.oriX,
      oriY: Settings.jugador.oriY,
    });

    this.botoninicio = new BotonNuevaPartida(this, {
      left: Math.floor(this.sys.game.config.width / 2),
      top: this.pos.boton,
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
      y: this.pos.titulo,
      txt: ' Level Up! ',
      size: this.resultado ? 66 : 86, color: '#ffa', style: 'bold',
      stroke: '#1cb', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });

    this.txt.create();
    this.txt.get().setDepth(Settings.depth.textos).setAlpha(1);

    if (this.resultado) this.crear_tabla_tiempo(this.resultado);

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

  // Tu tiempo, los tramos del bonus (el conseguido resaltado) y el bonus obtenido
  crear_tabla_tiempo({ segundos, bonus })
  {
    const centro = Math.floor(this.sys.game.config.width / 2);
    const tramos = Settings.bonusTiempo.tramos;
    const conseguido = tramos.findIndex(t => segundos < t.hasta);
    const sinBonus = tramos.length; // indice de la fila "no bonus"
    const fila = conseguido === -1 ? sinBonus : conseguido;

    const texto = (x, y, txt, size, color, stroke, origenX = 0.5) =>
    {
      const t = this.add.text(x, y, txt, {
        fontSize: size + 'px', fontStyle: 'bold', fontFamily: 'verdana, arial, sans-serif', fill: color
      });
      t.setOrigin(origenX, 0.5).setStroke(stroke, 8).setShadow(2, 2, '#111111', 2, false, true);
      t.setDepth(Settings.depth.textos);
      return t;
    };

    texto(centro, 102, ` Your time: ${segundos.toFixed(1)} s `, 30, '#fff', '#16d');

    const filas = [
      ...tramos.map(t => [`Under ${t.hasta} s`, `${t.puntos}`]),
      [`${tramos[tramos.length - 1].hasta} s or more`, 'No bonus']
    ];

    filas.forEach(([izq, der], i) =>
    {
      const y = 142 + i * 34;
      const activa = i === fila;
      const color = activa ? '#ffe033' : '#cfe';
      const stroke = activa ? '#b52' : '#289';

      texto(centro - 200, y, izq, 24, color, stroke, 0);
      texto(centro + 200, y, der, 24, color, stroke, 1);

      if (activa)
      {
        // Marca y parpadeo suave en la fila conseguida
        const marca = texto(centro - 225, y, '>', 24, color, stroke);
        this.tweens.add({ targets: marca, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
      }
      else
      {
        // Las demas filas mas apagadas
        this.children.list.slice(-2).forEach(t => t.setAlpha(0.6));
      }
    });

    texto(centro, 290, bonus > 0 ? ` Time bonus: +${bonus} ` : ' No time bonus ', 34, '#ffa', bonus > 0 ? '#4c1' : '#f41');
  }
}

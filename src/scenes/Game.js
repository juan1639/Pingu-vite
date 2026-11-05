// ============================================================
//      P i n g u  -  Phaser  |  By Juan Eguia
//   
//      https://juan1639.github.io/Pingu-vite
// 
// ------------------------------------------------------------
import { Scene } from 'phaser';
import { Laberinto, BrokenBlock } from '../components/laberinto.js';
import { Jewels } from '../components/jewels.js';
import { Jugador } from '../components/jugador2.js';
import { Enemigos } from '../components/enemigos.js';
import { Textos } from '../components/textos.js';
import { Marcador } from './../components/marcador.js';
import { Settings } from './settings.js';
import { matrixLevels } from './matrixLevels.js';
import { BotonFullScreen, BotonEsc } from '../components/boton-nuevapartida.js';
import { ControlTactil } from '../components/controlTactil.js';
import {
  colliderJugadorBloques,
  colliderJugadorJewels,
  colliderBloqueParar,
  colliderJewelParar,
  particulas,
  countDownBonus,
  play_sonidos,
  actualizar_marcadores
} from '../functions/functions.js';

export class Game extends Scene
{
  constructor()
  {
    super('Game');
  }

  init()
  {
    Settings.setGameOver(false);

    // Settings es estatico: el estado del bonus del nivel anterior seguiria activo
    Settings.setBonus3JewelsDone(false);
    Settings.setBonus3JewelsRunning(false);
    Settings.setBonus3JewelsBonus(Settings.pausas.bonus3Jewels.bonusInicial);
    Settings.setNivelSuperado(false);

    this.set_pausaInicial(2800);

    this.bloques = new Laberinto(this);
    this.brokenblock = new BrokenBlock(this);
    this.jewels = new Jewels(this);
    this.enemigos = new Enemigos(this);
    this.muriendo = false;

    this.jugador = new Jugador(this, {
      x: Settings.jugador.posIniX * Settings.tileXY.x,
      y: Settings.jugador.posIniY * Settings.tileXY.y,
      oriX: Settings.jugador.oriX,
      oriY: Settings.jugador.oriY,
    });

    this.instanciar_marcadores();

    // Con teclado no se crea, pero sus cursores (siempre sin pulsar) se leen igual
    this.controlTactil = new ControlTactil(this);
    this.joystickCursors = this.controlTactil.cursores;
  }

  preload() {}

  create()
  {
    // 1.48 1.68 ajustar size fondo al scroll
    this.add.image(0, 0, 'fondo').setScale(1.48, 1.68).setDepth(Settings.depth.fondo).setOrigin(0, 0);

    this.set_sonidos();
    this.set_cameras();
    this.set_cameras_marcadores();

    this.bloques.create();
    this.brokenblock.create(0, 0, true);
    this.jewels.create();
    this.jugador.create();
    this.enemigos.create();

    this.marcadorPtos.create();
    this.marcadorNivel.create();
    this.marcadorHi.create();
    this.marcadorVidas.create();
    this.botonfullscreen.create();
    this.botonesc.create();

    if (Settings.controlElegido.mobile)
    {
      this.controlTactil.create();
      // El joystick solo se dibuja en la camara principal, no en la del marcador
      this.mapa_scores.ignore(this.controlTactil.get());
    }

    this.cameras.main.startFollow(this.jugador.get());

    this.set_colliders();

    // La fisica Arcade avanza a 60 pasos/sg fijos en cualquier monitor.
    // La logica (que mueve 4px por llamada) solo avanza en los frames con paso de fisica,
    // asi la velocidad es la misma a 60, 120 o 144 Hz.
    this.pasoFisica = false;
    this.physics.world.off('worldstep');
    this.physics.world.on('worldstep', () => { this.pasoFisica = true; });
  }

  update()
  {
    if (!this.pasoFisica) return;
    this.pasoFisica = false;

    if (!Settings.pausas.inicial && !Settings.isGameOver() && !Settings.isBonus3JewelsRunning() && !this.muriendo)
    {
      this.bloques.update();
      this.jewels.update();
      this.jugador.update();

      // Con el nivel superado los enemigos se quedan quietos (y no salen mas)
      if (!Settings.isNivelSuperado())
      {
        if (this.enemigos.update())
        {
          this.jugador_tocado();
        }
        else if (this.enemigos.todos_eliminados())
        {
          this.nivel_superado_enemigos();
        }
      }
    }

    if (Settings.isBonus3JewelsDone() && !Settings.isBonus3JewelsRunning() && !Settings.isNivelSuperado())
    {
      this.timeToBonus3Jewels();
    }
  }

  timeToBonus3Jewels()
  {
    Settings.setBonus3JewelsRunning(true);
    this.texto_enhorabuena();
    Settings.audio.musicaFondo.volume = 0;
    play_sonidos(this.sonido_youWin, false, 0.9);

    this.timeline3Jewels = this.add.timeline([
      {
        at: 1500,
        run: () =>
        {
          particulas(
            this.jewels.get().getChildren()[0].x,
            this.jewels.get().getChildren()[0].y,
            'particula1',
            {min: 220, max: 420},
            {min: 2500, max: 3000},
            {start: 0.1, end: 0.6},
            0xffcc11,
            null, false, this
          );

          countDownBonus(this);
          play_sonidos(this.sonido_congrats, false, 0.9);
        }
      },
      {
        at: Settings.pausas.bonus3Jewels.duracion,
        run: () =>
        {
          Settings.setBonus3JewelsRunning(false);
          Settings.setNivelSuperado(true);
          this.jewels.get().children.iterate(gem => gem.play('jewels-anim', true));
        }
      },
      {
        at: Settings.pausas.bonus3Jewels.duracion + Settings.getPausaNivelSuperado(),
        run: () => this.pasar_nivel()
      }
    ]);

    this.timeline3Jewels.play();
  }

  // Nivel superado eliminando a los 12 enemigos (sin el bonus de las joyas)
  nivel_superado_enemigos()
  {
    Settings.setNivelSuperado(true);
    this.texto_enhorabuena();
    // La musica de fondo se baja para que se oiga la fanfarria (pasar_nivel() la para)
    Settings.audio.musicaFondo.volume = 0;
    play_sonidos(this.sonido_fanfarria, false, 0.9);

    this.time.delayedCall(Settings.getPausaNivelSuperado() + 1500, () => this.pasar_nivel());
  }

  jugador_tocado()
  {
    this.muriendo = true;

    play_sonidos(this.sonido_ziuuu, false, 0.9);
    this.jugador.morir();

    this.time.delayedCall(Settings.pausas_muerte.animacion, () =>
    {
      Settings.setVidas(Settings.getVidas() - 1);
      this.marcadorVidas.update(Settings.getTxtVidas(), Settings.getVidas());

      if (Settings.getVidas() <= 0)
      {
        this.game_over();
      }
      else
      {
        this.reaparecer();
      }
    });
  }

  reaparecer()
  {
    const tile = Settings.tileXY.x;
    const { x, y } = this.enemigos.casilla_libre_cercana(Settings.jugador.posIniX * tile, Settings.jugador.posIniY * tile);

    this.jugador.reaparecer(x, y);

    this.enemigos.volver_a_casa();
    this.muriendo = false;

    // Un momento de pausa antes de seguir, como al empezar el nivel
    Settings.setPausaInicial(true);

    const txt = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: Math.floor(this.sys.game.config.height / 2),
      txt: ' Ready! ',
      size: 78, color: '#ffa', style: 'bold',
      stroke: '#af1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });
    txt.create();
    txt.get().setDepth(Settings.depth.textos).setScrollFactor(0);
    this.mapa_scores.ignore(txt.get());

    this.time.delayedCall(Settings.pausas_muerte.reaparecer, () =>
    {
      txt.get().destroy();
      Settings.setPausaInicial(false);
    });
  }

  // Aviso de que los enemigos acaban de doblar su velocidad
  aviso_prisa()
  {
    const txt = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: Math.floor(this.sys.game.config.height / 4),
      txt: ' Hurry Up! ',
      size: 72, color: '#ffa', style: 'bold',
      stroke: '#f41', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });
    txt.create();
    txt.get().setDepth(Settings.depth.textos).setScrollFactor(0);
    this.mapa_scores.ignore(txt.get());

    this.tweens.add({
      targets: txt.get(),
      alpha: 0.2,
      duration: 300,
      yoyo: true,
      repeat: 3,
      onComplete: () => txt.get().destroy()
    });
  }

  game_over()
  {
    // Se congela la partida un rato con el aviso, para que el jugador asimile que ha terminado
    Settings.setGameOver(true);
    Settings.audio.musicaFondo.stop();
    this.enemigos.get().forEach(e => e.anims.stop());

    const txt = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: Math.floor(this.sys.game.config.height / 2),
      txt: ' Game Over ',
      size: 90, color: '#ffa', style: 'bold',
      stroke: '#f41', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });
    txt.create();
    txt.get().setDepth(Settings.depth.textos).setScrollFactor(0).setScale(0.3);
    this.mapa_scores.ignore(txt.get());

    this.tweens.add({ targets: txt.get(), scale: 1, duration: 700, ease: 'Back.Out' });

    this.time.delayedCall(Settings.pausas_muerte.gameOver, () => this.scene.start('PantallaGameOver'));
  }

  pasar_nivel()
  {
    // La musica es del sound manager global: si no se para, se solapa con la del nivel siguiente
    Settings.audio.musicaFondo.stop();

    const ultimoNivel = matrixLevels.array_levels.length - 1;

    if (Settings.getNivel() >= ultimoNivel)
    {
      this.scene.start('PantallaFinal');
    }
    else
    {
      this.scene.start('Congratulations');
    }
  }

  set_pausaInicial(tiempo)
  {
    Settings.setPausaInicial(true);

    this.txtpreparado = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: 0,
      txt: `Level ${Settings.getNivel()} Ready!`,
      size: 78, color: '#ffa', style: 'bold',
      stroke: '#af1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: Math.floor(this.sys.game.config.height / 2), dura: 2800
    });
    
    this.txtpreparado.create();
    this.txtpreparado.get().setDepth(Settings.depth.textos);
    
    const timeline = this.add.timeline([
      {
        at: tiempo - 300,
        run: () =>
        {
          play_sonidos(Settings.audio.musicaFondo, true, Settings.getVolumenMusica());
        }
      },
      {
        at: tiempo,
        run: () =>
        {
          Settings.setPausaInicial(false);
          this.txtpreparado.get().setVisible(false);
          this.set_txtGo();
        }
      }
    ]);

    timeline.play();
  }

  set_txtGo()
  {
    const txtgo = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: Math.floor(this.sys.game.config.height / 2),
      txt: ' Go! ',
      size: 90, color: '#ffa', style: 'bold',
      stroke: '#4f1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: false, dura: 0
    });
    
    txtgo.create();
    txtgo.get().setDepth(Settings.depth.textos);

    this.tweens.add({
      targets: txtgo.get(), alpha: 0, duration: 2200
    });
  }

  texto_enhorabuena()
  {
    this.txtcongrats = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2), y: 0,
      txt: ' Congratulations! ',
      size: 70, color: '#ffa', style: 'bold',
      stroke: '#5f1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: this.jugador.get().y - Settings.tileXY.y, dura: 3500
    });
    
    this.txtcongrats.create();
    this.txtcongrats.get().setDepth(Settings.depth.textos);

    this.tweens.add({
      targets: this.txtcongrats.get(), alpha: 0, duration: Settings.pausas.txtCongrats.duracion
    });
  }

  set_colliders()
  {
    // Jugador empuja bloques y joyas
    this.physics.add.collider(this.jugador.get(), this.bloques.get(), colliderJugadorBloques, null, this);
    this.physics.add.collider(this.jugador.get(), this.jewels.get(), colliderJugadorJewels, null, this);

    // Bloque en movimiento choca con bloque o joya
    this.physics.add.collider(this.bloques.get(), this.bloques.get(), colliderBloqueParar, null, this);
    this.physics.add.collider(this.bloques.get(), this.jewels.get(), colliderBloqueParar, null, this);

    // Joya en movimiento choca con bloque o joya
    this.physics.add.collider(this.jewels.get(), this.bloques.get(), colliderJewelParar, null, this);
    this.physics.add.collider(this.jewels.get(), this.jewels.get(), colliderJewelParar, null, this);
  }

  set_cameras()
  {
    this.cameras.main.setBounds(
      0, -Math.floor(Settings.tileXY.y / 2),
      Math.floor(this.sys.game.config.width * Settings.screen.escBoundsX),
      Math.floor(this.sys.game.config.height * Settings.screen.escBoundsY + Math.floor(Settings.tileXY.y / 2))
    );

    this.physics.world.setBounds(
      0, -Math.floor(Settings.tileXY.y / 2),
      Math.floor(this.sys.game.config.width * Settings.screen.escBoundsX),
      Math.floor(this.sys.game.config.height * Settings.screen.escBoundsY + Math.floor(Settings.tileXY.y / 2))
    );
  }

  set_cameras_marcadores()
  {
    var { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraScores();
    
    this.mapa_scores = this.cameras.add(x, y, ancho, alto).setZoom(0.6).setName('view-scores').setAlpha(1).setOrigin(0, 0);
    this.mapa_scores.scrollX = scrollX;
    this.mapa_scores.scrollY = scrollY;
  }

  instanciar_marcadores()
  {
    const ancho = this.sys.game.config.width;
    // Camara del marcador con zoom 0.6: caben ~1333 px; Score / Level / Lives / Record / Music
    const marcadoresPosY = -99;

    this.marcadorPtos = new Marcador(this, {
      x: 10, y: marcadoresPosY, size: 36, txt: Settings.getTxtScore(), color: '#fff', strokeColor: '#af1', id: 0
    });

    this.marcadorNivel = new Marcador(this, {
      x: 315, y: marcadoresPosY, size: 36, txt: ' Level: ', color: '#ff5', strokeColor: '#16d', id: 1
    });

    this.marcadorHi = new Marcador(this, {
      x: 715, y: marcadoresPosY, size: 36, txt: Settings.getTxtRecord(), color: '#fff', strokeColor: '#af1', id: 2
    });

    this.marcadorVidas = new Marcador(this, {
      x: 516, y: marcadoresPosY, size: 36, txt: Settings.getTxtVidas(), color: '#fff', strokeColor: '#f71', id: 3
    });

    this.botonfullscreen = new BotonFullScreen(this, {
      x: Math.floor(ancho * 1.55), y: marcadoresPosY + 7, id: 'boton-fullscreen',
      orX: 0, orY: 0, scX: 1.2, scY: 0.8, ang: 0
    });

    this.botonesc = new BotonEsc(this, {
      left: Math.floor(ancho * 1.42), top: marcadoresPosY + 26, id: 'boton-fire-joystick',
      scX: 0.5, scY: 0.5, angle: 0, originX: 0.5, originY: 0.5, texto: 'Music', nextScene: ''
    });
  }

  set_sonidos()
  {
    this.sonido_getReady = this.sound.add('get-ready');
    play_sonidos(this.sonido_getReady, false, 0.9);

    this.sonido_ziuuu = this.sound.add('ziuuu1');
    this.sonido_crash = this.sound.add('crash');
    this.sonido_congrats = this.sound.add('congrats-voice');
    this.sonido_youWin = this.sound.add('you-win');
    this.sonido_fanfarria = this.sound.add('fanfarria');
    this.sonido_moneda = this.sound.add('moneda-mario');
    this.sonido_numkey = this.sound.add('numkey');
    Settings.audio.musicaFondo = this.sound.add('musica-fondo');

    // Los sonidos son del sound manager global: sin esto se acumulan copias en cada nivel
    const sonidos = [
      this.sonido_getReady, this.sonido_ziuuu, this.sonido_crash, this.sonido_congrats,
      this.sonido_youWin, this.sonido_fanfarria, this.sonido_moneda, this.sonido_numkey, Settings.audio.musicaFondo
    ];
    this.events.once('shutdown', () => sonidos.forEach(sonido => sonido.destroy()));
  }
}

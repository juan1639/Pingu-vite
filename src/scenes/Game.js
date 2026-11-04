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
import { Textos } from '../components/textos.js';
import { Marcador } from './../components/marcador.js';
import { Settings } from './settings.js';
import { matrixLevels } from './matrixLevels.js';
import { BotonFullScreen, BotonEsc } from '../components/boton-nuevapartida.js';
import {
  colliderJugadorBloques,
  colliderJugadorJewels,
  colliderBloqueParar,
  colliderJewelParar,
  particulas,
  countDownBonus,
  play_sonidos
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

    this.jugador = new Jugador(this, {
      x: Settings.jugador.posIniX * Settings.tileXY.x,
      y: Settings.jugador.posIniY * Settings.tileXY.y,
      oriX: Settings.jugador.oriX,
      oriY: Settings.jugador.oriY,
    });

    this.instanciar_marcadores();
  }

  preload() {}

  create()
  {
    // 1.48 1.68 ajustar size fondo al scroll
    this.add.image(0, 0, 'fondo').setScale(1.48, 1.68).setDepth(Settings.depth.fondo).setOrigin(0, 0);

    this.set_sonidos();
    this.set_cameras();
    this.set_cameras_controles();
    this.set_cameras_marcadores();

    this.bloques.create();
    this.brokenblock.create(0, 0, true);
    this.jewels.create();
    this.jugador.create();

    this.marcadorPtos.create();
    this.marcadorNivel.create();
    this.marcadorHi.create();
    this.botonfullscreen.create();
    this.botonesc.create();

    this.rexVirtualJoystick();
    this.hideMobileControls();

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

    if (!Settings.pausas.inicial && !Settings.isGameOver() && !Settings.isBonus3JewelsRunning())
    {
      this.bloques.update();
      this.jewels.update();
      this.jugador.update();
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

  rexVirtualJoystick()
  {
    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: 90,
      y: this.sys.game.config.height - 80,
      radius: 90,
      base: this.add.circle(0, 0, 90, 0x888888, 0.4),
      thumb: this.add.circle(0, 0, 40, 0xcccccc, 0.7),
      dir: '4dir',
      fixed: true,
      enable: true
    });

    this.joystickCursors = this.joyStick.createCursorKeys();
  }

  hideMobileControls()
  {
    if (!Settings.controlElegido.mobile)
    {
      this.joyStick.setVisible(false);
    }
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

  set_cameras_controles()
  {
    var { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraControles();
    
    this.mapa_controles = this.cameras.add(x, y, ancho, alto).setZoom(0.9).setName('view-controls').setAlpha(1).setOrigin(0, 0);
    this.mapa_controles.scrollX = scrollX;
    this.mapa_controles.scrollY = scrollY;
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
    const marcadoresPosY = -99;

    this.marcadorPtos = new Marcador(this, {
      x: 10, y: marcadoresPosY, size: 40, txt: Settings.getTxtScore(), color: '#fff', strokeColor: '#af1', id: 0
    });

    this.marcadorNivel = new Marcador(this, {
      x: Math.floor(ancho / 2), y: marcadoresPosY, size: 40, txt: ' Level: ', color: '#ff5', strokeColor: '#16d', id: 1
    });

    this.marcadorHi = new Marcador(this, {
      x: Math.floor(ancho / 1.2), y: marcadoresPosY, size: 40, txt: Settings.getTxtRecord(), color: '#fff', strokeColor: '#af1', id: 2
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
    this.sonido_numkey = this.sound.add('numkey');
    Settings.audio.musicaFondo = this.sound.add('musica-fondo');

    // Los sonidos son del sound manager global: sin esto se acumulan copias en cada nivel
    const sonidos = [
      this.sonido_getReady, this.sonido_ziuuu, this.sonido_crash, this.sonido_congrats,
      this.sonido_youWin, this.sonido_numkey, Settings.audio.musicaFondo
    ];
    this.events.once('shutdown', () => sonidos.forEach(sonido => sonido.destroy()));
  }
}

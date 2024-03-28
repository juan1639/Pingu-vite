// ============================================================
//      P a c  C l o n  -  Phaser  |  By Juan Eguia
//   
//      https://juan1639.github.io/PacClon-vite-phaser
// 
// ------------------------------------------------------------
import { Scene } from 'phaser';
import { Laberinto } from '../components/laberinto.js';
import { Jugador, JugadorDies, JugadorShowVidas } from '../components/jugador.js';
import { Textos } from '../components/textos.js';
import { Marcador } from './../components/marcador.js';
import { Settings } from './settings.js';
import { BotonFullScreen, BotonNuevaPartida } from '../components/boton-nuevapartida.js';

import {
  // overlapJugadorFantasmas,
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

    this.set_pausaInicial(4300);

    this.laberinto = new Laberinto(this);
    this.jugador = new Jugador(this);
    // this.jugadordies = new JugadorDies(this);

    // this.instanciar_marcadores();
    // this.instanciar_mobileControls();

    this.botonrejugar = new BotonNuevaPartida(this);
  }

  preload() {}

  create()
  {
    this.add.image(0, 0, 'fondo').setDepth(Settings.depth.fondo).setOrigin(0, 0);
    
    // this.set_sonidos();
    // this.set_cameras();
    // this.set_cameras_controles();
    // this.set_cameras_marcadores();

    this.laberinto.create();
    this.jugador.create(Settings.tileXY.x * 2, Settings.tileXY.y * 1);

    // this.jugadorshowvidas.create();
    
    // this.marcadorPtos.create();
    // this.marcadorNivel.create();
    // this.marcadorHi.create();
    // this.botonfullscreen.create();

    this.rexVirtualJoystick();
    this.hideMobileControls();

    // this.cameras.main.startFollow(this.jugador.get());
    // this.cameras.main.followOffset.set(0, 0);

    this.crear_colliders();
  }

  update() {

    if (!this.pausa_inicial.activa && !Settings.isGameOver())
    {
      this.jugador.update();
    }

    /* if (this.puntito.get().countActive() <= 0 && !Settings.isNivelSuperado())
    {
      Settings.setNivelSuperado(true);
      Settings.setFantasmasScary(false);
      this.texto_enhorabuena();

      setTimeout(() =>
      {
        Settings.setNivelSuperado(false);
        this.scene.start('Congratulations');
      }, Settings.getPausaNivelSuperado());
    } */
    
    // this.mobile_controls();
  }

  set_pausaInicial(tiempo)
  {
    this.pausa_inicial = {
      duracion: tiempo,
      activa: false
    };

    return;

    this.txtpreparado = new Textos(this, {
      x: 400,
      y: 0,
      txt: ' Ready! ',
      size: 78, color: '#ffa', style: 'bold',
      stroke: '#ea1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0],
      elastic: (Settings.pacman.iniY + 1) * Settings.tileXY.y, dura: 3000
    });
    
    this.txtpreparado.create();
    this.txtpreparado.get().setDepth(Settings.getDepth().textos);

    this.timeline = this.add.timeline([
      {
        at: this.pausa_inicial.duracion,
        run: () => {
          this.pausa_inicial.activa = false,
          this.txtpreparado.get().setVisible(false);
        }
      }
    ]);

    this.timeline.play();
    console.log(this.txtpreparado);
  }

  texto_enhorabuena()
  {
    this.txtcongrats = new Textos(this, {
      x: this.jugador.get().x, y: 0,
      txt: ' Congratulations! ',
      size: 70, color: '#ffa', style: 'bold',
      stroke: '#5f1', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
      bool1: false, bool2: true, origin: [0.5, 0.5],
      elastic: this.jugador.get().y - Settings.tileXY.y, dura: 3000
    });
    
    this.txtcongrats.create();
    this.txtcongrats.get().setDepth(Settings.getDepth().textos);
  }

  crear_colliders()
  {
    //Overlap Jugador-Fantasmas
    // this.physics.add.overlap(this.jugador.get(), this.fantasmas.get(), overlapJugadorFantasmas, exceptoNotVisible, this);
  }

  rexVirtualJoystick()
  {
      this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
          x: 90,
          y: this.sys.game.config.height - 50,
          radius: 60,
          base: this.add.circle(0, 0, 60, 0x888888, 0.4),
          // base: this.add.image(0, 0, 'boton-fire-joystick').setScale(1),
          thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.7),
          // thumb: this.add.image(0, 0, 'base-joystick').setScale(1)
          dir: '4dir',
          // forceMin: 16,
          fixed: true,
          enable: true
      });
      
      console.log(this.joyStick);
      this.joystickCursors = this.joyStick.createCursorKeys();
  }

  hideMobileControls()
  {
      console.log(Settings.controlElegido);
      
      if (!Settings.controlElegido.mobile)
      {
        this.joyStick.setVisible(false);
      }
  }

  set_cameras()
  {
    this.cameras.main.setBounds(
      0, 0, Math.floor(this.sys.game.config.width * Settings.getScreen().escBoundsX),
      Math.floor(this.sys.game.config.height * Settings.getScreen().escBoundsY)
    );

    this.physics.world.setBounds(
      0, 0, Math.floor(this.sys.game.config.width * Settings.getScreen().escBoundsX),
      Math.floor(this.sys.game.config.height * Settings.getScreen().escBoundsY)
    );
  }

  set_cameras_controles()
  {
    var { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraControles();
    
    this.mapa_controles = this.cameras.add(x, y, ancho, alto).setZoom(0.9).setName('view-controls').setAlpha(0.7).setOrigin(0, 0);
    this.mapa_controles.scrollX = scrollX;
    this.mapa_controles.scrollY = scrollY;
    // console.log(this.mapa_controles);
  }
  
  set_cameras_marcadores()
  {
    var { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraScores();
    
    this.mapa_scores = this.cameras.add(x, y, ancho, alto).setZoom(0.6).setName('view-scores').setAlpha(1).setOrigin(0, 0);
    this.mapa_scores.scrollX = scrollX;
    this.mapa_scores.scrollY =scrollY;
    // console.log(this.mapa_scores);
  }

  instanciar_marcadores()
  {
    const ancho = this.sys.game.config.width;
    const alto = this.sys.game.config.height;

    const marcadoresPosY = -99;

    this.jugadorshowvidas = new JugadorShowVidas(this, {left: Math.floor(ancho * 1.4), top: marcadoresPosY + 9});

    this.marcadorPtos = new Marcador(this, {
      x: 10, y: marcadoresPosY, size: 40, txt: Settings.getTxtScore(), color: '#fff', id: 0
    });

    this.marcadorNivel = new Marcador(this, {
      x: Math.floor(ancho / 2), y: marcadoresPosY, size: 40, txt: ' Level: ', color: '#ff5', id: 1
    });

    this.marcadorHi = new Marcador(this, {
      x: Math.floor(ancho / 1.2), y: marcadoresPosY, size: 40, txt: ' Record: ', color: '#fff', id: 2
    });

    this.botonfullscreen = new BotonFullScreen(this, {x: Math.floor(ancho * 1.33), y: marcadoresPosY + 9});
  }

  instanciar_mobileControls()
  {
    var { xx, yy, sizeX, sizeY } = Settings.getCoorCruceta();
    
    this.crucetaleft = new CrucetaDireccion(this, {
      id: 'cruceta-left',
      press: 'left',
      x: xx, y: yy + 55,
      ang: 0,
      scX: sizeX, scY: sizeY
    });
    
    this.crucetaright = new CrucetaDireccion(this, {
      id: 'cruceta-right',
      press: 'right',
      x: xx + 350, y: yy + 55,
      ang: 0,
      scX: sizeX, scY: sizeY
    });
    
    this.crucetaup = new CrucetaDireccion(this, {
      id: 'cruceta-left',
      press: 'up',
      x: xx + 175, y: yy - 80,
      ang: 90,
      scX: sizeX - 0.7, scY: sizeY + 0.1
    });
    
    this.crucetadown = new CrucetaDireccion(this, {
      id: 'cruceta-left',
      press: 'down',
      x: xx + 175, y: yy + 80,
      ang: 270,
      scX: sizeX - 0.5, scY: sizeY + 0.1
    });

    this.iconogamepad = new IconoGamePad(this, {
      id: 'icono-gamepad',
      x: xx + 90, y: yy,
      ang: 0,
      scX: 2, scY: 2
    });
  }

  set_sonidos()
  {
    this.sonido_preparado = this.sound.add('sonidoPacmanInicioNivel');
    play_sonidos(this.sonido_preparado, false, 0.8);

    this.sonido_waka = this.sound.add('sonidoWakaWaka');
    this.sonido_jugadorDies = this.sound.add('sonidoPacmanDies');
    this.sonido_eatingGhost = this.sound.add('sonidoPacmanEatingGhost');
    this.sonido_eatingCherry = this.sound.add('sonidoPacmanEatingCherry');
    this.sonido_fantasmasScary = this.sound.add('sonidoPacmanAzules');
    this.sonido_sirena = this.sound.add('sonidoPacmanSirena');
  }
}

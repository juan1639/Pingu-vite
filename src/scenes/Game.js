// ============================================================
//      P i n g u  -  Phaser  |  By Juan Eguia
//   
//      https://juan1639.github.io/Pingu-vite
// 
// ------------------------------------------------------------
import { Scene } from 'phaser';
import { Laberinto } from '../components/laberinto.js';
import { Jewels } from '../components/jewels.js';
import { Jugador, JugadorDies, JugadorShowVidas } from '../components/jugador2.js';
import { Textos } from '../components/textos.js';
import { Marcador } from './../components/marcador.js';
import { Settings } from './settings.js';
import { BotonFullScreen, BotonNuevaPartida } from '../components/boton-nuevapartida.js';

import {
  // overlapJugadorFantasmas,
  colliderJugadorBloques,
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

    this.set_pausaInicial(2800);

    this.bloques = new Laberinto(this);
    this.jewels = new Jewels(this);

    this.jugador = new Jugador(this, {
      x: Settings.jugador.posIniX * Settings.tileXY.x,
      y: Settings.jugador.posIniY * Settings.tileXY.y,
      oriX: Settings.jugador.oriX,
      oriY: Settings.jugador.oriY,
    });

    // this.jugadordies = new JugadorDies(this);

    this.instanciar_marcadores();
    this.botonrejugar = new BotonNuevaPartida(this);
  }

  preload() {}

  create()
  {
    // 1.48 1.68 ajustar size fondo al scroll
    this.add.image(0, 0, 'fondo').setScale(1.48, 1.68).setDepth(Settings.depth.fondo).setOrigin(0, 0);

    this.set_sonidos();
    this.set_cameras();
    // this.set_cameras_controles();
    this.set_cameras_marcadores();

    this.bloques.create();
    this.jewels.create();
    this.jugador.create();

    // this.jugadorshowvidas.create();
    
    this.marcadorPtos.create();
    this.marcadorNivel.create();
    this.marcadorHi.create();
    this.botonfullscreen.create();

    this.rexVirtualJoystick();
    this.hideMobileControls();

    this.cameras.main.startFollow(this.jugador.get());
    // this.cameras.main.followOffset.set(0, 0);

    this.set_colliders();
  }

  update()
  {
    if (!Settings.pausas.inicial && !Settings.isGameOver())
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
    Settings.setPausaInicial(true);

    this.txtpreparado = new Textos(this, {
      x: Math.floor(this.sys.game.config.width / 2),
      y: 0,
      txt: ' Ready! ',
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
        at: tiempo,
        run: () =>
        {
          Settings.setPausaInicial(false),
          this.txtpreparado.get().setVisible(false);
          this.set_txtGo();
        }
      }
    ]);

    timeline.play();
    console.log(this.txtpreparado);
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

  set_colliders()
  {
    // Overlap Jugador-Fantasmas
    // this.physics.add.overlap(this.jugador.get(), this.fantasmas.get(), overlapJugadorFantasmas, exceptoNotVisible, this);
    
    // Collide Jugador-Bloques
    this.physics.add.collider(this.jugador.get(), this.bloques.get(), colliderJugadorBloques, null, this);

    // Collide Jugador-Jewels
    this.physics.add.collider(this.jugador.get(), this.jewels.get(), colliderJugadorBloques, null, this);
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
      x: 10, y: marcadoresPosY, size: 40, txt: Settings.getTxtScore(), color: '#fff', strokeColor: '#af1', id: 0
    });

    this.marcadorNivel = new Marcador(this, {
      x: Math.floor(ancho / 2), y: marcadoresPosY, size: 40, txt: ' Level: ', color: '#ff5', strokeColor: '#16d', id: 1
    });

    this.marcadorHi = new Marcador(this, {
      x: Math.floor(ancho / 1.2), y: marcadoresPosY, size: 40, txt: ' Record: ', color: '#fff', strokeColor: '#af1',id: 2
    });

    this.botonfullscreen = new BotonFullScreen(this, {
      x: Math.floor(ancho * 1.5), y: marcadoresPosY + 7, id: 'boton-fullscreen',
      orX: 0, orY: 0, scX: 1.2, scY: 0.8, ang: 0
    });
  }

  set_sonidos()
  {
    this.sonido_getReady = this.sound.add('get-ready');
    play_sonidos(this.sonido_getReady, false, 0.9);
    this.sonido_ziuuu = this.sound.add('ziuuu');
  }
}

import { Settings } from "../scenes/settings";
import { matrixLevels } from "../scenes/matrixLevels";
import { Textos } from "../components/textos";

function colliderJugadorBloques(jugador, bloques)
{
  // console.log(jugador);
  // console.log(bloques);

  // if (!this.jugador.controles.space.isDown) console.log('colision:' + bloques.getData('id'));

  const limits = Settings.bloques.limits;

  if ((this.jugador.controles.space.isDown && Settings.controlElegido.teclado && !limits.includes(bloques.getData('id'))) ||
    (Settings.controlElegido.mobile && !limits.includes(bloques.getData('id'))))
  {
    let indexTecla = 99; // No direction-key pressed (default)
    play_sonidos(this.sonido_ziuuu, false, 0.2);

    Settings.mideTiempo[0] = this.time.now;

    Object.values(Settings.jugador.teclas).forEach((tecla, index) =>
    {
      if (this.jugador.controles[tecla].isDown || this.joystickCursors[tecla].isDown) indexTecla = index; 
    });

    console.log('empujando:' + bloques.getData('id'), indexTecla);

    const array_vel = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    if (indexTecla >= 0 && indexTecla < 4)
    {
      bloques.setData('vel-x', array_vel[indexTecla][0] * Settings.bloques.velPxl);
      bloques.setData('vel-y', array_vel[indexTecla][1] * Settings.bloques.velPxl);
    }
  }
  
  this.jugador.get().setX(this.jugador.viejaX);
  this.jugador.get().setY(this.jugador.viejaY);
}

function colliderJugadorJewels(jugador, jewels)
{
  // console.log(jugador);
  // console.log(jewels);

  if (!this.jugador.controles.space.isDown) console.log('colision:' + jewels.getData('id'));

  if ((this.jugador.controles.space.isDown && Settings.controlElegido.teclado) || Settings.controlElegido.mobile)
  {
    let indexTecla = 99; // No direction-key pressed (default)
    play_sonidos(this.sonido_ziuuu, false, 0.2);

    Settings.mideTiempo[0] = this.time.now;

    Object.values(Settings.jugador.teclas).forEach((tecla, index) =>
    {
      if (this.jugador.controles[tecla].isDown || this.joystickCursors[tecla].isDown) indexTecla = index; 
    });

    console.log('empujando:' + jewels.getData('id'), indexTecla);

    const array_vel = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    if (indexTecla >= 0 && indexTecla < 4)
    {
      jewels.setData('vel-x', array_vel[indexTecla][0] * Settings.bloques.velPxl);
      jewels.setData('vel-y', array_vel[indexTecla][1] * Settings.bloques.velPxl);
    }
  }

  this.jugador.get().setX(this.jugador.viejaX);
  this.jugador.get().setY(this.jugador.viejaY);
}

function colliderBloquesBloques(bloques1, bloques2)
{
  // console.log(bloques1);
  // console.log(bloques2);
  // console.log('.....');

  // Decrease to 'exact pos'
  bloques1.setX(bloques1.x + -(bloques1.getData('vel-x')));
  bloques1.setY(bloques1.y + -(bloques1.getData('vel-y')));
  
  bloques1.setData('vel-x', 0).setData('vel-y', 0);
  
  // Check --> if 'shortTime collision' ... then ... destroy block
  Settings.mideTiempo[1] = this.time.now;
  const checkRomper = Settings.mideTiempo[2];

  if (Settings.mideTiempo[1] - Settings.mideTiempo[0] < checkRomper)
  {
    console.log('romper!!');

    // Shortest-Distance = 44 (tile 48px - 4)
    const shortestBlock = Settings.tileXY.x - Settings.bloques.velPxl;
    if (calcDistance_playerBlock(bloques1, this) === shortestBlock)
    {
      this.brokenblock.create(bloques1.x, bloques1.y, false);
      bloques1.disableBody(true, true);
      suma_puntos(bloques1, this);
      // console.log(Settings.getPuntos());

      play_sonidos(this.sonido_crash, false, 0.6);
    }
  }
}

function colliderBloquesJewels(bloques1, jewels)
{
  // console.log(bloques1);
  // console.log(jewels);
  // console.log('.....');

  // Decrease to 'exact pos'
  bloques1.setX(bloques1.x + -(bloques1.getData('vel-x')));
  bloques1.setY(bloques1.y + -(bloques1.getData('vel-y')));
  
  bloques1.setData('vel-x', 0).setData('vel-y', 0);
  
  // Check --> if 'shortTime collision' ... then ... destroy block
  Settings.mideTiempo[1] = this.time.now;
  const checkRomper = Settings.mideTiempo[2];

  if (Settings.mideTiempo[1] - Settings.mideTiempo[0] < checkRomper)
  {
    console.log('romper!!');

    // Shortest-Distance = 44 (tile 48px - 4)
    const shortestBlock = Settings.tileXY.x - Settings.bloques.velPxl;
    if (calcDistance_playerBlock(bloques1, this) === shortestBlock)
    {
      this.brokenblock.create(bloques1.x, bloques1.y, false);
      bloques1.disableBody(true, true);
      suma_puntos(bloques1, this);
      // console.log(Settings.getPuntos());

      play_sonidos(this.sonido_crash, false, 0.6);
    }
  }
}

function colliderJewelsBloques(jewels, bloques)
{
  // console.log(bloques1);
  // console.log(jewels);
  // console.log('.....');

  // Decrease to 'exact pos'
  jewels.setX(jewels.x + -(jewels.getData('vel-x')));
  jewels.setY(jewels.y + -(jewels.getData('vel-y')));
  
  jewels.setData('vel-x', 0).setData('vel-y', 0);

  check_3JewelsBonus(this);
}

function colliderJewelsJewels(bloques1, bloques2)
{
  // console.log(bloques1);
  // console.log(bloques2);
  // console.log('.....');

  // Decrease to 'exact pos'
  bloques1.setX(bloques1.x + -(bloques1.getData('vel-x')));
  bloques1.setY(bloques1.y + -(bloques1.getData('vel-y')));
  
  bloques1.setData('vel-x', 0).setData('vel-y', 0);

  check_3JewelsBonus(this);
}

function calcDistance_playerBlock(block, scene)
{
  const distX = Math.abs(scene.jugador.get().x - block.x);
  const distY = Math.abs(scene.jugador.get().y - block.y);
  // console.log(distX + distY);
  return distX + distY;
}

function check_3JewelsBonus(scene)
{
  const nivel = Settings.getNivel();

  for (let i = 0; i < matrixLevels.array_levels[nivel].length; i ++)
  {
    for (let ii = 0; ii < matrixLevels.array_levels[nivel][i].length; ii ++)
    {
      const coorY = i * Settings.tileXY.y;
      const coorX = ii * Settings.tileXY.x;
      // console.log(coorX, coorY);

      const coorArrayX = [coorX, coorX + Settings.tileXY.x, coorX + Settings.tileXY.x * 2];
      const coorArrayY = [coorY, coorY + Settings.tileXY.y, coorY + Settings.tileXY.y * 2];

      const gem = scene.jewels.get().getChildren();
      // console.log(gem[0].x, gem[0].y, gem[1].x, gem[1].y);

      if (
        (coorArrayX.includes(gem[0].x) && coorY === gem[0].y) &&
        (coorArrayX.includes(gem[1].x) && coorY === gem[1].y) &&
        (coorArrayX.includes(gem[2].x) && coorY === gem[2].y)
      ) {
        console.log('3 en raya! (horizontal)');
        Settings.setBonus3JewelsDone(true);
        return;
      }

      if (
        (coorArrayY.includes(gem[0].y) && coorX === gem[0].x) &&
        (coorArrayY.includes(gem[1].y) && coorX === gem[1].x) &&
        (coorArrayY.includes(gem[2].y) && coorX === gem[2].x)
      ) {
        console.log('3 en raya! (vertical)');
        Settings.setBonus3JewelsDone(true);
        return;
      }
    }
  }
}

function colisionJugadorVsEnemigo(enemigo, jugador)
{
  console.log('colision...jugador-enemigo');
  console.log(jugador);

  draw_explosionTimeout(this, jugador);

  particulas(
    jugador.x, jugador.y, 'particula-tint',
    {min: 120, max: 180},
    {min: Settings.pausas.duracionExplosion.enemigo, max: Settings.pausas.duracionExplosion.enemigo + 300},
    {start: 0.6, end: 0},
    // 0xffffff,
    // new Phaser.Display.Color(255, Phaser.Math.Between(50, 240), 0).color,
    jugador.tint,
    null, false, this
  );

  particulas(
    enemigo.x, enemigo.y, 'particula-tint',
    {min: 120, max: 200},
    {min: 1500, max: 2000},
    {start: 0.8, end: 0},
    // 0xffffff,
    new Phaser.Display.Color(Phaser.Math.Between(0, 125), Phaser.Math.Between(125, 255), 0).color,
    null, false, this
  );

  if (Settings.getVidas() > 0)
  {
    setTimeout(() =>
    {
      enemigo.setActive(true).setVisible(true).setAlpha(0.1);
      enemigo.enableBody(true, Settings.jugador.posIniX, Settings.jugador.posIniY, true, true);

      this.tweens.add(
      {
        targets: enemigo,
        alpha: 1,
        duration: Settings.pausas.invisible
      });
    }, Settings.pausas.revivir);
  }

  // restar_vida();
  // if (Settings.getVidas() >= 0) this.jugadorSV.get().getChildren()[Settings.getVidas()].setVisible(false);
  
  suma_puntos(jugador);
  this.marcador.update(0, Settings.getPuntos());
  
  jugador.setActive(false).setVisible(false).disableBody(true, true);
  enemigo.setActive(false).setVisible(false).disableBody(true, true);
}

function excepcionJugadorVsEnemigo(enemigo, jugador)
{
  if (enemigo.alpha < 1) return false;
  return true;
}

function colisionDisparoVsEnemigo(disparo, enemigo)
{
  console.log('colision...disparo-enemigo');
  console.log(disparo);

  play_sonidos(this.sonidoExplosion, false, 0.7);
  draw_explosionTimeout(this, disparo);

  particulas(
    disparo.x, disparo.y, 'particula-tint',
    {min: 120, max: 180},
    {min: Settings.pausas.duracionExplosion.enemigo, max: Settings.pausas.duracionExplosion.enemigo + 500},
    {start: 0.7, end: 0},
    // 0xffffff,
    // new Phaser.Display.Color(255, Phaser.Math.Between(50, 240), 0).color,
    disparo.tint,
    null, false, this
  );

  suma_puntos(disparo);
  this.marcador.update(0, Settings.getPuntos());
  
  enemigo.setActive(false).setVisible(false).setX(-9999)
  disparo.setActive(false).setVisible(false).disableBody(true, true);
}

function colisionDisparoEnemigoVsJugador(disparoEnemigo, jugador)
{
  console.log('colision...disparoEnemigo-jugador');
  console.log(disparoEnemigo);

  play_sonidos(this.sonidoNaveExplota, false, 0.8);

  particulas(
    disparoEnemigo.x, disparoEnemigo.y, 'particula-tint',
    {min: 120, max: 180},
    {min: Settings.pausas.duracionExplosion.jugador, max: Settings.pausas.duracionExplosion.jugador + 500},
    {start: 0.8, end: 0},
    // 0xffffff,
    // new Phaser.Display.Color(255, Phaser.Math.Between(50, 240), 0).color,
    new Phaser.Display.Color(Phaser.Math.Between(0, 125), Phaser.Math.Between(125, 255), 0).color,
    null, false, this
  );

  if (Settings.getVidas() > 0)
  {
    setTimeout(() =>
    {
      disparoEnemigo.setActive(true).setVisible(true).setAlpha(0.1);
      disparoEnemigo.enableBody(true, Settings.jugador.posIniX, Settings.jugador.posIniY, true, true);

      this.tweens.add(
      {
        targets: disparoEnemigo,
        alpha: 1,
        duration: Settings.pausas.invisible
      });
    }, Settings.pausas.revivir);
  }

  restar_vida();
  if (Settings.getVidas() >= 0)
  {
    this.jugadorSV.get().getChildren()[Settings.getVidas()].setVisible(false);
  }
  else
  {
    Settings.setGameOver(true);
  }

  jugador.setActive(false).setVisible(false).setX(-8888)
  disparoEnemigo.setActive(false).setVisible(false).disableBody(true, true);
}

function excepcionDisparoEnemigoVsJugador(disparoEnemigo, jugador)
{
  if (disparoEnemigo.alpha < 1) return false;
  return true;
}

/* particulas(
  defensa.x, defensa.y, 'particula-tint',
  {min: 100, max: 160},
  {min: Settings.pausas.duracionExplosion.enemigo, max: Settings.pausas.duracionExplosion.enemigo + 500},
  {start: 0.5, end: 0},
  new Phaser.Display.Color(Phaser.Math.Between(170, 180), Phaser.Math.Between(155 ,195), 73).color,
  null, false, this
); */

function countDownBonus(scene)
{
  const txtbonus = new Textos(scene, {
    x: scene.jugador.get().x,
    y: scene.jugador.get().y + 90,
    txt: Settings.getBonus3JewelsBonus(),
    size: 70, color: '#ffa', style: 'bold',
    stroke: '#af1', sizeStroke: 16,
    shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
    bool1: false, bool2: true, origin: [0.5, 0.5],
    elastic: false, dura: 0
  });
  
  txtbonus.create();
  txtbonus.get().setDepth(Settings.depth.textos);

  scene.time.delayedCall(Settings.pausas.bonus3Jewels.duracion, () => txtbonus.get().setVisible(false));

  const decBonus = Settings.pausas.bonus3Jewels.decBonusCountDown;
  const repetir = Math.floor(Settings.getBonus3JewelsBonus() / decBonus) - 1;

  const playerClock = scene.add.timeline([
    {
      at: 100, // 0.1sg --> dec time
      run: () =>
      {
        // console.log('sg');
        const decBonus = Settings.pausas.bonus3Jewels.decBonusCountDown;
        Settings.setBonus3JewelsBonus(Settings.getBonus3JewelsBonus() - decBonus);

        txtbonus.get().setText(Settings.getBonus3JewelsBonus());

        Settings.setPuntos(Settings.getPuntos() + decBonus);
        scene.marcadorPtos.update(Settings.getTxtScore(), Settings.getPuntos());
        play_sonidos(scene.sonido_numkey, false, 0.8);
      }
    }
  ]);

  playerClock.repeat(repetir).play();
}

function particulas(x, y, particula, vel, span, size, color, sprite, bool, scene)
{
  const partis = scene.add.particles(x, y, particula, {
    speed: vel,
    lifespan: span,
    scale: size,
    tint: color,
    // gravityY: 200
    blendMode: 'ADD'
  });

  partis.setDepth(Settings.depth.bonus3Jewels);

  scene.time.delayedCall(Settings.pausas.bonus3Jewels.duracion, () => {
    partis.stop();
    Settings.audio.musicaFondo.volume = 0.6;
  });

  if (bool) partis.startFollow(sprite);
}

function suma_puntos(puntos, scene)
{
  const bonus = Settings.getPuntos() + puntos.getData('puntos');
  Settings.setPuntos(bonus);
  scene.marcadorPtos.update(Settings.getTxtScore(), Settings.getPuntos());
  // console.log(bonus, Settings.getPuntos());
}

function restar_vida()
{
  const actualizar = Settings.getVidas() - 1;
  Settings.setVidas(actualizar);
}

function showBonus(scene, enemigo)
{
  Settings.showBonus = new Textos(scene, {
    x: enemigo.x,
    y: enemigo.y + 25,
    txt: enemigo.getData('puntos').toString(),
    size: 55, color: '#ffa', style: 'bold',
    stroke: '#f21', sizeStroke: 16,
    shadowOsx: 2, shadowOsy: 2, shadowColor: '#111',
    bool1: false, bool2: true, origin: [0.5, 0.5],
    elastic: false, dura: 0
  });
  
  Settings.showBonus.create();
  Settings.showBonus.get().setScale(1.2).setAlpha(1);

  scene.tweens.add(
  {
    targets: Settings.showBonus.get(),
    alpha: 0,
    scale: 0,
    duration: Settings.pausas.showBonus
  });
}

function play_sonidos(id, loop, volumen)
{
  id.volume = volumen;
  id.loop = loop;
  id.play();
}

export {
  colliderJugadorBloques,
  colliderJugadorJewels,
  colliderBloquesBloques,
  colliderBloquesJewels,
  colliderJewelsBloques,
  colliderJewelsJewels,
  particulas,
  countDownBonus,
  play_sonidos
};

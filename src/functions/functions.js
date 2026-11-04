import { Settings } from "../scenes/settings";
import { Textos } from "../components/textos";

// --- Colisiones del jugador: empujar bloques y joyas ---
function colliderJugadorBloques(jugador, bloque)
{
  // Los bordes (limits) no se pueden empujar
  if (!Settings.bloques.limits.includes(bloque.getData('id'))) intentar_empujar(bloque, this);

  volver_jugador(this);
}

function colliderJugadorJewels(jugador, gem)
{
  intentar_empujar(gem, this);
  volver_jugador(this);
}

function intentar_empujar(objeto, scene)
{
  // Con teclado hay que pulsar espacio; con controles moviles empuja al tocarlo
  const empuja = Settings.controlElegido.mobile ||
    (Settings.controlElegido.teclado && scene.jugador.controles.space.isDown);

  if (!empuja) return;

  play_sonidos(scene.sonido_ziuuu, false, 0.2);
  Settings.mideTiempo[0] = scene.time.now;

  let indexTecla = 99; // Ninguna direccion pulsada

  Object.values(Settings.jugador.teclas).forEach((tecla, index) =>
  {
    if (scene.jugador.controles[tecla].isDown || scene.joystickCursors[tecla].isDown) indexTecla = index;
  });

  const array_vel = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  if (indexTecla < 4)
  {
    objeto.setData('vel-x', array_vel[indexTecla][0] * Settings.bloques.velPxl);
    objeto.setData('vel-y', array_vel[indexTecla][1] * Settings.bloques.velPxl);
  }
}

function volver_jugador(scene)
{
  scene.jugador.get().setX(scene.jugador.viejaX);
  scene.jugador.get().setY(scene.jugador.viejaY);
}

// --- Colisiones de bloques y joyas en movimiento ---
// Bloque contra bloque o joya: se para y, si se acaba de empujar estando pegado a otro, se rompe
function colliderBloqueParar(bloque, otro)
{
  retroceder_y_parar(bloque);

  Settings.mideTiempo[1] = this.time.now;
  const checkRomper = Settings.mideTiempo[2];

  if (Settings.mideTiempo[1] - Settings.mideTiempo[0] < checkRomper)
  {
    // Distancia minima = 44 (tile 48px - 4): el bloque no llego a moverse
    const shortestBlock = Settings.tileXY.x - Settings.bloques.velPxl;

    if (calcDistance_playerBlock(bloque, this) === shortestBlock)
    {
      this.brokenblock.create(bloque.x, bloque.y, false);
      bloque.disableBody(true, true);
      suma_puntos(bloque, this);

      play_sonidos(this.sonido_crash, false, 0.6);
    }
  }
}

// Joya contra bloque o joya: se para y se comprueba el 3 en raya
function colliderJewelParar(gem, otro)
{
  retroceder_y_parar(gem);
  check_3JewelsBonus(this);
}

function retroceder_y_parar(objeto)
{
  // Deshacer el ultimo paso para quedar en la posicion exacta de la cuadricula
  objeto.setX(objeto.x - objeto.getData('vel-x'));
  objeto.setY(objeto.y - objeto.getData('vel-y'));

  objeto.setData('vel-x', 0).setData('vel-y', 0);
}

function calcDistance_playerBlock(block, scene)
{
  const distX = Math.abs(scene.jugador.get().x - block.x);
  const distY = Math.abs(scene.jugador.get().y - block.y);
  return distX + distY;
}

function check_3JewelsBonus(scene)
{
  const gems = scene.jewels.get().getChildren();
  const tile = Settings.tileXY.x;

  // 3 en raya = misma fila (o columna) y en casillas seguidas
  const enLinea = (fijo, variable) =>
  {
    if (!gems.every(g => g[fijo] === gems[0][fijo])) return false;

    const valores = gems.map(g => g[variable]).sort((a, b) => a - b);
    return valores[1] === valores[0] + tile && valores[2] === valores[0] + tile * 2;
  };

  if (enLinea('y', 'x') || enLinea('x', 'y')) Settings.setBonus3JewelsDone(true);
}

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
      at: 100, // cada 0.1sg se pasa parte del bonus a los puntos
      run: () =>
      {
        Settings.setBonus3JewelsBonus(Settings.getBonus3JewelsBonus() - decBonus);
        txtbonus.get().setText(Settings.getBonus3JewelsBonus());

        Settings.setPuntos(Settings.getPuntos() + decBonus);
        actualizar_marcadores(scene);
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
    blendMode: 'ADD'
  });

  partis.setDepth(Settings.depth.bonus3Jewels);

  scene.time.delayedCall(Settings.pausas.bonus3Jewels.duracion, () => {
    partis.stop();
    Settings.audio.musicaFondo.volume = Settings.getVolumenMusica();
  });

  if (bool) partis.startFollow(sprite);
}

function suma_puntos(puntos, scene)
{
  Settings.setPuntos(Settings.getPuntos() + puntos.getData('puntos'));
  actualizar_marcadores(scene);
}

function actualizar_marcadores(scene)
{
  scene.marcadorPtos.update(Settings.getTxtScore(), Settings.getPuntos());

  if (Settings.getPuntos() > Settings.getRecord())
  {
    Settings.setRecord(Settings.getPuntos());
    scene.marcadorHi.update(Settings.getTxtRecord(), Settings.getRecord());
  }
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
  colliderBloqueParar,
  colliderJewelParar,
  particulas,
  countDownBonus,
  play_sonidos
};

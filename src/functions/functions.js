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

  let indexTecla = 99; // Ninguna direccion pulsada

  Object.values(Settings.jugador.teclas).forEach((tecla, index) =>
  {
    if (scene.jugador.controles[tecla].isDown || scene.joystickCursors[tecla].isDown) indexTecla = index;
  });

  const array_vel = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  if (indexTecla < 4)
  {
    const [dx, dy] = array_vel[indexTecla];
    // indexTecla sigue el orden de Settings.jugador.teclas: le, ri, up, do
    scene.jugador.empujar(Object.keys(Settings.jugador.teclas)[indexTecla]);

    // Un bloque pegado a otro bloque o a una joya no puede moverse: se rompe (las joyas no se rompen)
    if (scene.bloques.get().contains(objeto) && casilla_ocupada(objeto, dx, dy, scene))
    {
      romper_bloque(objeto, scene);
      return;
    }

    objeto.setData('vel-x', dx * Settings.bloques.velPxl);
    objeto.setData('vel-y', dy * Settings.bloques.velPxl);
  }
}

function casilla_ocupada(objeto, dx, dy, scene)
{
  const col = Math.round(objeto.x / Settings.tileXY.x) + dx;
  const fila = Math.round(objeto.y / Settings.tileXY.y) + dy;
  return scene.enemigos.casillas_ocupadas().has(`${col},${fila}`);
}

function romper_bloque(bloque, scene)
{
  scene.brokenblock.create(bloque.x, bloque.y, false);
  bloque.disableBody(true, true);
  suma_puntos(bloque, scene);

  // Era un huevo: el enemigo que iba a salir de el ya no saldra
  if (bloque.getData('huevo')) scene.enemigos.huevo_roto(bloque);

  play_sonidos(scene.sonido_crash, false, 0.6);
}

function volver_jugador(scene)
{
  scene.jugador.get().setX(scene.jugador.viejaX);
  scene.jugador.get().setY(scene.jugador.viejaY);
}

// --- Colisiones de bloques y joyas en movimiento ---
// Bloque en movimiento contra bloque o joya: se para (romperse se decide al empujar, en intentar_empujar)
function colliderBloqueParar(bloque, otro)
{
  retroceder_y_parar(bloque);
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
  comprobar_vida_extra(scene);

  if (Settings.getPuntos() > Settings.getRecord())
  {
    Settings.setRecord(Settings.getPuntos());
    scene.marcadorHi.update(Settings.getTxtRecord(), Settings.getRecord());
  }
}

// Toque o clic en cualquier parte de la pagina (no solo en el canvas), una vez
function al_tocar(scene, callback)
{
  const app = document.getElementById('app') || document.body;
  const handler = () => { quitar(); callback(); };
  const quitar = () => app.removeEventListener('pointerdown', handler);

  app.addEventListener('pointerdown', handler);
  scene.events.once('shutdown', quitar);
}

// Todas las sumas de puntos pasan por actualizar_marcadores(): aqui se mira el siguiente umbral
function comprobar_vida_extra(scene)
{
  const extra = Settings.vidasExtra;
  let ganadas = 0;

  while (extra.conseguidas < extra.umbrales.length && Settings.getPuntos() >= extra.umbrales[extra.conseguidas])
  {
    extra.conseguidas++;
    ganadas++;
  }

  if (ganadas === 0) return;

  Settings.setVidas(Settings.getVidas() + ganadas);
  scene.marcadorVidas.update(Settings.getTxtVidas(), Settings.getVidas());
  scene.aviso_vida_extra();
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
  play_sonidos,
  al_tocar,
  actualizar_marcadores
};

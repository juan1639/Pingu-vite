import { Settings } from '../scenes/settings.js';
import { play_sonidos, actualizar_marcadores } from '../functions/functions.js';

const DIRECCIONES = [
    { dx: -1, dy: 0, anima: 'enemigo-le' },
    { dx: 1, dy: 0, anima: 'enemigo-ri' },
    { dx: 0, dy: -1, anima: 'enemigo-up' },
    { dx: 0, dy: 1, anima: 'enemigo-do' }
];

// Mismo reparto de fotogramas que pengo-ssheet (el del jugador), solo cambian los colores
const ANIMAS = [
    ['enemigo-le', 2, 3],
    ['enemigo-ri', 6, 7],
    ['enemigo-up', 4, 5],
    ['enemigo-do', 0, 1]
];

// Enemigos al estilo Pengo:
// - al empezar el nivel se eligen al azar 'total' bloques normales como huevos (parpadean durante el "Ready!")
// - como mucho hay 'maxALaVez' enemigos; cuando muere uno sale otro de un huevo (el bloque se rompe)
// - romper un huevo empujandolo elimina al enemigo que iba a salir de el
// - se mueven por la cuadricula como el jugador, y en cada casilla eligen camino (mas o menos persiguiendo)
export class Enemigos
{
    constructor(scene)
    {
        this.relatedScene = scene;
        this.lista = [];
        this.huevos = [];
        this.proximaSalida = 0;
    }

    create()
    {
        const cfg = Settings.enemigos;

        this.crear_animaciones();
        const tile = Settings.tileXY.x;
        const iniX = Settings.jugador.posIniX;
        const iniY = Settings.jugador.posIniY;

        // Los enemigos no rompen bloques: el huevo tiene que tocar algun pasillo o se quedarian encerrados
        const ocupadas = this.casillas_ocupadas();
        const candidatos = this.relatedScene.bloques.get().getChildren().filter(b =>
            Settings.bloques.normal.includes(b.getData('id')) &&
            Math.abs(b.x / tile - iniX) + Math.abs(b.y / tile - iniY) >= cfg.distanciaMinimaInicio &&
            this.tiene_salida(b, ocupadas)
        );

        this.huevos = Phaser.Utils.Array.Shuffle(candidatos).slice(0, cfg.total);

        this.huevos.forEach(huevo =>
        {
            huevo.setData('huevo', true);
            // suma_puntos() lee este dato al romper el bloque
            huevo.setData('puntos', cfg.puntosHuevo);
        });

        this.destellar_huevos();

        // Recordatorio: cada cierto tiempo vuelven a destellar los huevos que quedan
        this.relatedScene.time.addEvent({
            delay: cfg.intervaloRecordatorio,
            loop: true,
            callback: () =>
            {
                if (this.huevos.length > 0 && !Settings.isNivelSuperado() && !Settings.isGameOver())
                {
                    this.destellar_huevos();
                }
            }
        });
    }

    // Durante el "Ready!" los huevos destellan en amarillo para que el jugador vea (y recuerde) donde estan.
    // Solo color: cambiar la escala tocaria el cuerpo fisico y chocaria con los bloques de al lado
    destellar_huevos()
    {
        const { colorDestello, destellos, intervaloDestello } = Settings.enemigos;
        let encendido = false;

        this.relatedScene.time.addEvent({
            delay: intervaloDestello,
            startAt: intervaloDestello - 300, // el primero a los 300 ms
            repeat: destellos * 2 - 1,
            callback: () =>
            {
                encendido = !encendido;
                this.huevos.forEach(h =>
                {
                    if (!h.active) return;
                    if (encendido) h.setTintFill(colorDestello);
                    else h.clearTint();
                });
            }
        });
    }

    // Devuelve true si un enemigo ha tocado al jugador
    update()
    {
        this.intentar_salida();

        let ocupadas = null;

        for (const enemigo of this.lista)
        {
            if (enemigo.getData('muriendo')) continue;

            if (enemigo.x % Settings.tileXY.x === 0 && enemigo.y % Settings.tileXY.y === 0)
            {
                // Solo se calcula si algun enemigo esta en el centro de una casilla
                if (!ocupadas) ocupadas = this.casillas_ocupadas();
                this.elegir_direccion(enemigo, ocupadas);
            }

            const dir = enemigo.getData('dir');
            if (dir)
            {
                enemigo.x += dir.dx * Settings.enemigos.velPxl;
                enemigo.y += dir.dy * Settings.enemigos.velPxl;
            }
        }

        this.comprobar_aplastados();

        return this.toca_jugador();
    }

    intentar_salida()
    {
        const cfg = Settings.enemigos;
        const ahora = this.relatedScene.time.now;
        const vivos = this.lista.filter(e => !e.getData('muriendo')).length;

        if (vivos >= cfg.maxALaVez || this.huevos.length === 0 || ahora < this.proximaSalida) return;

        // Solo huevos quietos, en su casilla y con salida (los bloques empujados pueden haberlos tapado)
        const ocupadas = this.casillas_ocupadas();
        const quietos = this.huevos.filter(h =>
            h.active && h.getData('vel-x') === 0 && h.getData('vel-y') === 0 &&
            h.x % Settings.tileXY.x === 0 && h.y % Settings.tileXY.y === 0 &&
            this.tiene_salida(h, ocupadas)
        );
        if (quietos.length === 0) return;

        // Mejor que no salga pegado al jugador si hay otros huevos
        const jugador = this.relatedScene.jugador.get();
        const lejos = quietos.filter(h => this.distancia_casillas(h, jugador) >= 3);
        const huevo = Phaser.Utils.Array.GetRandom(lejos.length > 0 ? lejos : quietos);

        this.quitar_huevo(huevo);
        this.relatedScene.brokenblock.create(huevo.x, huevo.y, false);
        huevo.disableBody(true, true);
        play_sonidos(this.relatedScene.sonido_crash, false, 0.4);

        this.crear_enemigo(huevo.x, huevo.y);
        this.proximaSalida = ahora + cfg.retrasoSalida;
    }

    // Las animaciones son globales: solo se crean la primera vez
    crear_animaciones()
    {
        const anims = this.relatedScene.anims;

        ANIMAS.forEach(([key, inicio, fin]) =>
        {
            if (anims.exists(key)) return;

            anims.create({
                key,
                frames: anims.generateFrameNumbers('pengo-enemies-ssheet', { start: inicio, end: fin }),
                frameRate: 5,
                yoyo: true,
                repeat: -1
            });
        });
    }

    crear_enemigo(x, y)
    {
        const enemigo = this.relatedScene.add.sprite(x, y, 'pengo-enemies-ssheet');

        enemigo.setScale(0.9).setDepth(Settings.depth.enemigo);
        enemigo.setData('casaX', x).setData('casaY', y);
        enemigo.setData('dir', null).setData('muriendo', false);
        enemigo.anims.play('enemigo-do', true);

        // Los marcadores tienen su propia camara: el enemigo solo se dibuja en la principal
        this.relatedScene.mapa_scores.ignore(enemigo);

        this.lista.push(enemigo);
    }

    elegir_direccion(enemigo, ocupadas)
    {
        const col = enemigo.x / Settings.tileXY.x;
        const fila = enemigo.y / Settings.tileXY.y;
        const actual = enemigo.getData('dir');

        let libres = DIRECCIONES.filter(d => !ocupadas.has(this.clave(col + d.dx, fila + d.dy)));

        if (libres.length === 0)
        {
            enemigo.setData('dir', null);
            return;
        }

        // No dar media vuelta salvo en un callejon sin salida
        if (actual && libres.length > 1)
        {
            libres = libres.filter(d => !(d.dx === -actual.dx && d.dy === -actual.dy));
        }

        let elegida;

        if (Math.random() < Settings.enemigos.probPerseguir)
        {
            const jugador = this.relatedScene.jugador.get();
            const distancia = (d) =>
                Math.abs(enemigo.x + d.dx * Settings.tileXY.x - jugador.x) +
                Math.abs(enemigo.y + d.dy * Settings.tileXY.y - jugador.y);

            elegida = libres.reduce((mejor, d) => (distancia(d) < distancia(mejor) ? d : mejor));
        }
        else
        {
            elegida = Phaser.Utils.Array.GetRandom(libres);
        }

        if (elegida !== actual) enemigo.anims.play(elegida.anima, true);
        enemigo.setData('dir', elegida);
    }

    // Casillas con bloque o joya (los que se deslizan ocupan las dos casillas entre las que estan)
    casillas_ocupadas()
    {
        const ocupadas = new Set();
        const tile = Settings.tileXY.x;

        const marcar = (obj) =>
        {
            if (!obj.active) return;
            const cx = obj.x / tile;
            const cy = obj.y / tile;
            ocupadas.add(this.clave(Math.floor(cx), Math.floor(cy)));
            ocupadas.add(this.clave(Math.ceil(cx), Math.ceil(cy)));
        };

        this.relatedScene.bloques.get().getChildren().forEach(marcar);
        this.relatedScene.jewels.get().getChildren().forEach(marcar);

        return ocupadas;
    }

    // Un bloque o una joya deslizandose que alcanza a un enemigo lo aplasta
    comprobar_aplastados()
    {
        const alcance = Settings.tileXY.x - 8;
        const enMovimiento = [
            ...this.relatedScene.bloques.get().getChildren(),
            ...this.relatedScene.jewels.get().getChildren()
        ].filter(o => o.active && (o.getData('vel-x') !== 0 || o.getData('vel-y') !== 0));

        if (enMovimiento.length === 0) return;

        for (const enemigo of this.lista)
        {
            if (enemigo.getData('muriendo')) continue;

            const golpe = enMovimiento.some(o =>
                Math.abs(o.x - enemigo.x) < alcance && Math.abs(o.y - enemigo.y) < alcance
            );

            if (golpe) this.aplastar(enemigo);
        }
    }

    aplastar(enemigo)
    {
        const scene = this.relatedScene;

        enemigo.setData('muriendo', true);
        enemigo.anims.stop();

        Settings.setPuntos(Settings.getPuntos() + Settings.enemigos.puntosAplastar);
        actualizar_marcadores(scene);
        play_sonidos(scene.sonido_crash, false, 0.8);

        // Se aplasta y desaparece
        scene.tweens.add({
            targets: enemigo,
            scaleY: 0.15,
            alpha: 0,
            duration: 450,
            onComplete: () =>
            {
                this.lista = this.lista.filter(e => e !== enemigo);
                enemigo.destroy();
            }
        });

        this.proximaSalida = Math.max(this.proximaSalida, scene.time.now + Settings.enemigos.retrasoReponer);
    }

    toca_jugador()
    {
        const jugador = this.relatedScene.jugador.get();
        const alcance = Settings.tileXY.x - 14;

        return this.lista.some(e =>
            !e.getData('muriendo') &&
            Math.abs(e.x - jugador.x) < alcance && Math.abs(e.y - jugador.y) < alcance
        );
    }

    // Al morir el jugador, cada enemigo vuelve a la casilla de la que salio
    volver_a_casa()
    {
        this.lista.forEach(e =>
        {
            const { x, y } = this.casilla_libre_cercana(e.getData('casaX'), e.getData('casaY'));
            e.setPosition(x, y).setData('dir', null);
            e.anims.play('enemigo-do', true);
        });

        this.proximaSalida = this.relatedScene.time.now + Settings.enemigos.retrasoReponer;
    }

    // La casilla (x, y) si esta libre o la libre mas cercana (pueden haber empujado algo encima)
    casilla_libre_cercana(x, y)
    {
        const tile = Settings.tileXY.x;
        const ocupadas = this.casillas_ocupadas();
        const inicio = [x / tile, y / tile];
        const vistas = new Set([this.clave(...inicio)]);
        const cola = [inicio];

        while (cola.length > 0)
        {
            const [c, f] = cola.shift();
            if (!ocupadas.has(this.clave(c, f))) return { x: c * tile, y: f * tile };

            for (const d of DIRECCIONES)
            {
                const nc = c + d.dx;
                const nf = f + d.dy;
                const k = this.clave(nc, nf);
                if (nc < 0 || nf < 0 || nc > 18 || nf > 14 || vistas.has(k)) continue;
                vistas.add(k);
                cola.push([nc, nf]);
            }
        }

        return { x, y };
    }

    tiene_salida(bloque, ocupadas)
    {
        const col = bloque.x / Settings.tileXY.x;
        const fila = bloque.y / Settings.tileXY.y;
        return DIRECCIONES.some(d => !ocupadas.has(this.clave(col + d.dx, fila + d.dy)));
    }

    quitar_huevo(bloque)
    {
        this.huevos = this.huevos.filter(h => h !== bloque);
    }

    // El jugador ha roto un huevo: se quita y se celebra (los puntos ya los suma suma_puntos)
    huevo_roto(bloque)
    {
        const scene = this.relatedScene;
        const { x, y } = bloque;
        const cfg = Settings.enemigos;

        this.quitar_huevo(bloque);
        play_sonidos(scene.sonido_moneda, false, 0.8);

        // Estallido de chispas amarillas
        const chispas = scene.add.particles(x, y, 'particula1', {
            speed: { min: 120, max: 320 },
            lifespan: 650,
            scale: { start: 0.35, end: 0 },
            tint: cfg.colorDestello,
            blendMode: 'ADD',
            emitting: false
        });
        chispas.setDepth(Settings.depth.explosiones);
        chispas.explode(24);
        scene.time.delayedCall(800, () => chispas.destroy());

        // "+500" que sube y se desvanece
        const txt = scene.add.text(x, y, `+${cfg.puntosHuevo}`, {
            fontSize: '34px', fontStyle: 'bold', fontFamily: 'verdana, arial, sans-serif',
            fill: '#ffe033'
        });
        txt.setOrigin(0.5, 0.5).setStroke('#b52', 8).setDepth(Settings.depth.textos);

        scene.tweens.add({
            targets: txt,
            y: y - 60,
            alpha: 0,
            delay: 400,
            duration: 900,
            onComplete: () => txt.destroy()
        });
    }

    // Nivel superado por enemigos: no queda ninguno vivo ni por salir
    todos_eliminados()
    {
        return this.huevos.length === 0 && this.lista.length === 0;
    }

    restantes()
    {
        return this.huevos.length + this.lista.filter(e => !e.getData('muriendo')).length;
    }

    distancia_casillas(a, b)
    {
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) / Settings.tileXY.x;
    }

    clave(col, fila)
    {
        return `${col},${fila}`;
    }

    get()
    {
        return this.lista;
    }
}

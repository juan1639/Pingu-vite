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
        // Pasos de logica jugados en este nivel (60 por segundo); sin contar pausas ni muertes
        this.pasosJugados = 0;
        this.prisa = false;
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
        this.contar_tiempo();
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

                // La velocidad solo cambia en el centro de una casilla: a mitad de camino
                // (posicion multiplo de 2 pero no de 4) se saltaria el centro y saldria de la cuadricula
                enemigo.setData('vel', this.velocidad());
            }

            const dir = enemigo.getData('dir');
            if (dir)
            {
                enemigo.x += dir.dx * enemigo.getData('vel');
                enemigo.y += dir.dy * enemigo.getData('vel');
            }
        }

        this.comprobar_aplastados();
        this.mover_arrastrados();

        return this.toca_jugador();
    }

    // Pasado un tiempo en el mismo nivel los enemigos van al doble de velocidad (para no especular)
    contar_tiempo()
    {
        this.pasosJugados++;

        if (!this.prisa && this.pasosJugados * 1000 / 60 >= Settings.enemigos.tiempoPrisa)
        {
            this.prisa = true;
            this.relatedScene.aviso_prisa();
        }
    }

    velocidad()
    {
        return this.prisa ? Settings.enemigos.velPxlPrisa : Settings.enemigos.velPxl;
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
        enemigo.setData('dir', null).setData('muriendo', false).setData('vel', this.velocidad());
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

    // Un bloque o una joya deslizandose que alcanza a un enemigo se lo lleva por delante
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

            const golpe = enMovimiento.find(o =>
                Math.abs(o.x - enemigo.x) < alcance && Math.abs(o.y - enemigo.y) < alcance
            );

            if (golpe) this.arrastrar(enemigo, golpe);
        }
    }

    // Como en el Pengo original: el enemigo queda pegado delante del bloque hasta que este se para
    arrastrar(enemigo, bloque)
    {
        const dx = Math.sign(bloque.getData('vel-x'));
        const dy = Math.sign(bloque.getData('vel-y'));
        // Si ya lleva otros, este va un poco mas adelante
        const yaLleva = this.lista.filter(e => e.getData('arrastradoPor') === bloque).length;

        enemigo.setData('muriendo', true);
        enemigo.setData('arrastradoPor', bloque);
        enemigo.setData('arrastreDir', { dx, dy });
        enemigo.setData('arrastreDist', Settings.enemigos.distanciaArrastre + yaLleva * Settings.enemigos.separacionArrastre);
        enemigo.anims.stop();

        // Achatado contra el bloque en la direccion del empuje
        if (dx !== 0) enemigo.setScale(0.9 * 0.6, 0.9);
        else enemigo.setScale(0.9, 0.9 * 0.6);

        this.colocar_arrastrado(enemigo);

        // Mientras va arrastrado ya no cuenta como vivo: el siguiente tarda lo mismo que antes en salir
        this.proximaSalida = Math.max(this.proximaSalida, this.relatedScene.time.now + Settings.enemigos.retrasoReponer);
    }

    mover_arrastrados()
    {
        // Agrupados por bloque: los que lleva un mismo bloque se aplastan a la vez
        const porBloque = new Map();

        for (const enemigo of this.lista)
        {
            const bloque = enemigo.getData('arrastradoPor');
            if (!bloque) continue;
            if (!porBloque.has(bloque)) porBloque.set(bloque, []);
            porBloque.get(bloque).push(enemigo);
        }

        porBloque.forEach((enemigos, bloque) =>
        {
            const parado = !bloque.active || (bloque.getData('vel-x') === 0 && bloque.getData('vel-y') === 0);

            if (!parado)
            {
                enemigos.forEach(e => this.colocar_arrastrado(e));
                return;
            }

            enemigos.forEach(e =>
            {
                e.setData('arrastradoPor', null);
                this.aplastar(e);
            });

            // Bonificacion: 400 por uno, x2 por cada enemigo mas aplastado a la vez (400, 800, 1600, 3200)
            const puntos = Settings.enemigos.puntosAplastar * 2 ** (enemigos.length - 1);
            Settings.setPuntos(Settings.getPuntos() + puntos);
            actualizar_marcadores(this.relatedScene);

            // El efecto sale donde esta el primero (el mas pegado al bloque)
            this.celebrar_puntos(enemigos[0].x, enemigos[0].y, puntos);
        });
    }

    colocar_arrastrado(enemigo)
    {
        const bloque = enemigo.getData('arrastradoPor');
        const { dx, dy } = enemigo.getData('arrastreDir');
        const dist = enemigo.getData('arrastreDist');

        enemigo.setPosition(bloque.x + dx * dist, bloque.y + dy * dist);
    }

    aplastar(enemigo)
    {
        const scene = this.relatedScene;
        const dir = enemigo.getData('arrastreDir') || { dx: 0, dy: 1 };

        enemigo.setData('muriendo', true);
        enemigo.anims.stop();

        // Los puntos los suma mover_arrastrados() para todo el grupo
        play_sonidos(scene.sonido_crash, false, 0.8);

        // Se aplasta contra el obstaculo (en la direccion del empuje) y desaparece
        scene.tweens.add({
            targets: enemigo,
            ...(dir.dx !== 0 ? { scaleX: 0.12 } : { scaleY: 0.12 }),
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
            // Los que van arrastrados o aplastandose siguen a lo suyo
            if (e.getData('muriendo')) return;

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
        this.quitar_huevo(bloque);
        this.celebrar_puntos(bloque.x, bloque.y, Settings.enemigos.puntosHuevo);
    }

    // Chispas, "+puntos" que sube y se desvanece, y sonido de moneda (los puntos se suman aparte)
    celebrar_puntos(x, y, puntos)
    {
        const scene = this.relatedScene;
        const cfg = Settings.enemigos;

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

        const txt = scene.add.text(x, y, `+${puntos}`, {
            fontSize: '34px', fontStyle: 'bold', fontFamily: 'verdana, arial, sans-serif',
            fill: '#ffe033'
        });
        txt.setOrigin(0.5, 0.5).setStroke('#b52', 8).setDepth(Settings.depth.textos);

        // Cerca del borde de la pantalla el texto se mete hacia dentro para que se lea entero
        // (zona que ve la camara, que sigue al jugador y no siempre muestra todo el laberinto)
        const limites = scene.cameras.main.worldView;
        const margenX = txt.width / 2 + 4;
        txt.x = Math.min(Math.max(x, limites.x + margenX), limites.right - margenX);
        txt.y = Math.max(y, limites.y + txt.height + 60);

        scene.tweens.add({
            targets: txt,
            y: txt.y - 60,
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

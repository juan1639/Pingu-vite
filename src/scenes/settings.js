import { matrixLevels } from './matrixLevels.js';

export class Settings
{
    static controlElegido = {
        mobile: false,
        teclado: true
    };

    static screen = {
        width: 800,
        height: 550,
        escBoundsX: 1.10,
        escBoundsY: 1.25
    };

    static tileXY =
    {
        x: 48,
        y: 48
    };

    static gameOver = false;

    static puntos = 0;
    // Niveles en bucle: los escenarios de matrixLevels se repiten 'loops' veces (4 x 5 = 20 niveles)
    static nivel = 1;
    static loops = 5;
    // El record se guarda en el navegador (localStorage)
    static claveRecord = 'pingu-record';
    static recordInicial = 12000;
    static hi = Settings.cargar_record();
    static vidasIniciales = 3;
    static vidas = Settings.vidasIniciales;
    static txtScore = ' Score: ';
    static txtRecord = ' Record: ';

    static velJugador = 4;

    static jugador =
    {
        posIniX: 9,
        posIniY: 7,
        oriX: 0.5,
        oriY: 0.5,
        framesMuerte: [16, 17], // pengo-ssheet, en bucle al tocarle un enemigo
        // pengo-ssheet: se queda quieto asi al empujar, segun la direccion
        frameEmpujar: { le: 10, ri: 14, up: 12, do: 8 },
        pausaEmpujar: 450,     // ms sin poder moverse tras empujar (mas riesgo de que le pillen)
        velX: Settings.velJugador,
        velY: Settings.velJugador,
        moving: false,
        // [velX, velY, angle, anima]
        direccion: {
            le: [-1, 0, 0, 'le'],
            ri: [1, 0, 0, 'ri'],
            up: [0, -1, 0, 'up'],
            do: [0, 1, 0, 'do']
        },
        teclas: {
            le: 'left',
            ri: 'right',
            up: 'up',
            do: 'down'
        }
    };

    static bloques =
    {
        vel: 200,
        velPxl: 4,
        breakDuration: 900,
        puntos: 10,
        normal: [1],
        limits: [2, 3, 4, 5]
    };


    // Enemigos: salen de bloques "huevo" elegidos al azar al empezar cada nivel
    static enemigos =
    {
        total: 12,              // huevos por nivel
        maxALaVez: 4,
        velPxl: 2,              // la mitad que el jugador; tiene que dividir 48
        // ms jugados en el mismo nivel hasta que van mas rapido, uno por loop (cada loop, menos margen)
        tiempoPrisaPorLoop: [60000, 45000, 30000, 25000, 20000],
        velPxlPrisa: 4,         // el doble (tiene que dividir 48 y ser multiplo de velPxl)
        probPerseguir: 0.6,     // en cada cruce: 60% el camino que acerca al jugador, si no al azar
        puntosAplastar: 400,    // x2 por cada enemigo mas aplastado a la vez
        distanciaArrastre: 30,  // px delante del centro del bloque que lo arrastra (achatado contra el)
        separacionArrastre: 8,  // px entre enemigos si el bloque arrastra varios
        puntosHuevo: 500,       // romper un bloque del que iba a salir un enemigo
        distanciaMinimaInicio: 4, // casillas: ningun huevo pegado a la salida del jugador
        retrasoSalida: 600,     // ms entre salidas seguidas
        retrasoReponer: 1500,   // ms desde que muere uno hasta que sale el siguiente
        colorDestello: 0xffe033, // huevos durante el "Ready!"
        destellos: 5,
        intervaloDestello: 240, // ms encendido / apagado (5 destellos = 2.4 s, cabe en el "Ready!")
        intervaloRecordatorio: 20000, // ms: los huevos que quedan vuelven a destellar
    };

    static pausas_muerte =
    {
        animacion: 2000,        // ms con la animacion de muerte antes de restar la vida
        reaparecer: 1500,       // ms de "Ready!" al volver a la casilla inicial
        gameOver: 4000          // ms con la partida congelada antes de la pantalla de Game Over
    };

    static pausas =
    {
        inicial: false,
        nivelSuperado: {
            superado: false,
            duracion: 3200
        },
        bonus3Jewels: {
            done: false,
            duracion: 14000,
            running: false,
            bonus: 10000,
            bonusInicial: 10000, // la cuenta atras deja 'bonus' a 0, se restaura en cada nivel
            decBonusCountDown: 100
        },
        txtCongrats: {
            duracion: 9000
        }
    };

    static depth = {
        fondo: -900,
        bloques: -800,
        limites: -700,
        bonus3Jewels: -680,
        jewels: -650,
        jugador: -600,
        enemigo: -500,
        explosiones: -400,
        marcadores: -300,
        botones: -200,
        botonesTxt: -150,
        textos: -100,
        mobileControls: -50
    };

    static cameraScores =
    {
        x: 0,
        y: 0,
        ancho: 800,
        alto: 34,
        scrollX: 0,
        scrollY: -90
    };

    static audio =
    {
        palanca: null,          // sonido de los botones
        musicaFondo: null,
        volMusica: 0.6,
        musicaSilenciada: false // lo cambia el boton "Music" y dura toda la sesion
    };

    // --- Record (localStorage puede fallar: modo privado, bloqueado...) ---
    static cargar_record()
    {
        try
        {
            const guardado = parseInt(localStorage.getItem(Settings.claveRecord), 10);
            return Number.isNaN(guardado) ? Settings.recordInicial : guardado;
        }
        catch (e)
        {
            return Settings.recordInicial;
        }
    }

    static guardar_record()
    {
        try
        {
            localStorage.setItem(Settings.claveRecord, String(Settings.hi));
        }
        catch (e) {}
    }

    // --- Getters ---
    static getVolumenMusica()
    {
        return Settings.audio.musicaSilenciada ? 0 : Settings.audio.volMusica;
    }

    static isMusicaSilenciada()
    {
        return Settings.audio.musicaSilenciada;
    }

    static getTxtScore()
    {
        return Settings.txtScore;
    }

    static getTxtRecord()
    {
        return Settings.txtRecord;
    }

    static isNivelSuperado()
    {
        return Settings.pausas.nivelSuperado.superado;
    }

    static isBonus3JewelsDone()
    {
        return Settings.pausas.bonus3Jewels.done;
    }

    static isBonus3JewelsRunning()
    {
        return Settings.pausas.bonus3Jewels.running;
    }

    static getBonus3JewelsBonus()
    {
        return Settings.pausas.bonus3Jewels.bonus;
    }

    static isPausaInicial()
    {
        return Settings.pausas.inicial;
    }

    static getPausaNivelSuperado()
    {
        return Settings.pausas.nivelSuperado.duracion;
    }

    static isGameOver()
    {
        return Settings.gameOver;
    }

    static getPuntos()
    {
        return Settings.puntos;
    }

    static getNivel()
    {
        return Settings.nivel;
    }

    // Escenarios distintos en matrixLevels (el indice 0 no se usa)
    static getNumEscenarios()
    {
        return matrixLevels.array_levels.length - 1;
    }

    static getNivelesTotales()
    {
        return Settings.getNumEscenarios() * Settings.loops;
    }

    // Indice en matrixLevels del nivel actual: 1, 2, 3, 4, 1, 2...
    static getEscenario()
    {
        return (Settings.nivel - 1) % Settings.getNumEscenarios() + 1;
    }

    // 1 en los niveles 1-4, 2 en los 5-8...
    static getLoop()
    {
        return Math.floor((Settings.nivel - 1) / Settings.getNumEscenarios()) + 1;
    }

    static getTiempoPrisa()
    {
        const tiempos = Settings.enemigos.tiempoPrisaPorLoop;
        return tiempos[Math.min(Settings.getLoop(), tiempos.length) - 1];
    }

    static getRecord()
    {
        return Settings.hi;
    }

    static getVidas()
    {
        return Settings.vidas;
    }

    static getTxtVidas()
    {
        return ' Lives: ';
    }

    static getVelJugador()
    {
        return Settings.velJugador;
    }

    static isJugadorMoving()
    {
        return Settings.jugador.moving;
    }

    static getCameraScores()
    {
        return Settings.cameraScores;
    }

    // --- Setters ---
    static setMusicaSilenciada(bool)
    {
        Settings.audio.musicaSilenciada = bool;
    }

    static setNivelSuperado(bool)
    {
        Settings.pausas.nivelSuperado.superado = bool;
    }

    static setBonus3JewelsDone(bool)
    {
        Settings.pausas.bonus3Jewels.done = bool;
    }

    static setBonus3JewelsRunning(bool)
    {
        Settings.pausas.bonus3Jewels.running = bool;
    }

    static setBonus3JewelsBonus(ptos)
    {
        Settings.pausas.bonus3Jewels.bonus = ptos;
    }

    static setGameOver(bool)
    {
        Settings.gameOver = bool;
    }

    static setPuntos(ptos)
    {
        Settings.puntos = ptos;
    }

    static setNivel(level)
    {
        Settings.nivel = level;
    }

    static setRecord(hiScore)
    {
        Settings.hi = hiScore;
        Settings.guardar_record();
    }

    static setVidas(lifes)
    {
        Settings.vidas = lifes;
    }

    static setJugadorMoving(bool)
    {
        Settings.jugador.moving = bool;
    }

    static setPausaInicial(bool)
    {
        Settings.pausas.inicial = bool;
    }
}

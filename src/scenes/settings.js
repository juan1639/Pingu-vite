
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

    static layer1 =
    {
        scaleX: 1,
        scaleY: 1
    };

    static gameOver = false;

    static puntos = 0;
    static nivel = 1;
    static hi = 12000;
    static vidas = 3;
    static txtScore = ' Score: ';

    static velJugador = 4;

    static jugador =
    {
        posIniX: 9,
        posIniY: 7,
        oriX: 0.5,
        oriY: 0.5,
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
        puntos: 50
    };

    static mideTiempo = [null, null, 200];

    static incGodownInvaders =
    [
        2, 2, 4, 5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 30, 30, 30, 30, 30, 30, 30
    ];

    static pausas =
    {
        inicial: false,
        revivir: 4000,
        invisible: 3000,
        showBonus: 3500,
        nivelSuperado: {
            superado: false,
            duracion: 3200
        },
        duracionExplosion: {
            jugador: 1000,
            enemigo: 400
        }
    };

    static depth = {
        fondo: -900,
        bloques: -800,
        limites: -700,
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

    static cameraControles =
    {
        x: Math.floor(Settings.screen.width / 1.3),
        y: Math.floor(Settings.screen.height / 1.4),
        ancho: 270,
        alto: 270,
        scrollX: Math.floor(Settings.screen.width / 1.3),
        scrollY: -600
    };

    static audio =
    {
        monedaMario: null,
        musicaFondo: null
    };

    // --- Getters ---
    static getLayer1()
    {
        return Settings.layer1;
    }

    static getTxtScore()
    {
        return Settings.txtScore;
    }

    static isNivelSuperado()
    {
        return Settings.pausas.nivelSuperado.superado;
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

    static getRecord()
    {
        return Settings.hi;
    }

    static getVidas()
    {
        return Settings.vidas;
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

    static getCameraControles()
    {
        return Settings.cameraControles;
    }

    // --- Setters ---
    static setLaye1ScaleX(valor)
    {
        Settings.layer1.scaleX = valor;
    };

    static setLaye1ScaleY(valor)
    {
        Settings.layer1.scaleY = valor;
    };

    static setNivelSuperado(bool)
    {
        Settings.pausas.nivelSuperado.superado = bool;
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

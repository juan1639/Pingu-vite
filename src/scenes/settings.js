
export class Settings
{
    static controlElegido = {
        mobile: false,
        teclado: true
    };

    static screen = {
        width: 800,
        height: 550
    };

    static gameOver = false;

    static puntos = 0;
    static nivel = 1;
    static hi = 12000;
    static vidas = 3;

    static jugador =
    {
        posIniX: 0,
        posIniY: 0,
        velX: 500,
        velY: 500
    };

    static incGodownInvaders =
    [
        2, 2, 4, 5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 30, 30, 30, 30, 30, 30, 30
    ];

    static pausas =
    {
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
        fondo: -200,
        bloques: -180,
        limites: -160,
        jugador: -140,
        enemigo: -120,
        explosiones: -100,
        marcadores: -50,
        textos: -40,
        mobileControls: -30
    };

    static tileXY =
    {
        x: 64,
        y: 64
    };

    static array_laberinto = [
        [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
        [9,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,9],
        [9,1,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,1,9],
    
        [9,1,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,1,9],
        [9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9],
        [9,1,9,9,1,9,1,9,9,9,9,9,1,9,1,9,9,1,9],
    
        [9,1,1,1,1,9,1,1,1,9,1,1,1,9,1,1,1,1,9],
        [9,9,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,9,9],
        [9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9],
    
        [9,1,9,9,1,9,1,9,1,9,1,9,1,9,1,9,9,1,9],
        [9,1,9,9,1,9,1,9,1,9,1,9,1,9,1,9,9,1,9],
        [9,1,1,1,1,9,1,1,1,1,1,1,1,9,1,1,1,1,9],
    
        [9,1,9,9,1,9,1,9,9,9,9,9,1,9,1,9,9,1,9],
        [9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9],
        [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
    ];

    // --- Getters ---
    static isNivelSuperado()
    {
        return Settings.pausas.nivelSuperado.superado;
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

    static getIncGodownInvaders()
    {
        return Settings.incGodownInvaders;
    }

    // --- Setters ---
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
}

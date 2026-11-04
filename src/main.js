import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { PreGame } from './scenes/GameOver';
import { Congratulations } from './scenes/congratulations.js';
import { PantallaFinal } from './scenes/pantallaFinal.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 550,
    parent: 'game-container',
    backgroundColor: '#655500',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
    },
    // pixelArt: true,
    scene: [
        Boot,
        Preloader,
        MainMenu,
        PreGame,
        Game,
        Congratulations,
        PantallaFinal
    ]
};

const juego = new Phaser.Game(config);

// Acceso desde la consola para depurar (solo en desarrollo)
if (import.meta.env.DEV) window.juego = juego;

export default juego;

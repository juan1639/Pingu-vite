import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { PreGame } from './scenes/GameOver';
import { Congratulations } from './scenes/congratulations.js';
// import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

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
    /* plugins: {
        global: [{
            key: 'rexVirtualJoystick',
            plugin: VirtualJoystickPlugin,
            start: true
        },
        // ...
        ]
    }, */
    // pixelArt: true,
    scene: [
        Boot,
        Preloader,
        MainMenu,
        PreGame,
        Game,
        Congratulations
    ]
};

export default new Phaser.Game(config);

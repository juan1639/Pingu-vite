import { Scene } from 'phaser';
import { Textos } from '../components/textos.js';

export class Preloader extends Scene
{
    constructor()
    {
        super('Preloader');
    }

    init()
    {
        const widthScreen = this.sys.game.config.width;
        const heightScreen = this.sys.game.config.height;

        this.load.image('fondo', 'assets/img/bg.png');
        this.add.image(0, 0, 'fondo').setOrigin(0, 0);

        this.txt = new Textos(this, {
            x: Math.floor(widthScreen / 2),
            y: Math.floor(heightScreen / 3.5),
            txt: ' Loading...',
            size: 55, color: '#ffa', style: 'bold',
            stroke: '#f91', sizeStroke: 16,
            shadowOsx: 2, shadowOsy: 2, shadowColor: '#111',
            bool1: false, bool2: true, origin: [0.5, 0.5],
            elastic: false, dura: 0
        });

        this.txt.create();

        this.add.rectangle(
            Math.floor(widthScreen / 2), Math.floor(heightScreen / 2),
            Math.floor(widthScreen / 1.5), Math.floor(heightScreen / 12)
        ).setStrokeStyle(1, 0xffee88);

        const bar = this.add.rectangle(
            Math.floor(widthScreen / 2) - Math.floor(widthScreen / 3) + 4,
            Math.floor(heightScreen / 2),
            4,
            Math.floor(heightScreen / 14),
            0xff9911
        );

        this.load.on('progress', (progress) => {
            bar.width = (Math.floor(widthScreen / 1.52) * progress);
        });
    } 
    
    preload()
    {
        this.load.setPath('assets');

        this.load.image('fondo', './img/bg.png');

        this.load.image('boton-nueva-partida', './img/ui-newgame.png');
        this.load.image('boton-fire-joystick', './img/ui-1.png');
        this.load.spritesheet('radio-buttons', './img/radio-buttons-lightblue.png', {frameWidth: 50, frameHeight: 50});
        this.load.spritesheet('boton-fullscreen', './img/boton-fullscreen.png', {frameWidth: 64, frameHeight: 64});

        this.load.image('particula1', './img/particula1.png');

        for (let i = 1; i < 5; i ++)
        {
            this.load.image(`tile${i}`, `./img/tile${i}.png`);
        }

        this.load.atlas('tiles-jewels', './img/jewels.png', './img/jewels.json');
        this.load.spritesheet('tile-broken', './img/tile-broken-ssheet.png', {frameWidth: 64, frameHeight: 64});
        
        this.load.spritesheet('pengo-ssheet', './img/pengo-ssheet.png', {frameWidth: 50, frameHeight: 52});

        // Pluggin VirtualJoystick
        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);

        //  Archivos de audio
        this.load.audio('gameover-retro', './audio/gameoveretro.ogg');
        this.load.audio('get-ready', './audio/get-ready.mp3');
        this.load.audio('ziuuu', './audio/jumpbros.ogg');
        this.load.audio('moneda-mario', './audio/p-ping.mp3');
        this.load.audio('ziuuu1', './audio/slide-whistle-1.mp3');
        this.load.audio('ziuuu2', './audio/slide-whistle-2.mp3');
        this.load.audio('musica-fondo', './audio/musica-fondo.mp3');
        this.load.audio('mario-tuberias', './audio/mario-tuberias.ogg');
        this.load.audio('crash', './audio/crash.mp3');
        this.load.audio('congrats-voice', './audio/congrats-deep-voice.mp3');
        this.load.audio('you-win', './audio/you-win.mp3');
        this.load.audio('key', './audio/key.wav');
        this.load.audio('numkey', './audio/numkey.wav');
    }

    create()
    {
        this.scene.start('MainMenu');
    }
}

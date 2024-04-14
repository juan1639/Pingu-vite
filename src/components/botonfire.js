import { Settings } from "../scenes/settings.js";
import { Textos } from "./textos.js";

export class BotonFire
{
    constructor(scene, args)
    {
        this.relatedScene = scene;
        this.args = args;
    }

    create()
    {
        const {left, top, id, scX, scY, angle, originX, originY, alpha, texto} = this.args;

        this.boton = this.relatedScene.add.sprite(left, top, id).setInteractive();
        this.boton.setOrigin(originX, originY).setScale(scX, scY).setAngle(angle).setAlpha(alpha);
        this.boton.setDepth(Settings.depth.botones);

        this.txt = new Textos(this.relatedScene, {
            x: left,
            y: top,
            txt: texto,
            size: 30, color: '#fb1', style: 'bold',
            stroke: '#f81', sizeStroke: 8,
            shadowOsx: 2, shadowOsy: 2, shadowColor: '#111111',
            bool1: false, bool2: true, origin: [0.5, 0.5],
            elastic: false, dura: 0
        });

        this.txt.create();
        this.txt.get().setDepth(Settings.depth.mobileControls).setAlpha(alpha + 0.1).setScale(1);
    
        this.boton.on('pointerover', () =>
        {
          this.boton.setScale(scX + 0.1, scY + 0.1);
        });

        this.boton.on('pointerout', () =>
        {
          this.boton.setScale(scX, scY);
        });

        this.boton.on('pointerdown', () =>
        {
            this.isDown = true;
        });

        this.boton.on('pointerup', () => {
            this.isDown = false;
        });
    }

    get()
    {
        return this.boton;
    }
}

// ==================================================================================
export class CrucetaDireccion
{
    constructor(scene, direccion) {
        this.relatedScene = scene;
        this.direccion = direccion;
    }

    create() {
        const ancho = this.relatedScene.sys.game.config.width;
        const alto = this.relatedScene.sys.game.config.height;
        
        this.boton = this.relatedScene.add.image(this.direccion.x, alto - this.direccion.y, this.direccion.id).setInteractive();
        this.boton.setScale(2.7, 2.3).setDepth(Settings.depth.mobileControls);
        this.isDown = false;
    
        this.boton.on('pointerover', () => {
          this.boton.setScale(2.8, 2.4);
        });

        this.boton.on('pointerout', () => {
          this.boton.setScale(2.7, 2.3);
        });

        this.boton.on('pointerdown', () => {
            this.isDown = true;
            
        });

        this.boton.on('pointerup', () => {
            this.isDown = false;
        });
    }

    get()
    {
        return this.boton;
    }
}


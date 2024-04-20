import { Textos } from "./textos";
import { Settings } from "../scenes/settings";

export class ElegirControles
{
  constructor(scene, args)
  {
    this.relatedScene = scene;
    this.args = args;
  }

  create()
  {
    const {left, top, addLeft, orX, orY, frame, scale, txtSize, texto, id} = this.args;

    this.radiobutton = this.relatedScene.add.sprite(left, top, 'radio-buttons').setInteractive();
    this.radiobutton.setOrigin(orX, orY).setScale(scale).setDepth(Settings.depth.textos).setFrame(frame);
    this.radiobutton.setData('id', id);

    this.txt = new Textos(this.relatedScene, {
      x: left + 60 + addLeft,
      y: top,
      txt: texto,
      size: txtSize, color: '#ffa', style: 'bold',
      stroke: '#1fb', sizeStroke: 16,
      shadowOsx: 2, shadowOsy: 2, shadowColor: '#111',
      bool1: false, bool2: true, origin: [orX, orY],
      elastic: false, dura: 0
    });

    this.txt.create();

    this.radiobutton.on('pointerover', () =>
    {
      this.txt.get().setScale(scale + 0.1);
      this.radiobutton.setScale(scale + 0.1);
    });
    
    this.radiobutton.on('pointerout', () =>
    {
      this.txt.get().setScale(scale);
      this.radiobutton.setScale(scale);
    });

    this.radiobutton.on('pointerdown', (e) =>
    {
      // play_sonidos(this.sonidoMenuSelect, false, 0.9);
      if (id.includes('FPS'))
      {
        this.relatedScene.radioFps.forEach(radio => radio.get().setFrame(0));
      }
      else
      {
        this.relatedScene.radiobuttons.forEach(radio => radio.get().setFrame(0));
      }

      this.radiobutton.setFrame(1);

      if (id.includes('FPS'))
      {
        if (Settings.isFps60())
        {
          Settings.setFps60(false);
        }
        else
        {
          Settings.setFps60(true);
        }
      }
      else
      {
        Object.keys(Settings.controlElegido).forEach(control => {
          Settings.controlElegido[control] = false;
        });
  
        Settings.controlElegido[this.radiobutton.getData('id')] = true;
        console.log(Settings.controlElegido.mobile, Settings.controlElegido.teclado);
      }
    });
  }

  get()
  {
    return this.radiobutton;
  }
}

import { Settings } from '../scenes/settings.js';

// Joystick flotante: donde se apoya el dedo (en CUALQUIER parte de la pagina) aparece la base,
// y arrastrar hacia un lado mantiene pulsada esa direccion. Al soltar se para.
// Eventos del navegador sobre #app porque Phaser solo atiende el puntero encima del canvas
// (en un movil en vertical el pulgar suele estar en las bandas negras).
export class ControlTactil
{
    constructor(scene)
    {
        this.relatedScene = scene;
        this.activo = null;

        // Misma forma que createCursorKeys(): el jugador lee cursores[tecla].isDown
        this.cursores = {
            left: { isDown: false },
            right: { isDown: false },
            up: { isDown: false },
            down: { isDown: false }
        };
    }

    create()
    {
        const zonaMuerta = 16;   // px de juego antes de elegir direccion
        const radioMax = 60;     // si el dedo se aleja mas, la base le sigue (cambiar de sentido es rapido)

        this.base = this.relatedScene.add.circle(0, 0, radioMax, 0x888888, 0.35);
        this.pomo = this.relatedScene.add.circle(0, 0, 28, 0xcccccc, 0.7);

        [this.base, this.pomo].forEach(obj =>
        {
            obj.setScrollFactor(0).setDepth(Settings.depth.mobileControls).setVisible(false);
        });

        this.app = document.getElementById('app') || document.body;

        this.down = (e) =>
        {
            if (this.activo !== null) return;
            this.activo = e.pointerId;

            const { x, y } = this.a_coordenadas_juego(e);
            this.baseX = x;
            this.baseY = y;
            this.mover_dibujo(x, y);
            this.base.setVisible(true);
            this.pomo.setVisible(true);
        };

        this.move = (e) =>
        {
            if (e.pointerId !== this.activo) return;

            const { x, y } = this.a_coordenadas_juego(e);
            let dx = x - this.baseX;
            let dy = y - this.baseY;
            const distancia = Math.hypot(dx, dy);

            if (distancia > radioMax)
            {
                this.baseX = x - dx / distancia * radioMax;
                this.baseY = y - dy / distancia * radioMax;
                dx = x - this.baseX;
                dy = y - this.baseY;
            }

            this.mover_dibujo(x, y);
            this.soltar_cursores();

            if (distancia < zonaMuerta) return;

            // Solo 4 direcciones: gana el eje con mas recorrido
            if (Math.abs(dx) > Math.abs(dy))
            {
                this.cursores[dx < 0 ? 'left' : 'right'].isDown = true;
            }
            else
            {
                this.cursores[dy < 0 ? 'up' : 'down'].isDown = true;
            }
        };

        this.up = (e) =>
        {
            if (e.pointerId !== this.activo) return;
            this.activo = null;
            this.soltar_cursores();
            this.base.setVisible(false);
            this.pomo.setVisible(false);
        };

        this.app.addEventListener('pointerdown', this.down);
        window.addEventListener('pointermove', this.move);
        window.addEventListener('pointerup', this.up);
        window.addEventListener('pointercancel', this.up);

        this.relatedScene.events.once('shutdown', () => this.destroy());
    }

    // Pixeles de la pagina -> pixeles del juego (el canvas esta escalado y centrado)
    a_coordenadas_juego(e)
    {
        const rect = this.relatedScene.sys.game.canvas.getBoundingClientRect();
        const esc = Settings.screen.width / (rect.width || Settings.screen.width);

        return {
            x: (e.clientX - rect.left) * esc,
            y: (e.clientY - rect.top) * esc
        };
    }

    mover_dibujo(x, y)
    {
        // Si el dedo esta en las bandas negras, el joystick se dibuja entero junto al borde del canvas
        const r = this.base.radius;
        const limitar = (v, max) => Math.min(Math.max(v, r), max - r);
        const { width, height } = Settings.screen;

        const bx = limitar(this.baseX, width);
        const by = limitar(this.baseY, height);

        this.base.setPosition(bx, by);
        this.pomo.setPosition(bx + x - this.baseX, by + y - this.baseY);
    }

    soltar_cursores()
    {
        Object.values(this.cursores).forEach(c => c.isDown = false);
    }

    get()
    {
        return [this.base, this.pomo];
    }

    destroy()
    {
        this.app.removeEventListener('pointerdown', this.down);
        window.removeEventListener('pointermove', this.move);
        window.removeEventListener('pointerup', this.up);
        window.removeEventListener('pointercancel', this.up);
        this.activo = null;
        this.soltar_cursores();
    }
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pingu: a Pengo-style maze/block-pushing game built with Phaser 3 + Vite (started from the official `phaserjs/template-vite`). Plain JavaScript (ES modules), no TypeScript. Code identifiers and comments are mostly in Spanish (`jugador` = player, `bloques` = blocks, `nivel` = level, `puntos` = score, `vidas` = lives, `sonidos` = sounds); keep that naming style. Deployed to GitHub Pages: https://juan1639.github.io/Pingu-vite

## Commands

- `npm run dev`: dev server with hot reload on http://localhost:8080 (`vite/config.dev.mjs`)
- `npm run build`: production build into `dist/` (`vite/config.prod.mjs`, terser, Phaser split into its own chunk, `base: './'`)
- `npm run deploy`: builds, then publishes `dist/` to the `gh-pages` branch

There are no tests and no linter.

## Architecture

**Scene flow** (registered in `src/main.js`): `Boot` → `Preloader` → `MainMenu` → `PreGame` → `Game` → `Congratulations` (next level) or `PantallaFinal` (after the last level in `matrixLevels`, back to `PreGame`). A level ends when the 3 jewels are lined up: `Game.timeToBonus3Jewels()` runs the bonus countdown and then `pasar_nivel()`. `PreGame` is defined in `src/scenes/GameOver.js` (the file name doesn't match the class). In dev, `window.juego` exposes the Phaser game for debugging. Scene changes are mostly triggered by buttons in `src/components/boton-nuevapartida.js` through a `nextScene` option.

**Global state lives in `Settings`** (`src/scenes/settings.js`): a class with only static fields and static getters/setters. It holds score, level, lives, record, tile size (48×48), player speed, pause/timer durations, the `depth` layering table, camera viewports, the chosen control type (keyboard/mobile), the 30/60 FPS toggle, and shared audio objects. Scenes and components read and change state through it rather than passing data around. Game-flow flags (`pausas.inicial`, `gameOver`, `bonus3Jewels.done/running`, `nivelSuperado`) control what `Game.update()` runs.

**Components** (`src/components/`) are wrapper classes, not Phaser subclasses. Each takes `(scene, args)` in its constructor, builds its Phaser objects in `create()`, may have `update()`, and exposes the underlying sprite or group through `get()`. `Game.init()` creates them and `Game.create()` calls their `create()`.

**Levels** are tile matrices in `src/scenes/matrixLevels.js`, indexed by `Settings.nivel` (which starts at 1, so index 0 is unused/legacy). Cell values: 0 = empty, 1 = pushable ice block, 2–5 = border blocks. `Laberinto` (`src/components/laberinto.js`) builds a physics group from the matrix and moves blocks with their `vel-x`/`vel-y` data each frame.

**Movement is grid-locked**: the player only changes direction when its position is an exact multiple of the tile size, so speeds (`Settings.velJugador`, `Settings.bloques.velPxl`) must divide 48 evenly.

**Collision callbacks and shared helpers** (player/blocks/jewels colliders, 3-jewels bonus check, particles, scoring, `play_sonidos`) are in `src/functions/functions.js` and wired up in `Game.set_colliders()`. A pushed block or jewel moves 4px per step; when it hits something, `retroceder_y_parar()` undoes the last step so it lands exactly on the grid.

**Cameras**: `Game` uses the main camera (follows the player, bounds scaled by `Settings.screen.escBoundsX/Y`) plus two extra cameras, one for the score HUD and one for the mobile controls. HUD and controls objects are placed at off-screen coordinates (e.g. negative y) that only those extra cameras scroll to. Keep this in mind when positioning UI.

**Fixed logic rate**: game logic moves sprites a fixed number of pixels per call, so `Game.update()` only runs it on frames where the Arcade world emitted `worldstep` (60 fixed steps/s). This keeps the speed the same on 60/120/144 Hz monitors. Below 60 FPS the game slows down, because logic runs at most once per frame.

**Record** is kept in `localStorage` (`Settings.claveRecord`, wrapped in try/catch). `Settings.setRecord()` saves it, and `actualizar_marcadores()` in `functions.js` updates it whenever the score goes past it.

**Mobile joystick**: the `rexvirtualjoystickplugin` is loaded at runtime from a GitHub raw URL in `Preloader` (the npm `phaser3-rex-plugins` package is not installed), so it needs network access.

Assets live in `public/assets/` and are loaded by key in `Preloader.js`.

**Versions**: `phaser` is pinned to `~3.90.0` (a bare `npm install phaser` would pull Phaser 4). Vite stays on 5.x by the user's choice. Its remaining `npm audit` warnings only affect the dev server, not the published game.

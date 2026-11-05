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

**Scene flow** (registered in `src/main.js`): `Boot` → `Preloader` → `MainMenu` → `PreGame` → `Game` → `Congratulations` (next level) or `PantallaFinal` (after the last level in `matrixLevels`, back to `PreGame`); losing the last life goes to `PantallaGameOver`. A level ends when the 3 jewels are lined up (`Game.timeToBonus3Jewels()` runs the bonus countdown and then `pasar_nivel()`) or when all its enemies are gone (`Game.nivel_superado_enemigos()`, no bonus). `PreGame` is defined in `src/scenes/GameOver.js` (the file name doesn't match the class). In dev, `window.juego` exposes the Phaser game for debugging. Scene changes are mostly triggered by buttons in `src/components/boton-nuevapartida.js` through a `nextScene` option.

**Global state lives in `Settings`** (`src/scenes/settings.js`): a class with only static fields and static getters/setters. It holds score, level, lives, record, tile size (48×48), player speed, pause/timer durations, the `depth` layering table, camera viewports, the chosen control type (keyboard/mobile), and shared audio objects (including the "Music" mute flag, which lasts the whole session: use `Settings.getVolumenMusica()` instead of a fixed volume). Scenes and components read and change state through it rather than passing data around. Game-flow flags (`pausas.inicial`, `gameOver`, `bonus3Jewels.done/running`, `nivelSuperado`) control what `Game.update()` runs.

**Components** (`src/components/`) are wrapper classes, not Phaser subclasses. Each takes `(scene, args)` in its constructor, builds its Phaser objects in `create()`, may have `update()`, and exposes the underlying sprite or group through `get()`. `Game.init()` creates them and `Game.create()` calls their `create()`.

**Levels** are tile matrices in `src/scenes/matrixLevels.js`, indexed by `Settings.nivel` (which starts at 1, so index 0 is unused/legacy). Cell values: 0 = empty, 1 = pushable ice block, 2–5 = border blocks. `Laberinto` (`src/components/laberinto.js`) builds a physics group from the matrix and moves blocks with their `vel-x`/`vel-y` data each frame.

**Enemies** (`src/components/enemigos.js`, values in `Settings.enemigos`): at level start 12 normal blocks that touch a corridor are picked as eggs (they flash yellow with `setTintFill` during "Ready!"; only color, because scaling would resize their physics bodies), and again every `intervaloRecordatorio` ms as a reminder. At most 4 enemies are out at once; when one dies another hatches from an egg (the block breaks). Breaking an egg block removes that future enemy (`colliderBloqueParar` calls `enemigos.huevo_roto()`, which shows sparks and a "+500"; the egg's `puntos` data is 500). Enemies don't use physics colliders: they move on the grid at 2px per step, pick a direction at each tile center from an occupancy set of blocks and jewels (`casillas_ocupadas()`), never break blocks, and are crushed by any sliding block or jewel (distance check). Touching the player costs a life: `Game.jugador_tocado()` → `reaparecer()` (player and enemies back to their start tiles, short "Ready!" pause) or `game_over()` (game frozen with a "Game Over" text for `pausas_muerte.gameOver` ms, then `PantallaGameOver`). They use `pengo-enemies-ssheet.png`, laid out like the player's `pengo-ssheet.png` (same frame numbers), with their own `enemigo-le/ri/up/do` animations.

**Movement is grid-locked**: the player only changes direction when its position is an exact multiple of the tile size, so speeds (`Settings.velJugador`, `Settings.bloques.velPxl`) must divide 48 evenly.

**Collision callbacks and shared helpers** (player/blocks/jewels colliders, 3-jewels bonus check, particles, scoring, `play_sonidos`) are in `src/functions/functions.js` and wired up in `Game.set_colliders()`. A pushed block or jewel moves 4px per step; when it hits something, `retroceder_y_parar()` undoes the last step so it lands exactly on the grid. Breaking is decided at push time in `intentar_empujar()`: a block whose next tile is already taken (`casilla_ocupada()`) breaks instead of moving (`romper_bloque()`); jewels never break. Every push calls `Jugador.empujar()`, which shows the push frame for that direction (`Settings.jugador.frameEmpujar`: 8 down, 10 left, 12 up, 14 right) and freezes the player for `Settings.jugador.pausaEmpujar` ms (more risk from enemies). Losing a life plays the `jugador-muerte` animation (frames 16–17) for `pausas_muerte.animacion` ms.

**Cameras**: `Game` uses the main camera (follows the player, bounds scaled by `Settings.screen.escBoundsX/Y`) plus an extra camera for the score HUD. HUD objects are placed at off-screen coordinates (negative y) that only that camera scrolls to. Objects fixed to the screen (`setScrollFactor(0)`, like the touch joystick) are drawn by every camera, so the HUD camera must `ignore()` them. Keep this in mind when positioning UI.

**Fixed logic rate**: game logic moves sprites a fixed number of pixels per call, so `Game.update()` only runs it on frames where the Arcade world emitted `worldstep` (60 fixed steps/s). This keeps the speed the same on 60/120/144 Hz monitors. Below 60 FPS the game slows down, because logic runs at most once per frame.

**Record** is kept in `localStorage` (`Settings.claveRecord`, wrapped in try/catch). `Settings.setRecord()` saves it, and `actualizar_marcadores()` in `functions.js` updates it whenever the score goes past it.

**Touch controls** (`src/components/controlTactil.js`, only when "Mobile controls" is chosen in PreGame): a floating joystick built on browser pointer events on `#app`, so touches on the black bands outside the canvas count too (`touch-action: none` in `public/style.css` keeps the phone from scrolling). Dragging past a small dead zone holds one of 4 directions, and lifting the finger releases it. It exposes `cursores` with the same shape as `createCursorKeys()`, read through `Game.joystickCursors`. In mobile mode, walking into a block pushes it (no action button). `al_tocar()` in `functions.js` is the same idea for "tap to continue" screens (Boot).

Assets live in `public/assets/` and are loaded by key in `Preloader.js`.

**Versions**: `phaser` is pinned to `~3.90.0` (a bare `npm install phaser` would pull Phaser 4). Vite stays on 5.x by the user's choice. Its remaining `npm audit` warnings only affect the dev server, not the published game.

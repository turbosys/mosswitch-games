# DASH FROG Gameplay Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DASH FROG into a layered arcade experience with HF-generated pixel art, power-ups, biome obstacles, a laser-mouth mechanic, Frog Rage, weather particles, and screen effects.

**Architecture:** Single HTML file (`games/game-001/index.html`) gains a `PreloadScene` that loads all external sprites from `sprites/`. `BootScene` is stripped to animation definitions only. All gameplay additions live in `GameScene`.

**Tech Stack:** Phaser 3.60, Hugging Face Z-Image Turbo MCP (`mcp__hf-mcp-server__gr1_z_image_turbo_generate`), Python/Pillow for sprite assembly, Playwright for validation.

**Sprite sizes (game coordinates):**
- Frog: 64×64 per frame — sheet 320×64 (5 frames)
- Bat: 72×36 per frame — sheet 144×36 (2 frames)
- Log: 40×80 | Snake: 64×32 | Spore Cloud: 96×48
- Falling Rock: 48×48 | Laser Grid: 32×96
- Power-ups: 48×48 each | Laser beam: 480×16
- Backgrounds mid: 480×120 | Backgrounds fore: 480×40

**Playwright path:** `/Users/turbonoob/.openclaw/workspace/node_modules/playwright`
**Local server:** `python3 -m http.server 8082 --directory /tmp/mosswitch-games`
**Sprites dir:** `games/game-001/sprites/`

---

## Task 1: Generate Character & Obstacle Sprites

**Files:**
- Create: `games/game-001/sprites/frog_run_a.webp`
- Create: `games/game-001/sprites/frog_run_b.webp`
- Create: `games/game-001/sprites/frog_jump.webp`
- Create: `games/game-001/sprites/frog_dead.webp`
- Create: `games/game-001/sprites/frog_laser.webp`
- Create: `games/game-001/sprites/bat_up.webp`
- Create: `games/game-001/sprites/bat_down.webp`
- Create: `games/game-001/sprites/log.webp`
- Create: `games/game-001/sprites/snake.webp`
- Create: `games/game-001/sprites/spore_cloud.webp`
- Create: `games/game-001/sprites/falling_rock.webp`
- Create: `games/game-001/sprites/laser_grid.webp`

- [ ] **Step 1: Generate frog run frame A** via HF MCP with prompt:
  `"pixel art game character frog running, side view left leg forward, bright green frog with big eyes, chunky retro 16-bit style, solid black background, no text, no watermark, character centered in frame"`
  Resolution: `1024x1024 ( 1:1 )`. Download URL to `sprites/frog_run_a_raw.webp`.

- [ ] **Step 2: Generate frog run frame B** via HF MCP:
  `"pixel art game character frog running, side view right leg forward, bright green frog with big eyes, mid-stride opposite leg position to frame A, chunky retro 16-bit style, solid black background, no text, no watermark, character centered in frame"`
  Download to `sprites/frog_run_b_raw.webp`.

- [ ] **Step 3: Generate frog jump frame** via HF MCP:
  `"pixel art game character frog jumping, side view, bright green frog with legs tucked up mid-leap, big round eyes, chunky retro 16-bit style, solid black background, no text, character centered"`
  Download to `sprites/frog_jump_raw.webp`.

- [ ] **Step 4: Generate frog dead frame** via HF MCP:
  `"pixel art game character frog dead, side view, bright green frog lying on back belly up, x eyes, legs in air, chunky retro 16-bit style, solid black background, no text, character centered"`
  Download to `sprites/frog_dead_raw.webp`.

- [ ] **Step 5: Generate frog laser-mouth frame** via HF MCP:
  `"pixel art game character frog firing laser, side view, bright green frog with wide open mouth shooting glowing cyan laser beam, eyes glowing, chunky retro 16-bit style, solid black background, no text, character centered"`
  Download to `sprites/frog_laser_raw.webp`.

- [ ] **Step 6: Generate bat frames** via HF MCP (two calls):
  Wings up: `"pixel art purple bat, wings raised up, side view, red glowing eyes, white fangs, chunky retro 16-bit style, solid black background, no text, centered"`
  Wings down: `"pixel art purple bat, wings swept down, side view, red glowing eyes, white fangs, chunky retro 16-bit style, solid black background, no text, centered"`
  Download to `sprites/bat_up_raw.webp` and `sprites/bat_down_raw.webp`.

- [ ] **Step 7: Generate obstacle sprites** via HF MCP (4 calls):

  Log: `"pixel art wooden log standing upright, brown bark texture with rings visible on top, chunky retro 16-bit style, solid black background, no text, centered, vertical orientation"`
  → `sprites/log_raw.webp`

  Snake: `"pixel art green snake coiled low to ground, side view, beady eyes, chunky retro 16-bit style, solid black background, no text, wider than tall, centered"`
  → `sprites/snake_raw.webp`

  Spore Cloud: `"pixel art purple glowing mushroom spore cloud, wide horizontal puff, bioluminescent purple dots, chunky retro 16-bit style, solid black background, no text, centered, wider than tall"`
  → `sprites/spore_cloud_raw.webp`

  Falling Rock: `"pixel art grey boulder falling, jagged rocky texture, orange lava cracks on surface, chunky retro 16-bit style, solid black background, no text, centered, roughly square"`
  → `sprites/falling_rock_raw.webp`

  Laser Grid: `"pixel art neon cyan laser emitter tower, tall vertical device with glowing light at top, sci-fi pixel art, solid black background, no text, centered, taller than wide"`
  → `sprites/laser_grid_raw.webp`

- [ ] **Step 8: Resize all sprites with Python/Pillow**

  Save this script to `sprites/resize.py` and run it:

  ```python
  from PIL import Image
  import os

  SPRITES_DIR = '/tmp/mosswitch-games/games/game-001/sprites'

  def resize(src, dst, size, resample=Image.NEAREST):
      img = Image.open(os.path.join(SPRITES_DIR, src))
      img = img.resize(size, resample)
      img.save(os.path.join(SPRITES_DIR, dst))
      print(f'{src} -> {dst} {size}')

  # Frog frames (all 64x64)
  for name in ['frog_run_a', 'frog_run_b', 'frog_jump', 'frog_dead', 'frog_laser']:
      resize(f'{name}_raw.webp', f'{name}.webp', (64, 64))

  # Bat frames (72x36 — 2:1 aspect, crop to landscape from square)
  for name in ['bat_up', 'bat_down']:
      img = Image.open(os.path.join(SPRITES_DIR, f'{name}_raw.webp'))
      # Crop centre square to 2:1 landscape
      w, h = img.size
      crop_h = h
      crop_w = h  # square
      left = (w - crop_w) // 2
      img = img.crop((left, 0, left + crop_w, crop_h))
      # Scale to 72x36
      img = img.resize((72, 36), Image.NEAREST)
      img.save(os.path.join(SPRITES_DIR, f'{name}.webp'))
      print(f'{name}_raw -> {name}.webp (72x36)')

  # Obstacles
  resize('log_raw.webp',         'log.webp',         (40, 80))
  resize('snake_raw.webp',       'snake.webp',       (64, 32))
  resize('spore_cloud_raw.webp', 'spore_cloud.webp', (96, 48))
  resize('falling_rock_raw.webp','falling_rock.webp',(48, 48))
  resize('laser_grid_raw.webp',  'laser_grid.webp',  (32, 96))

  print('Done.')
  ```

  Run: `python3 /tmp/mosswitch-games/games/game-001/sprites/resize.py`
  Expected: 10 lines of "-> converted" output, no errors.

- [ ] **Step 9: Build frog and bat sprite sheets**

  Save and run `sprites/build_sheets.py`:

  ```python
  from PIL import Image
  import os

  SPRITES_DIR = '/tmp/mosswitch-games/games/game-001/sprites'

  def path(name):
      return os.path.join(SPRITES_DIR, name)

  # Frog sheet: 5 frames x 64x64 = 320x64
  frames = ['frog_run_a', 'frog_run_b', 'frog_jump', 'frog_dead', 'frog_laser']
  sheet = Image.new('RGBA', (64 * len(frames), 64), (0, 0, 0, 255))
  for i, name in enumerate(frames):
      img = Image.open(path(f'{name}.webp')).convert('RGBA')
      sheet.paste(img, (i * 64, 0))
  sheet.save(path('frog_sheet.webp'))
  print(f'frog_sheet.webp: {sheet.size}')

  # Bat sheet: 2 frames x 72x36 = 144x36
  bat_sheet = Image.new('RGBA', (144, 36), (0, 0, 0, 255))
  for i, name in enumerate(['bat_up', 'bat_down']):
      img = Image.open(path(f'{name}.webp')).convert('RGBA')
      bat_sheet.paste(img, (i * 72, 0))
  bat_sheet.save(path('bat_sheet.webp'))
  print(f'bat_sheet.webp: {bat_sheet.size}')
  ```

  Run: `python3 /tmp/mosswitch-games/games/game-001/sprites/build_sheets.py`
  Expected: `frog_sheet.webp: (320, 64)` and `bat_sheet.webp: (144, 36)`.

- [ ] **Step 10: Commit sprites**

  ```bash
  cd /tmp/mosswitch-games
  git add games/game-001/sprites/
  git commit -m "assets: HF-generated character and obstacle sprites"
  ```

---

## Task 2: Generate Power-Up & Effect Sprites

**Files:**
- Create: `games/game-001/sprites/pickup_fly.webp`
- Create: `games/game-001/sprites/pickup_shroom.webp`
- Create: `games/game-001/sprites/pickup_shield.webp`
- Create: `games/game-001/sprites/pickup_laser.webp`
- Create: `games/game-001/sprites/pickup_rage.webp`
- Create: `games/game-001/sprites/laser_beam.webp`

- [ ] **Step 1: Generate power-up sprites** via HF MCP (5 calls):

  Fly Swarm: `"pixel art glowing green fly collectible power-up item, swarm of tiny green flies forming a cluster with sparkles, retro 16-bit game item, solid black background, no text, centered, square"`
  → `sprites/pickup_fly_raw.webp`

  Magic Shroom: `"pixel art glowing purple mushroom power-up item, chunky cute mushroom with white spots, bioluminescent purple glow, retro 16-bit game item, solid black background, no text, centered, square"`
  → `sprites/pickup_shroom_raw.webp`

  Fire Shield: `"pixel art orange fire shield orb power-up item, glowing orange flame sphere with protective aura, retro 16-bit game item, solid black background, no text, centered, square"`
  → `sprites/pickup_shield_raw.webp`

  Laser Crystal: `"pixel art cyan glowing crystal power-up item, sharp faceted crystal with electric cyan glow and lightning sparks, retro 16-bit game item, solid black background, no text, centered, square"`
  → `sprites/pickup_laser_raw.webp`

  Rage Orb: `"pixel art red and gold rage power orb, swirling fiery energy sphere, pulsing with anger, retro 16-bit game item, solid black background, no text, centered, square"`
  → `sprites/pickup_rage_raw.webp`

- [ ] **Step 2: Generate laser beam** via HF MCP:
  `"pixel art horizontal laser beam, bright glowing cyan energy beam, thin horizontal line with glow halo, retro 16-bit style, pure black background, centered vertically, very wide aspect ratio"`
  Resolution: `2016x864 ( 21:9 )` (widest available).
  → `sprites/laser_beam_raw.webp`

- [ ] **Step 3: Resize power-ups and beam with Python/Pillow**

  Save and run `sprites/resize_powerups.py`:

  ```python
  from PIL import Image
  import os

  SPRITES_DIR = '/tmp/mosswitch-games/games/game-001/sprites'

  def path(name):
      return os.path.join(SPRITES_DIR, name)

  def resize(src, dst, size):
      img = Image.open(path(src))
      img = img.resize(size, Image.NEAREST)
      img.save(path(dst))
      print(f'{src} -> {dst} {size}')

  resize('pickup_fly_raw.webp',    'pickup_fly.webp',    (48, 48))
  resize('pickup_shroom_raw.webp', 'pickup_shroom.webp', (48, 48))
  resize('pickup_shield_raw.webp', 'pickup_shield.webp', (48, 48))
  resize('pickup_laser_raw.webp',  'pickup_laser.webp',  (48, 48))
  resize('pickup_rage_raw.webp',   'pickup_rage.webp',   (48, 48))
  resize('laser_beam_raw.webp',    'laser_beam.webp',    (480, 16))

  print('Done.')
  ```

  Run: `python3 /tmp/mosswitch-games/games/game-001/sprites/resize_powerups.py`
  Expected: 6 lines of output, no errors.

- [ ] **Step 4: Commit**

  ```bash
  cd /tmp/mosswitch-games
  git add games/game-001/sprites/
  git commit -m "assets: power-up and laser beam sprites"
  ```

---

## Task 3: Generate Background Tiles

**Files:** `games/game-001/sprites/bg_mid_0..3.webp` and `bg_fore_0..3.webp`

- [ ] **Step 1: Generate bg_mid tiles** via HF MCP (4 calls), resolution `1280x720 ( 16:9 )`:

  bg_mid_0 (Swamp): `"pixel art dark swamp background, silhouettes of gnarled trees with hanging moss, night scene, dark green palette, moody atmospheric, seamless side-scrolling game background, no text, no characters"`
  → `sprites/bg_mid_0_raw.webp`

  bg_mid_1 (Mushroom Forest): `"pixel art mushroom forest background, giant glowing mushroom silhouettes, bioluminescent purple and teal, dark night, seamless side-scrolling game background, no text, no characters"`
  → `sprites/bg_mid_1_raw.webp`

  bg_mid_2 (Volcanic Wasteland): `"pixel art volcanic wasteland background, jagged dark rock spire silhouettes, orange lava glow on horizon, ember particles, dark ominous sky, seamless side-scrolling game background, no text, no characters"`
  → `sprites/bg_mid_2_raw.webp`

  bg_mid_3 (Neon City): `"pixel art neon city background, dark building silhouettes with glowing cyan and magenta windows, night skyline, cyberpunk aesthetic, seamless side-scrolling game background, no text, no characters"`
  → `sprites/bg_mid_3_raw.webp`

- [ ] **Step 2: Generate bg_fore tiles** via HF MCP (4 calls), resolution `1280x720 ( 16:9 )`:

  bg_fore_0 (Swamp): `"pixel art swamp foreground strip, reeds and lily pads at water's edge, short ground-level vegetation, dark green, seamless side-scrolling game foreground strip, no text, no characters"`
  → `sprites/bg_fore_0_raw.webp`

  bg_fore_1 (Mushroom): `"pixel art mushroom forest foreground strip, small glowing mushrooms and floating spores at ground level, purple bioluminescent, seamless side-scrolling game foreground strip, no text, no characters"`
  → `sprites/bg_fore_1_raw.webp`

  bg_fore_2 (Volcano): `"pixel art volcanic foreground strip, rocky rubble and glowing lava cracks at ground level, dark rocks with orange glow, seamless side-scrolling game foreground strip, no text, no characters"`
  → `sprites/bg_fore_2_raw.webp`

  bg_fore_3 (Neon City): `"pixel art neon city foreground strip, pipes and vents at ground level with cyan neon lines, industrial cyberpunk floor, seamless side-scrolling game foreground strip, no text, no characters"`
  → `sprites/bg_fore_3_raw.webp`

- [ ] **Step 3: Crop and resize backgrounds**

  Save and run `sprites/resize_bgs.py`:

  ```python
  from PIL import Image
  import os

  SPRITES_DIR = '/tmp/mosswitch-games/games/game-001/sprites'

  def path(name):
      return os.path.join(SPRITES_DIR, name)

  for i in range(4):
      # Mid: 480x120 — crop bottom 40% of image (ground/tree zone), scale to 480x120
      raw = Image.open(path(f'bg_mid_{i}_raw.webp'))
      w, h = raw.size
      crop = raw.crop((0, int(h * 0.3), w, h))  # lower 70% has the silhouettes
      mid = crop.resize((480, 120), Image.LANCZOS)
      mid.save(path(f'bg_mid_{i}.webp'))
      print(f'bg_mid_{i}.webp: {mid.size}')

      # Fore: 480x40 — crop bottom 15% of image (ground strip)
      crop = raw.crop((0, int(h * 0.85), w, h))
      fore = crop.resize((480, 40), Image.LANCZOS)
      fore.save(path(f'bg_fore_{i}.webp'))
      print(f'bg_fore_{i}.webp: {fore.size}')
  ```

  Run: `python3 /tmp/mosswitch-games/games/game-001/sprites/resize_bgs.py`
  Expected: 8 lines output, no errors.

- [ ] **Step 4: Commit**

  ```bash
  cd /tmp/mosswitch-games
  git add games/game-001/sprites/
  git commit -m "assets: biome background tiles (mid + fore, 4 biomes)"
  ```

---

## Task 4: PreloadScene + Swap Procedural Textures

**Files:**
- Modify: `games/game-001/index.html` — replace `BootScene` texture generation with `PreloadScene`, update all sprite references

- [ ] **Step 1: Write a Playwright boot test**

  Save to `games/game-001/tests/boot.js`:

  ```js
  const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8082/games/game-001/index.html');
    await page.waitForTimeout(4000);
    const state = await page.evaluate(() => {
      const g = window.__phaserGame;
      if (!g) return { error: 'no game' };
      return {
        activeScenes: g.scene.scenes.filter(s => s.sys.isActive()).map(s => s.sys.settings.key),
        errors,
      };
    });
    console.log('State:', JSON.stringify(state));
    console.log('Console errors:', errors);
    if (errors.length || state.error) { console.log('FAIL'); process.exit(1); }
    if (!state.activeScenes.includes('Game')) { console.log('FAIL - Game scene not active'); process.exit(1); }
    console.log('PASS');
    await browser.close();
  })();
  ```

  Run (expect FAIL — game doesn't expose `window.__phaserGame` yet):
  `node games/game-001/tests/boot.js`

- [ ] **Step 2: Rewrite `games/game-001/index.html`**

  Replace the entire `<script>` contents with the structure below. Key changes:
  - Add `window.__phaserGame = new Phaser.Game(...)` for test introspection
  - Add `PreloadScene` class before `BootScene`
  - Strip `BootScene` to animation definitions only
  - Update all sprite keys and frame sizes to match HF sprites
  - Update physics body sizes (frog, bat, log) to match new sprite dimensions

  **`PreloadScene` class (insert before `BootScene`):**

  ```javascript
  class PreloadScene extends Phaser.Scene {
    constructor() { super('Preload'); }

    preload() {
      const BASE = 'sprites/';
      this.load.spritesheet('frog_sheet', BASE + 'frog_sheet.webp', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('bat_sheet',  BASE + 'bat_sheet.webp',  { frameWidth: 72, frameHeight: 36 });
      this.load.image('log',          BASE + 'log.webp');
      this.load.image('snake',        BASE + 'snake.webp');
      this.load.image('spore_cloud',  BASE + 'spore_cloud.webp');
      this.load.image('falling_rock', BASE + 'falling_rock.webp');
      this.load.image('laser_grid',   BASE + 'laser_grid.webp');
      this.load.image('pickup_fly',   BASE + 'pickup_fly.webp');
      this.load.image('pickup_shroom',BASE + 'pickup_shroom.webp');
      this.load.image('pickup_shield',BASE + 'pickup_shield.webp');
      this.load.image('pickup_laser', BASE + 'pickup_laser.webp');
      this.load.image('pickup_rage',  BASE + 'pickup_rage.webp');
      this.load.image('laser_beam',   BASE + 'laser_beam.webp');
      for (let i = 0; i < 4; i++) {
        this.load.image(`bg_mid_${i}`,  BASE + `bg_mid_${i}.webp`);
        this.load.image(`bg_fore_${i}`, BASE + `bg_fore_${i}.webp`);
      }
      // Particles: still procedural (tiny, work fine)
      const d = this.make.graphics({ add: false });
      d.fillStyle(0x3d7a32); d.fillCircle(4, 4, 4);
      d.generateTexture('pdust', 8, 8); d.destroy();
      const s = this.make.graphics({ add: false });
      s.fillStyle(0x8bc34a); s.fillRect(0, 0, 5, 5);
      s.generateTexture('pstar', 5, 5); s.destroy();
    }

    create() { this.scene.start('Boot'); }
  }
  ```

  **`BootScene` stripped down:**

  ```javascript
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    create() {
      // Frog frames: 0=run_a, 1=run_b, 2=jump, 3=dead, 4=laser
      this.anims.create({ key: 'frog_run',   frames: this.anims.generateFrameNumbers('frog_sheet', { start: 0, end: 1 }), frameRate: 9, repeat: -1 });
      this.anims.create({ key: 'frog_jump',  frames: this.anims.generateFrameNumbers('frog_sheet', { start: 2, end: 2 }), frameRate: 1, repeat: 0 });
      this.anims.create({ key: 'frog_dead',  frames: this.anims.generateFrameNumbers('frog_sheet', { start: 3, end: 3 }), frameRate: 1, repeat: 0 });
      this.anims.create({ key: 'frog_laser', frames: this.anims.generateFrameNumbers('frog_sheet', { start: 4, end: 4 }), frameRate: 1, repeat: 0 });
      this.anims.create({ key: 'bat_flap',   frames: this.anims.generateFrameNumbers('bat_sheet',  { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
      this.scene.start('Game');
    }
  }
  ```

  **Updated physics bodies in `GameScene.create()`:**

  ```javascript
  // Frog: was 32x32 → now 64x64
  this.frog = this.physics.add.sprite(80, GY, 'frog_sheet', 0).setOrigin(0.5, 1).setDepth(5);
  this.frog.body.setCollideWorldBounds(true).setSize(48, 56).setOffset(8, 8);

  // In spawnObstacle() — log body (was 18x36 on 20x40, now 36x72 on 40x80):
  obs = this.obstacles.create(W + 40, GY, 'log').setOrigin(0.5, 1).setDepth(4);
  obs.body.setAllowGravity(false).setImmovable(true).setSize(36, 72).setOffset(2, 8);

  // Bat body (was 28x12 on 36x18, now 56x24 on 72x36):
  const batY = GY - 64 - 64 - 12;
  obs = this.obstacles.create(W + 40, batY, 'bat_sheet', 0).setOrigin(0.5, 0.5).setDepth(4);
  obs.body.setAllowGravity(false).setImmovable(true).setSize(56, 24).setOffset(8, 6);
  obs.play('bat_flap');
  ```

  **Update scene config to include PreloadScene:**

  ```javascript
  window.__phaserGame = new Phaser.Game({
    ...
    scene: [PreloadScene, BootScene, GameScene, GameOverScene],
    ...
  });
  ```

  **Apply ADD blend mode to frog and obstacles** (after creating each):

  ```javascript
  this.frog.setBlendMode(Phaser.BlendModes.ADD);
  // and after creating each obs:
  obs.setBlendMode(Phaser.BlendModes.ADD);
  ```

- [ ] **Step 3: Run boot test**

  Start server: `python3 -m http.server 8082 --directory /tmp/mosswitch-games &`
  Run: `node games/game-001/tests/boot.js`
  Expected: `PASS` — Game scene active, zero console errors.
  If sprites fail to load (404), check filenames in `sprites/` match the `load.*` calls exactly.

- [ ] **Step 4: Commit**

  ```bash
  cd /tmp/mosswitch-games
  git add games/game-001/index.html
  git commit -m "feat: PreloadScene with HF sprites, strip procedural texture generation"
  ```

---

## Task 5: Biome-Aware Obstacle System

**Files:**
- Modify: `games/game-001/index.html` — rewrite `spawnObstacle()` to use per-biome pools

- [ ] **Step 1: Write obstacle spawn test**

  Save to `games/game-001/tests/obstacles.js`:

  ```js
  const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8082/games/game-001/index.html');
    await page.waitForTimeout(2000);
    await page.mouse.click(200, 400); // start game
    await page.waitForTimeout(8000);  // let some obstacles spawn
    const result = await page.evaluate(() => {
      const g = window.__phaserGame;
      const scene = g.scene.getScene('Game');
      if (!scene) return { error: 'no scene' };
      const obs = scene.obstacles.getChildren();
      return {
        obsCount: obs.length,
        obsTypes: obs.map(o => o.texture.key),
        biomeIdx: scene.biomeIdx,
      };
    });
    console.log('Result:', JSON.stringify(result));
    if (errors.length) { console.log('ERRORS:', errors); process.exit(1); }
    if (result.obsCount === 0) { console.log('FAIL - no obstacles spawned'); process.exit(1); }
    console.log('PASS');
    await browser.close();
  })();
  ```

  Run: `node games/game-001/tests/obstacles.js` — expect FAIL (new obstacle types not yet added).

- [ ] **Step 2: Replace `spawnObstacle()` in `GameScene`**

  Replace the entire `spawnObstacle()` method with:

  ```javascript
  spawnObstacle() {
    // Per-biome pools: [type, weight]
    const pools = [
      // Swamp
      [['log', 50], ['bat', 30], ['snake', 20]],
      // Mushroom Forest
      [['log', 40], ['bat', 25], ['spore_cloud', 35]],
      // Volcanic Wasteland
      [['log', 35], ['bat', 25], ['falling_rock', 40]],
      // Neon City
      [['log', 30], ['bat', 20], ['laser_grid', 50]],
    ];
    const pool = pools[this.biomeIdx] || pools[0];
    const total = pool.reduce((s, [, w]) => s + w, 0);
    let r = Phaser.Math.Between(1, total);
    let type = pool[0][0];
    for (const [t, w] of pool) { r -= w; if (r <= 0) { type = t; break; } }

    let obs;
    switch (type) {
      case 'log':
        obs = this.obstacles.create(W + 40, GY, 'log').setOrigin(0.5, 1).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(true).setSize(36, 72).setOffset(2, 8);
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;

      case 'bat': {
        const batY = GY - 64 - 64 - 12;
        obs = this.obstacles.create(W + 40, batY, 'bat_sheet', 0).setOrigin(0.5, 0.5).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(true).setSize(56, 24).setOffset(8, 6);
        obs.play('bat_flap');
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;
      }

      case 'snake':
        obs = this.obstacles.create(W + 40, GY, 'snake').setOrigin(0.5, 1).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(true).setSize(60, 28).setOffset(2, 4);
        obs.obsSpeed = this.speed * 1.3; // snakes are faster
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;

      case 'spore_cloud':
        obs = this.obstacles.create(W + 48, GY - 12, 'spore_cloud').setOrigin(0.5, 1).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(true).setSize(90, 40).setOffset(3, 4);
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;

      case 'falling_rock': {
        // Drops from top at a random X near the right side
        const rx = W + Phaser.Math.Between(0, 60);
        obs = this.obstacles.create(rx, -48, 'falling_rock').setOrigin(0.5, 0.5).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(true).setSize(44, 44).setOffset(2, 2);
        obs.obsSpeed = 0;           // no horizontal movement
        obs.fallSpeed = 400;        // falls at 400px/s
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;
      }

      case 'laser_grid': {
        // Emitter at mid-height, beam alternates every 1.2s
        obs = this.obstacles.create(W + 40, GY - 80, 'laser_grid').setOrigin(0.5, 1).setDepth(4);
        obs.body.setAllowGravity(false).setImmovable(false); // beam handled separately
        obs.setSize(24, 80).setOffset(4, 8);
        obs.beamHigh = true; obs.beamTimer = 0; // alternates each 1.2s
        // beam hitbox image
        obs.beamHitbox = this.physics.add.staticImage(obs.x - W / 2, GY - (obs.beamHigh ? 140 : 20), null)
          .setVisible(false).setDisplaySize(W, 24).refreshBody();
        obs.setBlendMode(Phaser.BlendModes.ADD);
        break;
      }
    }

    if (!obs.obsSpeed && type !== 'falling_rock') obs.obsSpeed = this.speed;
    return obs;
  }
  ```

- [ ] **Step 3: Update the obstacle update loop in `update()`**

  Find the current obstacle loop and replace with:

  ```javascript
  this.obstacles.getChildren().forEach(obs => {
    if (obs.obsSpeed !== undefined) {
      obs.x -= (obs.obsSpeed || this.speed) * dt;
    }
    // Falling rocks drop vertically
    if (obs.fallSpeed) {
      obs.y += obs.fallSpeed * dt;
      if (obs.y > H + 60) { obs.destroy(); return; }
    }
    // Laser grid beam alternation
    if (obs.beamTimer !== undefined) {
      obs.beamTimer += dt;
      if (obs.beamTimer >= 1.2) {
        obs.beamTimer = 0;
        obs.beamHigh = !obs.beamHigh;
      }
      if (obs.beamHitbox) {
        obs.beamHitbox.x = obs.x - W / 2;
        obs.beamHitbox.y = GY - (obs.beamHigh ? 140 : 20);
        obs.beamHitbox.refreshBody();
      }
    }
    if (obs.x < -120 && !obs.fallSpeed) obs.destroy();
  });
  ```

  Also add overlap for beamHitbox in `create()`:

  ```javascript
  // Add after the main obstacle overlap:
  this.laserGridHitboxes = []; // track for cleanup
  ```

  And in `spawnObstacle()` for laser_grid, after creating beamHitbox:

  ```javascript
  this.physics.add.overlap(this.frog, obs.beamHitbox, () => this.die());
  ```

- [ ] **Step 4: Run obstacle test**

  `node games/game-001/tests/obstacles.js`
  Expected: `PASS` — `obsCount > 0`, `obsTypes` array contains valid texture keys.

- [ ] **Step 5: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: biome-aware obstacle pools (snake, spore cloud, falling rock, laser grid)"
  ```

---

## Task 6: Power-Up Spawn System + UI Bar

**Files:**
- Modify: `games/game-001/index.html` — add power-up group, spawn timer, pickup collision, active power-up state, UI bar

- [ ] **Step 1: Add power-up state and spawn timer to `GameScene.create()`**

  After `this.spawnTimer = 0;` add:

  ```javascript
  this.powerupTimer   = 15000; // ms until first power-up
  this.activePowerup  = null;  // { type, fuel, maxFuel }
  this.pickups        = this.physics.add.group();

  this.physics.add.overlap(this.frog, this.pickups, (frog, pickup) => {
    this.collectPowerup(pickup.puType);
    pickup.destroy();
  });
  ```

- [ ] **Step 2: Add power-up UI bar graphics** in `GameScene.create()` (after score UI):

  ```javascript
  // Power-up bar (depth 7, hidden until active)
  this.puBar = this.add.graphics().setDepth(7).setVisible(false);
  this.puIcon = this.add.image(0, 0, 'pickup_fly').setDepth(7).setVisible(false).setScale(0.5);
  ```

- [ ] **Step 3: Add `spawnPickup()` method to `GameScene`:**

  ```javascript
  spawnPickup() {
    const biome = this.biomeIdx;
    // Weighted type selection
    let type;
    const r = Math.random();
    if (r < 0.03) {
      type = 'rage';
    } else if (r < 0.18) {
      type = 'laser';
    } else {
      // Biome-flavoured picks
      const biomeTypes = ['fly', 'shroom', 'shield', 'laser'];
      const home = biomeTypes[Math.min(biome, 3)];
      type = Math.random() < 0.6 ? home : biomeTypes[Phaser.Math.Between(0, 3)];
    }

    const textureKey = { fly: 'pickup_fly', shroom: 'pickup_shroom', shield: 'pickup_shield', laser: 'pickup_laser', rage: 'pickup_rage' }[type];
    // Random Y: low (ground), mid (single jump), high (double jump)
    const yOptions = [GY - 24, GY - 120, GY - 220];
    const y = yOptions[Phaser.Math.Between(0, 2)];

    const pu = this.pickups.create(W + 60, y, textureKey).setDepth(4).setOrigin(0.5, 0.5);
    pu.body.setAllowGravity(false).setImmovable(true).setSize(40, 40).setOffset(4, 4);
    pu.puType = type;
    pu.setBlendMode(Phaser.BlendModes.ADD);

    // Float bob tween
    this.tweens.add({
      targets: pu, y: y - 10, duration: 600, ease: 'Sine.easeInOut',
      yoyo: true, repeat: -1,
    });
  }
  ```

- [ ] **Step 4: Add `collectPowerup()` method:**

  ```javascript
  collectPowerup(type) {
    // Cancel any active power-up
    this.clearActivePowerup();

    const configs = {
      fly:    { maxFuel: 8000,  icon: 'pickup_fly'    },
      shroom: { maxFuel: 5000,  icon: 'pickup_shroom' },
      shield: { maxFuel: -1,    icon: 'pickup_shield' }, // hit-based
      laser:  { maxFuel: 6000,  icon: 'pickup_laser'  },
      rage:   { maxFuel: 3000,  icon: 'pickup_rage'   },
    };
    const cfg = configs[type];
    this.activePowerup = { type, fuel: cfg.maxFuel, maxFuel: cfg.maxFuel };

    // Flash on pickup
    this.cameras.main.flash(100, 255, 255, 255, false);

    // Show UI
    this.puIcon.setTexture(cfg.icon).setVisible(true);
    this.puBar.setVisible(type !== 'shield');

    // Type-specific activation
    if (type === 'shroom') {
      this.frog.setTint(0xce93d8);
    } else if (type === 'rage') {
      this.cameras.main.flash(80, 255, 255, 255, false);
      this.cameras.main.shake(3000, 0.008);
      this.frog.setScale(2);
    } else if (type === 'laser') {
      this.frog.play('frog_laser', true);
      this.activateLaser();
    } else if (type === 'shield') {
      this.shieldRing = this.add.graphics().setDepth(6);
    }

    beep(880, 0.12);
  }
  ```

- [ ] **Step 5: Add `clearActivePowerup()` method:**

  ```javascript
  clearActivePowerup() {
    if (!this.activePowerup) return;
    const { type } = this.activePowerup;
    if (type === 'shroom') this.frog.clearTint();
    if (type === 'rage')   { this.frog.setScale(1); this.cameras.main.shake(0); }
    if (type === 'laser')  this.deactivateLaser();
    if (type === 'shield' && this.shieldRing) { this.shieldRing.destroy(); this.shieldRing = null; }
    this.activePowerup = null;
    this.puBar.setVisible(false);
    this.puIcon.setVisible(false);
    if (!this.dead) this.frog.play('frog_run', true);
  }
  ```

- [ ] **Step 6: Add power-up tick to `update()`**

  Inside the `if (!this.gameStarted || this.dead) { ... return; }` block, before that check:

  ```javascript
  // Power-up timer
  if (this.gameStarted && !this.dead) {
    this.powerupTimer -= delta;
    if (this.powerupTimer <= 0) {
      this.spawnPickup();
      this.powerupTimer = 15000 + Phaser.Math.Between(-3000, 3000);
    }
  }

  // Scroll pickups
  this.pickups.getChildren().forEach(pu => {
    pu.x -= this.speed * 0.8 * dt; // slightly slower than obstacles
    if (pu.x < -80) pu.destroy();
  });

  // Active power-up tick
  if (this.activePowerup && this.activePowerup.fuel > 0) {
    this.activePowerup.fuel -= delta;
    if (this.activePowerup.fuel <= 0) {
      this.clearActivePowerup();
    } else {
      // Update UI bar (drawn below frog)
      const { fuel, maxFuel } = this.activePowerup;
      const ratio = Math.max(0, fuel / maxFuel);
      const bx = this.frog.x - 30, by = this.frog.y + 8;
      this.puBar.clear();
      this.puBar.fillStyle(0x333333); this.puBar.fillRect(bx, by, 60, 6);
      this.puBar.fillStyle(0x00ff88); this.puBar.fillRect(bx, by, 60 * ratio, 6);
      this.puIcon.setPosition(bx - 12, by + 3);
    }
  }
  if (this.activePowerup?.type === 'shield' && this.shieldRing) {
    this.shieldRing.clear();
    this.shieldRing.lineStyle(2, 0xff8800, 0.8);
    this.shieldRing.strokeCircle(this.frog.x, this.frog.y - 32, 36);
  }
  ```

- [ ] **Step 7: Add to shutdown cleanup:**

  ```javascript
  this.events.once('shutdown', () => {
    this.dustEmitter.destroy();
    this.deathEmitter.destroy();
    this.clearActivePowerup();
  });
  ```

- [ ] **Step 8: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: power-up spawn system, pickup collision, UI bar"
  ```

---

## Task 7: Laser Crystal Mechanic

**Files:**
- Modify: `games/game-001/index.html` — add laser beam image, activation/deactivation, obstacle destruction

- [ ] **Step 1: Write Playwright laser test**

  Save to `games/game-001/tests/laser.js`:

  ```js
  const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8082/games/game-001/index.html');
    await page.waitForTimeout(2000);
    await page.mouse.click(200, 400); // start
    // Force laser pickup via console injection
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const scene = window.__phaserGame.scene.getScene('Game');
      scene.collectPowerup('laser');
    });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const scene = window.__phaserGame.scene.getScene('Game');
      return {
        hasBeam: !!scene.laserBeam && scene.laserBeam.visible,
        activePowerup: scene.activePowerup?.type,
        laserSpawnMult: scene.laserSpawnMult,
      };
    });
    console.log('Result:', JSON.stringify(result));
    if (!result.hasBeam) { console.log('FAIL - no beam visible'); process.exit(1); }
    if (result.activePowerup !== 'laser') { console.log('FAIL - wrong powerup'); process.exit(1); }
    console.log('PASS');
    await browser.close();
  })();
  ```

  Run: `node games/game-001/tests/laser.js` — expect FAIL (laser not implemented yet).

- [ ] **Step 2: Add laser beam image in `GameScene.create()`** (after obstacles group):

  ```javascript
  // Laser beam (hidden until activated)
  this.laserBeam = this.add.image(W / 2, GY - 32, 'laser_beam')
    .setOrigin(0, 0.5).setDepth(5.5).setVisible(false)
    .setBlendMode(Phaser.BlendModes.ADD);
  this.laserSpawnMult = 1; // multiplier for obstacle density during laser
  ```

- [ ] **Step 3: Add `activateLaser()` and `deactivateLaser()` to `GameScene`:**

  ```javascript
  activateLaser() {
    this.laserBeam.setVisible(true);
    this.laserSpawnMult = 2; // double obstacle density
    // Set beam tint to biome colour
    const biomeColors = [0x00ff44, 0xce93d8, 0xff6b35, 0x00e5ff];
    this.laserBeam.setTint(biomeColors[this.biomeIdx] || 0x00ff44);
  }

  deactivateLaser() {
    this.laserBeam.setVisible(false);
    this.laserSpawnMult = 1;
    this.frog.play('frog_run', true);
  }
  ```

- [ ] **Step 4: Update the spawn timer in `update()` to use `laserSpawnMult`:**

  Change:
  ```javascript
  this.spawnTimer = this.spawnInterval + Phaser.Math.Between(-200, 200);
  ```
  To:
  ```javascript
  const interval = Math.round(this.spawnInterval / this.laserSpawnMult);
  this.spawnTimer = interval + Phaser.Math.Between(-200, 200);
  ```

- [ ] **Step 5: Track beam position and destroy obstacles in `update()`:**

  Inside the active game loop (after parallax scroll lines), add:

  ```javascript
  // Laser beam follows frog mouth
  if (this.laserBeam.visible) {
    this.laserBeam.setPosition(this.frog.x, this.frog.y - 32);
    const beamBounds = this.laserBeam.getBounds();
    this.obstacles.getChildren().forEach(obs => {
      if (!Phaser.Geom.Intersects.RectangleToRectangle(beamBounds, obs.getBounds())) return;
      // Destroy obstacle
      this.deathEmitter.explode(8, obs.x, obs.y);
      obs.destroy();
      this.score += 10;
      // Floating score text
      const t = this.add.text(obs.x, obs.y - 10, '+10', {
        fontSize: '14px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
      }).setDepth(8).setOrigin(0.5);
      this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    });
  }
  ```

- [ ] **Step 6: Run laser test**

  `node games/game-001/tests/laser.js`
  Expected: `PASS` — beam visible, activePowerup is 'laser'.

- [ ] **Step 7: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: laser crystal — auto-firing beam from frog's mouth, destroys obstacles, +10pts each"
  ```

---

## Task 8: Frog Rage Mechanic + Fly Swarm + Magic Shroom + Fire Shield

**Files:**
- Modify: `games/game-001/index.html` — wire up remaining 4 power-up effects

- [ ] **Step 1: Frog Rage — update `die()` to respect active power-up:**

  At the top of `die()`:

  ```javascript
  die() {
    if (this.dead) return;
    // Shield absorbs one hit
    if (this.activePowerup?.type === 'shield') {
      this.shieldRing.destroy(); this.shieldRing = null;
      this.activePowerup = null;
      this.puBar.setVisible(false); this.puIcon.setVisible(false);
      this.cameras.main.shake(120, 0.01);
      beep(300, 0.1);
      return; // survive
    }
    // Shroom or Rage: fully invincible
    if (this.activePowerup?.type === 'shroom' || this.activePowerup?.type === 'rage') return;
    // ... rest of die() unchanged
  ```

- [ ] **Step 2: Rage — smash obstacles on overlap**

  In the obstacle update loop in `update()`, after checking `obs.x < -120`, add rage smash check:

  ```javascript
  if (this.activePowerup?.type === 'rage') {
    const frogB = this.frog.getBounds();
    this.obstacles.getChildren().forEach(obs => {
      if (!Phaser.Geom.Intersects.RectangleToRectangle(frogB, obs.getBounds())) return;
      this.deathEmitter.explode(12, obs.x, obs.y);
      obs.destroy();
      this.score += 15;
      const t = this.add.text(obs.x, obs.y - 10, '+15', {
        fontSize: '16px', fontFamily: 'monospace', color: '#ff4400', stroke: '#000000', strokeThickness: 2,
      }).setDepth(8).setOrigin(0.5);
      this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 700, onComplete: () => t.destroy() });
    });
  }
  ```

- [ ] **Step 3: Fly Swarm — 2× score multiplier**

  In the score tick section of `update()`:

  ```javascript
  if (this.scoreTick >= 0.1) {
    this.scoreTick -= 0.1;
    const mult = this.activePowerup?.type === 'fly' ? 2 : 1;
    this.score += mult;
  }
  ```

- [ ] **Step 4: Validate all power-ups via Playwright**

  Save to `games/game-001/tests/powerups.js`:

  ```js
  const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8082/games/game-001/index.html');
    await page.waitForTimeout(2000);
    await page.mouse.click(200, 400);
    await page.waitForTimeout(500);

    for (const type of ['fly', 'shroom', 'shield', 'laser', 'rage']) {
      await page.evaluate(t => {
        const scene = window.__phaserGame.scene.getScene('Game');
        scene.collectPowerup(t);
      }, type);
      await page.waitForTimeout(300);
      const state = await page.evaluate(() => {
        const s = window.__phaserGame.scene.getScene('Game');
        return { type: s.activePowerup?.type, dead: s.dead };
      });
      console.log(`${type}: active=${state.type}, dead=${state.dead}`);
      if (state.dead) { console.log(`FAIL - game died collecting ${type}`); process.exit(1); }
    }

    console.log('JS errors:', errors);
    if (errors.length) process.exit(1);
    console.log('PASS');
    await browser.close();
  })();
  ```

  Run: `node games/game-001/tests/powerups.js`
  Expected: All 5 lines show correct type, `dead=false`. `PASS`.

- [ ] **Step 5: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: all power-up effects — rage smash, shroom invincibility, shield parry, fly 2x score"
  ```

---

## Task 9: Weather Particles Per Biome

**Files:**
- Modify: `games/game-001/index.html` — add `WeatherSystem` logic to `GameScene`

- [ ] **Step 1: Generate weather particle textures in `PreloadScene.preload()`**

  Add after particle generation in `PreloadScene`:

  ```javascript
  // Rain drop
  const rain = this.make.graphics({ add: false });
  rain.fillStyle(0x6688aa); rain.fillRect(0, 0, 1, 6);
  rain.generateTexture('p_rain', 1, 6); rain.destroy();

  // Spore
  const spore = this.make.graphics({ add: false });
  spore.fillStyle(0xce93d8); spore.fillCircle(2, 2, 2);
  spore.generateTexture('p_spore', 4, 4); spore.destroy();

  // Ember
  const ember = this.make.graphics({ add: false });
  ember.fillStyle(0xff6b35); ember.fillCircle(2, 2, 2);
  ember.generateTexture('p_ember', 4, 4); ember.destroy();

  // Neon spark
  const spark = this.make.graphics({ add: false });
  spark.fillStyle(0x00e5ff); spark.fillRect(0, 0, 2, 2);
  spark.generateTexture('p_spark', 2, 2); spark.destroy();
  ```

- [ ] **Step 2: Add `initWeather()` and `transitionWeather()` to `GameScene`**

  Add these methods:

  ```javascript
  _weatherConfig(biomeIdx) {
    return [
      // Swamp: diagonal rain
      { key: 'p_rain', x: { min: 0, max: W }, y: -10, speedX: { min: -30, max: -10 }, speedY: { min: 120, max: 200 }, scale: 1, lifespan: 800, quantity: 1, frequency: 80 },
      // Mushroom: rising spores
      { key: 'p_spore', x: { min: 0, max: W }, y: GY, speedX: { min: -8, max: 8 }, speedY: { min: -60, max: -20 }, scale: { start: 0.8, end: 0 }, lifespan: 1800, quantity: 1, frequency: 120 },
      // Volcano: falling embers
      { key: 'p_ember', x: { min: 0, max: W }, y: -8, speedX: { min: -20, max: 20 }, speedY: { min: 80, max: 160 }, scale: { start: 1, end: 0 }, lifespan: 1000, quantity: 1, frequency: 60 },
      // Neon city: falling sparks
      { key: 'p_spark', x: { min: 0, max: W }, y: -4, speedX: { min: -5, max: 5 }, speedY: { min: 100, max: 180 }, scale: 1, lifespan: 700, quantity: 2, frequency: 50 },
    ][biomeIdx] || null;
  }

  initWeather(biomeIdx) {
    if (this.weatherEmitter) { this.weatherEmitter.destroy(); this.weatherEmitter = null; }
    const cfg = this._weatherConfig(biomeIdx);
    if (!cfg) return;
    const { key, x, y, speedX, speedY, scale, lifespan, quantity, frequency } = cfg;
    this.weatherEmitter = this.add.particles(0, 0, key, {
      x, y, speedX, speedY, scale, lifespan, quantity, frequency,
      emitting: true,
    }).setDepth(1.5);
  }

  transitionWeather(biomeIdx) {
    if (this.weatherEmitter) {
      const old = this.weatherEmitter;
      this.tweens.add({ targets: old, alpha: 0, duration: 1200, onComplete: () => old.destroy() });
    }
    this.weatherEmitter = null;
    this.time.delayedCall(600, () => this.initWeather(biomeIdx));
  }
  ```

- [ ] **Step 3: Call `initWeather(0)` in `GameScene.create()`** (after `initBiome(0)`):

  ```javascript
  this.weatherEmitter = null;
  this.initWeather(0);
  ```

- [ ] **Step 4: Call `transitionWeather(idx)` in `transitionBiome()`** (after `_showBiomeLabel` call):

  ```javascript
  this.transitionWeather(idx);
  ```

- [ ] **Step 5: Add `weatherEmitter` to shutdown cleanup:**

  ```javascript
  if (this.weatherEmitter) this.weatherEmitter.destroy();
  ```

- [ ] **Step 6: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: biome weather particles — rain, spores, embers, neon sparks"
  ```

---

## Task 10: Screen Effects (Near-Miss, Flash, 300m+ Glitch)

**Files:**
- Modify: `games/game-001/index.html` — near-miss detection, 300m glitch

- [ ] **Step 1: Add near-miss detection in the obstacle update loop**

  Inside the `this.obstacles.getChildren().forEach` loop, after the `x < -120` destroy check, add:

  ```javascript
  // Near-miss: obstacle just passed the frog
  if (!obs._nearMissed && obs.x < this.frog.x - 10 && obs.x > this.frog.x - 50) {
    const frogB = this.frog.getBounds();
    const obsB  = obs.getBounds();
    const gap = Math.abs(frogB.centerY - obsB.centerY) - frogB.height / 2 - obsB.height / 2;
    if (gap < 12 && gap >= 0) {
      obs._nearMissed = true;
      this.cameras.main.shake(80, 0.004);
      this.cameras.main.flash(60, 255, 255, 255, false);
      this.score += 3;
      const t = this.add.text(this.frog.x + 20, this.frog.y - 40, 'CLOSE!', {
        fontSize: '12px', fontFamily: 'monospace', color: '#ffff00', stroke: '#000000', strokeThickness: 2,
      }).setDepth(8).setOrigin(0.5);
      this.tweens.add({ targets: t, y: t.y - 20, alpha: 0, duration: 500, onComplete: () => t.destroy() });
    }
  }
  ```

- [ ] **Step 2: Add 300m+ glitch effect**

  In `GameScene.create()`, after the score text creation:

  ```javascript
  this.glitchTimer = 0;
  this.glitchNext  = Phaser.Math.Between(8000, 15000);
  this.canvas = document.querySelector('canvas');
  ```

  In `update()`, inside the active game loop:

  ```javascript
  // 300m+ scanline glitch
  if (this.score >= 300) {
    this.glitchTimer += delta;
    if (this.glitchTimer >= this.glitchNext) {
      this.glitchTimer = 0;
      this.glitchNext = Phaser.Math.Between(8000, 15000);
      if (this.canvas) {
        this.canvas.style.filter = 'contrast(1.15) brightness(0.9) saturate(1.3)';
        this.time.delayedCall(80, () => {
          if (this.canvas) this.canvas.style.filter = '';
        });
      }
    }
  }
  ```

- [ ] **Step 3: Clean up canvas filter on scene shutdown:**

  In the `events.once('shutdown')` block:

  ```javascript
  if (this.canvas) this.canvas.style.filter = '';
  ```

- [ ] **Step 4: Run full Playwright validation**

  `node games/game-001/tests/powerups.js && node games/game-001/tests/laser.js && node games/game-001/tests/obstacles.js && node games/game-001/tests/boot.js`
  Expected: all four return `PASS`.

- [ ] **Step 5: Commit**

  ```bash
  cd /tmp/mosswitch-games && git add games/game-001/index.html
  git commit -m "feat: near-miss shake+flash+3pts, 300m+ scanline glitch effect"
  ```

---

## Task 11: Push to GitHub Pages

- [ ] **Step 1: Run full boot test one final time**

  `node games/game-001/tests/boot.js`
  Expected: `PASS`.

- [ ] **Step 2: Push**

  ```bash
  cd /tmp/mosswitch-games && git push origin main
  ```

- [ ] **Step 3: Verify live at** `https://turbosys.github.io/mosswitch-games/games/game-001/index.html`

---

## Self-Review Checklist

| Spec requirement | Task |
|-----------------|------|
| HF-generated sprites for all characters/obstacles | Tasks 1–3 |
| PreloadScene architecture | Task 4 |
| ADD blend mode for sprites | Task 4 |
| Biome-aware obstacle pools | Task 5 |
| Snake, spore cloud, falling rock, laser grid | Task 5 |
| Power-up spawn timer + floating pickups | Task 6 |
| Pickup collision + activation | Task 6 |
| UI fuel bar + icon | Task 6 |
| Laser auto-fires from mouth | Task 7 |
| Beam tracks frog Y (works mid-air) | Task 7 |
| Obstacle density doubles during laser | Task 7 |
| +10 pts per obstacle destroyed | Task 7 |
| Biome-coloured beam | Task 7 |
| Frog Rage: 2× scale, invincible, +15 pts smash | Task 8 |
| Shield absorbs 1 hit | Task 8 |
| Shroom: invincibility + purple tint | Task 8 |
| Fly Swarm: 2× score multiplier | Task 8 |
| Weather particles per biome | Task 9 |
| Weather transitions with biome | Task 9 |
| Near-miss shake + flash + +3 pts | Task 10 |
| 300m+ glitch effect | Task 10 |

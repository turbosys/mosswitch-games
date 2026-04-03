# DASH FROG — Gameplay Overhaul Design Spec
**Date:** 2026-04-03  
**Status:** Approved

## Overview

Transform DASH FROG from a monotonous jump-to-survive loop into a layered arcade experience with power-ups, ability moments, biome-specific obstacles, and HF-generated pixel art sprites.

**Design principle:** Easy to start, surprises you as you go deeper. Each biome introduces new threats and new rewards. The laser crystal is the "holy shit" moment that earns word-of-mouth.

---

## 1. Sprite System — HF-Generated Art

Replace all procedural Phaser Graphics API textures with AI-generated pixel art from Z-Image Turbo (HF MCP). Style: 16-bit pixel art, dark backgrounds, vibrant colors.

### Sprites to generate

| Sprite | Size | Notes |
|--------|------|-------|
| Frog sheet | 224×32 | 7 frames × 32×32: run×4, jump, dead, laser-mouth-open |
| Log | 20×40 | Ground obstacle |
| Bat sheet | 72×18 | 2 frames × 36×18: wings up, wings down |
| Snake | 32×16 | Ground obstacle, lower profile than log |
| Spore Cloud | 48×24 | Mushroom biome obstacle, wide and low |
| Falling Rock | 24×24 | Volcano biome, drops from above |
| Laser Grid | 16×48 | Neon biome, vertical emitter sprite |
| Fly Swarm pick-up | 24×24 | Glowing green bug cluster |
| Magic Shroom pick-up | 20×24 | Glowing purple mushroom |
| Fire Shield pick-up | 24×24 | Orange flame orb |
| Laser Crystal pick-up | 20×24 | Cyan glowing crystal |
| Rage Orb pick-up | 24×24 | Red/gold pulsing orb |
| Laser beam | 480×8 | Horizontal beam, bright on black, ADD blend |
| bg_mid_0..3 | 480×120 | Biome mid parallax tiles (4 images) |
| bg_fore_0..3 | 480×40 | Biome fore parallax tiles (4 images) |

**Transparency:** Character and effect sprites generated on near-black (#050505) backgrounds. Phaser `BlendModes.ADD` makes dark pixels invisible against the game's dark palette. Background tiles are opaque.

### Architecture change

```
PreloadScene (new) → BootScene (animations only) → GameScene → GameOverScene
```

- **PreloadScene:** `this.load.image()` / `this.load.spritesheet()` for all HF assets
- **BootScene:** stripped to animation definitions only — no texture generation
- Frog rage (2× size) achieved via `setScale(2)` in code — no separate sprite needed

---

## 2. Power-Up System

Power-ups float mid-path at varying heights, spawning on a separate timer from obstacles. Grabbing one by collision activates it immediately. Only one power-up active at a time (new pick-up replaces old).

### Spawn rules
- Base interval: 15 seconds between power-up spawns
- Y position randomised: low (grabbable from ground), mid (requires single jump), high (requires double jump)
- Rage Orb: 3% chance per power-up spawn event, any biome
- Laser Crystal: 15% chance, weighted toward all biomes equally
- Biome-flavoured picks (Fly Swarm, Shroom, Shield) weighted 60% in their home biome, 20% elsewhere

### Power-up types

| Name | Sprite | Effect | Duration |
|------|--------|--------|----------|
| Fly Swarm | fly_swarm | 2× score multiplier | 8s |
| Magic Shroom | magic_shroom | Full invincibility, frog tint purple | 5s |
| Fire Shield | fire_shield | Absorb 1 hit (shield aura on frog) | Until hit |
| Laser Crystal | laser_crystal | Auto-firing laser from mouth (see §3) | 6s fuel |
| Rage Orb | rage_orb | 2× frog scale, invincible, smash everything (see §4) | 3s |

### UI
Active power-up: small icon + horizontal fuel/timer bar rendered below the frog at depth 7. Bar drains in real-time. No bar for Fire Shield (hit-based); replaced by a shield ring drawn around the frog.

---

## 3. Laser Crystal Mechanic

The centrepiece "wow" moment. When the frog collects a Laser Crystal:

1. Frog switches to `laser_mouth` sprite frame
2. A `laser_beam` image is placed horizontally from the frog's mouth to the right edge of the screen
3. Beam Y tracks the frog's Y every frame (fires at whatever height the frog is at — including mid-air)
4. **Obstacle spawn rate doubles** for the laser duration (2× density = more to blast)
5. Any obstacle whose bounds overlap the beam rectangle is destroyed:
   - Small explosion particle burst at obstacle position
   - +10 points per obstacle destroyed (shown as floating "+10" text)
6. Beam colour matches current biome: green (swamp), purple (mushroom), orange (volcano), cyan (neon)
7. Fuel bar drains over 6 seconds. On empty: beam removed, frog returns to normal sprite

Normal tap-to-jump works throughout — player can arc through the air blasting obstacles at any height.

---

## 4. Frog Rage Mechanic

When the Rage Orb is collected:

1. One-frame white screen flash
2. `this.frog.setScale(2)` — frog doubles in size instantly
3. Continuous camera shake for 3 seconds (`this.cameras.main.shake`)
4. All obstacle overlaps trigger destroy + shockwave particle burst + +15 points
5. After 3 seconds: flash, `setScale(1)`, shake stops, normal run resumes

Rage and Laser can't stack — collecting either while the other is active replaces it.

---

## 5. New Obstacles Per Biome

Biome obstacle pools. `spawnObstacle()` picks from the current biome's pool with these weights:

### Swamp (0m+)
| Obstacle | Weight | Behaviour |
|----------|--------|-----------|
| Log | 50% | Current — vertical, on ground |
| Bat | 30% | Current — mid-air |
| Snake | 20% | Ground level, 60% height of log, faster horizontal speed |

### Mushroom Forest (60m+)
| Obstacle | Weight | Behaviour |
|----------|--------|-----------|
| Log | 40% | As before |
| Bat | 25% | As before |
| Spore Cloud | 35% | Wide (48px), low (24px tall), spawns at GY-12 — jump over |

### Volcanic Wasteland (130m+)
| Obstacle | Weight | Behaviour |
|----------|--------|-----------|
| Log | 35% | As before |
| Bat | 25% | As before |
| Falling Rock | 40% | Spawns at Y=0, drops at 400px/s. Player must run through the gap (rock is 24px wide, gap beside it is passable) |

### Neon City (220m+)
| Obstacle | Weight | Behaviour |
|----------|--------|-----------|
| Log | 30% | As before |
| Bat | 20% | As before |
| Laser Grid | 50% | Stationary emitter sprite, fires a horizontal beam at alternating heights (low/high) on a 1.2s cycle. Frog must be at the opposite height when passing. |

---

## 6. Atmosphere & Screen Effects

### Biome weather particles
Continuous particle emitter at depth 1.5, transitions with biomes:

| Biome | Particle | Behaviour |
|-------|---------|-----------|
| Swamp | Rain drops (1×6px rect, blue-grey) | Fall diagonally right-to-left |
| Mushroom | Spores (circle, purple) | Drift upward slowly |
| Volcano | Embers (circle, orange) | Fall downward with slight drift |
| Neon City | Pixel sparks (2×2 rect, cyan/pink alternating) | Fall vertically, brief lifespan |

Weather emitter replaces on biome transition (fade old, start new).

### Screen effects
- **Near-miss:** obstacle passes within 10px of frog body → `cameras.main.shake(80, 0.004)` + brief white flash
- **Power-up grab:** flash in the power-up's accent colour (100ms)
- **300m+:** CSS `filter: contrast(1.1) brightness(0.95)` on the canvas + random 80ms static flashes every 8–15 seconds

---

## 7. Implementation Order

1. Generate all sprites via HF MCP (Z-Image Turbo), save to `games/game-001/sprites/`
2. Add `PreloadScene`, strip `BootScene` to animation definitions only
3. Swap procedural textures for loaded sprites, verify game boots
4. Implement new obstacle types per biome in `spawnObstacle()`
5. Power-up spawn timer + floating pick-up objects + collision pickup
6. Power-up UI bar (depth 7, tracks frog position)
7. Laser Crystal: beam image, biome colour, density surge, destroy-on-overlap, +10 points
8. Frog Rage: scale, shake, invincibility, +15 points
9. Remaining power-ups (Fly Swarm multiplier, Shroom invincibility, Fire Shield)
10. Weather particle system + biome transitions
11. Screen effects (near-miss shake, power-up flash, 300m+ glitch)

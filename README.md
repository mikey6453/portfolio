# Portfolio — Michael Park

An interactive 3D portfolio built with Three.js. The visitor lands in a small
fantasy clearing at night: a wizard tower with a glowing crystal spire stands
at the center, a campfire flickers in front of it, fireflies drift through the
forest, mountains line the horizon, and five elemental statues — Fire, Water,
Earth, Air, and Lightning — sit in front of the tower. Each statue maps to a
portfolio section. Click one (or use the tabs / arrow keys) and the camera
glides over while the panel opens.

## Why this exists

I kept landing on interactive 3D sites and thinking *that's cool, I'd want to
try building one.* Most of my day-to-day work — backends, evaluation tooling,
infrastructure — lives off-screen, so this was a chance to step out of that
lane and figure something unfamiliar out from the Three.js docs up.

The whole world is hand-built from primitive geometry — no imported models —
so every piece (the shingled witch-hat roof, the spiraling exterior staircase,
the bubbling cauldron, the bent crystal-orb spire, the lake's irregular
shoreline) is just code worked out along the way.

## Navigation

There are three ways to move between sections, so a visitor never has to figure
out the controls:

- **Click** an elemental statue or the tower itself
- **Tabs** in the upper right (About / Experience / Projects / Skills / Contact)
- **Arrow keys** ← / → cycle through sections in order
- **Drag** to look around with OrbitControls
- **Esc** closes the current panel

## What's in the scene

- A two-tier wizard tower with a tall conical witch-hat shingled roof, a bent
  iron spire topped by a crystal orb, a wraparound balcony, an exterior spiral
  staircase, a brass observatory telescope, a bubbling cauldron at the
  entrance, a stained-glass window, glowing rune carvings, embedded crystals,
  hanging wind chimes, gargoyles, an owl on the porch, and chimney smoke
- Five elemental statues, each with its own animated effect (flickering flame,
  orbiting water droplets, slowly rotating earth crystals, drifting air wisps
  with rotating rings, crackling lightning bolts)
- A campfire with crossed logs, drifting embers, and flickering point light
- A footpath of overlapping irregular dirt patches winding past the tower
- A lake with an irregular shoreline, lily pads, reeds, and a moonlight glint
- 50+ trees in five variants (fir, oak, dead, mushroom-cap, bush) plus
  background trees and silhouette trees fading into the fog
- A mountain horizon in two depth layers
- Fireflies that drift along the forest, glowing flowers, fallen logs,
  pumpkins, mushroom fairy rings, hanging tree-lanterns, stumps, and rock
  clusters

## Tech

- **Three.js** (vanilla, no React Three Fiber)
- **GSAP** for camera tweening
- **Vite** for the build and dev server
- A static shadow map and selective shadow casting keep frame rates high even
  with the dense scene

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL.

## File layout

```
src/
├── main.js            entry — wires scene, world, animation loop
├── scene.js           scene, camera, renderer, fog, moon, starfield
├── controls.js        OrbitControls config
├── world.js           ground, dirt clearing, footpath, hut + statues + nature
├── hut.js             the wizard tower (~2000+ meshes, 4 point lights)
├── statues.js         the five elemental statues + per-statue animations
├── nature.js          trees, lake, rocks, grass, mushrooms, mountains, etc.
├── campfire.js        crossed logs, flames, ember particles, flickering light
├── fireflies.js       additive-blended drifting points
├── interactions.js    raycasting, focus tweening, tabs, arrow-key navigation
├── ui.js              overlay panel show/hide
├── content.js         section copy
├── style.css          page chrome + overlay + topnav styling
└── loaders.js         shared GLTFLoader (fallback to primitives if no GLB)
```

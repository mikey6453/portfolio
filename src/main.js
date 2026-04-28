import * as THREE from 'three';
import { createScene } from './scene.js';
import { setupControls } from './controls.js';
import { buildWorld } from './world.js';
import { createCampfire } from './campfire.js';
import { createFireflies } from './fireflies.js';
import { setupInteractions } from './interactions.js';

const { scene, camera, renderer } = createScene();
const controls = setupControls(camera, renderer);
const { interactiveObjects, updateStatues, updateHut } = await buildWorld(scene);
const updateCampfire = createCampfire(scene);
const updateFireflies = createFireflies(scene);
setupInteractions({ scene, camera, controls, renderer, interactiveObjects });

const clock = new THREE.Clock();

let firstFrame = true;
function loop() {
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();
  updateCampfire(t);
  updateFireflies(t);
  updateStatues(t);
  updateHut(t);
  controls.update();
  renderer.render(scene, camera);
  // shadow map is static — only the first frame needs to render it
  if (firstFrame) {
    renderer.shadowMap.needsUpdate = false;
    firstFrame = false;
  }
}

loop();

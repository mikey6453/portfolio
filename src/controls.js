import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minPolarAngle = Math.PI / 6;
  controls.target.set(0, 1, 0);
  controls.enablePan = false;
  controls.update();
  return controls;
}

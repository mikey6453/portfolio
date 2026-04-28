import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const cache = new Map();

export function loadModel(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      loader
        .loadAsync(url)
        .then((gltf) => gltf.scene)
        .catch(() => null)
    );
  }
  return cache.get(url).then((scene) => (scene ? scene.clone(true) : null));
}

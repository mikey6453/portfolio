import * as THREE from 'three';
import { loadModel } from './loaders.js';
import { buildWizardHut } from './hut.js';
import { addNature } from './nature.js';
import { addStatues } from './statues.js';

export async function buildWorld(scene) {
  addGround(scene);
  const updateHut = await addHut(scene);
  await addNature(scene);
  const { statues, update: updateStatues } = addStatues(scene);
  return { interactiveObjects: statues, updateStatues, updateHut };
}

function addGround(scene) {
  const geom = new THREE.PlaneGeometry(80, 80, 1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a3a22,
    roughness: 0.95,
    metalness: 0,
  });
  const ground = new THREE.Mesh(geom, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  addClearingPatch(scene);
  addFootpath(scene);
}

// build a flat-laying mesh from an irregular polygon (xz plane, y=position.y)
function buildIrregularPatch(baseRadius, jitter, segments = 32) {
  const shape = new THREE.Shape();
  // pre-pick angle phases so each shape has its own organic profile
  const phaseA = Math.random() * Math.PI * 2;
  const phaseB = Math.random() * Math.PI * 2;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2;
    // smooth low-frequency wobble + a touch of high-frequency noise
    const noise =
      1 +
      Math.sin(angle * 2 + phaseA) * jitter * 0.6 +
      Math.sin(angle * 5 + phaseB) * jitter * 0.3 +
      (Math.random() - 0.5) * jitter * 0.7;
    const r = baseRadius * Math.max(0.55, noise);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape, 1);
}

function addClearingPatch(scene) {
  // main irregular dirt clearing — replaces the perfect circle
  const main = new THREE.Mesh(
    buildIrregularPatch(5.6, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x3a3024, roughness: 1 })
  );
  main.rotation.x = -Math.PI / 2;
  main.position.y = 0.01;
  main.receiveShadow = true;
  scene.add(main);

  // a slightly darker inner core to give the clearing depth at its center
  const core = new THREE.Mesh(
    buildIrregularPatch(3.2, 0.25, 28),
    new THREE.MeshStandardMaterial({
      color: 0x322820,
      roughness: 1,
      transparent: true,
      opacity: 0.7,
    })
  );
  core.rotation.x = -Math.PI / 2;
  core.position.y = 0.012;
  core.receiveShadow = true;
  scene.add(core);

  // small overlapping irregular patches around the perimeter to soften the edge
  const fringe = [
    { x: 5.0, z: 1.5, r: 1.3 },
    { x: -4.2, z: 2.2, r: 1.2 },
    { x: 1.0, z: -5.5, r: 1.5 },
    { x: -3.0, z: -4.5, r: 1.3 },
    { x: 5.8, z: -2.5, r: 1.0 },
    { x: -1.5, z: 5.4, r: 1.2 },
    { x: 3.4, z: 4.8, r: 0.9 },
    { x: -5.5, z: -1.0, r: 1.0 },
  ];
  for (const p of fringe) {
    const patch = new THREE.Mesh(
      buildIrregularPatch(p.r, 0.3, 14),
      new THREE.MeshStandardMaterial({
        color: 0x342a1f,
        roughness: 1,
        transparent: true,
        opacity: 0.7,
      })
    );
    patch.rotation.x = -Math.PI / 2;
    patch.rotation.z = Math.random() * Math.PI;
    patch.position.set(p.x, 0.011 + Math.random() * 0.003, p.z);
    patch.receiveShadow = true;
    scene.add(patch);
  }
}

function addFootpath(scene) {
  // curving path from near the wagon's foldout step around the right side
  // of the sign arc and out toward the camera. Built as a single ShapeGeometry
  // with two perturbed long edges so it reads as a worn dirt strip, not a tile.
  const controls = [
    new THREE.Vector2(0.6, -1.4),
    new THREE.Vector2(2.6, -0.6),
    new THREE.Vector2(4.8, 1.2),
    new THREE.Vector2(5.8, 4.0),
    new THREE.Vector2(5.8, 7.2),
    new THREE.Vector2(5.0, 9.4),
  ];
  const curve = new THREE.SplineCurve(controls);
  const samples = 26;
  const baseWidth = 0.85;
  const left = [];
  const right = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const nx = -tan.y;
    const ny = tan.x;
    // narrower at the very ends so it fades into the surroundings
    const taper = Math.sin(t * Math.PI);
    const w = baseWidth * (0.55 + taper * 0.6) * (0.85 + Math.random() * 0.3);
    left.push(new THREE.Vector2(p.x + nx * w, p.y + ny * w));
    right.push(new THREE.Vector2(p.x - nx * w, p.y - ny * w));
  }
  const shape = new THREE.Shape([...left, ...right.reverse()]);
  const geom = new THREE.ShapeGeometry(shape, 1);

  const path = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({
      color: 0x4a3826,
      roughness: 1,
      transparent: true,
      opacity: 0.9,
    })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.018;
  path.receiveShadow = true;
  scene.add(path);

  // a sprinkling of tiny dirt blobs along the path to break up the silhouette
  for (let i = 0; i < 18; i++) {
    const t = Math.random();
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const nx = -tan.y;
    const ny = tan.x;
    const offset = (Math.random() - 0.5) * 1.4;
    const blob = new THREE.Mesh(
      buildIrregularPatch(0.18 + Math.random() * 0.14, 0.4, 10),
      new THREE.MeshStandardMaterial({
        color: 0x3e2e1c,
        roughness: 1,
        transparent: true,
        opacity: 0.7,
      })
    );
    blob.rotation.x = -Math.PI / 2;
    blob.rotation.z = Math.random() * Math.PI;
    blob.position.set(p.x + nx * offset, 0.02, p.y + ny * offset);
    scene.add(blob);
  }
}

async function addHut(scene) {
  const glb = await loadModel('/models/wizard_hut.glb');
  if (glb) {
    glb.position.set(-2.0, 0, -2.6);
    glb.scale.setScalar(1.4);
    glb.rotation.y = Math.PI * 0.25;
    glb.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scene.add(glb);
    return () => {}; // no animation for the GLB path
  }
  const { group, update } = buildWizardHut();
  group.position.set(-2.0, 0, -2.6);
  // entrance faces the elemental statues
  group.rotation.y = Math.PI * 0.25;
  scene.add(group);
  return update;
}


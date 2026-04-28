import * as THREE from 'three';
import { loadModel } from './loaders.js';

const MAT = {
  trunk: new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 1, flatShading: true }),
  trunkPale: new THREE.MeshStandardMaterial({ color: 0x4a3422, roughness: 1, flatShading: true }),
  trunkDead: new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: 1, flatShading: true }),
  fir: new THREE.MeshStandardMaterial({ color: 0x1a3a1f, roughness: 0.9, flatShading: true }),
  firDeep: new THREE.MeshStandardMaterial({ color: 0x143324, roughness: 0.9, flatShading: true }),
  oak: new THREE.MeshStandardMaterial({ color: 0x244a26, roughness: 0.9, flatShading: true }),
  oakBright: new THREE.MeshStandardMaterial({ color: 0x2e5a30, roughness: 0.9, flatShading: true }),
  bush: new THREE.MeshStandardMaterial({ color: 0x2a4a25, roughness: 0.95, flatShading: true }),
  rock: new THREE.MeshStandardMaterial({ color: 0x6e6862, roughness: 1, flatShading: true }),
  rockDark: new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1, flatShading: true }),
  rockMoss: new THREE.MeshStandardMaterial({ color: 0x5a6a4a, roughness: 1, flatShading: true }),
  grass: new THREE.MeshStandardMaterial({ color: 0x3a5a30, roughness: 0.95, flatShading: true }),
  water: new THREE.MeshStandardMaterial({
    color: 0x2a4a6e,
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  }),
  reed: new THREE.MeshStandardMaterial({ color: 0x4a5a30, roughness: 0.95, flatShading: true }),
  reedTop: new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 1, flatShading: true }),
  lilyPad: new THREE.MeshStandardMaterial({ color: 0x2a5a3a, roughness: 0.85, flatShading: true }),
  mushroomCap: new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.85, flatShading: true }),
  mushroomStem: new THREE.MeshStandardMaterial({ color: 0xeae0ce, roughness: 0.9, flatShading: true }),
  stump: new THREE.MeshStandardMaterial({ color: 0x4a3422, roughness: 1, flatShading: true }),
  stumpTop: new THREE.MeshStandardMaterial({ color: 0xc09060, roughness: 1, flatShading: true }),
  cobble: new THREE.MeshStandardMaterial({ color: 0x6a655e, roughness: 1, flatShading: true }),
  cobbleDark: new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1, flatShading: true }),
  pumpkin: new THREE.MeshStandardMaterial({ color: 0xc05a14, roughness: 0.85, flatShading: true }),
  pumpkinStem: new THREE.MeshStandardMaterial({ color: 0x4a5a25, roughness: 1, flatShading: true }),
  flowerCyan: new THREE.MeshStandardMaterial({
    color: 0x66e0ff,
    emissive: 0x44a0c0,
    emissiveIntensity: 1.4,
    roughness: 0.4,
    flatShading: true,
  }),
  flowerMagenta: new THREE.MeshStandardMaterial({
    color: 0xff66c8,
    emissive: 0xc04088,
    emissiveIntensity: 1.4,
    roughness: 0.4,
    flatShading: true,
  }),
  flowerGold: new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xb09030,
    emissiveIntensity: 1.4,
    roughness: 0.5,
    flatShading: true,
  }),
  flowerStem: new THREE.MeshStandardMaterial({ color: 0x2e4a25, roughness: 0.95, flatShading: true }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.5, metalness: 0.6 }),
  glassWarm: new THREE.MeshBasicMaterial({ color: 0xffcc66 }),
};

// regions to keep clear of
const SAFE_RADIUS = 7; // hut + campfire + signs zone
const LAKE_CENTER = new THREE.Vector3(11, 0, -8);
const LAKE_RADIUS = 4.2;

// camera looks at the scene from +X +Z. trees in that quadrant block the wagon.
// the fire statue sits just past +X (~-5°) so the no-tree zone now extends to
// ~-30° to give the rightmost statue clear breathing room.
const TREE_ANGLE_START = Math.PI * 0.55;  // ~99°
const TREE_ANGLE_END = Math.PI * 1.83;    // ~329° — leaves -31° → 99° tree-free

export async function addNature(scene) {
  await addTrees(scene);
  addBackgroundTrees(scene);
  addMountains(scene);
  addLake(scene);
  addRocks(scene);
  addGrass(scene);
  addMushroomPatches(scene);
  addStumps(scene);
  addFallenLogs(scene);
  addFirewoodStack(scene);
  addStonePath(scene);
  addGlowingFlowers(scene);
  addPumpkins(scene);
  addTreeLanterns(scene);
  addDistantBoulders(scene);
}

// ---------------- trees ----------------

async function addTrees(scene) {
  const placements = generatePlacements(48, {
    minR: 8,
    maxR: 22,
    spacing: 1.7,
    angleStart: TREE_ANGLE_START,
    angleEnd: TREE_ANGLE_END,
    extraExclusions: [
      { center: LAKE_CENTER, radius: LAKE_RADIUS + 1 },
    ],
  });

  // try GLB first for variety, fall back to per-tree primitives
  const tallGlb = await loadModel('/models/tree_tall.glb');
  const smallGlb = await loadModel('/models/tree_small.glb');
  const useGlb = !!(tallGlb || smallGlb);

  for (const { x, z, scale, rot } of placements) {
    const variant = pickTreeVariant();
    let tree;
    if (useGlb && variant !== 'dead' && variant !== 'bush' && variant !== 'mushroomTree') {
      const src = variant === 'fir' ? tallGlb : smallGlb || tallGlb;
      tree = src.clone(true);
      tree.scale.setScalar(scale * 1.5);
    } else {
      tree = buildTreeVariant(variant, scale);
    }
    tree.position.set(x, 0, z);
    tree.rotation.y = rot;
    // shadow casting on dozens of trees is too expensive — they read fine
    // without it, especially backlit by the campfire and fireflies
    scene.add(tree);
  }

  // a handful of bushes inside the safer zone for filler greenery —
  // also kept out of the camera's view cone
  for (let i = 0; i < 10; i++) {
    const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
    const r = SAFE_RADIUS - 1 + Math.random() * 1.5;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z) < LAKE_RADIUS) continue;
    const bush = buildBush(0.7 + Math.random() * 0.4);
    bush.position.set(x, 0, z);
    bush.rotation.y = Math.random() * Math.PI;
    scene.add(bush);
  }
}

function pickTreeVariant() {
  const r = Math.random();
  if (r < 0.45) return 'fir';
  if (r < 0.75) return 'oak';
  if (r < 0.85) return 'dead';
  if (r < 0.93) return 'bush';
  return 'mushroomTree';
}

function buildTreeVariant(variant, scale) {
  switch (variant) {
    case 'fir':
      return buildFir(scale);
    case 'oak':
      return buildOak(scale);
    case 'dead':
      return buildDeadTree(scale);
    case 'bush':
      return buildBush(scale);
    case 'mushroomTree':
      return buildMushroomTree(scale);
    default:
      return buildFir(scale);
  }
}

function buildFir(scale) {
  const tree = new THREE.Group();
  const trunkH = 1.6 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, trunkH, 6),
    MAT.trunk
  );
  trunk.position.y = trunkH / 2;
  tree.add(trunk);

  // 3-4 stacked cones, slightly varied
  const layers = 3 + (Math.random() > 0.5 ? 1 : 0);
  for (let i = 0; i < layers; i++) {
    const radius = (1.4 - i * 0.22) * scale;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(radius, 1.5 * scale, 7),
      i % 2 === 0 ? MAT.fir : MAT.firDeep
    );
    cone.position.y = trunkH + i * 0.85 * scale;
    cone.rotation.y = Math.random() * Math.PI;
    tree.add(cone);
  }

  // tip
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.3 * scale, 0.6 * scale, 5),
    MAT.fir
  );
  tip.position.y = trunkH + layers * 0.85 * scale + 0.1;
  tree.add(tip);

  return tree;
}

function buildOak(scale) {
  const tree = new THREE.Group();
  const trunkH = 1.5 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.4 * scale, trunkH, 7),
    MAT.trunkPale
  );
  trunk.position.y = trunkH / 2;
  tree.add(trunk);

  // a couple of branch stubs
  for (let i = 0; i < 2; i++) {
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 0.6 * scale, 5),
      MAT.trunkPale
    );
    const angle = Math.random() * Math.PI * 2;
    branch.position.set(Math.cos(angle) * 0.15, trunkH * 0.6, Math.sin(angle) * 0.15);
    branch.rotation.z = Math.PI / 3;
    branch.rotation.y = -angle;
    tree.add(branch);
  }

  // crown made of 3-5 overlapping icosahedrons (organic blob look)
  const blobCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < blobCount; i++) {
    const size = (1.0 + Math.random() * 0.4) * scale;
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, 0),
      Math.random() > 0.5 ? MAT.oak : MAT.oakBright
    );
    blob.position.set(
      (Math.random() - 0.5) * 0.6 * scale,
      trunkH + 0.6 * scale + Math.random() * 0.3 * scale,
      (Math.random() - 0.5) * 0.6 * scale
    );
    blob.scale.set(1, 0.85 + Math.random() * 0.3, 1);
    tree.add(blob);
  }

  return tree;
}

function buildDeadTree(scale) {
  const tree = new THREE.Group();
  const trunkH = 2.0 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.28 * scale, trunkH, 6),
    MAT.trunkDead
  );
  trunk.position.y = trunkH / 2;
  trunk.rotation.z = (Math.random() - 0.5) * 0.15;
  tree.add(trunk);

  // 3-5 bare branches forking up
  const branchCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2 + Math.random();
    const len = (0.8 + Math.random() * 0.6) * scale;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, len, 5),
      MAT.trunkDead
    );
    branch.position.set(
      Math.cos(angle) * 0.05,
      trunkH + len / 2 - 0.2,
      Math.sin(angle) * 0.05
    );
    branch.rotation.set(
      Math.cos(angle) * 0.6,
      0,
      Math.sin(angle) * 0.6
    );
    tree.add(branch);
  }

  return tree;
}

function buildBush(scale) {
  const bush = new THREE.Group();
  const blobs = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < blobs; i++) {
    const size = (0.4 + Math.random() * 0.3) * scale;
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, 0),
      Math.random() > 0.5 ? MAT.bush : MAT.oak
    );
    blob.position.set(
      (Math.random() - 0.5) * 0.4,
      size * 0.7,
      (Math.random() - 0.5) * 0.4
    );
    bush.add(blob);
  }
  return bush;
}

function buildMushroomTree(scale) {
  const tree = new THREE.Group();
  const trunkH = 1.4 * scale;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.26 * scale, trunkH, 8),
    MAT.mushroomStem
  );
  stem.position.y = trunkH / 2;
  tree.add(stem);

  // big domed cap
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.85 * scale, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mushroomCap
  );
  cap.position.y = trunkH;
  cap.scale.y = 0.7;
  tree.add(cap);

  // white spots
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.6 * scale;
    const spot = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 * scale, 6, 6),
      MAT.mushroomStem
    );
    spot.position.set(
      Math.cos(angle) * dist,
      trunkH + 0.4 * scale,
      Math.sin(angle) * dist
    );
    tree.add(spot);
  }

  return tree;
}

// ---------------- lake ----------------

// deterministic shoreline radius at a given angle — used by water shape,
// deep-water ring, and the shoreline stones so they all hug the same edge
function lakeRadiusAt(angle) {
  const stretch = 1.18; // slight oval
  const r = LAKE_RADIUS * (
    1
    + Math.sin(angle * 1.7 + 0.6) * 0.14
    + Math.sin(angle * 3.3 + 2.1) * 0.09
    + Math.cos(angle * 2.4 - 1.2) * 0.07
  );
  // apply x-stretch via direction-dependent scale
  return { x: Math.cos(angle) * r * stretch, z: Math.sin(angle) * r };
}

function buildLakeShape(scaleR = 1.0) {
  const shape = new THREE.Shape();
  const segments = 60;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const p = lakeRadiusAt(a);
    const x = p.x * scaleR;
    const y = p.z * scaleR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape, 1);
}

function addLake(scene) {
  const group = new THREE.Group();
  group.position.copy(LAKE_CENTER);
  scene.add(group);

  // irregular water surface
  const water = new THREE.Mesh(buildLakeShape(1.0), MAT.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.05;
  water.receiveShadow = true;
  group.add(water);

  // darker irregular deep-water inner pool
  const deep = new THREE.Mesh(
    buildLakeShape(0.62),
    new THREE.MeshStandardMaterial({
      color: 0x152838,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75,
    })
  );
  deep.rotation.x = -Math.PI / 2;
  deep.position.y = 0.06;
  // slight rotational offset so the deep pool's wobble doesn't perfectly mirror the surface
  deep.rotation.z = 0.4;
  group.add(deep);

  // muddy shore band — slightly larger than the water, slightly opaque,
  // makes the transition from grass to water feel gradual
  const shore = new THREE.Mesh(
    buildLakeShape(1.15),
    new THREE.MeshStandardMaterial({
      color: 0x3a3024,
      roughness: 1,
      transparent: true,
      opacity: 0.55,
    })
  );
  shore.rotation.x = -Math.PI / 2;
  shore.position.y = 0.025;
  group.add(shore);

  // moonlight glint streak (sprite)
  const glint = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 0.6),
    new THREE.MeshBasicMaterial({
      map: makeGlintTexture(),
      transparent: true,
      depthWrite: false,
    })
  );
  glint.rotation.x = -Math.PI / 2;
  glint.position.set(-1.2, 0.07, 0.5);
  group.add(glint);

  // lily pads (placed inside the irregular shape: take a random angle then
  // scale toward center so we know we're inside)
  for (let i = 0; i < 7; i++) {
    const angle = Math.random() * Math.PI * 2;
    const edge = lakeRadiusAt(angle);
    const t = 0.15 + Math.random() * 0.7;
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(0.18 + Math.random() * 0.1, 6),
      MAT.lilyPad
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(edge.x * t, 0.07, edge.z * t);
    pad.rotation.z = Math.random() * Math.PI;
    group.add(pad);

    if (Math.random() > 0.6) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffe0e8, roughness: 0.8, flatShading: true })
      );
      flower.position.copy(pad.position);
      flower.position.y += 0.04;
      group.add(flower);
    }
  }

  // shoreline stones — hugging the irregular water edge by sampling lakeRadiusAt
  const stoneCount = 28;
  for (let i = 0; i < stoneCount; i++) {
    const angle = (i / stoneCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
    const edge = lakeRadiusAt(angle);
    // push the stone slightly outside the water edge along the radial direction
    const len = Math.hypot(edge.x, edge.z);
    const nx = edge.x / len;
    const nz = edge.z / len;
    const offset = 0.05 + Math.random() * 0.35;
    const size = 0.18 + Math.random() * 0.2;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      Math.random() > 0.7 ? MAT.rockMoss : Math.random() > 0.5 ? MAT.rockDark : MAT.rock
    );
    stone.scale.set(1.0, 0.6 + Math.random() * 0.3, 1.0);
    stone.position.set(edge.x + nx * offset, size * 0.3, edge.z + nz * offset);
    stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
  }

  // reeds clustered on a couple of edges — also hug the irregular shoreline
  const reedClusters = 4;
  for (let c = 0; c < reedClusters; c++) {
    const baseAngle = (c / reedClusters) * Math.PI * 2 + 0.4;
    for (let i = 0; i < 6; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.3;
      const edge = lakeRadiusAt(angle);
      const len = Math.hypot(edge.x, edge.z);
      const nx = edge.x / len;
      const nz = edge.z / len;
      const offset = 0.25 + Math.random() * 0.4;
      const reedH = 0.7 + Math.random() * 0.5;
      const reed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.025, reedH, 4),
        MAT.reed
      );
      reed.position.set(edge.x + nx * offset, reedH / 2, edge.z + nz * offset);
      reed.rotation.z = (Math.random() - 0.5) * 0.2;
      group.add(reed);

      // cattail top on some
      if (Math.random() > 0.5) {
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6),
          MAT.reedTop
        );
        top.position.set(reed.position.x, reedH, reed.position.z);
        group.add(top);
      }
    }
  }
}

function makeGlintTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 4;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(220,230,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size / 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------- rocks ----------------

function addRocks(scene) {
  const clusterCount = 14;
  const placements = generatePlacements(clusterCount, {
    minR: 4,
    maxR: 20,
    spacing: 2.0,
    extraExclusions: [
      { center: LAKE_CENTER, radius: LAKE_RADIUS + 0.5 },
    ],
  });

  for (const p of placements) {
    const cluster = buildRockCluster();
    cluster.position.set(p.x, 0, p.z);
    cluster.rotation.y = Math.random() * Math.PI;
    scene.add(cluster);
  }

  // a few solo larger rocks — restricted to the back ¾ so none land in front of statues
  for (let i = 0; i < 5; i++) {
    const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
    const r = 8 + Math.random() * 12;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z) < LAKE_RADIUS + 0.5) continue;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3, 0),
      Math.random() > 0.5 ? MAT.rockDark : MAT.rock
    );
    rock.position.set(x, 0.2, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.scale.set(1.0, 0.7 + Math.random() * 0.3, 1.0);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }
}

function buildRockCluster() {
  const group = new THREE.Group();
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const size = 0.18 + Math.random() * 0.35;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      i === 0 || Math.random() > 0.6 ? MAT.rockDark : Math.random() > 0.7 ? MAT.rockMoss : MAT.rock
    );
    rock.position.set(
      (Math.random() - 0.5) * 0.7,
      size * 0.4,
      (Math.random() - 0.5) * 0.7
    );
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.scale.set(1.0, 0.6 + Math.random() * 0.4, 1.0);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }
  return group;
}

// ---------------- grass tufts ----------------

function addGrass(scene) {
  // many grass patches scattered over the clearing rim and out into the forest
  // (count kept modest — each tuft is ~5 cone meshes)
  const count = 75;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 16;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    // skip lake
    if (Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z) < LAKE_RADIUS + 0.3) continue;
    // skip directly under the hut
    if (Math.hypot(x, z + 3) < 2.0) continue;
    const tuft = makeGrassTuft();
    tuft.position.set(x, 0, z);
    tuft.rotation.y = Math.random() * Math.PI;
    scene.add(tuft);
  }
}

function makeGrassTuft() {
  const group = new THREE.Group();
  const blades = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < blades; i++) {
    const h = 0.15 + Math.random() * 0.18;
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, h, 3),
      Math.random() > 0.7 ? MAT.bush : MAT.grass
    );
    const a = (i / blades) * Math.PI * 2 + Math.random();
    blade.position.set(Math.cos(a) * 0.04, h / 2, Math.sin(a) * 0.04);
    blade.rotation.set(
      (Math.random() - 0.5) * 0.4,
      Math.random() * Math.PI,
      (Math.random() - 0.5) * 0.4
    );
    group.add(blade);
  }
  return group;
}

// ---------------- mushroom patches ----------------

function addMushroomPatches(scene) {
  // a few small fairy rings scattered among the trees — restricted to the back
  // ¾ so they don't appear in front of the elemental statues
  const ringCount = 4;
  for (let r = 0; r < ringCount; r++) {
    const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
    const radius = 8 + Math.random() * 10;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    if (Math.hypot(cx - LAKE_CENTER.x, cz - LAKE_CENTER.z) < LAKE_RADIUS + 1) continue;

    const mushCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < mushCount; i++) {
      const t = i / mushCount;
      const a = t * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.4;
      const big = Math.random() > 0.7;
      const mush = makeMushroom(big);
      mush.position.set(
        cx + Math.cos(a) * r,
        0,
        cz + Math.sin(a) * r
      );
      mush.rotation.y = Math.random() * Math.PI;
      scene.add(mush);
    }
  }
}

function makeMushroom(big) {
  const group = new THREE.Group();
  const size = big ? 1 : 0.55;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * size, 0.08 * size, 0.32 * size, 8),
    MAT.mushroomStem
  );
  stem.position.y = 0.16 * size;
  group.add(stem);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.18 * size, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mushroomCap
  );
  cap.position.y = 0.32 * size;
  cap.scale.y = 0.8;
  group.add(cap);

  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.13 * size;
    const spot = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * size, 6, 6),
      MAT.mushroomStem
    );
    spot.position.set(
      Math.cos(angle) * r,
      0.32 * size + 0.04 * size,
      Math.sin(angle) * r
    );
    group.add(spot);
  }
  return group;
}

// ---------------- stumps ----------------

function addStumps(scene) {
  for (let i = 0; i < 4; i++) {
    const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
    const r = 7 + Math.random() * 9;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z) < LAKE_RADIUS + 0.5) continue;

    const stump = new THREE.Group();
    const main = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.4, 0.5, 8),
      MAT.stump
    );
    main.position.y = 0.25;
    stump.add(main);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.04, 8),
      MAT.stumpTop
    );
    top.position.y = 0.5;
    stump.add(top);

    // a couple of small mushrooms on the stump
    if (Math.random() > 0.5) {
      for (let j = 0; j < 2; j++) {
        const m = makeMushroom(false);
        m.position.set(
          (Math.random() - 0.5) * 0.3,
          0.52,
          (Math.random() - 0.5) * 0.3
        );
        stump.add(m);
      }
    }

    stump.position.set(x, 0, z);
    stump.rotation.y = Math.random() * Math.PI;
    scene.add(stump);
  }
}

// ---------------- placement helper ----------------

function generatePlacements(count, opts) {
  const {
    minR,
    maxR,
    spacing,
    angleStart = 0,
    angleEnd = Math.PI * 2,
    extraExclusions = [],
  } = opts;
  const placements = [];
  let attempts = 0;
  while (placements.length < count && attempts < count * 20) {
    attempts++;
    const angle = angleStart + Math.random() * (angleEnd - angleStart);
    const r = minR + Math.random() * (maxR - minR);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    // outer wall: not too close to scene origin
    if (Math.hypot(x, z) < SAFE_RADIUS) continue;

    // extra exclusions (e.g. lake)
    let blocked = false;
    for (const ex of extraExclusions) {
      if (Math.hypot(x - ex.center.x, z - ex.center.z) < ex.radius) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    // spacing from existing placements
    if (placements.some((p) => Math.hypot(p.x - x, p.z - z) < spacing)) continue;

    placements.push({
      x,
      z,
      scale: 0.8 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
    });
  }
  return placements;
}

// ---------------- fallen logs ----------------

function addFallenLogs(scene) {
  const placements = generatePlacements(7, {
    minR: 8,
    maxR: 18,
    spacing: 3,
    angleStart: TREE_ANGLE_START,
    angleEnd: TREE_ANGLE_END,
    extraExclusions: [{ center: LAKE_CENTER, radius: LAKE_RADIUS + 1 }],
  });

  for (const p of placements) {
    const log = buildFallenLog();
    log.position.set(p.x, 0, p.z);
    log.rotation.y = p.rot;
    scene.add(log);
  }
}

function buildFallenLog() {
  const group = new THREE.Group();

  // main log lying horizontally (cylinder along X)
  const length = 1.8 + Math.random() * 1.2;
  const radius = 0.18 + Math.random() * 0.08;
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.9, length, 8),
    Math.random() > 0.5 ? MAT.trunk : MAT.trunkDead
  );
  log.rotation.z = Math.PI / 2;
  log.position.y = radius;
  group.add(log);

  // a couple of broken-end discs (cut faces)
  for (const sign of [-1, 1]) {
    const cut = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.95, 12),
      MAT.stumpTop
    );
    cut.position.set(sign * length / 2, radius, 0);
    cut.rotation.y = sign * Math.PI / 2;
    group.add(cut);
  }

  // moss patches on top
  for (let i = 0; i < 3; i++) {
    const moss = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius * 0.6, 0),
      MAT.bush
    );
    moss.position.set(
      (Math.random() - 0.5) * length * 0.7,
      radius + 0.05,
      (Math.random() - 0.5) * 0.1
    );
    moss.scale.set(1, 0.4, 1.1);
    group.add(moss);
  }

  // mushrooms growing on the log
  if (Math.random() > 0.4) {
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      const m = makeMushroom(false);
      m.position.set(
        (Math.random() - 0.5) * length * 0.7,
        radius * 1.5,
        (Math.random() - 0.5) * 0.05
      );
      m.scale.setScalar(0.7);
      group.add(m);
    }
  }

  return group;
}

// ---------------- firewood stack near the campfire ----------------

function addFirewoodStack(scene) {
  // stack near the campfire (campfire is at z=1.8). place to one side.
  const cx = -2.5;
  const cz = 1.5;
  const group = new THREE.Group();
  group.position.set(cx, 0, cz);
  group.rotation.y = -0.4;

  const rows = 4;
  const cols = 5;
  const logRadius = 0.085;
  const logLength = 1.0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // slight random skip to make it look organic
      if (row === rows - 1 && Math.random() > 0.6) continue;

      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(logRadius, logRadius, logLength, 6),
        Math.random() > 0.5 ? MAT.trunk : MAT.trunkPale
      );
      log.rotation.z = Math.PI / 2;
      log.position.set(
        (Math.random() - 0.5) * 0.04,
        logRadius + row * (logRadius * 2 + 0.005),
        -logRadius * (cols - 1) + col * (logRadius * 2.05) + (row % 2) * logRadius
      );
      log.castShadow = true;
      log.receiveShadow = true;
      group.add(log);
    }
  }

  // a couple of vertical end-stops (sticks driven into the ground at each end)
  for (const z of [-(cols * logRadius + 0.05), cols * logRadius + 0.05]) {
    const stake = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5),
      MAT.trunkDead
    );
    stake.position.set(0, 0.6, z);
    group.add(stake);
  }

  scene.add(group);
}

// ---------------- stone path ----------------

function addStonePath(scene) {
  // a short cobblestone path leading toward the wagon's foldout step
  // wagon is at (0, 0, -3), rotated by +27° around Y, with step at +X local end.
  // The step lands at world ~(2.0, 0, -2.2). Path runs from there toward the campfire.
  const start = new THREE.Vector3(2.0, 0, -2.0);
  const end = new THREE.Vector3(0.5, 0, 1.6);
  const stones = 18;

  for (let i = 0; i < stones; i++) {
    const t = i / (stones - 1);
    const px = THREE.MathUtils.lerp(start.x, end.x, t) + (Math.random() - 0.5) * 0.5;
    const pz = THREE.MathUtils.lerp(start.z, end.z, t) + (Math.random() - 0.5) * 0.3;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.16 + Math.random() * 0.09, 0),
      Math.random() > 0.5 ? MAT.cobble : MAT.cobbleDark
    );
    stone.position.set(px, 0.04, pz);
    stone.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    stone.scale.set(1, 0.35, 1);
    stone.receiveShadow = true;
    scene.add(stone);
  }
}

// ---------------- glowing magical flowers ----------------

function addGlowingFlowers(scene) {
  // scatter glowing flowers around the lake edge and through the forest
  const palette = [MAT.flowerCyan, MAT.flowerMagenta, MAT.flowerGold];
  const total = 38;
  let placed = 0;
  let tries = 0;

  while (placed < total && tries < total * 8) {
    tries++;

    // bias 60% to lake edge, 40% to forest
    let x, z;
    if (Math.random() < 0.6) {
      const angle = Math.random() * Math.PI * 2;
      const r = LAKE_RADIUS + 0.4 + Math.random() * 1.5;
      x = LAKE_CENTER.x + Math.cos(angle) * r;
      z = LAKE_CENTER.z + Math.sin(angle) * r;
    } else {
      const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
      const r = 6 + Math.random() * 12;
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
    }

    // skip the safe zone
    if (Math.hypot(x, z) < SAFE_RADIUS - 1) continue;
    if (Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z) < LAKE_RADIUS - 0.2) continue;

    const flower = buildGlowFlower(palette[Math.floor(Math.random() * palette.length)]);
    flower.position.set(x, 0, z);
    flower.rotation.y = Math.random() * Math.PI * 2;
    scene.add(flower);
    placed++;
  }
}

function buildGlowFlower(petalMat) {
  const group = new THREE.Group();

  // stem
  const stemH = 0.22 + Math.random() * 0.18;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, stemH, 5),
    MAT.flowerStem
  );
  stem.position.y = stemH / 2;
  stem.rotation.z = (Math.random() - 0.5) * 0.2;
  group.add(stem);

  // 4-5 small petals splayed outward
  const petalCount = 4 + Math.floor(Math.random() * 2);
  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 6, 6),
      petalMat
    );
    petal.position.set(Math.cos(a) * 0.05, stemH + 0.02, Math.sin(a) * 0.05);
    petal.scale.set(1, 0.45, 1);
    group.add(petal);
  }

  // glowing core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    petalMat
  );
  core.position.y = stemH + 0.04;
  group.add(core);

  // small leaves at the base
  for (let i = 0; i < 2; i++) {
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.05, 0),
      MAT.flowerStem
    );
    leaf.position.set(
      (Math.random() - 0.5) * 0.06,
      0.04,
      (Math.random() - 0.5) * 0.06
    );
    leaf.scale.set(1.1, 0.4, 0.8);
    group.add(leaf);
  }

  return group;
}

// ---------------- pumpkins ----------------

function addPumpkins(scene) {
  // a few pumpkins scattered around the clearing edge — kept clear of the
  // statue arc on the right (+X +Z quadrant)
  const spots = [
    { x: -2.7, z: 2.5 },
    { x: -3.2, z: -1.8 },
    { x: -4.0, z: 0.6 },
    { x: -1.8, z: 4.0 },
    { x: -3.6, z: 3.2 },
    { x: -1.2, z: -4.2 },
  ];
  for (const s of spots) {
    const p = buildPumpkin(0.25 + Math.random() * 0.18);
    p.position.set(s.x + (Math.random() - 0.5) * 0.3, 0, s.z + (Math.random() - 0.5) * 0.3);
    p.rotation.y = Math.random() * Math.PI * 2;
    scene.add(p);
  }
}

function buildPumpkin(size) {
  const group = new THREE.Group();

  // body — lobed shape: 6 overlapping spheres around a center
  const lobeCount = 6;
  for (let i = 0; i < lobeCount; i++) {
    const a = (i / lobeCount) * Math.PI * 2;
    const lobe = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.65, 10, 8),
      MAT.pumpkin
    );
    lobe.position.set(Math.cos(a) * size * 0.22, size * 0.55, Math.sin(a) * size * 0.22);
    lobe.scale.set(0.6, 1, 0.6);
    group.add(lobe);
  }

  // central core sphere to fill any gaps
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.6, 10, 8),
    MAT.pumpkin
  );
  core.position.y = size * 0.55;
  core.scale.set(1, 0.85, 1);
  group.add(core);

  // stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.08, size * 0.1, size * 0.22, 6),
    MAT.pumpkinStem
  );
  stem.position.y = size * 1.05;
  stem.rotation.z = (Math.random() - 0.5) * 0.3;
  group.add(stem);

  // a curling vine tendril
  const tendril = new THREE.Mesh(
    new THREE.TorusGeometry(size * 0.1, size * 0.018, 4, 8, Math.PI * 1.4),
    MAT.pumpkinStem
  );
  tendril.position.set(size * 0.06, size * 1.1, 0);
  tendril.rotation.set(Math.PI / 4, 0, Math.PI / 4);
  group.add(tendril);

  return group;
}

// ---------------- lanterns hanging from tree branches ----------------

function addTreeLanterns(scene) {
  // a couple of lanterns hanging mid-air to suggest they're tied to branches
  const spots = [
    { x: -6, y: 2.6, z: 4 },
    { x: -5, y: 2.4, z: -6 },
    { x: 7, y: 2.5, z: -10 },
  ];
  for (const s of spots) {
    const lantern = buildHangingLantern();
    lantern.position.set(s.x, s.y, s.z);
    scene.add(lantern);
    // (lantern core uses an emissive basic material — no point light)

    // a thin "rope" descending from invisible branch to the lantern
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 1.0, 4),
      MAT.iron
    );
    rope.position.set(s.x, s.y + 0.5, s.z);
    scene.add(rope);
  }
}

function buildHangingLantern() {
  const g = new THREE.Group();

  // body posts
  for (const [dx, dz] of [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06], [0.06, 0.06]]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.24, 0.018),
      MAT.iron
    );
    post.position.set(dx, 0, dz);
    g.add(post);
  }
  for (const y of [-0.12, 0.12]) {
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.02, 0.16),
      MAT.iron
    );
    rim.position.y = y;
    g.add(rim);
  }
  // glowing core
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.18, 0.1),
    MAT.glassWarm
  );
  g.add(core);
  // pyramid cap
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.1, 4),
    MAT.iron
  );
  cap.position.y = 0.18;
  cap.rotation.y = Math.PI / 4;
  g.add(cap);

  return g;
}

// ---------------- distant mountains backdrop ----------------

const MOUNTAIN_MAT = {
  near: new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 1,
    flatShading: true,
  }),
  far: new THREE.MeshStandardMaterial({
    color: 0x1e2032,
    roughness: 1,
    flatShading: true,
  }),
  snow: new THREE.MeshStandardMaterial({
    color: 0xb8c8e0,
    roughness: 0.9,
    flatShading: true,
  }),
};

function addMountains(scene) {
  // two depth layers — nearer chunkier silhouettes + a hazier far ridge.
  // counts trimmed down — each mountain is ~3 cone meshes, this adds up
  const layers = [
    { count: 9, distMin: 28, distMax: 40, hMin: 5, hMax: 11, mat: MOUNTAIN_MAT.near, snow: true },
    { count: 11, distMin: 42, distMax: 58, hMin: 4, hMax: 8, mat: MOUNTAIN_MAT.far, snow: false },
  ];

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      // angle in the back 3/4 (avoid the camera-facing quadrant)
      const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
      const dist = layer.distMin + Math.random() * (layer.distMax - layer.distMin);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const mountain = buildMountain(layer.hMin, layer.hMax, layer.mat, layer.snow);
      mountain.position.set(x, 0, z);
      mountain.rotation.y = Math.random() * Math.PI * 2;
      // mountains are big enough not to need shadow casting
      scene.add(mountain);
    }
  }
}

function buildMountain(hMin, hMax, mat, withSnow) {
  const group = new THREE.Group();
  const height = hMin + Math.random() * (hMax - hMin);
  const baseRadius = height * (0.55 + Math.random() * 0.25);

  // main jagged peak — cone with low segment count for faceted shape
  const peak = new THREE.Mesh(
    new THREE.ConeGeometry(baseRadius, height, 5 + Math.floor(Math.random() * 3)),
    mat
  );
  peak.position.y = height / 2;
  peak.rotation.y = Math.random() * Math.PI;
  // squash slightly to vary silhouettes
  peak.scale.set(1, 0.85 + Math.random() * 0.3, 1);
  group.add(peak);

  // a secondary lower peak to one side for a chunkier silhouette
  if (Math.random() > 0.4) {
    const sideHeight = height * (0.45 + Math.random() * 0.3);
    const side = new THREE.Mesh(
      new THREE.ConeGeometry(baseRadius * 0.7, sideHeight, 5),
      mat
    );
    const a = Math.random() * Math.PI * 2;
    const off = baseRadius * 0.65;
    side.position.set(Math.cos(a) * off, sideHeight / 2, Math.sin(a) * off);
    side.rotation.y = Math.random() * Math.PI;
    group.add(side);
  }

  // snow cap
  if (withSnow && Math.random() > 0.25) {
    const capH = height * 0.25;
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(baseRadius * 0.35, capH, 5),
      MOUNTAIN_MAT.snow
    );
    cap.position.y = height - capH * 0.5 - 0.05;
    cap.rotation.y = peak.rotation.y;
    group.add(cap);
  }

  return group;
}

// ---------------- additional background trees (further out) ----------------

function addBackgroundTrees(scene) {
  // a denser ring of trees beyond the main forest, fogged out for depth
  const placements = generatePlacements(30, {
    minR: 22,
    maxR: 32,
    spacing: 2.0,
    angleStart: TREE_ANGLE_START,
    angleEnd: TREE_ANGLE_END,
    extraExclusions: [{ center: LAKE_CENTER, radius: LAKE_RADIUS + 1 }],
  });

  for (const p of placements) {
    const tree = Math.random() > 0.5 ? buildBackgroundFir(p.scale) : buildBackgroundOak(p.scale);
    tree.position.set(p.x, 0, p.z);
    tree.rotation.y = p.rot;
    // keep these out of shadow casting (they're far + the scene already has many)
    scene.add(tree);
  }

  // even further out, a faint silhouette ring of small dark trees
  for (let i = 0; i < 12; i++) {
    const angle = TREE_ANGLE_START + Math.random() * (TREE_ANGLE_END - TREE_ANGLE_START);
    const r = 33 + Math.random() * 12;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const tree = buildSilhouetteTree(0.7 + Math.random() * 0.5);
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI;
    scene.add(tree);
  }
}

function buildBackgroundFir(scale) {
  const tree = new THREE.Group();
  const trunkH = 1.8 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2 * scale, 0.34 * scale, trunkH, 6),
    MAT.trunk
  );
  trunk.position.y = trunkH / 2;
  tree.add(trunk);

  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const radius = (1.5 - i * 0.22) * scale;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(radius, 1.6 * scale, 7),
      i % 2 === 0 ? MAT.fir : MAT.firDeep
    );
    cone.position.y = trunkH + i * 0.95 * scale;
    cone.rotation.y = Math.random() * Math.PI;
    tree.add(cone);
  }
  return tree;
}

function buildBackgroundOak(scale) {
  const tree = new THREE.Group();
  const trunkH = 1.7 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * scale, 0.42 * scale, trunkH, 7),
    MAT.trunkPale
  );
  trunk.position.y = trunkH / 2;
  tree.add(trunk);

  const blobCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < blobCount; i++) {
    const size = (1.2 + Math.random() * 0.4) * scale;
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, 0),
      Math.random() > 0.5 ? MAT.oak : MAT.oakBright
    );
    blob.position.set(
      (Math.random() - 0.5) * 0.7 * scale,
      trunkH + 0.7 * scale + Math.random() * 0.3 * scale,
      (Math.random() - 0.5) * 0.7 * scale
    );
    blob.scale.set(1, 0.85 + Math.random() * 0.3, 1);
    tree.add(blob);
  }
  return tree;
}

function buildSilhouetteTree(scale) {
  // simplified, dark, just a trunk and a single conical crown — meant to read as a silhouette in the fog
  const tree = new THREE.Group();
  const trunkH = 1.6 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, trunkH, 5),
    MAT.trunkDead
  );
  trunk.position.y = trunkH / 2;
  tree.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(1.0 * scale, 2.5 * scale, 6),
    MAT.firDeep
  );
  crown.position.y = trunkH + 1.0 * scale;
  tree.add(crown);
  return tree;
}

// ---------------- distant boulders / outcrops ----------------

function addDistantBoulders(scene) {
  // a few large standing rock outcrops in the middle distance to break up the silhouette
  const placements = generatePlacements(8, {
    minR: 18,
    maxR: 28,
    spacing: 3.5,
    angleStart: TREE_ANGLE_START,
    angleEnd: TREE_ANGLE_END,
    extraExclusions: [{ center: LAKE_CENTER, radius: LAKE_RADIUS + 1 }],
  });

  for (const p of placements) {
    const boulder = buildBoulderOutcrop();
    boulder.position.set(p.x, 0, p.z);
    boulder.rotation.y = Math.random() * Math.PI * 2;
    scene.add(boulder);
  }
}

function buildBoulderOutcrop() {
  const group = new THREE.Group();
  // 3-5 stacked / leaning boulders
  const count = 3 + Math.floor(Math.random() * 3);
  let prevTop = 0;
  for (let i = 0; i < count; i++) {
    const size = 0.7 + Math.random() * 0.7;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      Math.random() > 0.6 ? MAT.rockMoss : Math.random() > 0.5 ? MAT.rockDark : MAT.rock
    );
    rock.position.set(
      (Math.random() - 0.5) * 0.8,
      prevTop + size * 0.8,
      (Math.random() - 0.5) * 0.8
    );
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.scale.set(1, 0.7 + Math.random() * 0.4, 1);
    prevTop = rock.position.y + size * 0.5;
    group.add(rock);
  }
  return group;
}

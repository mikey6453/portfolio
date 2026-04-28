import * as THREE from 'three';

// each firefly drifts around its anchor point on offset sine waves;
// brightness pulses on its own slow cycle.
// total: ~50 fireflies — only 4 carry actual point lights to keep the shader cheap.

const FIREFLY_COUNT = 50;
// no point lights — additive emissive material is enough atmosphere on its own
const LIT_COUNT = 0;

export function createFireflies(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const geom = new THREE.SphereGeometry(0.05, 6, 6);
  const flies = [];

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const anchor = pickAnchor();
    const mat = new THREE.MeshBasicMaterial({
      color: 0xfff0a0,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(anchor);
    group.add(mesh);

    // every Nth firefly carries a soft light
    let light = null;
    if (i < LIT_COUNT) {
      light = new THREE.PointLight(0xfff0a0, 0.4, 3.5, 2);
      mesh.add(light);
    }

    flies.push({
      mesh,
      mat,
      light,
      anchor: anchor.clone(),
      // wandering parameters
      sx: 0.3 + Math.random() * 0.7,
      sy: 0.15 + Math.random() * 0.35,
      sz: 0.3 + Math.random() * 0.7,
      // amplitudes
      ax: 0.6 + Math.random() * 1.4,
      ay: 0.3 + Math.random() * 0.6,
      az: 0.6 + Math.random() * 1.4,
      // phases
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      pz: Math.random() * Math.PI * 2,
      // brightness flicker
      flickerSpeed: 0.7 + Math.random() * 1.6,
      flickerPhase: Math.random() * Math.PI * 2,
    });
  }

  function update(t) {
    for (const f of flies) {
      f.mesh.position.set(
        f.anchor.x + Math.sin(t * f.sx + f.px) * f.ax,
        f.anchor.y + Math.sin(t * f.sy + f.py) * f.ay,
        f.anchor.z + Math.cos(t * f.sz + f.pz) * f.az
      );
      // soft pulsing brightness — never goes fully out, low end ~0.3
      const pulse = 0.6 + Math.sin(t * f.flickerSpeed + f.flickerPhase) * 0.35;
      f.mat.opacity = pulse;
      if (f.light) f.light.intensity = 0.35 * pulse;
    }
  }

  return update;
}

// scatter anchors across the scene — most in the forest, some near the lake
function pickAnchor() {
  const choice = Math.random();
  if (choice < 0.55) {
    // ring around the clearing, at varied heights
    const angle = Math.random() * Math.PI * 2;
    const r = 5 + Math.random() * 12;
    return new THREE.Vector3(
      Math.cos(angle) * r,
      0.5 + Math.random() * 2.5,
      Math.sin(angle) * r
    );
  } else if (choice < 0.85) {
    // around the lake (at 11, 0, -8 with radius ~4)
    const angle = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 3.5;
    return new THREE.Vector3(
      11 + Math.cos(angle) * r,
      0.4 + Math.random() * 1.5,
      -8 + Math.sin(angle) * r
    );
  } else {
    // a few near the wagon and campfire
    return new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      0.8 + Math.random() * 2.2,
      -1 + Math.random() * 4
    );
  }
}

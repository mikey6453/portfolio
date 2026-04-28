import * as THREE from 'three';

export function createCampfire(scene) {
  const group = new THREE.Group();
  group.position.set(0, 0, 1.8);
  scene.add(group);

  // stones in a ring
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.06),
      stoneMat
    );
    stone.position.set(Math.cos(angle) * 0.7, 0.05, Math.sin(angle) * 0.7);
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    stone.castShadow = true;
    group.add(stone);
  }

  // crossed logs
  const logMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.95 });
  const logCount = 4;
  for (let i = 0; i < logCount; i++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6),
      logMat
    );
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / logCount) * Math.PI;
    log.position.y = 0.18;
    log.castShadow = true;
    group.add(log);
  }

  // flame cones (two stacked, basic material so they self-glow)
  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 1.1, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff7733,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    })
  );
  outerFlame.position.y = 0.75;
  group.add(outerFlame);

  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.75, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffd866,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
  );
  innerFlame.position.y = 0.65;
  group.add(innerFlame);

  // the actual light source — shadow casting disabled to keep frame budget tight
  const light = new THREE.PointLight(0xff8844, 2.4, 18, 1.6);
  light.position.set(0, 1.0, 0);
  group.add(light);

  // embers (drifting particles)
  const embers = createEmbers();
  group.add(embers.mesh);

  return (t) => {
    const flicker = Math.sin(t * 12) * 0.15 + Math.sin(t * 31.7) * 0.1 + Math.random() * 0.25;
    light.intensity = 2.4 + flicker;
    outerFlame.scale.set(1 + flicker * 0.15, 1 + flicker * 0.4, 1 + flicker * 0.15);
    innerFlame.scale.set(1 + flicker * 0.2, 1 + flicker * 0.55, 1 + flicker * 0.2);
    outerFlame.rotation.y = t * 1.3;
    innerFlame.rotation.y = -t * 1.6;
    embers.update(t);
  };
}

function createEmbers() {
  const count = 30;
  const positions = new Float32Array(count * 3);
  const data = []; // per-ember speed + lifetime
  for (let i = 0; i < count; i++) {
    seedEmber(i, positions, data);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffaa55,
    size: 0.08,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const mesh = new THREE.Points(geom, mat);

  function update(t) {
    for (let i = 0; i < count; i++) {
      data[i].life += 0.016;
      if (data[i].life > data[i].maxLife) {
        seedEmber(i, positions, data);
      } else {
        positions[i * 3] += Math.sin(t * 2 + i) * 0.005;
        positions[i * 3 + 1] += data[i].vy;
        positions[i * 3 + 2] += Math.cos(t * 2 + i) * 0.005;
      }
    }
    geom.attributes.position.needsUpdate = true;
  }

  return { mesh, update };
}

function seedEmber(i, positions, data) {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * 0.25;
  positions[i * 3] = Math.cos(angle) * r;
  positions[i * 3 + 1] = 0.4 + Math.random() * 0.3;
  positions[i * 3 + 2] = Math.sin(angle) * r;
  data[i] = {
    vy: 0.012 + Math.random() * 0.02,
    life: 0,
    maxLife: 1.5 + Math.random() * 1.5,
  };
}

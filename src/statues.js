import * as THREE from 'three';

// the statue arc places ELEMENTS[0] at the rightmost angle and ELEMENTS[4] at
// the leftmost. To make the on-screen left-to-right reading order match
// About → Experience → Projects → Skills → Contact, this array runs
// right-to-left through the sections.
const ELEMENTS = ['Lightning', 'Air', 'Earth', 'Water', 'Fire'];

// each statue maps to a portfolio section
const SECTION_MAP = {
  Fire: 'About',
  Water: 'Experience',
  Earth: 'Projects',
  Air: 'Skills',
  Lightning: 'Contact',
};

const MAT = {
  pedestalLight: new THREE.MeshStandardMaterial({ color: 0x6e6862, roughness: 1, flatShading: true }),
  pedestalDark: new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 1, flatShading: true }),
  pedestalMoss: new THREE.MeshStandardMaterial({ color: 0x5a6a4a, roughness: 1, flatShading: true }),
  obsidian: new THREE.MeshStandardMaterial({ color: 0x14101a, roughness: 0.4, metalness: 0.2, flatShading: true }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.5, metalness: 0.6 }),
  ironBronze: new THREE.MeshStandardMaterial({ color: 0x6a4830, roughness: 0.6, metalness: 0.5, flatShading: true }),
  trimGold: new THREE.MeshStandardMaterial({
    color: 0xd4a96a,
    roughness: 0.55,
    metalness: 0.4,
    flatShading: true,
  }),

  // FIRE
  flameOuter: new THREE.MeshBasicMaterial({
    color: 0xff7733,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  }),
  flameInner: new THREE.MeshBasicMaterial({
    color: 0xffd866,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  }),
  ember: new THREE.MeshStandardMaterial({
    color: 0xff5522,
    emissive: 0xff3300,
    emissiveIntensity: 1.5,
    roughness: 0.6,
  }),

  // WATER
  waterSurface: new THREE.MeshStandardMaterial({
    color: 0x2a6e9e,
    roughness: 0.15,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  }),
  waterDeep: new THREE.MeshStandardMaterial({
    color: 0x163850,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.7,
  }),
  waterDroplet: new THREE.MeshStandardMaterial({
    color: 0x5acdff,
    emissive: 0x3a90c0,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  }),

  // EARTH
  earthCrystal: new THREE.MeshStandardMaterial({
    color: 0x8be36e,
    emissive: 0x3a8c30,
    emissiveIntensity: 1.0,
    roughness: 0.3,
    transparent: true,
    opacity: 0.92,
    flatShading: true,
  }),
  earthRoot: new THREE.MeshStandardMaterial({ color: 0x4a3422, roughness: 1, flatShading: true }),
  earthMoss: new THREE.MeshStandardMaterial({ color: 0x3a5a30, roughness: 1, flatShading: true }),

  // AIR
  airWisp: new THREE.MeshBasicMaterial({
    color: 0xe8f4ff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  airOrb: new THREE.MeshStandardMaterial({
    color: 0xc8e8ff,
    emissive: 0x88b8e0,
    emissiveIntensity: 1.0,
    roughness: 0.2,
    transparent: true,
    opacity: 0.7,
  }),

  // LIGHTNING
  lightningCore: new THREE.MeshBasicMaterial({ color: 0xc8d8ff }),
  lightningBolt: new THREE.MeshStandardMaterial({
    color: 0xb0a8ff,
    emissive: 0x8866ff,
    emissiveIntensity: 1.6,
    roughness: 0.3,
    transparent: true,
    opacity: 0.92,
  }),
};

const PEDESTAL_HEIGHT = 1.0;

export function addStatues(scene) {
  const statues = [];
  const animations = [];
  const radius = 4.6;
  const arc = Math.PI / 2;
  const startAngle = -Math.PI / 36;

  ELEMENTS.forEach((element, i) => {
    const t = i / (ELEMENTS.length - 1);
    const angle = startAngle + arc * t;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const built = buildStatue(element);
    const statue = built.group;
    statue.position.set(x, 0, z);
    // make the statue face roughly toward the campfire/center
    statue.lookAt(0, 1, 0);
    statue.rotateY(Math.PI);
    statue.userData = {
      type: 'statue',
      section: SECTION_MAP[element],
      element,
      baseY: 0,
    };
    // statues are small, mostly emissive/transparent details — skip the shadow pass
    statue.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
      }
    });
    scene.add(statue);
    statues.push(statue);
    if (built.update) animations.push(built.update);
  });

  return {
    statues,
    update: (t) => {
      for (const fn of animations) fn(t);
    },
  };
}

function buildStatue(element) {
  switch (element) {
    case 'Fire': return buildFireStatue();
    case 'Water': return buildWaterStatue();
    case 'Earth': return buildEarthStatue();
    case 'Air': return buildAirStatue();
    case 'Lightning': return buildLightningStatue();
  }
}

// ---------------- common pedestal ----------------

function buildPedestal(group, options = {}) {
  const baseMat = options.dark ? MAT.pedestalDark : MAT.pedestalLight;

  // wide base block
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 0.18, 8),
    baseMat
  );
  base.position.y = 0.09;
  group.add(base);

  // mid column
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 0.7, 8),
    baseMat
  );
  col.position.y = 0.55;
  group.add(col);

  // top capital
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.32, 0.12, 8),
    baseMat
  );
  cap.position.y = PEDESTAL_HEIGHT - 0.04;
  group.add(cap);

  // moss/wear at the base
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.random();
    const moss = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.05, 0),
      MAT.pedestalMoss
    );
    moss.position.set(Math.cos(a) * 0.45, 0.05, Math.sin(a) * 0.45);
    moss.scale.set(1, 0.4, 1);
    group.add(moss);
  }

  // engraved sigil ring (gold) on the column
  if (options.sigil !== false) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.02, 4, 16),
      MAT.trimGold
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.55;
    group.add(ring);
  }
}

// ---------------- FIRE — obsidian brazier ----------------

function buildFireStatue() {
  const group = new THREE.Group();
  buildPedestal(group, { dark: true });

  // brazier bowl on top
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.22, 0.18, 8, 1, true),
    MAT.obsidian
  );
  bowl.position.y = PEDESTAL_HEIGHT + 0.09;
  group.add(bowl);

  const bowlBottom = new THREE.Mesh(
    new THREE.CircleGeometry(0.21, 8),
    MAT.iron
  );
  bowlBottom.rotation.x = -Math.PI / 2;
  bowlBottom.position.y = PEDESTAL_HEIGHT + 0.0;
  group.add(bowlBottom);

  // gold accent rim around the bowl
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.025, 5, 16),
    MAT.trimGold
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = PEDESTAL_HEIGHT + 0.18;
  group.add(rim);

  // 3 hot coals at the bottom of the brazier
  for (let i = 0; i < 5; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.15;
    const coal = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.05 + Math.random() * 0.03, 0),
      MAT.ember
    );
    coal.position.set(Math.cos(a) * r, PEDESTAL_HEIGHT + 0.03, Math.sin(a) * r);
    group.add(coal);
  }

  // flame (twin cones)
  const outer = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.7, 8),
    MAT.flameOuter
  );
  outer.position.y = PEDESTAL_HEIGHT + 0.45;
  group.add(outer);

  const inner = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.5, 8),
    MAT.flameInner
  );
  inner.position.y = PEDESTAL_HEIGHT + 0.4;
  group.add(inner);

  // a small clickable hit-box surrounding the flame for raycasting
  const hitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.y = PEDESTAL_HEIGHT * 0.5 + 0.4;
  group.add(hitbox);

  // light source — kept moderate so each statue carries its own glow
  const light = new THREE.PointLight(0xff7733, 0.9, 5, 2);
  light.position.y = PEDESTAL_HEIGHT + 0.45;
  group.add(light);

  const update = (t) => {
    const flicker = Math.sin(t * 9) * 0.15 + Math.sin(t * 27) * 0.05 + Math.random() * 0.15;
    light.intensity = 0.9 + flicker;
    outer.scale.set(1 + flicker * 0.2, 1 + flicker * 0.4, 1 + flicker * 0.2);
    inner.scale.set(1 + flicker * 0.25, 1 + flicker * 0.55, 1 + flicker * 0.25);
    outer.rotation.y = t * 1.3;
    inner.rotation.y = -t * 1.6;
  };

  return { group, update };
}

// ---------------- WATER — basin with floating droplets ----------------

function buildWaterStatue() {
  const group = new THREE.Group();
  buildPedestal(group);

  // basin bowl
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.28, 0.22, 12, 1, true),
    MAT.pedestalLight
  );
  bowl.position.y = PEDESTAL_HEIGHT + 0.11;
  group.add(bowl);

  // outer rim trim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.03, 5, 16),
    MAT.trimGold
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = PEDESTAL_HEIGHT + 0.22;
  group.add(rim);

  // water surface inside the basin
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 18),
    MAT.waterSurface
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = PEDESTAL_HEIGHT + 0.18;
  group.add(surface);

  // darker deep water spot
  const deep = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 14),
    MAT.waterDeep
  );
  deep.rotation.x = -Math.PI / 2;
  deep.position.y = PEDESTAL_HEIGHT + 0.185;
  group.add(deep);

  // floating water droplets above the basin (animated)
  const droplets = [];
  for (let i = 0; i < 5; i++) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.03, 12, 12),
      MAT.waterDroplet
    );
    const a = (i / 5) * Math.PI * 2;
    drop.userData.baseAngle = a;
    drop.userData.baseY = PEDESTAL_HEIGHT + 0.45 + (i % 2) * 0.15;
    drop.userData.radius = 0.22;
    drop.userData.speed = 0.6 + Math.random() * 0.5;
    drop.userData.bobPhase = Math.random() * Math.PI * 2;
    drop.position.set(Math.cos(a) * 0.22, drop.userData.baseY, Math.sin(a) * 0.22);
    group.add(drop);
    droplets.push(drop);
  }

  // a tall slim wave mesh rising from the center (suggestion of a water spout)
  const spout = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.32, 8),
    MAT.waterDroplet
  );
  spout.position.y = PEDESTAL_HEIGHT + 0.36;
  group.add(spout);

  const hitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.y = PEDESTAL_HEIGHT * 0.5 + 0.4;
  group.add(hitbox);

  const light = new THREE.PointLight(0x5acdff, 0.6, 4.5, 2);
  light.position.y = PEDESTAL_HEIGHT + 0.5;
  group.add(light);

  const update = (t) => {
    for (const d of droplets) {
      d.position.x = Math.cos(d.userData.baseAngle + t * d.userData.speed) * d.userData.radius;
      d.position.z = Math.sin(d.userData.baseAngle + t * d.userData.speed) * d.userData.radius;
      d.position.y = d.userData.baseY + Math.sin(t * 1.6 + d.userData.bobPhase) * 0.06;
    }
    spout.scale.y = 1 + Math.sin(t * 3) * 0.15;
    light.intensity = 0.6 + Math.sin(t * 2) * 0.15;
  };

  return { group, update };
}

// ---------------- EARTH — crystal cluster with mossy roots ----------------

function buildEarthStatue() {
  const group = new THREE.Group();
  buildPedestal(group);

  // mossy mound on top of the pedestal
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.earthMoss
  );
  mound.position.y = PEDESTAL_HEIGHT + 0.04;
  mound.scale.y = 0.5;
  group.add(mound);

  // exposed roots wrapping the pedestal cap
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.random() * 0.3;
    const root = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.04, 0.4, 5),
      MAT.earthRoot
    );
    root.position.set(Math.cos(a) * 0.32, PEDESTAL_HEIGHT - 0.05, Math.sin(a) * 0.32);
    root.rotation.set(Math.cos(a) * 0.4, -a, Math.sin(a) * 0.4);
    group.add(root);
  }

  // central tall crystal
  const main = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.85, 5),
    MAT.earthCrystal
  );
  main.position.y = PEDESTAL_HEIGHT + 0.5;
  group.add(main);

  // 4 satellite crystals at varied angles
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const small = new THREE.Mesh(
      new THREE.ConeGeometry(0.07 + Math.random() * 0.04, 0.4 + Math.random() * 0.25, 5),
      MAT.earthCrystal
    );
    small.position.set(Math.cos(a) * 0.18, PEDESTAL_HEIGHT + 0.25 + Math.random() * 0.1, Math.sin(a) * 0.18);
    small.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
    group.add(small);
  }

  // small mushrooms at the base of the crystals
  for (let i = 0; i < 3; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.12 + Math.random() * 0.1;
    const mush = makeSmallMushroom();
    mush.position.set(Math.cos(a) * r, PEDESTAL_HEIGHT + 0.1, Math.sin(a) * r);
    group.add(mush);
  }

  const hitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.y = PEDESTAL_HEIGHT * 0.5 + 0.4;
  group.add(hitbox);

  const light = new THREE.PointLight(0x70d090, 0.55, 4.5, 2);
  light.position.y = PEDESTAL_HEIGHT + 0.5;
  group.add(light);

  const update = (t) => {
    light.intensity = 0.55 + Math.sin(t * 1.2) * 0.1;
    main.rotation.y = t * 0.2;
  };

  return { group, update };
}

function makeSmallMushroom() {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.024, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0xeae0ce, roughness: 0.9, flatShading: true })
  );
  stem.position.y = 0.05;
  g.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.85, flatShading: true })
  );
  cap.position.y = 0.1;
  cap.scale.y = 0.6;
  g.add(cap);
  return g;
}

// ---------------- AIR — tall pedestal with spinning rings + wisps ----------------

function buildAirStatue() {
  const group = new THREE.Group();
  buildPedestal(group);

  // tall slim spire above the pedestal (wind-vane feel)
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.7, 6),
    MAT.ironBronze
  );
  spire.position.y = PEDESTAL_HEIGHT + 0.35;
  group.add(spire);

  // central glowing orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    MAT.airOrb
  );
  orb.position.y = PEDESTAL_HEIGHT + 0.75;
  group.add(orb);

  // 3 rotating rings around the orb (each on a different axis)
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22 + i * 0.05, 0.012, 5, 24),
      MAT.trimGold
    );
    ring.position.y = PEDESTAL_HEIGHT + 0.75;
    ring.userData.axis = i;
    rings.push(ring);
    group.add(ring);
  }

  // floating wisps (semi-transparent spheres)
  const wisps = [];
  for (let i = 0; i < 6; i++) {
    const wisp = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8),
      MAT.airWisp
    );
    const a = (i / 6) * Math.PI * 2;
    wisp.userData.baseAngle = a;
    wisp.userData.baseY = PEDESTAL_HEIGHT + 0.5 + Math.random() * 0.5;
    wisp.userData.radius = 0.35 + Math.random() * 0.15;
    wisp.userData.speed = 0.4 + Math.random() * 0.4;
    wisp.position.set(Math.cos(a) * wisp.userData.radius, wisp.userData.baseY, Math.sin(a) * wisp.userData.radius);
    group.add(wisp);
    wisps.push(wisp);
  }

  // small directional vane at the top
  const vane = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.18, 4),
    MAT.trimGold
  );
  vane.position.y = PEDESTAL_HEIGHT + 1.05;
  vane.rotation.x = Math.PI / 2;
  group.add(vane);

  const hitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.7, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.y = PEDESTAL_HEIGHT * 0.5 + 0.45;
  group.add(hitbox);

  const light = new THREE.PointLight(0xc8e8ff, 0.5, 4.5, 2);
  light.position.y = PEDESTAL_HEIGHT + 0.75;
  group.add(light);

  const update = (t) => {
    rings[0].rotation.x = t * 1.0;
    rings[0].rotation.y = t * 0.4;
    rings[1].rotation.z = t * -0.7;
    rings[1].rotation.y = t * 0.6;
    rings[2].rotation.x = t * 0.5;
    rings[2].rotation.z = t * 0.8;

    for (const w of wisps) {
      w.position.x = Math.cos(w.userData.baseAngle + t * w.userData.speed) * w.userData.radius;
      w.position.z = Math.sin(w.userData.baseAngle + t * w.userData.speed) * w.userData.radius;
      w.position.y = w.userData.baseY + Math.sin(t * 0.8 + w.userData.baseAngle) * 0.08;
    }
    light.intensity = 0.5 + Math.sin(t * 1.5) * 0.1;
  };

  return { group, update };
}

// ---------------- LIGHTNING — jagged metal pedestal with electric orb ----------------

function buildLightningStatue() {
  const group = new THREE.Group();
  buildPedestal(group, { dark: true });

  // jagged metal collar around the top of the pedestal
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.3, 4),
      MAT.iron
    );
    spike.position.set(Math.cos(a) * 0.32, PEDESTAL_HEIGHT + 0.05, Math.sin(a) * 0.32);
    spike.rotation.x = Math.PI;
    spike.rotation.y = -a;
    group.add(spike);
  }

  // orb cradle: 4 curving arms
  const cradleY = PEDESTAL_HEIGHT + 0.6;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const arm = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.018, 4, 8, Math.PI / 2),
      MAT.iron
    );
    arm.position.set(Math.cos(a) * 0.05, cradleY, Math.sin(a) * 0.05);
    arm.rotation.set(Math.PI / 2, -a, 0);
    group.add(arm);
  }

  // central electric orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    MAT.lightningCore
  );
  orb.position.y = cradleY;
  group.add(orb);

  // outer glowing shell around the orb
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x9a8bff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shell.position.y = cradleY;
  group.add(shell);

  // jagged lightning bolts emanating out (6 thin angular shapes)
  const bolts = [];
  for (let i = 0; i < 6; i++) {
    const bolt = makeLightningBolt();
    const a = (i / 6) * Math.PI * 2;
    bolt.position.set(Math.cos(a) * 0.05, cradleY, Math.sin(a) * 0.05);
    bolt.rotation.y = -a;
    bolt.userData.basePhase = Math.random() * Math.PI * 2;
    group.add(bolt);
    bolts.push(bolt);
  }

  // tall iron antenna spike rising above the orb
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.04, 0.6, 5),
    MAT.iron
  );
  antenna.position.y = cradleY + 0.5;
  group.add(antenna);

  // tip ball
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), MAT.iron);
  tip.position.y = cradleY + 0.85;
  group.add(tip);

  const hitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 1.8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.y = PEDESTAL_HEIGHT * 0.5 + 0.5;
  group.add(hitbox);

  const light = new THREE.PointLight(0x9a8bff, 0.7, 5, 2);
  light.position.y = cradleY;
  group.add(light);

  const update = (t) => {
    // erratic flicker
    const pulse = 0.7 + Math.sin(t * 4) * 0.3 + (Math.random() < 0.06 ? 0.4 : 0);
    light.intensity = 0.7 * pulse;
    shell.scale.setScalar(1 + Math.sin(t * 5) * 0.1);
    shell.material.opacity = 0.3 + Math.sin(t * 7) * 0.15;

    for (let i = 0; i < bolts.length; i++) {
      const b = bolts[i];
      // each bolt flickers visibility independently
      const visible = (Math.sin(t * 6 + b.userData.basePhase) + Math.random() * 0.6) > 0.3;
      b.visible = visible;
      b.scale.setScalar(0.8 + Math.random() * 0.4);
    }
  };

  return { group, update };
}

function makeLightningBolt() {
  const g = new THREE.Group();
  // small jagged segments — 3 zig-zag pieces forming a bolt outward
  const segs = [
    { x: 0.18, y: 0.05, len: 0.18, rot: 0.4 },
    { x: 0.32, y: -0.05, len: 0.16, rot: -0.5 },
    { x: 0.48, y: 0.04, len: 0.14, rot: 0.3 },
  ];
  for (const s of segs) {
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(s.len, 0.04, 0.04),
      MAT.lightningBolt
    );
    seg.position.set(s.x, s.y, 0);
    seg.rotation.z = s.rot;
    g.add(seg);
  }
  return g;
}

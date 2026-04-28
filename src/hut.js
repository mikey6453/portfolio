import * as THREE from 'three';

const MAT = {
  stone: new THREE.MeshStandardMaterial({ color: 0x6e6862, roughness: 1, flatShading: true }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1, flatShading: true }),
  stoneMoss: new THREE.MeshStandardMaterial({ color: 0x5a6a4a, roughness: 1, flatShading: true }),
  stoneRune: new THREE.MeshStandardMaterial({
    color: 0x4a4540,
    emissive: 0x66c8ff,
    emissiveIntensity: 0.7,
    roughness: 1,
    flatShading: true,
  }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6b4326, roughness: 0.85 }),
  woodWeathered: new THREE.MeshStandardMaterial({ color: 0x563421, roughness: 0.95 }),
  woodWarm: new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.85 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.9 }),
  shingle: new THREE.MeshStandardMaterial({ color: 0x3b2a5e, roughness: 0.7, flatShading: true }),
  shingleDeep: new THREE.MeshStandardMaterial({ color: 0x231944, roughness: 0.8, flatShading: true }),
  shingleAccent: new THREE.MeshStandardMaterial({ color: 0x4d3678, roughness: 0.7, flatShading: true }),
  trim: new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.7, flatShading: true }),
  trimGold: new THREE.MeshStandardMaterial({
    color: 0xd4a96a,
    roughness: 0.55,
    metalness: 0.4,
    flatShading: true,
  }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.5, metalness: 0.6 }),
  ironRust: new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.85, metalness: 0.3 }),
  vine: new THREE.MeshStandardMaterial({ color: 0x2f4a25, roughness: 0.95, flatShading: true }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x3a5a30, roughness: 0.95, flatShading: true }),
  leafBright: new THREE.MeshStandardMaterial({ color: 0x4a6a35, roughness: 0.95, flatShading: true }),
  mushroomCap: new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.85, flatShading: true }),
  mushroomStem: new THREE.MeshStandardMaterial({ color: 0xeae0ce, roughness: 0.9, flatShading: true }),
  parchment: new THREE.MeshStandardMaterial({ color: 0xc4a878, roughness: 1 }),
  glassBlue: new THREE.MeshBasicMaterial({ color: 0x6699ff }),
  glassPurple: new THREE.MeshBasicMaterial({ color: 0x9966ff }),
  glassWarm: new THREE.MeshBasicMaterial({ color: 0xffcc66 }),
  glassMagic: new THREE.MeshBasicMaterial({ color: 0xc8a8ff }),
  crystal: new THREE.MeshStandardMaterial({
    color: 0xa6c0ff,
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0x4466aa,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.9,
  }),
  crystalGreen: new THREE.MeshStandardMaterial({
    color: 0x9af0b8,
    roughness: 0.25,
    metalness: 0.1,
    emissive: 0x40a060,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.9,
  }),
  bookCover: new THREE.MeshStandardMaterial({ color: 0x5a2030, roughness: 0.9 }),
  bookPages: new THREE.MeshStandardMaterial({ color: 0xe6d4a8, roughness: 1 }),
};

// dimensions
const FOUNDATION_TOP = 0.85;
const TOWER1_BOTTOM_R = 1.95;
const TOWER1_TOP_R = 1.65;
const TOWER1_HEIGHT = 2.6;
const TOWER1_TOP = FOUNDATION_TOP + TOWER1_HEIGHT;

const TOWER2_BOTTOM_R = 1.4;
const TOWER2_TOP_R = 1.2;
const TOWER2_HEIGHT = 1.8;
const TOWER2_TOP = TOWER1_TOP + TOWER2_HEIGHT;

const ROOF_HEIGHT = 4.2; // tall witch-hat
const ROOF_TIP_Y = TOWER2_TOP + ROOF_HEIGHT;

export function buildWizardHut() {
  const hut = new THREE.Group();
  const animations = [];

  buildFoundation(hut);
  buildLowerTower(hut);
  buildUpperTower(hut);
  buildSideTurret(hut);
  buildBalcony(hut);
  buildRoof(hut);
  buildBentSpire(hut);
  buildPorch(hut);
  buildDoor(hut);
  buildBigStainedWindow(hut);
  buildPortholes(hut);
  buildChimney(hut);
  buildVines(hut);
  buildHangingLanterns(hut);
  buildBaseDetails(hut);
  buildCrystals(hut);
  buildHangingBanner(hut);
  buildFloatingBook(hut);

  // upgraded features
  buildWallRunes(hut);
  buildWallCrystals(hut);
  buildSpiralStairs(hut);
  buildGargoyles(hut);
  buildOwl(hut);
  buildTelescope(hut);
  animations.push(buildCauldron(hut));
  animations.push(buildWindChimes(hut));
  animations.push(buildSpireWisps(hut));
  animations.push(buildChimneySmoke(hut));
  animations.push(buildAuraRing(hut));

  // Only opaque non-glow meshes contribute to the shadow pass — wisps, smoke,
  // bubbles, runes, and other transparent / emissive bits skip it.
  hut.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    if (!m) return;
    const isGlow = m.isMeshBasicMaterial === true;
    const isTranslucent = m.transparent === true && (m.opacity ?? 1) < 0.95;
    if (isGlow || isTranslucent) {
      o.castShadow = false;
      o.receiveShadow = false;
      return;
    }
    o.castShadow = true;
    o.receiveShadow = true;
  });

  // slight whimsical lean
  hut.rotation.z = -0.025;

  return {
    group: hut,
    update: (t) => {
      for (const a of animations) a(t);
    },
  };
}

// ---------------- foundation ----------------

function buildFoundation(hut) {
  // a flat capstone the walls sit on
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(TOWER1_BOTTOM_R + 0.08, TOWER1_BOTTOM_R + 0.15, 0.18, 16),
    MAT.stoneDark
  );
  cap.position.y = FOUNDATION_TOP - 0.09;
  hut.add(cap);

  // many overlapping irregular stones forming the foundation pile
  const stones = 48;
  for (let i = 0; i < stones; i++) {
    const t = i / stones;
    const angle = t * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const ringR = TOWER1_BOTTOM_R + (Math.random() - 0.3) * 0.3;
    const layerY = Math.random() * (FOUNDATION_TOP - 0.08);
    const size = 0.18 + Math.random() * 0.22;
    const mat = Math.random() > 0.7 ? MAT.stoneMoss : Math.random() > 0.5 ? MAT.stoneDark : MAT.stone;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), mat);
    stone.position.set(Math.cos(angle) * ringR, layerY + size * 0.5, Math.sin(angle) * ringR);
    stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    stone.scale.set(1, 0.85 + Math.random() * 0.3, 1);
    hut.add(stone);
  }

  // 5 large anchor stones at structural points
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
    const big = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 0), MAT.stoneDark);
    big.position.set(
      Math.cos(angle) * (TOWER1_BOTTOM_R + 0.05),
      0.32,
      Math.sin(angle) * (TOWER1_BOTTOM_R + 0.05)
    );
    big.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    hut.add(big);
  }

  // 4 glowing rune stones embedded in the foundation
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + 0.4;
    const rune = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.32, 0),
      MAT.stoneRune
    );
    rune.position.set(
      Math.cos(angle) * (TOWER1_BOTTOM_R - 0.05),
      0.45,
      Math.sin(angle) * (TOWER1_BOTTOM_R - 0.05)
    );
    rune.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    hut.add(rune);
    // (the rune material is emissive — no point light needed)
  }
}

// ---------------- lower tower ----------------

function buildLowerTower(hut) {
  // octagonal main body
  const walls = new THREE.Mesh(
    new THREE.CylinderGeometry(TOWER1_TOP_R, TOWER1_BOTTOM_R, TOWER1_HEIGHT, 8),
    MAT.wood
  );
  walls.position.y = FOUNDATION_TOP + TOWER1_HEIGHT / 2;
  walls.rotation.y = Math.PI / 8;
  hut.add(walls);

  // plank facade — visible horizontal planking on each face
  const facadePlanks = 9;
  const facade = TOWER1_HEIGHT / facadePlanks;
  for (let f = 0; f < 8; f++) {
    if (f === 0) continue; // skip door face
    const angle = (f / 8) * Math.PI * 2;
    for (let p = 0; p < facadePlanks; p++) {
      const yOffset = (p / facadePlanks) * TOWER1_HEIGHT - TOWER1_HEIGHT / 2 + facade / 2;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, facade - 0.04, 0.05),
        p % 2 === 0 ? MAT.wood : MAT.woodWeathered
      );
      plank.position.set(
        Math.cos(angle) * (TOWER1_TOP_R + 0.03),
        FOUNDATION_TOP + TOWER1_HEIGHT / 2 + yOffset,
        Math.sin(angle) * (TOWER1_TOP_R + 0.03)
      );
      plank.lookAt(0, plank.position.y, 0);
      hut.add(plank);
    }
    // vertical seam beam between faces
    const seamAngle = angle + Math.PI / 8;
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, TOWER1_HEIGHT - 0.05, 0.1),
      MAT.woodDark
    );
    beam.position.set(
      Math.cos(seamAngle) * (TOWER1_TOP_R + 0.04),
      FOUNDATION_TOP + TOWER1_HEIGHT / 2,
      Math.sin(seamAngle) * (TOWER1_TOP_R + 0.04)
    );
    hut.add(beam);
  }

  // mid trim band (decorative strap)
  const midBand = new THREE.Mesh(
    new THREE.CylinderGeometry(TOWER1_TOP_R + 0.05, TOWER1_BOTTOM_R + 0.05, 0.18, 16),
    MAT.trim
  );
  midBand.position.y = FOUNDATION_TOP + TOWER1_HEIGHT * 0.55;
  hut.add(midBand);
}

// ---------------- upper tower (narrower second story) ----------------

function buildUpperTower(hut) {
  // slightly inset upper story
  const upper = new THREE.Mesh(
    new THREE.CylinderGeometry(TOWER2_TOP_R, TOWER2_BOTTOM_R, TOWER2_HEIGHT, 8),
    MAT.woodWarm
  );
  upper.position.y = TOWER1_TOP + TOWER2_HEIGHT / 2;
  upper.rotation.y = Math.PI / 8;
  hut.add(upper);

  // soffit/skirt where tower 1 meets tower 2
  const skirt = new THREE.Mesh(
    new THREE.ConeGeometry(TOWER1_TOP_R + 0.2, 0.45, 16, 1, true),
    MAT.shingleDeep
  );
  skirt.position.y = TOWER1_TOP + 0.08;
  hut.add(skirt);

  // skirt trim ring at the bottom of the cone
  const skirtTrim = new THREE.Mesh(
    new THREE.TorusGeometry(TOWER1_TOP_R + 0.18, 0.06, 6, 24),
    MAT.trimGold
  );
  skirtTrim.rotation.x = Math.PI / 2;
  skirtTrim.position.y = TOWER1_TOP - 0.1;
  hut.add(skirtTrim);

  // upper plank facade (vertical-running this time, for variation)
  const facadePlanks = 12;
  for (let p = 0; p < facadePlanks; p++) {
    const angle = (p / facadePlanks) * Math.PI * 2 + 0.05;
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, TOWER2_HEIGHT - 0.06, 0.05),
      p % 3 === 0 ? MAT.woodDark : p % 2 === 0 ? MAT.woodWarm : MAT.wood
    );
    plank.position.set(
      Math.cos(angle) * (TOWER2_TOP_R + 0.025),
      TOWER1_TOP + TOWER2_HEIGHT / 2,
      Math.sin(angle) * (TOWER2_TOP_R + 0.025)
    );
    plank.lookAt(0, plank.position.y, 0);
    hut.add(plank);
  }

  // top trim ring
  const topRing = new THREE.Mesh(
    new THREE.CylinderGeometry(TOWER2_TOP_R + 0.15, TOWER2_TOP_R + 0.15, 0.2, 16),
    MAT.woodDark
  );
  topRing.position.y = TOWER2_TOP - 0.1;
  hut.add(topRing);

  // gold trim ring
  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(TOWER2_TOP_R + 0.2, 0.05, 6, 24),
    MAT.trimGold
  );
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = TOWER2_TOP + 0.02;
  hut.add(goldRing);
}

// ---------------- side turret (asymmetric oriel) ----------------

function buildSideTurret(hut) {
  // small bay/turret protruding from the lower tower's side at angle ~+45°
  // gives the silhouette character
  const bayAngle = Math.PI * 0.25;
  const cx = Math.cos(bayAngle) * (TOWER1_TOP_R + 0.05);
  const cz = Math.sin(bayAngle) * (TOWER1_TOP_R + 0.05);
  const bayRadius = 0.55;
  const bayY = FOUNDATION_TOP + TOWER1_HEIGHT * 0.7;

  // hexagonal bay window box
  const bay = new THREE.Mesh(
    new THREE.CylinderGeometry(bayRadius, bayRadius, 1.1, 6),
    MAT.woodWarm
  );
  bay.position.set(cx + Math.cos(bayAngle) * 0.25, bayY, cz + Math.sin(bayAngle) * 0.25);
  bay.rotation.y = -bayAngle;
  hut.add(bay);

  // glowing pane on the bay (warm yellow)
  for (let i = 0; i < 3; i++) {
    const a = bayAngle - 0.3 + i * 0.3;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.5), MAT.glassWarm);
    const r = TOWER1_TOP_R + 0.5;
    pane.position.set(Math.cos(a) * r, bayY, Math.sin(a) * r);
    pane.lookAt(0, bayY, 0);
    pane.rotateY(Math.PI);
    hut.add(pane);

    // mullion frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.54, 0.04), MAT.woodDark);
    frame.position.copy(pane.position);
    frame.position.x += Math.cos(a) * 0.005;
    frame.position.z += Math.sin(a) * 0.005;
    frame.lookAt(0, bayY, 0);
    frame.rotateY(Math.PI);
    hut.add(frame);
    // re-add the pane in front of the frame
    pane.position.x += Math.cos(a) * 0.025;
    pane.position.z += Math.sin(a) * 0.025;
  }

  // little conical roof for the bay
  const bayRoof = new THREE.Mesh(
    new THREE.ConeGeometry(bayRadius + 0.18, 0.7, 6),
    MAT.shingle
  );
  bayRoof.position.set(
    cx + Math.cos(bayAngle) * 0.25,
    bayY + 0.85,
    cz + Math.sin(bayAngle) * 0.25
  );
  bayRoof.rotation.y = -bayAngle + Math.PI / 6;
  hut.add(bayRoof);

  // tiny bay finial
  const bayFinial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), MAT.trimGold);
  bayFinial.position.set(
    cx + Math.cos(bayAngle) * 0.25,
    bayY + 1.25,
    cz + Math.sin(bayAngle) * 0.25
  );
  hut.add(bayFinial);

  // bay support brackets
  for (let i = 0; i < 3; i++) {
    const a = bayAngle - 0.3 + i * 0.3;
    const bracket = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.32, 4),
      MAT.woodDark
    );
    bracket.position.set(
      Math.cos(a) * (TOWER1_TOP_R + 0.08),
      bayY - 0.55 - i * 0.04,
      Math.sin(a) * (TOWER1_TOP_R + 0.08)
    );
    bracket.rotation.x = Math.PI;
    bracket.rotation.y = -a;
    hut.add(bracket);
  }

  // warm light spill from the bay
  const bayLight = new THREE.PointLight(0xffaa55, 0.5, 5, 2);
  bayLight.position.set(
    cx + Math.cos(bayAngle) * 0.55,
    bayY,
    cz + Math.sin(bayAngle) * 0.55
  );
  hut.add(bayLight);
}

// ---------------- balcony at first/second tower junction ----------------

function buildBalcony(hut) {
  // wraps the back half of the tower; doesn't block the front view
  const balconyY = TOWER1_TOP + 0.05;
  const segments = 7;
  const startAngle = Math.PI * 0.55;
  const endAngle = Math.PI * 1.55;
  const r = TOWER2_BOTTOM_R + 0.5;

  // platform slats
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const a = startAngle + t * (endAngle - startAngle);
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, 0.6),
      MAT.woodWeathered
    );
    slat.position.set(Math.cos(a) * r, balconyY, Math.sin(a) * r);
    slat.rotation.y = -a;
    hut.add(slat);
  }

  // railing posts
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + t * (endAngle - startAngle);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6),
      MAT.woodDark
    );
    post.position.set(Math.cos(a) * (r + 0.16), balconyY + 0.21, Math.sin(a) * (r + 0.16));
    hut.add(post);
  }

  // top rail in short straight segments
  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    const a1 = startAngle + t1 * (endAngle - startAngle);
    const a2 = startAngle + t2 * (endAngle - startAngle);
    const x1 = Math.cos(a1) * (r + 0.16), z1 = Math.sin(a1) * (r + 0.16);
    const x2 = Math.cos(a2) * (r + 0.16), z2 = Math.sin(a2) * (r + 0.16);
    const len = Math.hypot(x2 - x1, z2 - z1);
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.05, 0.05),
      MAT.woodDark
    );
    rail.position.set((x1 + x2) / 2, balconyY + 0.39, (z1 + z2) / 2);
    rail.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    hut.add(rail);
  }

  // corbel brackets under both ends
  for (const a of [startAngle, endAngle]) {
    const bracket = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.32, 4),
      MAT.woodDark
    );
    bracket.position.set(
      Math.cos(a) * (TOWER2_BOTTOM_R + 0.05),
      balconyY - 0.18,
      Math.sin(a) * (TOWER2_BOTTOM_R + 0.05)
    );
    bracket.rotation.x = Math.PI;
    bracket.rotation.y = -a;
    hut.add(bracket);
  }
}

// ---------------- TALL conical witch-hat roof with shingle rings ----------------

function buildRoof(hut) {
  // build the tall cone in 4 stages from wide-base to thin-tip, with shingles per ring.
  // ring + shingle counts kept modest — this geometry adds up fast in draw calls.
  const stages = [
    { yBase: TOWER2_TOP, yTop: TOWER2_TOP + 1.0, rBase: TOWER2_TOP_R + 0.28, rTop: TOWER2_TOP_R + 0.0, rings: 2, shinglesPerRing: 12, mat: MAT.shingle },
    { yBase: TOWER2_TOP + 0.95, yTop: TOWER2_TOP + 2.3, rBase: TOWER2_TOP_R - 0.05, rTop: 0.6, rings: 3, shinglesPerRing: 10, mat: MAT.shingleDeep },
    { yBase: TOWER2_TOP + 2.25, yTop: TOWER2_TOP + 3.4, rBase: 0.6, rTop: 0.22, rings: 2, shinglesPerRing: 8, mat: MAT.shingle },
    { yBase: TOWER2_TOP + 3.35, yTop: ROOF_TIP_Y, rBase: 0.22, rTop: 0.05, rings: 2, shinglesPerRing: 6, mat: MAT.shingleDeep },
  ];

  for (const s of stages) {
    placeShingleStage(hut, s);
  }

  // add 3 small dormer windows on the roof (just above the second story)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.6;
    const dY = TOWER2_TOP + 0.45;
    const dR = TOWER2_TOP_R + 0.15;
    const dormer = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.45, 0.3),
      MAT.woodWarm
    );
    dormer.position.set(Math.cos(angle) * dR, dY, Math.sin(angle) * dR);
    dormer.lookAt(0, dY, 0);
    dormer.position.x += Math.cos(angle) * 0.05;
    dormer.position.z += Math.sin(angle) * 0.05;
    hut.add(dormer);

    // little roof on the dormer
    const dormerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(0.26, 0.22, 4),
      MAT.shingle
    );
    dormerRoof.position.copy(dormer.position);
    dormerRoof.position.y += 0.34;
    dormerRoof.rotation.y = Math.PI / 4 - angle;
    hut.add(dormerRoof);

    // glowing window pane
    const dPane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.28),
      MAT.glassWarm
    );
    dPane.position.copy(dormer.position);
    dPane.position.x += Math.cos(angle) * 0.18;
    dPane.position.z += Math.sin(angle) * 0.18;
    dPane.lookAt(dPane.position.clone().multiplyScalar(2));
    hut.add(dPane);
  }
}

function placeShingleStage(hut, s) {
  const coneH = s.yTop - s.yBase;

  // smooth cone underneath the shingles for solidity
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(s.rTop, s.rBase, coneH, 16),
    s.mat
  );
  cone.position.y = s.yBase + coneH / 2;
  hut.add(cone);

  for (let r = 0; r < s.rings; r++) {
    const tBottom = r / s.rings;
    const tTop = (r + 1) / s.rings;
    const yMid = s.yBase + ((tBottom + tTop) / 2) * coneH;
    const radiusAtMid = s.rBase + (s.rTop - s.rBase) * ((tBottom + tTop) / 2);
    const ringHeight = coneH / s.rings + 0.06;
    const angleOffset = (r % 2) * (Math.PI / s.shinglesPerRing);

    for (let i = 0; i < s.shinglesPerRing; i++) {
      const angle = (i / s.shinglesPerRing) * Math.PI * 2 + angleOffset;
      const arcWidth = (Math.PI * 2 * radiusAtMid) / s.shinglesPerRing + 0.03;
      const variant = i % 3 === 0 ? MAT.shingleAccent : i % 2 === 0 ? s.mat : MAT.shingleDeep;
      const shingle = new THREE.Mesh(
        new THREE.BoxGeometry(arcWidth, ringHeight, 0.08),
        variant
      );
      shingle.position.set(
        Math.cos(angle) * (radiusAtMid + 0.04),
        yMid,
        Math.sin(angle) * (radiusAtMid + 0.04)
      );
      shingle.lookAt(0, yMid, 0);
      const slope = Math.atan2(s.rBase - s.rTop, coneH);
      shingle.rotateX(slope);
      hut.add(shingle);
    }
  }
}

// ---------------- bent spire tip with crystal orb ----------------

function buildBentSpire(hut) {
  // a thin bent finial extending past the cone tip — gives the witch-hat its character
  const baseY = ROOF_TIP_Y;

  // first segment: straight up
  const seg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6),
    MAT.iron
  );
  seg1.position.set(0, baseY + 0.4, 0);
  hut.add(seg1);

  // bent middle: tilted
  const seg2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.7, 6),
    MAT.iron
  );
  seg2.position.set(0.13, baseY + 1.05, 0);
  seg2.rotation.z = -0.35;
  hut.add(seg2);

  // top thin segment, more tilt
  const seg3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 0.5, 6),
    MAT.iron
  );
  seg3.position.set(0.32, baseY + 1.55, 0);
  seg3.rotation.z = -0.6;
  hut.add(seg3);

  // 3 ornament rings along the spire
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.05 - i * 0.01, 0.018, 4, 12),
      MAT.trimGold
    );
    ring.position.set(0.04 * i, baseY + 0.3 + i * 0.55, 0);
    ring.rotation.x = Math.PI / 2;
    hut.add(ring);
  }

  // crystal orb at the tip
  const orbX = 0.5;
  const orbY = baseY + 1.85;
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xc8d8ff })
  );
  orb.position.set(orbX, orbY, 0);
  hut.add(orb);

  // orb cradle
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.32, 5),
      MAT.iron
    );
    arm.position.set(orbX + Math.cos(a) * 0.13, orbY, Math.sin(a) * 0.13);
    arm.rotation.x = Math.PI / 2;
    arm.lookAt(orbX, orbY + 0.05, 0);
    hut.add(arm);
  }

  // small finial above the orb
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), MAT.trimGold);
  finial.position.set(orbX, orbY + 0.24, 0);
  hut.add(finial);

  // a crescent moon ornament hanging off the bent spire
  const moon = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.025, 4, 12, Math.PI),
    MAT.trimGold
  );
  moon.position.set(0.18, baseY + 1.2, 0);
  moon.rotation.z = Math.PI / 2;
  hut.add(moon);

  // strong beacon light from the orb
  const orbLight = new THREE.PointLight(0xb8c8ff, 1.1, 16, 2);
  orbLight.position.set(orbX, orbY, 0);
  hut.add(orbLight);
}

// ---------------- porch overhang ----------------

function buildPorch(hut) {
  // small triangular overhang above the door
  const overhang = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 0.5, 4),
    MAT.shingle
  );
  overhang.position.set(0, FOUNDATION_TOP + 1.95, TOWER1_TOP_R + 0.55);
  overhang.rotation.x = -Math.PI / 2;
  overhang.rotation.z = Math.PI / 4;
  overhang.scale.set(1, 1, 0.55);
  hut.add(overhang);

  // overhang trim
  for (const x of [-0.55, 0.55]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 1.85, 6),
      MAT.woodDark
    );
    post.position.set(x, FOUNDATION_TOP + 0.92, TOWER1_TOP_R + 0.65);
    hut.add(post);
  }

  // wooden stairs to the door
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(1.3 - i * 0.05, 0.12, 0.4 - i * 0.06),
      MAT.woodWeathered
    );
    step.position.set(0, 0.06 + i * 0.18, TOWER1_TOP_R + 0.7 - i * 0.18);
    hut.add(step);
  }
}

// ---------------- gothic arched door ----------------

function buildDoor(hut) {
  const group = new THREE.Group();
  group.position.set(0, FOUNDATION_TOP + 0.05, TOWER1_TOP_R - 0.05);
  hut.add(group);

  // ---- doorframe ----
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.95, 0.2),
    MAT.woodDark
  );
  frame.position.y = 0.97;
  group.add(frame);

  // gothic arched top
  const arch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.2, 16, 1, false, 0, Math.PI),
    MAT.woodDark
  );
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = Math.PI / 2;
  arch.position.y = 1.85;
  group.add(arch);

  // ---- doorway opening: a dark interior backdrop visible through the open door ----
  const interior = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 1.85),
    new THREE.MeshBasicMaterial({ color: 0x140a06 })
  );
  interior.position.set(0, 0.95, -0.02); // slightly recessed into the wall
  group.add(interior);

  // warm spilling glow on top of the interior so the doorway looks lit-from-within
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 1.55),
    new THREE.MeshBasicMaterial({
      color: 0xffaa55,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  glow.position.set(0, 0.85, 0.0);
  group.add(glow);

  // a hint of an interior wall and the start of a hallway/floor inside,
  // so the opening reads as actually leading somewhere
  const innerFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(0.92, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x4a3422, roughness: 1 })
  );
  innerFloor.rotation.x = -Math.PI / 2;
  innerFloor.position.set(0, 0.06, -0.18);
  group.add(innerFloor);

  // ---- the open door panel, hinged on the left ----
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.42, 0.85, 0.05); // left edge of the opening
  doorPivot.rotation.y = -Math.PI / 3.2;     // ~56° swung inward
  group.add(doorPivot);

  // 5 vertical planks extending right from the hinge
  const plankW = 0.17;
  for (let i = 0; i < 5; i++) {
    const xOff = 0.08 + i * plankW;
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(plankW - 0.01, 1.65, 0.08),
      i % 2 === 0 ? MAT.wood : MAT.woodWeathered
    );
    plank.position.set(xOff, 0, 0);
    doorPivot.add(plank);

    // arched plank tops (taper down toward the right edge)
    const archTop = new THREE.Mesh(
      new THREE.BoxGeometry(plankW - 0.01, 0.45, 0.08),
      i % 2 === 0 ? MAT.wood : MAT.woodWeathered
    );
    const taper = Math.max(0, 0.3 - Math.abs(xOff - 0.5) * 0.4);
    archTop.position.set(xOff, 0.93 + taper, 0);
    doorPivot.add(archTop);
  }

  // iron straps with rivets (on the open door)
  for (const y of [-0.55, 0.55]) {
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.07, 0.04),
      MAT.iron
    );
    strap.position.set(0.46, y, 0.05);
    doorPivot.add(strap);
    for (const xx of [0.12, 0.78]) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), MAT.iron);
      rivet.position.set(xx, y, 0.07);
      doorPivot.add(rivet);
    }
  }

  // iron handle on the open-edge of the door
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.018, 6, 12),
    MAT.iron
  );
  handle.position.set(0.78, -0.15, 0.06);
  handle.rotation.y = Math.PI / 2;
  doorPivot.add(handle);

  const handlePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.18, 0.02),
    MAT.iron
  );
  handlePlate.position.set(0.78, -0.15, 0.05);
  doorPivot.add(handlePlate);

  // hinge pins — visible at the left edge
  for (const y of [0.6, -0.6]) {
    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6),
      MAT.iron
    );
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0.04, y, 0.05);
    doorPivot.add(hinge);
  }

  // ---- threshold step under the doorway ----
  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.06, 0.22),
    MAT.woodDark
  );
  threshold.position.set(0, 0.04, 0.08);
  group.add(threshold);

  // a small worn-stone slab in front of the threshold
  const stoneStep = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.05, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x6e6862, roughness: 1, flatShading: true })
  );
  stoneStep.position.set(0, 0.025, 0.32);
  group.add(stoneStep);

  // ---- pentagram sigil + charm above the door (frame, not the door) ----
  const star = new THREE.Mesh(
    new THREE.RingGeometry(0.1, 0.14, 5),
    MAT.trimGold
  );
  star.position.set(0, 1.55, 0.13);
  group.add(star);

  const charm = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 6, 6),
    MAT.parchment
  );
  charm.position.set(-0.25, 1.55, 0.13);
  group.add(charm);

  // ---- flanking iron sconces beside the doorway ----
  for (const dx of [-0.72, 0.72]) {
    // mounting bracket
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.26, 0.08),
      MAT.iron
    );
    bracket.position.set(dx, 1.05, 0.12);
    group.add(bracket);

    // sconce body
    const sconce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.05, 0.18, 8, 1, true),
      MAT.iron
    );
    sconce.position.set(dx, 1.18, 0.18);
    group.add(sconce);

    // glowing flame inside the sconce
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.2, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffcc66,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
    );
    flame.position.set(dx, 1.32, 0.18);
    group.add(flame);
  }
}

// ---------------- big arched stained-glass window on upper tower ----------------

function buildBigStainedWindow(hut) {
  // large arched window on the upper tower facing front (toward camera)
  const y = TOWER1_TOP + TOWER2_HEIGHT * 0.5;
  const z = TOWER2_TOP_R - 0.04;

  const group = new THREE.Group();
  group.position.set(0, y, z);
  hut.add(group);

  // outer arched frame: rectangular base + half-circle top
  const lower = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.08), MAT.woodDark);
  lower.position.y = -0.2;
  group.add(lower);

  const upper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.475, 0.475, 0.08, 16, 1, false, 0, Math.PI),
    MAT.woodDark
  );
  upper.rotation.z = Math.PI / 2;
  upper.rotation.y = Math.PI / 2;
  upper.position.y = 0.22;
  group.add(upper);

  // glowing pane (rectangle + half-circle)
  const paneRect = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), MAT.glassMagic);
  paneRect.position.set(0, -0.2, 0.05);
  group.add(paneRect);

  const paneArc = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 16, 0, Math.PI),
    MAT.glassMagic
  );
  paneArc.position.set(0, 0.22, 0.05);
  paneArc.rotation.z = 0;
  group.add(paneArc);

  // stained-glass radial mullions in the arched top
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.03, 0.03), MAT.woodDark);
    m.rotation.z = -Math.PI / 2 + a;
    m.position.set(0, 0.22, 0.07);
    group.add(m);
  }

  // vertical and horizontal mullions in the rectangle
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 0.03), MAT.woodDark);
  m1.position.set(0, -0.2, 0.07);
  group.add(m1);
  const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.03), MAT.woodDark);
  m2.position.set(0, -0.2, 0.07);
  group.add(m2);

  // central jewel boss
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), MAT.crystal);
  boss.position.set(0, 0.22, 0.1);
  group.add(boss);

  // window sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.18), MAT.trim);
  sill.position.y = -0.65;
  group.add(sill);

  // strong magical light spilling from the window
  const winLight = new THREE.PointLight(0xc8a8ff, 1.0, 8, 2);
  winLight.position.set(0, y, z + 0.6);
  hut.add(winLight);
}

// ---------------- portholes (small round windows) ----------------

function buildPortholes(hut) {
  // 4 small portholes scattered on the lower tower
  const spots = [
    { angle: Math.PI * 0.85, y: FOUNDATION_TOP + 1.4, mat: MAT.glassWarm, color: 0xffaa55 },
    { angle: Math.PI * 1.15, y: FOUNDATION_TOP + 1.2, mat: MAT.glassBlue, color: 0x6699ff },
    { angle: Math.PI * 1.5, y: FOUNDATION_TOP + 1.6, mat: MAT.glassPurple, color: 0x9966ff },
    { angle: Math.PI * 1.8, y: FOUNDATION_TOP + 1.0, mat: MAT.glassWarm, color: 0xffaa55 },
  ];
  for (const s of spots) {
    const r = TOWER1_TOP_R + 0.05;
    const x = Math.cos(s.angle) * r;
    const z = Math.sin(s.angle) * r;

    const pane = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), s.mat);
    pane.position.set(x, s.y, z);
    pane.lookAt(pane.position.clone().multiplyScalar(2));
    hut.add(pane);

    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.04, 5, 14),
      MAT.woodDark
    );
    frame.position.set(x, s.y, z);
    frame.lookAt(frame.position.clone().multiplyScalar(2));
    hut.add(frame);

    // simple cross mullions
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.02), MAT.woodDark);
      m.position.set(x, s.y, z);
      m.lookAt(m.position.clone().multiplyScalar(2));
      m.rotateZ((i / 2) * Math.PI);
      hut.add(m);
    }
    // (porthole pane material is emissive — no point light needed)
  }
}

// ---------------- chimney (off-axis stone) ----------------

function buildChimney(hut) {
  // chimney offset from center, on the back-left
  const cx = -0.7;
  const cz = -0.5;
  const yBase = TOWER2_TOP + 1.2;

  // built from layered stones
  for (let i = 0; i < 16; i++) {
    const layer = Math.floor(i / 4);
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.18 + Math.random() * 0.05, 0.18, 0.18 + Math.random() * 0.05),
      Math.random() > 0.5 ? MAT.stone : MAT.stoneDark
    );
    const off = (i % 4) / 4;
    stone.position.set(
      cx + Math.cos(off * Math.PI * 2) * 0.2,
      yBase + layer * 0.18,
      cz + Math.sin(off * Math.PI * 2) * 0.2
    );
    stone.rotation.y = Math.random() * 0.3;
    hut.add(stone);
  }

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.1, 0.55),
    MAT.stoneDark
  );
  cap.position.set(cx, yBase + 1.0, cz);
  hut.add(cap);
  // (omitted ember point light — chimney smoke is animated above)
}

// ---------------- climbing vines on the tower ----------------

function buildVines(hut) {
  for (let v = 0; v < 4; v++) {
    const startAngle = (v / 4) * Math.PI * 2 + Math.random() * 0.5 + 0.5;
    const points = [];
    const climbHeight = TOWER1_HEIGHT + 0.2;
    const turns = 1.2 + Math.random() * 0.7;
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = startAngle + t * turns * Math.PI;
      const r = TOWER1_TOP_R + 0.05 + Math.sin(t * Math.PI * 3) * 0.05;
      const y = FOUNDATION_TOP + t * climbHeight;
      points.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.04, 5, false),
      MAT.vine
    );
    hut.add(tube);

    // leaf clusters along the vine
    for (let i = 2; i < points.length - 1; i += 2) {
      const p = points[i];
      const leafCount = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < leafCount; j++) {
        const leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.12 + Math.random() * 0.06, 0),
          Math.random() > 0.5 ? MAT.leaf : MAT.leafBright
        );
        leaf.position.copy(p);
        leaf.position.x += (Math.random() - 0.5) * 0.18;
        leaf.position.y += (Math.random() - 0.5) * 0.12;
        leaf.position.z += (Math.random() - 0.5) * 0.18;
        leaf.scale.set(1.2, 0.5, 1.2);
        leaf.rotation.set(Math.random(), Math.random(), Math.random());
        hut.add(leaf);
      }
    }
  }
}

// ---------------- hanging lanterns ----------------

function buildHangingLanterns(hut) {
  // one by the door, one off the balcony, one off the bay turret
  const spots = [
    { x: 0.85, y: FOUNDATION_TOP + 1.5, z: TOWER1_TOP_R + 0.4 },
    { x: -1.6, y: TOWER1_TOP + 0.6, z: -0.5 },
  ];
  for (const s of spots) {
    const lantern = makeHangingLantern();
    lantern.position.set(s.x, s.y, s.z);
    hut.add(lantern);
    // (lantern core uses an emissive basic material — no point light)
  }
}

function makeHangingLantern() {
  const g = new THREE.Group();
  const chain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4),
    MAT.iron
  );
  chain.position.y = 0.27;
  g.add(chain);
  for (const [dx, dz] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.26, 0.018),
      MAT.iron
    );
    post.position.set(dx, 0, dz);
    g.add(post);
  }
  for (const y of [-0.13, 0.13]) {
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.02, 0.18),
      MAT.iron
    );
    rim.position.y = y;
    g.add(rim);
  }
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.18, 0.12),
    MAT.glassWarm
  );
  g.add(core);
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.1, 4),
    MAT.iron
  );
  cap.position.y = 0.18;
  cap.rotation.y = Math.PI / 4;
  g.add(cap);
  return g;
}

// ---------------- mushrooms / herbs at the base ----------------

function buildBaseDetails(hut) {
  // mushroom clusters
  const positions = [
    { x: 1.6, z: 1.4, big: true },
    { x: 1.8, z: 1.55, big: false },
    { x: 1.45, z: 1.6, big: false },
    { x: -1.7, z: -1.2, big: true },
    { x: -1.55, z: -1.35, big: false },
    { x: 0.3, z: 2.05, big: false },
    { x: -0.4, z: -2.0, big: true },
  ];
  for (const p of positions) {
    const m = makeMushroom(p.big);
    m.position.set(p.x, 0, p.z);
    m.rotation.y = Math.random() * Math.PI;
    hut.add(m);
  }

  // grass tufts up against the foundation
  for (let i = 0; i < 32; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = TOWER1_BOTTOM_R + 0.15 + Math.random() * 0.4;
    const tuft = makeGrassTuft();
    tuft.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    tuft.rotation.y = Math.random() * Math.PI;
    hut.add(tuft);
  }

  // a small barrel by the door
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.5, 12),
    MAT.woodWarm
  );
  barrel.position.set(-1.0, 0.25, 1.4);
  hut.add(barrel);
  for (const y of [0.1, 0.4]) {
    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.018, 4, 16),
      MAT.iron
    );
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(-1.0, y, 1.4);
    hut.add(hoop);
  }

  // a small stack of books on the porch
  for (let i = 0; i < 3; i++) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.22 - i * 0.02, 0.06, 0.16),
      i % 2 === 0 ? MAT.bookCover : MAT.parchment
    );
    book.position.set(0.85, 0.06 + i * 0.06, 1.55);
    book.rotation.y = (Math.random() - 0.5) * 0.3;
    hut.add(book);
  }
}

function makeMushroom(big) {
  const g = new THREE.Group();
  const size = big ? 1 : 0.6;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * size, 0.08 * size, 0.32 * size, 8),
    MAT.mushroomStem
  );
  stem.position.y = 0.16 * size;
  g.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.18 * size, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mushroomCap
  );
  cap.position.y = 0.32 * size;
  cap.scale.y = 0.8;
  g.add(cap);
  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.13 * size;
    const spot = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * size, 6, 6),
      MAT.mushroomStem
    );
    spot.position.set(Math.cos(angle) * r, 0.32 * size + 0.04 * size, Math.sin(angle) * r);
    g.add(spot);
  }
  return g;
}

function makeGrassTuft() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.16 + Math.random() * 0.08, 3),
      MAT.leaf
    );
    const a = (i / 5) * Math.PI * 2 + Math.random();
    blade.position.set(Math.cos(a) * 0.04, blade.geometry.parameters.height / 2, Math.sin(a) * 0.04);
    blade.rotation.set(
      (Math.random() - 0.5) * 0.4,
      Math.random() * Math.PI,
      (Math.random() - 0.5) * 0.4
    );
    g.add(blade);
  }
  return g;
}

// ---------------- crystals at the foundation ----------------

function buildCrystals(hut) {
  const spots = [
    { x: 1.7, z: 0.9, h: 0.95, mat: MAT.crystal },
    { x: -1.85, z: 0.7, h: 1.15, mat: MAT.crystalGreen },
    { x: 1.5, z: -1.6, h: 0.7, mat: MAT.crystal },
    { x: -1.4, z: -1.8, h: 0.85, mat: MAT.crystal },
  ];
  for (const c of spots) {
    const cluster = new THREE.Group();
    const main = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, c.h, 5),
      c.mat
    );
    main.position.y = c.h / 2;
    cluster.add(main);

    for (let i = 0; i < 3; i++) {
      const small = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, c.h * 0.55, 5),
        c.mat
      );
      const a = (i / 3) * Math.PI * 2 + Math.random();
      small.position.set(Math.cos(a) * 0.18, c.h * 0.27, Math.sin(a) * 0.18);
      small.rotation.z = (Math.random() - 0.5) * 0.5;
      cluster.add(small);
    }
    cluster.position.set(c.x, 0.05, c.z);
    cluster.rotation.y = Math.random() * Math.PI;
    cluster.rotation.z = (Math.random() - 0.5) * 0.2;
    hut.add(cluster);
    // (crystals are emissive — no point light)
  }
}

// ---------------- hanging banner from balcony ----------------

function buildHangingBanner(hut) {
  // a long vertical banner draped over the front of the balcony
  const bannerY = TOWER1_TOP - 0.05;

  // banner cloth (3 vertical stripe panels)
  const stripes = [0x603848, 0x8a4a30, 0x603848];
  for (let i = 0; i < stripes.length; i++) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 1.3),
      new THREE.MeshStandardMaterial({
        color: stripes[i],
        roughness: 0.95,
        side: THREE.DoubleSide,
        flatShading: true,
      })
    );
    stripe.position.set(-0.66 + i * 0.22, bannerY - 0.7, TOWER2_BOTTOM_R + 0.05);
    hut.add(stripe);
  }

  // sigil patch
  const sigil = new THREE.Mesh(
    new THREE.RingGeometry(0.08, 0.12, 5),
    MAT.trimGold
  );
  sigil.position.set(-0.22, bannerY - 0.55, TOWER2_BOTTOM_R + 0.07);
  hut.add(sigil);

  // bottom tasseled trim — 5 small triangles
  for (let i = 0; i < 5; i++) {
    const tassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.16, 4),
      MAT.trimGold
    );
    tassel.position.set(-0.66 + i * 0.275, bannerY - 1.4, TOWER2_BOTTOM_R + 0.06);
    tassel.rotation.x = Math.PI;
    hut.add(tassel);
  }
}

// ---------------- floating spell book visible through the window ----------------

function buildFloatingBook(hut) {
  // a book hovering inside the tower at the upper-window height — visible through the glass
  const y = TOWER1_TOP + TOWER2_HEIGHT * 0.55;
  const book = new THREE.Group();
  book.position.set(0, y, 0);
  hut.add(book);

  // back cover
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.5), MAT.bookCover);
  back.position.y = -0.04;
  book.add(back);

  // pages (open spread)
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.46), MAT.bookPages);
  pages.position.y = 0.005;
  book.add(pages);

  // spine
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.5), MAT.bookCover);
  spine.position.set(0, -0.01, 0);
  book.add(spine);

  // small magical glow above the open book — emissive sphere instead of a light
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xc8a8ff,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
  );
  glow.position.set(0, 0.18, 0);
  book.add(glow);

  // tilt the book so it reads as floating-open
  book.rotation.set(0, Math.PI / 6, -0.1);
}

// ---------------- glowing rune carvings on the lower tower walls ----------------

function buildWallRunes(hut) {
  // small emissive rectangular sigils carved into a few faces of the lower tower
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0x331a55,
    emissive: 0x9966ff,
    emissiveIntensity: 1.4,
    roughness: 0.8,
  });

  const spots = [
    { angle: Math.PI * 0.25, y: FOUNDATION_TOP + 1.4, w: 0.18, h: 0.32 },
    { angle: Math.PI * 0.62, y: FOUNDATION_TOP + 1.7, w: 0.2, h: 0.2 },
    { angle: Math.PI * 1.05, y: FOUNDATION_TOP + 1.5, w: 0.16, h: 0.28 },
    { angle: Math.PI * 1.4, y: FOUNDATION_TOP + 1.9, w: 0.22, h: 0.22 },
    { angle: Math.PI * 1.78, y: FOUNDATION_TOP + 1.2, w: 0.18, h: 0.3 },
  ];
  for (const s of spots) {
    const r = TOWER1_TOP_R + 0.04;
    const rune = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), runeMat);
    rune.position.set(Math.cos(s.angle) * r, s.y, Math.sin(s.angle) * r);
    rune.lookAt(rune.position.clone().multiplyScalar(2));
    hut.add(rune);
    // (rune material is emissive — no point light needed)
  }
}

// ---------------- crystals embedded in the wall ----------------

function buildWallCrystals(hut) {
  // small crystal shards poking through the wall planks at varied positions
  const spots = [
    { angle: Math.PI * 0.4, y: FOUNDATION_TOP + 0.9, mat: MAT.crystal },
    { angle: Math.PI * 1.2, y: FOUNDATION_TOP + 2.2, mat: MAT.crystalGreen },
    { angle: Math.PI * 1.7, y: FOUNDATION_TOP + 2.0, mat: MAT.crystal },
    { angle: Math.PI * 0.95, y: FOUNDATION_TOP + 0.6, mat: MAT.crystalGreen },
  ];
  for (const s of spots) {
    const r = TOWER1_TOP_R + 0.05;
    const x = Math.cos(s.angle) * r;
    const z = Math.sin(s.angle) * r;

    const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 5), s.mat);
    crystal.position.set(x, s.y, z);
    crystal.lookAt(crystal.position.clone().multiplyScalar(2));
    crystal.rotateX(Math.PI / 2);
    crystal.rotateZ(Math.random() * Math.PI);
    hut.add(crystal);

    // a smaller satellite shard
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), s.mat);
    shard.position.set(x + Math.cos(s.angle) * 0.05, s.y - 0.06, z + Math.sin(s.angle) * 0.05);
    shard.lookAt(shard.position.clone().multiplyScalar(2));
    shard.rotateX(Math.PI / 2);
    shard.rotateZ(Math.random() * Math.PI);
    hut.add(shard);
    // (crystal material is emissive — no extra point light)
  }
}

// ---------------- exterior spiral staircase wrapping the lower tower ----------------

function buildSpiralStairs(hut) {
  // wraps from ground to the balcony level, going around the back/left so it
  // doesn't conflict with the door (front, +Z) or the bay turret (~45°)
  const steps = 14;
  const startAngle = Math.PI * 1.05; // back-left-ish
  const endAngle = Math.PI * 2.45;   // wraps around past the back to land on the balcony entry
  const yStart = 0.05;
  const yEnd = TOWER1_TOP - 0.05;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const a = startAngle + t * (endAngle - startAngle);
    const y = yStart + t * (yEnd - yStart);

    const r = TOWER1_TOP_R + 0.18;
    // step plank — slightly tilted to follow the spiral upward
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.32),
      MAT.woodWeathered
    );
    step.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    step.lookAt(0, y, 0);
    hut.add(step);

    // outer rail post every other step
    if (i % 2 === 0) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.5, 5),
        MAT.woodDark
      );
      post.position.set(Math.cos(a) * (r + 0.18), y + 0.27, Math.sin(a) * (r + 0.18));
      hut.add(post);
    }

    // small bracket attaching the step to the wall
    const bracket = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.2, 4),
      MAT.iron
    );
    bracket.position.set(Math.cos(a) * (r - 0.12), y - 0.08, Math.sin(a) * (r - 0.12));
    bracket.rotation.x = Math.PI;
    bracket.rotation.y = -a;
    hut.add(bracket);
  }

  // continuous sloped handrail approximation — short straight segments connecting the posts
  for (let i = 0; i < steps - 1; i++) {
    const t1 = i / (steps - 1);
    const t2 = (i + 1) / (steps - 1);
    const a1 = startAngle + t1 * (endAngle - startAngle);
    const a2 = startAngle + t2 * (endAngle - startAngle);
    const y1 = yStart + t1 * (yEnd - yStart) + 0.5;
    const y2 = yStart + t2 * (yEnd - yStart) + 0.5;
    const r = TOWER1_TOP_R + 0.36;
    const x1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
    const x2 = Math.cos(a2) * r, z2 = Math.sin(a2) * r;

    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.hypot(dx, dy, dz);
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, len, 4),
      MAT.woodDark
    );
    rail.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    // align cylinder along the rail direction
    rail.lookAt(x2, y2, z2);
    rail.rotateX(Math.PI / 2);
    hut.add(rail);
  }
}

// ---------------- gargoyles perched on the lower roof ----------------

function buildGargoyles(hut) {
  const gargMat = new THREE.MeshStandardMaterial({
    color: 0x4a4540,
    roughness: 1,
    flatShading: true,
  });

  // 2 gargoyles at opposite-ish positions on the lower roof shoulder
  const spots = [
    { angle: Math.PI * 0.7, y: TOWER2_TOP + 0.45 },
    { angle: Math.PI * 1.7, y: TOWER2_TOP + 0.45 },
  ];
  for (const s of spots) {
    const r = TOWER2_TOP_R + 0.1;
    const garg = buildGargoyle(gargMat);
    garg.position.set(Math.cos(s.angle) * r, s.y, Math.sin(s.angle) * r);
    garg.rotation.y = -s.angle + Math.PI / 2;
    // slight forward tilt so it leans outward
    garg.rotation.x = -0.15;
    hut.add(garg);
  }
}

function buildGargoyle(mat) {
  const g = new THREE.Group();

  // crouched body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mat);
  body.scale.set(1, 0.85, 1.1);
  body.position.y = 0.2;
  g.add(body);

  // head (forward-tilted)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat);
  head.position.set(0, 0.32, 0.1);
  head.scale.set(1, 0.9, 1.2);
  g.add(head);

  // horns / ears
  for (const dx of [-0.06, 0.06]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 4), mat);
    horn.position.set(dx, 0.42, 0.06);
    horn.rotation.x = -0.3;
    g.add(horn);
  }

  // wing nubs (folded)
  for (const dx of [-0.13, 0.13]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 3), mat);
    wing.position.set(dx, 0.25, -0.05);
    wing.rotation.z = dx > 0 ? -0.4 : 0.4;
    g.add(wing);
  }

  // tail curling up behind
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 4, 8, Math.PI), mat);
  tail.position.set(0, 0.18, -0.18);
  tail.rotation.x = Math.PI / 2;
  g.add(tail);

  // base perch — a small rough stone
  const perch = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.14, 0),
    new THREE.MeshStandardMaterial({ color: 0x5a5550, roughness: 1, flatShading: true })
  );
  perch.position.y = 0.05;
  g.add(perch);

  return g;
}

// ---------------- owl perched on the porch overhang ----------------

function buildOwl(hut) {
  // sits on top of the porch overhang, watching the entrance
  const g = new THREE.Group();
  g.position.set(0.55, FOUNDATION_TOP + 2.25, TOWER1_TOP_R + 0.55);
  g.rotation.y = -Math.PI * 0.15;
  hut.add(g);

  const featherDark = new THREE.MeshStandardMaterial({
    color: 0x4a3a2a,
    roughness: 0.9,
    flatShading: true,
  });
  const featherLight = new THREE.MeshStandardMaterial({
    color: 0x8a7458,
    roughness: 0.9,
    flatShading: true,
  });

  // body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), featherDark);
  body.scale.set(1, 1.2, 0.95);
  body.position.y = 0.18;
  g.add(body);

  // belly tuft (lighter)
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), featherLight);
  belly.position.set(0, 0.16, 0.06);
  belly.scale.set(1, 1.1, 0.5);
  g.add(belly);

  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), featherDark);
  head.position.y = 0.38;
  head.scale.set(1.05, 0.95, 1.0);
  g.add(head);

  // eye discs (large round face plates)
  for (const dx of [-0.06, 0.06]) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd866, roughness: 0.7 })
    );
    disc.position.set(dx, 0.4, 0.11);
    g.add(disc);
    // pupil
    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.02, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    pupil.position.set(dx, 0.4, 0.115);
    g.add(pupil);
  }

  // beak
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.025, 0.06, 4),
    new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.6 })
  );
  beak.position.set(0, 0.36, 0.12);
  beak.rotation.x = Math.PI / 2;
  g.add(beak);

  // ear tufts
  for (const dx of [-0.07, 0.07]) {
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.08, 4),
      featherDark
    );
    tuft.position.set(dx, 0.5, 0);
    tuft.rotation.x = -0.25;
    g.add(tuft);
  }

  // talons (just hint at them under the body)
  for (const dx of [-0.04, 0.04]) {
    const talon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.05, 4),
      new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.6 })
    );
    talon.position.set(dx, 0.04, 0.04);
    g.add(talon);
  }
}

// ---------------- brass telescope on a wooden mount ----------------

function buildTelescope(hut) {
  // mounted on a short wooden platform protruding from the upper tower at the back
  const angle = Math.PI * 1.3; // back-left
  const r = TOWER2_TOP_R + 0.05;
  const baseX = Math.cos(angle) * r;
  const baseY = TOWER1_TOP + TOWER2_HEIGHT * 0.6;
  const baseZ = Math.sin(angle) * r;

  const brass = new THREE.MeshStandardMaterial({
    color: 0xc09040,
    roughness: 0.4,
    metalness: 0.7,
  });

  // wooden support platform sticking out of the wall
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.06, 0.55),
    MAT.woodDark
  );
  platform.position.set(
    baseX + Math.cos(angle) * 0.25,
    baseY - 0.05,
    baseZ + Math.sin(angle) * 0.25
  );
  platform.lookAt(0, baseY, 0);
  hut.add(platform);

  // platform brackets
  for (let i = 0; i < 2; i++) {
    const bracket = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.3, 4),
      MAT.woodDark
    );
    const off = (i === 0 ? -0.18 : 0.18);
    bracket.position.set(
      baseX + Math.cos(angle) * 0.05 + Math.cos(angle + Math.PI / 2) * off,
      baseY - 0.22,
      baseZ + Math.sin(angle) * 0.05 + Math.sin(angle + Math.PI / 2) * off
    );
    bracket.rotation.x = Math.PI;
    bracket.rotation.y = -angle;
    hut.add(bracket);
  }

  // tripod / pivot at the platform top
  const pivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    MAT.iron
  );
  pivot.position.set(
    baseX + Math.cos(angle) * 0.25,
    baseY + 0.02,
    baseZ + Math.sin(angle) * 0.25
  );
  hut.add(pivot);

  // telescope tube (brass), tilted up toward the sky
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 0.7, 12),
    brass
  );
  // place along a vector pointing up + outward
  const tilt = 0.6; // tilt up
  tube.position.set(
    baseX + Math.cos(angle) * 0.5,
    baseY + 0.34,
    baseZ + Math.sin(angle) * 0.5
  );
  // rotate so tube axis (default Y) points along the tilt direction outward + up
  const dir = new THREE.Vector3(Math.cos(angle), 1.2, Math.sin(angle)).normalize();
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  hut.add(tube);

  // brass rings around the tube
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.055 + i * 0.008, 0.012, 4, 12),
      brass
    );
    const offset = -0.25 + i * 0.25;
    ring.position.copy(tube.position);
    ring.position.add(dir.clone().multiplyScalar(offset));
    ring.quaternion.copy(tube.quaternion);
    hut.add(ring);
  }

  // wider eyepiece flare (back end)
  const eyepiece = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.06, 0.12, 12),
    brass
  );
  eyepiece.position.copy(tube.position);
  eyepiece.position.sub(dir.clone().multiplyScalar(0.42));
  eyepiece.quaternion.copy(tube.quaternion);
  hut.add(eyepiece);

  // objective lens cap (front end)
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.08, 0.08, 12),
    MAT.iron
  );
  lens.position.copy(tube.position);
  lens.position.add(dir.clone().multiplyScalar(0.4));
  lens.quaternion.copy(tube.quaternion);
  hut.add(lens);
}

// ---------------- bubbling cauldron at the entrance ----------------

function buildCauldron(hut) {
  const g = new THREE.Group();
  g.position.set(-0.95, 0.15, TOWER1_TOP_R + 0.55);
  hut.add(g);

  // 3 short iron legs
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.22, 5),
      MAT.iron
    );
    leg.position.set(Math.cos(a) * 0.2, -0.1, Math.sin(a) * 0.2);
    g.add(leg);
  }

  // cauldron pot — a sphere bottom + open top opening
  const pot = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.65),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a20,
      roughness: 0.6,
      metalness: 0.4,
      flatShading: true,
    })
  );
  pot.position.y = 0.1;
  g.add(pot);

  // rim trim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.03, 5, 16),
    MAT.iron
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.21;
  g.add(rim);

  // handle (half torus)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.018, 5, 12, Math.PI),
    MAT.iron
  );
  handle.rotation.z = Math.PI;
  handle.position.set(0, 0.24, 0);
  g.add(handle);

  // bubbling green brew surface
  const brewMat = new THREE.MeshStandardMaterial({
    color: 0x55c060,
    emissive: 0x40a040,
    emissiveIntensity: 0.9,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
  });
  const brew = new THREE.Mesh(new THREE.CircleGeometry(0.24, 18), brewMat);
  brew.rotation.x = -Math.PI / 2;
  brew.position.y = 0.18;
  g.add(brew);

  // bubbles rising — small spheres that animate up
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0x88e090,
    emissive: 0x55a060,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.85,
  });
  const bubbles = [];
  for (let i = 0; i < 6; i++) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 + Math.random() * 0.025, 8, 8),
      bubbleMat
    );
    bubble.userData.startY = 0.18 + Math.random() * 0.05;
    bubble.userData.peakY = 0.55 + Math.random() * 0.25;
    bubble.userData.speed = 0.8 + Math.random() * 0.6;
    bubble.userData.phase = Math.random() * Math.PI * 2;
    bubble.userData.rx = (Math.random() - 0.5) * 0.18;
    bubble.userData.rz = (Math.random() - 0.5) * 0.18;
    bubble.position.set(bubble.userData.rx, bubble.userData.startY, bubble.userData.rz);
    g.add(bubble);
    bubbles.push(bubble);
  }

  // green light from inside the cauldron
  const brewLight = new THREE.PointLight(0x66e070, 0.65, 4, 2);
  brewLight.position.y = 0.25;
  g.add(brewLight);

  return (t) => {
    for (const b of bubbles) {
      const cycle = ((t * b.userData.speed + b.userData.phase) % 1.4) / 1.4;
      b.position.y = b.userData.startY + (b.userData.peakY - b.userData.startY) * cycle;
      const fade = 1 - Math.max(0, (cycle - 0.7) / 0.3);
      b.material.opacity = 0.85 * fade;
      b.scale.setScalar(1 + cycle * 0.4);
    }
    // gentle brew shimmer
    brew.scale.set(1 + Math.sin(t * 3) * 0.04, 1, 1 + Math.cos(t * 2.5) * 0.04);
    brewLight.intensity = 0.65 + Math.sin(t * 4) * 0.15;
  };
}

// ---------------- wind chimes hanging from the porch ----------------

function buildWindChimes(hut) {
  const g = new THREE.Group();
  g.position.set(-0.5, FOUNDATION_TOP + 1.8, TOWER1_TOP_R + 0.5);
  hut.add(g);

  // top crossbar
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5),
    MAT.iron
  );
  bar.rotation.z = Math.PI / 2;
  g.add(bar);

  // 5 thin metal chimes hanging at varying lengths
  const chimes = [];
  const lengths = [0.32, 0.42, 0.36, 0.28, 0.4];
  for (let i = 0; i < lengths.length; i++) {
    const x = -0.2 + i * 0.1;
    const chime = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, lengths[i], 5),
      MAT.trimGold
    );
    chime.position.set(x, -lengths[i] / 2 - 0.05, 0);
    chime.userData.basePhase = Math.random() * Math.PI * 2;
    chime.userData.baseX = x;
    g.add(chime);
    chimes.push(chime);
  }

  // central chime striker
  const striker = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    MAT.iron
  );
  striker.position.set(0, -0.5, 0);
  g.add(striker);

  return (t) => {
    for (const c of chimes) {
      // gentle swing — small rotation around z based on a slow sine
      c.rotation.z = Math.sin(t * 0.6 + c.userData.basePhase) * 0.08;
    }
    // striker swings slightly
    striker.position.x = Math.sin(t * 0.4) * 0.04;
  };
}

// ---------------- magical wisps drifting around the spire orb ----------------

function buildSpireWisps(hut) {
  // the bent spire's orb is at world hut-local (~0.5, ROOF_TIP_Y + 1.85, 0)
  const center = new THREE.Vector3(0.5, ROOF_TIP_Y + 1.85, 0);
  const wispMat = new THREE.MeshBasicMaterial({
    color: 0xc8d8ff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const wisps = [];
  for (let i = 0; i < 5; i++) {
    const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), wispMat);
    wisp.userData.basePhase = (i / 5) * Math.PI * 2;
    wisp.userData.tilt = (Math.random() - 0.5) * 0.6;
    wisp.userData.radius = 0.35 + Math.random() * 0.25;
    wisp.userData.speed = 0.5 + Math.random() * 0.4;
    wisp.userData.heightOffset = (Math.random() - 0.5) * 0.4;
    hut.add(wisp);
    wisps.push(wisp);
  }

  return (t) => {
    for (const w of wisps) {
      const angle = t * w.userData.speed + w.userData.basePhase;
      w.position.set(
        center.x + Math.cos(angle) * w.userData.radius,
        center.y + w.userData.heightOffset + Math.sin(angle * 1.5) * 0.15,
        center.z + Math.sin(angle) * w.userData.radius
      );
      // pulse opacity
      w.material.opacity = 0.7 + Math.sin(t * 2 + w.userData.basePhase) * 0.25;
    }
  };
}

// ---------------- chimney smoke ----------------

function buildChimneySmoke(hut) {
  // chimney cap top is roughly at (-0.7, TOWER2_TOP + 2.2, -0.5) — the cap
  // in buildChimney is at yBase + 1.0 = TOWER2_TOP + 2.2
  const startPos = new THREE.Vector3(-0.7, TOWER2_TOP + 2.25, -0.5);

  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xb8b8c0,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), smokeMat.clone());
    puff.userData.cycleStart = (i / 7) * 4;
    puff.userData.driftX = (Math.random() - 0.5) * 0.4;
    puff.userData.driftZ = (Math.random() - 0.5) * 0.4;
    hut.add(puff);
    puffs.push(puff);
  }

  return (t) => {
    for (const p of puffs) {
      // each puff cycles every ~4s with staggered start
      const tt = ((t - p.userData.cycleStart) % 4 + 4) % 4;
      const k = tt / 4;
      p.position.x = startPos.x + p.userData.driftX * k;
      p.position.y = startPos.y + k * 1.8;
      p.position.z = startPos.z + p.userData.driftZ * k;
      // grow + fade
      p.scale.setScalar(0.4 + k * 1.4);
      p.material.opacity = 0.5 * (1 - k);
    }
  };
}

// ---------------- ground aura ring ----------------

function buildAuraRing(hut) {
  // a faint glowing ring at the foundation base, pulsing softly
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(TOWER1_BOTTOM_R + 0.5, TOWER1_BOTTOM_R + 1.0, 36),
    new THREE.MeshBasicMaterial({
      color: 0x9966ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  hut.add(ring);

  return (t) => {
    ring.material.opacity = 0.12 + Math.sin(t * 0.8) * 0.08;
    ring.scale.setScalar(1 + Math.sin(t * 0.6) * 0.04);
  };
}

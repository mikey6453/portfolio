import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121633);
  scene.fog = new THREE.Fog(0x121633, 18, 70);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(8, 5, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // pixel ratio capped at 1.5 — going higher on retina screens roughly doubles
  // the per-frame fragment work for very little visual gain at this art style
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // every shadow caster in this scene is static, so we render the shadow map
  // once and reuse it. main.js flips needsUpdate on the first frame.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.getElementById('app').appendChild(renderer.domElement);

  // base fill — cool blue, much brighter than before
  const ambient = new THREE.AmbientLight(0x4a6a9a, 0.85);
  scene.add(ambient);

  // sky/ground tint for depth
  const hemi = new THREE.HemisphereLight(0xa8c0ff, 0x2a3a25, 0.55);
  scene.add(hemi);

  // primary moonlight — bright, casts shadows. shadow map kept modest for perf.
  const moonLight = new THREE.DirectionalLight(0xc4d4ff, 1.6);
  moonLight.position.set(-10, 14, -6);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -16;
  moonLight.shadow.camera.right = 16;
  moonLight.shadow.camera.top = 16;
  moonLight.shadow.camera.bottom = -16;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 35;
  moonLight.shadow.bias = -0.0005;
  scene.add(moonLight);

  // visible half-moon disc up in the sky
  addMoon(scene, moonLight.position);

  addStarfield(scene);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}

function addMoon(scene, lightPos) {
  // place the moon disc out along the light direction, far away
  const dir = lightPos.clone().normalize();
  const distance = 55;
  const moonPos = dir.multiplyScalar(distance);

  // a soft glow halo behind the moon
  const haloTex = makeHaloTexture();
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: 0xb8c8ff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      fog: false,
    })
  );
  halo.scale.set(18, 18, 1);
  halo.position.copy(moonPos);
  scene.add(halo);

  // half-moon disc, made from a CanvasTexture
  const moonTex = makeHalfMoonTexture();
  const moon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: moonTex,
      transparent: true,
      depthWrite: false,
      fog: false,
    })
  );
  moon.scale.set(8, 8, 1);
  moon.position.copy(moonPos);
  scene.add(moon);

  // (the visible halo sprite already gives the moon visual presence — we omit
  // an additional point light here to save shader cost)
}

function makeHalfMoonTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // full moon disc
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#f0f4ff');
  grad.addColorStop(1, '#c8d4ff');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // crescent shadow — composite a darker offset disc to carve a half
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.55, cy, r * 1.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // soft inner shading along the terminator
  ctx.globalCompositeOperation = 'multiply';
  const term = ctx.createLinearGradient(cx - r, cy, cx + r * 0.4, cy);
  term.addColorStop(0, '#ffffff');
  term.addColorStop(0.85, '#ffffff');
  term.addColorStop(1, '#7080a0');
  ctx.fillStyle = term;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // a couple subtle craters
  ctx.fillStyle = 'rgba(120, 130, 160, 0.35)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.15, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - r * 0.15, cy + r * 0.35, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - r * 0.55, cy + r * 0.1, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeHaloTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, 'rgba(200, 215, 255, 0.6)');
  grad.addColorStop(0.4, 'rgba(160, 180, 230, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function addStarfield(scene) {
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.6 + 0.2);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    fog: false,
  });
  scene.add(new THREE.Points(geom, mat));
}

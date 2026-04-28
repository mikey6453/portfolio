import * as THREE from 'three';
import gsap from 'gsap';
import { showPanel, hidePanel, bindClose } from './ui.js';

// canonical reading order for the navigation tabs and arrow-key cycling
const SECTION_ORDER = ['About', 'Experience', 'Projects', 'Skills', 'Contact'];

export function setupInteractions({ scene, camera, controls, renderer, interactiveObjects }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const defaultPos = camera.position.clone();
  const defaultTarget = controls.target.clone();
  let focusedTarget = null;
  let hovered = null;
  let downAt = null;

  const dom = renderer.domElement;

  // section name → statue group, for tab + keyboard navigation
  const sectionToTarget = {};
  for (const obj of interactiveObjects) {
    if (obj.userData?.section) sectionToTarget[obj.userData.section] = obj;
  }

  // ---------- pointer (click + hover) ----------

  dom.addEventListener('pointerdown', (e) => {
    downAt = { x: e.clientX, y: e.clientY };
  });

  dom.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const dx = e.clientX - downAt.x;
    const dy = e.clientY - downAt.y;
    downAt = null;
    if (Math.hypot(dx, dy) > 6) return; // it was a drag, not a click
    setPointer(e);
    const target = pickInteractive();
    if (target) focusOn(target);
  });

  dom.addEventListener('pointermove', (e) => {
    setPointer(e);
    if (focusedTarget) return;
    const target = pickInteractive();
    if (target !== hovered) {
      if (hovered) animateHover(hovered, false);
      if (target) animateHover(target, true);
      hovered = target;
      dom.style.cursor = target ? 'pointer' : '';
    }
  });

  function setPointer(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function pickInteractive() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjects, true);
    for (const hit of hits) {
      let o = hit.object;
      while (o) {
        if (o.userData?.type === 'statue' || o.userData?.type === 'sign') return o;
        o = o.parent;
      }
    }
    return null;
  }

  function animateHover(target, isOver) {
    gsap.killTweensOf(target.position);
    gsap.to(target.position, {
      y: isOver ? 0.15 : 0,
      duration: 0.25,
      ease: 'power2.out',
    });
  }

  // ---------- focus / navigate ----------

  function focusOn(target) {
    if (!target) return;
    if (focusedTarget === target) return;

    const wasFocused = focusedTarget !== null;
    focusedTarget = target;
    controls.enabled = false;
    if (hovered) {
      animateHover(hovered, false);
      hovered = null;
      dom.style.cursor = '';
    }

    // kill any in-progress camera tweens so navigation feels responsive
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    const targetPos = target.getWorldPosition(new THREE.Vector3());
    const fromCenter = targetPos.clone().normalize();
    const camDest = targetPos.clone().add(fromCenter.multiplyScalar(2.6));
    camDest.y = 1.9;
    const targetLook = targetPos.clone();
    targetLook.y = 1.4;

    // if the panel is already open, swap content immediately so the tabs/keys
    // feel snappy. otherwise wait until the camera has arrived.
    const section = target.userData.section;
    if (wasFocused) showPanel(section);

    gsap.to(camera.position, {
      x: camDest.x,
      y: camDest.y,
      z: camDest.z,
      duration: 1.0,
      ease: 'power2.inOut',
    });
    gsap.to(controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
      onComplete: () => {
        if (!wasFocused) showPanel(section);
      },
    });

    setActiveTab(section);
  }

  function reset() {
    if (!focusedTarget) return;
    focusedTarget = null;
    hidePanel();
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.to(camera.position, {
      x: defaultPos.x,
      y: defaultPos.y,
      z: defaultPos.z,
      duration: 1.0,
      ease: 'power2.inOut',
    });
    gsap.to(controls.target, {
      x: defaultTarget.x,
      y: defaultTarget.y,
      z: defaultTarget.z,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
      onComplete: () => {
        controls.enabled = true;
      },
    });
    setActiveTab(null);
  }

  bindClose(reset);

  // ---------- tab buttons ----------

  const tabButtons = Array.from(document.querySelectorAll('#topnav button'));
  for (const btn of tabButtons) {
    btn.addEventListener('click', () => {
      const target = sectionToTarget[btn.dataset.section];
      if (target) focusOn(target);
    });
  }

  function setActiveTab(section) {
    for (const btn of tabButtons) {
      btn.classList.toggle('active', btn.dataset.section === section);
    }
  }

  // ---------- arrow-key navigation ----------

  document.addEventListener('keydown', (e) => {
    // only intercept arrow keys; let other keys pass through (esc is handled
    // by ui.js bindClose)
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    // ignore if the user is typing into something (e.g., overlay form fields)
    const tag = (e.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;

    e.preventDefault();
    navigateBy(e.key === 'ArrowRight' ? 1 : -1);
  });

  function navigateBy(direction) {
    const currentIdx = focusedTarget
      ? SECTION_ORDER.indexOf(focusedTarget.userData.section)
      : -1;
    const len = SECTION_ORDER.length;
    let nextIdx;
    if (currentIdx === -1) {
      // nothing focused yet — right starts at first, left starts at last
      nextIdx = direction > 0 ? 0 : len - 1;
    } else {
      nextIdx = (currentIdx + direction + len) % len;
    }
    const target = sectionToTarget[SECTION_ORDER[nextIdx]];
    if (target) focusOn(target);
  }
}

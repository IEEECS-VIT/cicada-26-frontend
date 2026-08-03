/*
 * tunnel.ts — Three.js wormhole timeline engine
 * ─────────────────────────────────────────────────────────────────
 * Port of timeline/main.js into the Next app. The TunnelScene class is
 * kept as-authored; only the scroll bookkeeping changed, because the
 * timeline no longer starts at the top of the document — the Cicada
 * landing hero now sits above it. See `journeyStart` in initTunnel.
 *
 * React renders the card / rail DOM (see TimelineSection.tsx); this
 * module only mutates it. Nothing here is allowed to touch React state.
 * ─────────────────────────────────────────────────────────────────
 */

import * as THREE from "three";

/* matchMedia can't run at module scope: this file is imported by a client
   component, which Next still renders on the server. Evaluated per call. */
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
const hoverCapable = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const PALETTE = {
  amber: 0xd69977,
  amberBright: 0xeec6a8,
  brown: 0x63493a,
  debris: 0x545662,
  starWarm: 0xd8b380,
  starCool: 0xffffff,
};

export type RoundStatus = "COMPLETE" | "ACTIVE" | "LOCKED";

export interface Round {
  code: string;
  title: string;
  date: string;
  status: RoundStatus;
  summary: string;
  briefing: string;
  objectives: [string, string][];
}

export const ROUNDS: Round[] = [
  { code: 'ROUND 01', title: 'FIRST CONTACT', date: '14 MAR 2067', status: 'COMPLETE',
    summary: 'Initial transmission decoded. Entry accepted.',
    briefing: 'A single burst signal repeated for six days before it was caught. Once isolated, the payload resolved into an invitation, not a threat.',
    objectives: [['ISOLATE SIGNAL', 'COMPLETE'], ['DECODE PAYLOAD', 'COMPLETE'], ['CONFIRM ENTRY', 'COMPLETE']] },
  { code: 'ROUND 02', title: 'CIPHER PROTOCOL', date: '02 APR 2067', status: 'ACTIVE',
    summary: 'Decode the transmission. Uncover the next coordinate.',
    briefing: 'A looping numeric transmission repeats every eleven seconds. Isolate the pattern, invert it, and the next coordinate resolves.',
    objectives: [['DECODE PAYLOAD', 'IN PROGRESS'], ['VERIFY CHECKSUM', 'PENDING'], ['SUBMIT COORDINATE', 'LOCKED']] },
  { code: 'ROUND 03', title: 'DEEP FIELD SCAN', date: '21 APR 2067', status: 'LOCKED',
    summary: 'Coordinates unlock at close of Round 02.',
    briefing: 'Long range scan protocols are staged and waiting on authorization from the prior round.',
    objectives: [['SCAN ARRAY', 'LOCKED'], ['TRIANGULATE', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 04', title: 'SIGNAL TRIANGULATION', date: '09 MAY 2067', status: 'LOCKED',
    summary: 'Three signals converge on a single origin.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['CROSS REFERENCE', 'LOCKED'], ['PLOT VECTOR', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 05', title: 'THE LONG SILENCE', date: '28 MAY 2067', status: 'LOCKED',
    summary: 'No transmission is still a transmission.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['MONITOR FREQUENCY', 'LOCKED'], ['INTERPRET SILENCE', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 06', title: 'FINAL DESCENT', date: '16 JUN 2067', status: 'LOCKED',
    summary: 'Last coordinate. No return signal past this point.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['CONFIRM DESCENT', 'LOCKED'], ['BRACE', 'LOCKED'], ['ARRIVE', 'LOCKED']] },
];

export const statusClass = (status: RoundStatus) =>
  status === "ACTIVE" ? "active" : status === "COMPLETE" ? "complete" : "locked";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clampRange = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function tickClock(el: HTMLElement) {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function makeGlowTexture(colorRGB: string) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${colorRGB}, 1)`);
  grad.addColorStop(0.4, `rgba(${colorRGB}, 0.5)`);
  grad.addColorStop(1, `rgba(${colorRGB}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

interface CardAnchor { u: number; world: THREE.Vector3 }

class TunnelScene {
  canvas: HTMLCanvasElement;
  clock = new THREE.Clock();
  targetProgress = 0;
  smoothProgress = 0;
  active = false;
  elapsed = 0;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  curve!: THREE.CatmullRomCurve3;
  pointCount!: number;
  pad!: number;
  totalLength!: number;
  snapLeadU!: number;

  threadGroup!: THREE.Group;
  farStars!: THREE.Points;
  dust!: THREE.Points;
  debris!: THREE.Group;
  planet!: THREE.Mesh;
  mistStops!: THREE.Color[];
  mistLayers!: THREE.Sprite[];

  cardAnchors: CardAnchor[];
  snapUs: number[];
  maxCardScale = 1;
  maxLateral = 0;

  mouseX = 0; mouseY = 0;
  targetMouseX = 0; targetMouseY = 0;

  private _forward = new THREE.Vector3();
  private _mistColor = new THREE.Color();
  /* Everything that holds GPU memory, so the StrictMode remount can free it. */
  private disposables: { dispose(): void }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1 : 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0e0c0c, 0.011);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1400);
    // Establish the real aspect ratio before anchorForRound() (below) reads it -- otherwise
    // card anchors get computed against the camera's placeholder 1:1 aspect from construction.
    this.resize();

    this.scene.add(new THREE.HemisphereLight(0x6b5a52, 0x0a0908, 0.9));
    const key = new THREE.DirectionalLight(PALETTE.amber, 0.6);
    key.position.set(6, 10, 4);
    this.scene.add(key);

    this.buildCurve();
    this.buildThread();
    this.buildStarfields();
    this.buildDust();
    this.buildDebris();
    this.buildMist();
    this.buildPlanet();

    this.cardAnchors = ROUNDS.map((_, i) => this.anchorForRound(i));
    this.snapUs = this.cardAnchors.map((a) => clamp01(a.u - this.snapLeadU));
  }

  setMouse(nx: number, ny: number) { this.targetMouseX = nx; this.targetMouseY = ny; }

  buildCurve() {
    const pad = 1;
    const count = ROUNDS.length + pad * 2 + 1;
    const spacing = 30;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < count; k++) {
      const a = k * 0.62;
      const x = Math.sin(a) * 15 + Math.sin(a * 0.41 + 1.4) * 8;
      const y = Math.cos(a * 0.7) * 8 + Math.sin(a * 1.3 + 0.8) * 5;
      const z = -k * spacing;
      pts.push(new THREE.Vector3(x, y, z));
    }
    this.curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    this.pointCount = count;
    this.pad = pad;
    this.totalLength = this.curve.getLength();
    this.snapLeadU = 14 / this.totalLength;
  }

  tAt(u: number) { return this.curve.getPointAt(clamp01(u)); }
  tangentAt(u: number) { return this.curve.getTangentAt(clamp01(u)).normalize(); }

  anchorForRound(i: number): CardAnchor {
    const u = (i + this.pad + 0.5) / (this.pointCount - 1);
    const center = this.tAt(u);
    const tangent = this.tangentAt(u);
    const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0));
    if (right.lengthSq() < 0.001) right.set(1, 0, 0);
    right.normalize();
    const side = i % 2 === 0 ? 1 : -1;
    // A fixed world-space stagger offset was tuned for wide desktop screens; it pushed the
    // anchor toward (or entirely past) the edge of the frustum on narrow/portrait viewports,
    // where the card's own CSS width is already most of the viewport, leaving little or no
    // room for a left/right offset. `maxLateral` (set in resize(), which runs before this is
    // ever called) is derived from the current viewport so the card can't overflow the edge.
    const lateral = this.maxLateral;
    const vertical = i % 2 === 0 ? 0.8 : -0.8;
    const pos = center.clone().addScaledVector(right, lateral * side).add(new THREE.Vector3(0, vertical, 0));
    return { u, world: pos };
  }

  buildThread() {
    const layers = [
      { radius: 0.22, opacity: 0.85, color: PALETTE.amberBright },
      { radius: 0.6, opacity: 0.16, color: PALETTE.amber },
      { radius: 1.3, opacity: 0.06, color: PALETTE.amber },
    ];
    this.threadGroup = new THREE.Group();
    layers.forEach((l) => {
      const geo = new THREE.TubeGeometry(this.curve, this.pointCount * 5, l.radius, 5, false);
      const mat = new THREE.MeshBasicMaterial({ color: l.color, transparent: true, opacity: l.opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      this.disposables.push(geo, mat);
      this.threadGroup.add(new THREE.Mesh(geo, mat));
    });
    this.scene.add(this.threadGroup);
  }

  buildStarfields() {
    const count = isMobile() ? 500 : 1500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 500 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - this.pointCount * 15;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const map = makeGlowTexture("255,255,255");
    const mat = new THREE.PointsMaterial({ size: 2.4, color: PALETTE.starCool, transparent: true, opacity: 0.75, map, depthWrite: false, blending: THREE.AdditiveBlending });
    this.disposables.push(geo, mat, map);
    this.farStars = new THREE.Points(geo, mat);
    this.scene.add(this.farStars);
  }

  buildDust() {
    const count = isMobile() ? 380 : 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const warm = new THREE.Color(PALETTE.starWarm);
    const cool = new THREE.Color(0xffffff);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const center = this.tAt(u);
      const radius = 4 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = center.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = center.y + Math.sin(angle) * radius * 0.6;
      positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * 20;
      const c = Math.random() < 0.12 ? warm : cool;
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const map = makeGlowTexture("255,255,255");
    const mat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.8, map, depthWrite: false, blending: THREE.AdditiveBlending });
    this.disposables.push(geo, mat, map);
    this.dust = new THREE.Points(geo, mat);
    this.scene.add(this.dust);
  }

  buildDebris() {
    this.debris = new THREE.Group();
    const count = isMobile() ? 10 : 26;
    const geoBase = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: PALETTE.debris, roughness: 0.85, metalness: 0.15, flatShading: true });
    this.disposables.push(geoBase, mat);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const center = this.tAt(u);
      const radius = 10 + Math.random() * 34;
      const angle = Math.random() * Math.PI * 2;
      const mesh = new THREE.Mesh(geoBase, mat);
      const scale = 0.4 + Math.random() * 1.6;
      mesh.scale.setScalar(scale);
      mesh.position.set(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius * 0.5,
        center.z + (Math.random() - 0.5) * 26
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData.spin = (Math.random() - 0.5) * 0.15;
      this.debris.add(mesh);
    }
    this.scene.add(this.debris);
  }

  buildMist() {
    this.mistStops = [
      new THREE.Color(0x201e22), new THREE.Color(0x3a3238), new THREE.Color(0x63493a),
      new THREE.Color(0x8a5f45), new THREE.Color(0x6b5648), new THREE.Color(0x3f3c42),
    ];
    const tex = makeGlowTexture("255,255,255");
    this.disposables.push(tex);
    this.mistLayers = [0, 1, 2].map((i) => {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.34 - i * 0.06, depthWrite: false, blending: THREE.AdditiveBlending });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.setScalar(190 + i * 90);
      this.scene.add(sprite);
      return sprite;
    });
  }

  updateMist(u: number) {
    const stops = this.mistStops;
    const segments = stops.length - 1;
    const scaled = clamp01(u) * segments;
    const idx = Math.min(Math.floor(scaled), segments - 1);
    const localT = scaled - idx;
    this._mistColor.copy(stops[idx]).lerp(stops[idx + 1], localT);
    this.mistLayers.forEach((sprite, i) => {
      sprite.material.color.copy(this._mistColor);
      sprite.position.copy(this.camera.position).addScaledVector(this._forward, 50 + i * 40);
    });
  }

  buildPlanet() {
    const center = this.tAt(0.48);
    const geo = new THREE.SphereGeometry(12, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a4650, roughness: 1, metalness: 0 });
    this.disposables.push(geo, mat);
    this.planet = new THREE.Mesh(geo, mat);
    this.planet.position.set(center.x - 34, center.y + 6, center.z - 4);
    this.scene.add(this.planet);

    const ringGeo = new THREE.RingGeometry(16, 19, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.amber, transparent: true, opacity: 0.28, side: THREE.DoubleSide });
    this.disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    ring.rotation.y = 0.3;
    this.planet.add(ring);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Mirrors `.round-card`'s CSS width (timeline.css) so the two derivations below know how
    // wide a card actually renders at this viewport size.
    const cardCssWidth = w <= 767 ? Math.min(320, w * 0.88) : Math.min(360, w * 0.84);
    const FOCUS_ZOOM = 1.07; // extra zoom projectCards applies to the focused card (pullScale)

    // Cap the focused-card zoom (projectCards' `scale`) so it can't render a card wider than
    // the viewport -- the zoom was a fixed 1.5x tuned for desktop, but on narrow phones the
    // CSS width alone is already most of the viewport, so that zoom used to overflow it.
    this.maxCardScale = clampRange((w * 0.92) / (cardCssWidth * FOCUS_ZOOM), 0.6, 1.5);

    // Cap the cards' left/right stagger offset (anchorForRound's `lateral`, in world units)
    // so the anchor's projected pixel position, plus the card's own (possibly viewport-filling)
    // half-width, can never push it past the screen edge. A fixed world-space offset was tuned
    // only for wide desktop screens; on narrow/portrait viewports the projected offset is much
    // larger relative to the screen, and the card itself may leave little or no margin for any
    // offset at all -- both are accounted for here instead of guessed as separate constants.
    const FOCUS_DIST = 16; // world distance where projectCards' scale reaches ~1 (its focus point)
    const VFOV_HALF_TAN = 0.6009; // tan(31deg): half of the camera's fixed 62deg vertical FOV
    const pxPerWorldUnit = h / (2 * FOCUS_DIST * VFOV_HALF_TAN);
    const cardHalfWidthPx = (cardCssWidth * this.maxCardScale * FOCUS_ZOOM) / 2;
    const marginPx = 10;
    this.maxLateral = clampRange((w / 2 - marginPx - cardHalfWidthPx) / pxPerWorldUnit, 0, 8.5);

    // Anchors' world position depends on both values above -- re-derive them whenever the
    // viewport changes so a resize/orientation change keeps cards on-screen. Guarded because
    // this also runs once during construction, before anchors exist yet.
    if (this.cardAnchors) {
      this.cardAnchors.forEach((anchor, i) => { anchor.world.copy(this.anchorForRound(i).world); });
    }
  }

  setActive(v: boolean) { this.active = v; }

  setTargetProgress(p: number) { this.targetProgress = clamp01(p); }

  frame(cardEls: HTMLElement[], depthEl: HTMLElement | null) {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    let u: number;
    if (this.active) {
      const lerpFactor = isMobile() ? 0.14 : 0.09;
      this.smoothProgress = lerp(this.smoothProgress, this.targetProgress, lerpFactor);
      u = clamp01(this.smoothProgress);
      if (depthEl) depthEl.textContent = String(Math.round(this.targetProgress * 100)).padStart(3, "0") + "%";
    } else {
      this.smoothProgress = lerp(this.smoothProgress, 0, 0.05);
      const wobble = 0.007 + Math.sin(this.elapsed * 0.3) * 0.006;
      u = clamp01(this.smoothProgress + wobble);
    }

    const camPos = this.tAt(u);
    const lookPos = this.tAt(clamp01(u + 0.012));
    this.camera.position.copy(camPos);

    const roll = Math.sin(u * Math.PI * 6) * 0.06;
    this.camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    this.camera.lookAt(lookPos);
    this._forward.copy(lookPos).sub(camPos).normalize();

    this.farStars.rotation.y += dt * 0.004;
    this.debris.children.forEach((m) => { m.rotation.x += m.userData.spin * dt; m.rotation.y += m.userData.spin * dt * 0.7; });

    this.mouseX = lerp(this.mouseX, this.targetMouseX, 0.08);
    this.mouseY = lerp(this.mouseY, this.targetMouseY, 0.08);

    this.updateMist(u);
    if (this.active) this.projectCards(cardEls);
    this.renderer.render(this.scene, this.camera);
  }

  projectCards(cardEls: HTMLElement[]) {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.updateMatrixWorld();
    const viewMatrix = this.camera.matrixWorldInverse;

    this.cardAnchors.forEach((anchor, i) => {
      const el = cardEls[i];
      if (!el) return;

      const local = anchor.world.clone().applyMatrix4(viewMatrix);
      const frontDist = -local.z;

      if (frontDist <= 0.4) { el.style.opacity = "0"; el.style.pointerEvents = "none"; return; }

      const ndc = anchor.world.clone().project(this.camera);
      if (ndc.z > 1) { el.style.opacity = "0"; el.style.pointerEvents = "none"; return; }

      const x = (ndc.x * 0.5 + 0.5) * w;
      const y = (1 - (ndc.y * 0.5 + 0.5)) * h;

      let opacity: number;
      if (frontDist > 46) opacity = 0;
      else if (frontDist > 24) opacity = (46 - frontDist) / 22;
      else if (frontDist > 5) opacity = 1;
      else opacity = clamp01((frontDist - 0.4) / 4.6);

      const scale = clampRange(16 / frontDist, 0.32, this.maxCardScale);

      const isFocused = Math.abs(this.snapUs[i] - this.smoothProgress) < 0.03;
      el.classList.toggle("round-card--focused", isFocused);
      const pullX = isFocused ? this.mouseX * 24 : 0;
      const pullY = isFocused ? this.mouseY * 16 : 0;
      const pullScale = isFocused ? 1.07 : 1;

      el.style.opacity = opacity.toFixed(3);
      el.style.pointerEvents = opacity > 0.08 ? "auto" : "none";
      el.style.transform = `translate3d(${(x + pullX).toFixed(1)}px, ${(y + pullY).toFixed(1)}px, 0) translate(-50%, -50%) scale(${(scale * pullScale).toFixed(3)})`;
    });
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    // Deliberately NOT forceContextLoss(): React reuses the same <canvas>
    // element across a StrictMode remount, and a force-lost context is dead
    // for the life of that element -- the next WebGLRenderer built on it
    // throws. dispose() already frees the GPU resources.
  }
}

export interface TunnelRefs {
  canvas: HTMLCanvasElement;
  cards: HTMLElement[];
  railTicks: HTMLElement[];
  rail: HTMLElement;
  track: HTMLElement;
  viewport: HTMLElement;
  hero: HTMLElement;
  hud: HTMLElement;
  depth: HTMLElement;
  clock: HTMLElement;
  topFade: HTMLElement;
  vignette: HTMLElement;
}

/**
 * Boots the scene and the scroll loop. Returns a teardown function — required,
 * not optional: React StrictMode mounts effects twice in dev, and without this
 * you get two WebGL contexts and two rAF loops racing the same DOM.
 */
export function initTunnel(refs: TunnelRefs): () => void {
  const { canvas, cards, railTicks, rail, track, viewport, hero, hud, depth, clock, topFade, vignette } = refs;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = hoverCapable();

  /* Both owned by page.tsx (a server component), so they're reached by selector
     rather than plumbed through props. Absent on any route that isn't home. */
  const landing = document.querySelector<HTMLElement>(".blackhole-bg");
  const faq = document.querySelector<HTMLElement>(".faq-section");

  tickClock(clock);
  const clockTimer = window.setInterval(() => tickClock(clock), 1000);

  if (!canHover) {
    cards.forEach((el) => {
      const hint = el.querySelector(".round-card__hint");
      if (hint) hint.textContent = "TAP FOR BRIEFING";
    });
  }

  const setTrackHeight = () => {
    const vh = ROUNDS.length * (isMobile() ? 72 : 96) + (isMobile() ? 40 : 60);
    // Set vh first, then dvh: browsers without dvh support silently keep the vh value
    // (an unsupported unit assignment is a no-op), so this is a safe progressive upgrade
    // that avoids the mobile-Safari toolbar-show/hide scroll jump.
    track.style.height = `${vh}vh`;
    track.style.height = `${vh}dvh`;
  };
  setTrackHeight();

  const scene = new TunnelScene(canvas);

  /* Card open/close. Deliberately classList, not React state: projectCards writes
     `round-card--focused` onto these same elements 60x/sec, and a re-render would
     wipe it. React renders this DOM once; from here on it's ours. */
  const cardCleanups = cards.map((el) => {
    const panel = el.querySelector<HTMLElement>(".round-card__panel");
    if (!panel) return () => {};
    const open = () => { el.classList.add("round-card--open"); panel.setAttribute("aria-expanded", "true"); };
    const close = () => { el.classList.remove("round-card--open"); panel.setAttribute("aria-expanded", "false"); };

    if (canHover) {
      panel.addEventListener("mouseenter", open);
      panel.addEventListener("mouseleave", close);
      panel.addEventListener("focus", open);
      panel.addEventListener("blur", close);
      return () => {
        panel.removeEventListener("mouseenter", open);
        panel.removeEventListener("mouseleave", close);
        panel.removeEventListener("focus", open);
        panel.removeEventListener("blur", close);
      };
    }
    const onClick = () => {
      const isOpen = el.classList.contains("round-card--open");
      cards.forEach((c) => { if (c !== el) c.classList.remove("round-card--open"); });
      if (isOpen) close(); else open();
    };
    panel.addEventListener("click", onClick);
    return () => panel.removeEventListener("click", onClick);
  });

  const onPointerMove = (e: PointerEvent) => {
    scene.setMouse((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  if (canHover) window.addEventListener("pointermove", onPointerMove);

  /* Cached because they only move when the layout does. Reading them inside raf()
     forced two layout flushes per frame for values that were constant between
     resizes. measure() must run AFTER setTrackHeight, which changes both. */
  let heroTop = 0, trackTop = 0, trackHeight = 0;
  const measure = () => {
    heroTop = hero.getBoundingClientRect().top + window.scrollY;
    trackTop = track.getBoundingClientRect().top + window.scrollY;
    trackHeight = track.offsetHeight;
  };

  const onResize = () => { scene.resize(); setTrackHeight(); measure(); };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  /* The timeline no longer starts at document top -- the landing hero sits above it.
     Everything below measures from the timeline hero instead of from scrollY 0, which
     is exactly what the original did back when nothing preceded it.

     offsetTop is NOT usable here: .timeline-section is position:relative, so it is the
     offsetParent and offsetTop would report 0 for the hero. These need document-absolute
     positions, hence getBoundingClientRect — see measure() above, which caches them. */
  measure();

  // Idle scroll-snap: once the user stops moving near a card, drift the scroll
  // position onto that card so it settles at a readable size. Any real input
  // (wheel/touch/key) cancels the drift instantly so free scrolling always wins.
  const SNAP_IDLE_MS = 150;
  const SNAP_DURATION_MS = 500;
  const SNAP_EPSILON = 0.004;
  let prevScrollY = window.scrollY;
  let lastMoveTime = performance.now();
  let snapping = false;
  let snapFromY = 0, snapToY = 0, snapStartTime = 0;
  const cancelSnap = () => { snapping = false; };
  const inputEvents = ["wheel", "touchstart", "keydown"] as const;
  inputEvents.forEach((type) => window.addEventListener(type, cancelSnap, { passive: true }));

  let rafId = 0;

  function raf() {
    const now = performance.now();
    const scrollY = window.scrollY;
    const start = heroTop;
    const end = trackTop + trackHeight - window.innerHeight;
    const span = Math.max(end - start, 1);
    if (Math.abs(scrollY - prevScrollY) > 0.5) lastMoveTime = now;
    prevScrollY = scrollY;

    const idle = scrollY <= start + 1;
    scene.setActive(!idle);

    /* Cross-fade: landing visuals out, tunnel + HUD in, over the first half
       viewport of the timeline hero. Replaces the old one-shot `is-visible`. */
    const enterT = clamp01((scrollY - start) / (window.innerHeight * 0.5));

    /* ...and back out again as the FAQ rises into frame. The HUD readouts and
       the rail are position:fixed, so without this they hang over the FAQ and
       the footer for the rest of the page. Ramped over a FULL viewport (was 0.6)
       so the tunnel is still partly lit behind the 220px translucent band at the
       top of .faq-section — that overlap is what makes the seam a cross-fade
       rather than a cut. Shortening this back re-hardens the seam. */
    const exitT = faq
      ? clamp01(1 - faq.getBoundingClientRect().top / window.innerHeight)
      : 0;

    const chrome = enterT * (1 - exitT);
    const chromeOpacity = chrome.toFixed(3);
    canvas.style.opacity = chromeOpacity;
    hud.style.opacity = chromeOpacity;
    if (landing) landing.style.opacity = (1 - enterT).toFixed(3);

    const rect = track.getBoundingClientRect();
    /* `trueInView` alone is not enough to justify snapping. The track's last
       pixels are still technically in view when the FAQ already fills the
       screen, so a reader who stops anywhere on the FAQ — by scrolling or via
       the navbar's FAQs link — used to get dragged thousands of pixels back
       into the tunnel. Once the tunnel has begun fading out (exitT > 0) it is
       never right to pull the page back into it. Same condition the rail uses. */
    const trueInView = rect.top <= 1 && rect.bottom > 0;
    const snappable = trueInView && exitT === 0;
    rail.classList.toggle("is-visible", snappable);

    // Before `.tunnel-viewport` actually locks to the top of the screen, it still
    // renders in normal flow with its vignette/fade already at full strength --
    // that hard-edged box floating mid-page is the seam between the hero and the
    // first card. Ramp both overlays in only as the viewport approaches its stuck
    // position, so the darkening arrives as part of the scroll rather than a cut.
    const viewportRect = viewport.getBoundingClientRect();
    const stuckT = clamp01(1 - viewportRect.top / 220).toFixed(3);
    vignette.style.opacity = stuckT;
    topFade.style.opacity = stuckT;

    if (!idle) {
      const progress = clamp01((scrollY - start) / span);
      scene.setTargetProgress(progress);

      if (trueInView) {
        let nearest = 0, best = Infinity;
        scene.snapUs.forEach((u, i) => {
          const dist = Math.abs(u - progress);
          if (dist < best) { best = dist; nearest = i; }
        });
        railTicks.forEach((t, i) => t.classList.toggle("progress-rail__tick--active", i === nearest));

        if (!snapping && snappable && !reducedMotionQuery.matches && best > SNAP_EPSILON && (now - lastMoveTime) > SNAP_IDLE_MS) {
          snapping = true;
          snapStartTime = now;
          snapFromY = scrollY;
          snapToY = clampRange(start + scene.snapUs[nearest] * span, start, end);
        }
      }
    }

    if (snapping) {
      const t = clamp01((now - snapStartTime) / SNAP_DURATION_MS);
      // behavior:"instant" defeats globals.css `html { scroll-behavior: smooth }`, which
      // would otherwise start a fresh smooth animation on every one of these frames and
      // leave the snap permanently chasing itself.
      window.scrollTo({ top: lerp(snapFromY, snapToY, easeOutCubic(t)), behavior: "instant" });
      if (t >= 1) { snapping = false; lastMoveTime = now; }
    }

    const heroFadeDistance = Math.max(window.innerHeight * 0.62, 1);
    const heroT = clamp01((scrollY - start) / heroFadeDistance);
    hero.style.opacity = (1 - heroT).toFixed(3);
    // Skip the filter property entirely at rest instead of `blur(0px)`: a zero-radius blur
    // still promotes the element to its own compositing layer every frame, which is wasted
    // GPU work while idle and has caused text rasterization glitches on some mobile GPUs.
    hero.style.filter = heroT > 0 ? `blur(${(heroT * 14).toFixed(1)}px)` : "";
    hero.style.transform = `translate3d(0, ${(-heroT * 40).toFixed(1)}px, 0)`;

    /* Nothing the scene draws is visible at chrome 0 — either the tunnel hasn't
       faded in yet, or the FAQ has covered it — so skip the WebGL render and the
       card projection entirely. The scroll bookkeeping above still runs, so the
       state is correct the moment it becomes visible again. frame()'s getDelta is
       clamped at 0.05, so a long gap can't jolt the animation on resume. */
    if (chrome > 0.001) scene.frame(cards, depth);
    // @ts-ignore TEMP DEBUG
    (window as any).__tdbg = {
      scrollY, start, end, span,
      viewH: window.innerHeight, liveViewH: window.innerHeight,
      viewW: window.innerWidth, liveViewW: window.innerWidth,
      mobile: isMobile(),
      target: scene.targetProgress, smooth: scene.smoothProgress,
      maxLateral: scene.maxLateral, maxCardScale: scene.maxCardScale,
      heroTop, trackTop, trackHeight,
      faqTop: faq ? faq.getBoundingClientRect().top + scrollY : 0,
      anchors: scene.cardAnchors.map((a) => [a.u, a.world.x, a.world.y, a.world.z]),
      cam: [scene.camera.position.x, scene.camera.position.y, scene.camera.position.z],
    };
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(rafId);
    clearInterval(clockTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    inputEvents.forEach((type) => window.removeEventListener(type, cancelSnap));
    cardCleanups.forEach((fn) => fn());
    if (landing) landing.style.opacity = "";
    scene.dispose();
  };
}

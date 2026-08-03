"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

/*
 * EnduranceShip.tsx
 * ─────────────────────────────────────────────────────────────────
 * The Interstellar Endurance: a ring of 12 modules, nothing in the centre.
 *
 * Replaces the vendored public/endurance.js, which built the same shape from
 * ~1600 CSS preserve-3d divs. That version's own comment recorded that a
 * continuous orbit cost roughly half the frame rate — which is why its spin was
 * gated to desktop and capped at 90s. Every one of those divs was a separate
 * compositor layer being re-projected per frame; this is ~60 meshes in one draw
 * loop, so the 60s revolution the design calls for is affordable everywhere.
 *
 * This is a THIRD WebGL context on the site (lib/tunnel.ts, TarsWidget). It is
 * safe only because HeroSection unmounts it past ~1.1vh, long before the FAQ
 * mounts TARS. Don't remove that gate.
 * ─────────────────────────────────────────────────────────────────
 */

/* One revolution per minute — the explicit spec. Driven off elapsed time, not
   accumulated deltas, so the period holds exactly regardless of frame rate. */
const REVOLUTION_SECONDS = 60;

/* Ring geometry. RADIUS is arbitrary units; camera distance is derived from it
   in fitCamera() below, so changing it rescales rather than reframes. */
const MODULE_COUNT = 12;
const RADIUS = 8;
const MODULE_W = 3.1;   // tangential — 12 of these + connectors close the ring
const MODULE_H = 2.5;   // radial
const MODULE_D = 2.2;   // along the ring's axis

/* Hull ramp lifted from the copper palette already tuned for this ship in
   globals.css (the old --sp0..8 custom properties). The vendor needed a
   `filter: brightness(.66)` on top to tame its near-white shading ramp; these
   colours are the corrected values, so no post-filter is needed or wanted. */
const HULL_LIGHT = 0xb5a794;
const HULL_MID = 0x8a7b69;
const HULL_DARK = 0x5b5046;
const AMBER = 0xf4a233;

export default function EnduranceShip() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    /* 1.5, not TarsWidget's 2: a thin metal ring needs the AA more than the
       resolution, and this matches the tunnel's desktop cap (tunnel.ts). */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* Lighting. This ship sits on top of the accretion disk in 891208.jpg, which
       is close to blown-out white — so the usual key/fill/rim rig alone leaves
       every camera-facing panel darker than the background and the whole model
       collapses into a muddy silhouette. The frontLight below is what separates
       the hull from the disk; without it the geometry stops reading. */
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.4);
    frontLight.position.set(0, 0, 10); // straight down the camera axis
    scene.add(frontLight);

    /* Key from the upper right, matching the disk's brightest quadrant
       (891208.jpg is positioned at 62% 50%), so the highlights agree with it. */
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.4);
    keyLight.position.set(6, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf4a233, 1.3);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xbcd4ff, 1.8);
    rimLight.position.set(-2, 3, -6);
    scene.add(rimLight);

    /* Two nested groups: tilt is fixed, spin is animated. Rotating a single
       group on a composed axis would precess instead of orbiting cleanly. */
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.set(THREE.MathUtils.degToRad(-62), 0, THREE.MathUtils.degToRad(8));
    scene.add(tiltGroup);

    const spinGroup = new THREE.Group();
    tiltGroup.add(spinGroup);

    /* Tracked for disposal — three.js does not free GPU buffers on GC. */
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const track = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const mat = (opts: THREE.MeshStandardMaterialParameters) => {
      const m = new THREE.MeshStandardMaterial(opts);
      materials.push(m);
      return m;
    };

    const hullLight = mat({ color: HULL_LIGHT, metalness: 0.55, roughness: 0.45 });
    const hullMid = mat({ color: HULL_MID, metalness: 0.6, roughness: 0.4 });
    const hullDark = mat({ color: HULL_DARK, metalness: 0.65, roughness: 0.5 });
    const windowMat = mat({
      color: 0x2a1f12,
      emissive: AMBER,
      emissiveIntensity: 1.4,
      metalness: 0.1,
      roughness: 0.6,
    });

    /* Shared across all 12 pods — one geometry, twelve meshes. */
    const podGeo = track(new THREE.BoxGeometry(MODULE_W, MODULE_H, MODULE_D));
    const connectorGeo = track(new THREE.BoxGeometry(RADIUS * 0.34, MODULE_H * 0.42, MODULE_D * 0.5));
    const portGeo = track(new THREE.CylinderGeometry(0.45, 0.55, 0.9, 12));
    const panelGeo = track(new THREE.BoxGeometry(MODULE_W * 0.82, 0.12, MODULE_D * 1.5));
    const windowGeo = track(new THREE.BoxGeometry(0.34, 0.34, 0.06));

    for (let i = 0; i < MODULE_COUNT; i++) {
      const angle = (i / MODULE_COUNT) * Math.PI * 2;

      /* A pod carrier rotated so its local +Y points outward from the hub —
         that way every child is authored in simple radial/tangential terms. */
      const pod = new THREE.Group();
      pod.position.set(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0);
      pod.rotation.z = angle - Math.PI / 2;
      spinGroup.add(pod);

      /* Three variants cycled by index. The real Endurance mixes hab, lander
         dock and equipment modules; the silhouette break is what sells it as a
         built object rather than a twelve-sided polygon. */
      const variant = i % 3;
      pod.add(new THREE.Mesh(podGeo, variant === 0 ? hullLight : variant === 1 ? hullMid : hullDark));

      if (variant === 1) {
        /* Docking port, pointing radially outward (+Y local; the cylinder's
           own axis is already Y, so no reorientation needed). */
        const port = new THREE.Mesh(portGeo, hullLight);
        port.position.y = MODULE_H / 2 + 0.45;
        pod.add(port);
      }

      if (variant === 2) {
        /* Radiator panels, one per face along the ring axis. */
        for (const z of [-MODULE_D * 0.62, MODULE_D * 0.62]) {
          const panel = new THREE.Mesh(panelGeo, hullDark);
          panel.position.set(0, 0, z);
          panel.rotation.x = Math.PI / 2;
          pod.add(panel);
        }
      }

      /* Lit windows on the inward face — they catch the eye as the ring turns
         and are the only thing tying the model to the site's amber. */
      if (variant !== 2) {
        for (const x of [-0.62, 0, 0.62]) {
          const win = new THREE.Mesh(windowGeo, windowMat);
          win.position.set(x, -MODULE_H / 2 - 0.03, MODULE_D * 0.22);
          pod.add(win);
        }
      }

      /* Connector spanning to the next pod, placed at the midpoint angle. */
      const midAngle = angle + Math.PI / MODULE_COUNT;
      const connector = new THREE.Mesh(connectorGeo, hullMid);
      connector.position.set(Math.cos(midAngle) * RADIUS, Math.sin(midAngle) * RADIUS, 0);
      connector.rotation.z = midAngle;
      spinGroup.add(connector);
    }

    /*
     * Framing. Distance is DERIVED from the ring's size and the container's
     * aspect rather than hard-coded, so the ship stays correctly spaced in all
     * three layouts .spacecraft-scene takes: fixed 48%-wide full-height on
     * desktop, absolute inset-0 in a 50vh grid row under 768px, and short
     * landscape. On a wide-but-short box the vertical FOV binds; on a narrow
     * one the horizontal does. Fit to whichever is tighter.
     */
    const fitCamera = (w: number, h: number) => {
      camera.aspect = w / h;
      /* Tilted ~62deg the ring still projects nearly its full width, so the
         bounding radius is the ring radius plus a module. 1.35 is breathing
         room so it never touches the edges of its column. */
      const extent = (RADIUS + MODULE_H) * 1.35;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const distV = extent / Math.tan(vFov / 2);
      const distH = extent / (Math.tan(vFov / 2) * camera.aspect);
      camera.position.set(0, 0, Math.max(distV, distH));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) fitCamera(width, height);
    });
    resizeObserver.observe(container);
    fitCamera(container.clientWidth || 600, container.clientHeight || 800);

    /* Reduced motion: render the pose once and never start a loop. */
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;
    const clock = new THREE.Clock();

    const loop = () => {
      spinGroup.rotation.z = (clock.getElapsedTime() / REVOLUTION_SECONDS) * Math.PI * 2;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };

    if (reducedMotion.matches) renderer.render(scene, camera);
    else rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="endurance-canvas" aria-hidden="true" />;
}

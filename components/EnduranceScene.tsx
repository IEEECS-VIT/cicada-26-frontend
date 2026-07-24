"use client";

/*
 * EnduranceScene.tsx — REVISED v2
 * ─────────────────────────────────────────────────────────────────
 * Changes from v1:
 *   • Camera moved to [0, 0, 7] — directly in front, no downward
 *     angle that was causing the ship to appear at the bottom.
 *   • FOV widened to 52° — ensures the full ring (Ø4.4 units) is
 *     comfortably visible within the canvas.
 *   • Engine glow point lights updated to match new RING_R = 2.2.
 *   • Canvas parent is position:fixed via CSS (.spacecraft-scene)
 *     so it's never clipped by the hero-section overflow:hidden.
 * ─────────────────────────────────────────────────────────────────
 */

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { PlaceholderShip } from "./EnduranceMesh";

const RING_R = 2.2; // must match EnduranceMesh constant

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC LIGHTING — matches 891208.jpg
   ─────────────────────────────────────────────────────────────
   891208.jpg has:
     • Intensely bright accretion disk wrapping right + bottom-right
     • Near-total darkness upper-left
   We replicate with:
     • Dim ambient  — prevents pure-black shadows (looks CG flat)
     • Warm KEY directional from lower-right  — the disk glow
     • Cool FILL directional from upper-left  — deep-space scatter
     • Rim point light from back-top          — edge separation
     • 3× engine pod point lights             — amber nozzle warmth
═══════════════════════════════════════════════════════════════ */
function CinematicLighting() {
  /* Engine pod world-space positions (match EnduranceMesh Struts at 0/120/240°)
     These approximate positions; lighting is wide enough to look right
     regardless of ring's current rotation angle. */
  const enginePos: [number, number, number][] = [
    [ RING_R,    0,  0],
    [-RING_R/2,  0,  RING_R * 0.866],
    [-RING_R/2,  0, -RING_R * 0.866],
  ];

  return (
    <>
      {/* Very dim ambient — prevents pure black shadows */}
      <ambientLight intensity={0.07} color="#10102a" />

      {/*
       * KEY — warm accretion disk glow from lower-right.
       * position [9, -4, 4]: far right, below and in front of ship.
       * color #ffd8a8: warm amber-gold (matches 891208.jpg disk tones).
       */}
      <directionalLight
        position={[9, -4, 4]}
        intensity={4.0}
        color="#ffd8a8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/*
       * FILL — cool blue from upper-left.
       * Very low intensity: only slightly lifts the dark side of the hull.
       */}
      <directionalLight
        position={[-7, 4, -2]}
        intensity={0.10}
        color="#253060"
      />

      {/*
       * RIM — top-back, cool blue.
       * Traces the outer edge of the ring against the dark BG.
       */}
      <pointLight
        position={[0, 8, -5]}
        intensity={0.9}
        color="#8aaae0"
        distance={24}
        decay={2}
      />

      {/* Engine pod warm glow — tight radius so only local hull lights up */}
      {enginePos.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={2.5}
          color="#F4A233"
          distance={4.5}
          decay={2}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SCENE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function EnduranceScene() {
  return (
    <Canvas
      /*
       * alpha:true  — transparent canvas, 891208.jpg shows through.
       * dpr [1,2]   — cap at 2× so 3×/4× DPR devices don't triple draw cost.
       * antialias   — smooth edges on the torus and cylinders.
       * powerPreference "high-performance" — use discrete GPU on laptops.
       */
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      shadows
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    >
      {/*
       * Camera at [0, 0, 7]:
       *   No Y offset — ship origin at canvas centre, not bottom.
       *   FOV 52° — wide enough to show the full ring (Ø 4.4 units)
       *   with comfortable margin at this distance.
       *   near 0.1 / far 100 — no z-fighting on fine details.
       */}
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 7]}
        fov={52}
        near={0.1}
        far={100}
      />

      <CinematicLighting />

      {/*
       * HDR environment map (night preset).
       * Adds physically-correct reflections to metallic surfaces
       * without showing a visible skybox (background={false}).
       */}
      <Environment preset="night" background={false} />

      {/*
       * Suspense wraps the ship so if you ever swap PlaceholderShip
       * for EnduranceGLTF, the placeholder is shown while the GLB loads.
       */}
      <Suspense fallback={<PlaceholderShip />}>
        <PlaceholderShip />
      </Suspense>
    </Canvas>
  );
}

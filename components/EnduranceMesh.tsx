"use client";

/*
 * EnduranceMesh.tsx — REVISED v2
 * ─────────────────────────────────────────────────────────────────
 * Changes from v1:
 *   • Smaller ring (R=2.2) — fits viewport without clipping
 *   • Interconnected struts: dual-rail truss with visible hub-yoke
 *     nodes + ring-collar connectors, so struts visually "grip" both
 *     the central hub and the habitat ring.
 *   • Hub spigots at strut attachment points so struts don't look
 *     disconnected from the central spine.
 *   • Better material emissive values for cabin lights.
 *   • Cleaner tilt: [0.32, 0.12, 0.04] → ring shows as nice ellipse.
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ─── Ring geometry constant ──────────────────────────────── */
const RING_R   = 2.2;   // outer ring major radius
const HUB_R    = 0.15;  // hub cylinder radius (used for strut alignment)

/* ─── Shared PBR materials ────────────────────────────────── */
const HULL_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#8a8f9e"),
  metalness: 0.94,
  roughness: 0.15,
  envMapIntensity: 1.3,
});
const STRUT_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#636678"),
  metalness: 0.90,
  roughness: 0.22,
  envMapIntensity: 1.1,
});
const MODULE_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#8c8fa4"),
  metalness: 0.91,
  roughness: 0.17,
  emissive: new THREE.Color("#1a1a30"),
  emissiveIntensity: 0.4,
  envMapIntensity: 1.2,
});
const WINDOW_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#88c6ff"),
  emissive: new THREE.Color("#3a8ae0"),
  emissiveIntensity: 1.4,
  metalness: 0.05,
  roughness: 0.05,
});
const ENGINE_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#F4A233"),
  emissive: new THREE.Color("#FF6600"),
  emissiveIntensity: 5,
  side: THREE.DoubleSide,
});
const NOZZLE_RING_MAT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#FFD97D"),
  emissive: new THREE.Color("#F4A233"),
  emissiveIntensity: 2.5,
});

/* ═══════════════════════════════════════════════════════════════
   HABITAT MODULES — 12 boxes spaced evenly around the ring
═══════════════════════════════════════════════════════════════ */
function HabitatModules({ count = 12 }: { count?: number }) {
  const angles = useMemo(
    () => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2),
    [count]
  );

  return (
    <>
      {angles.map((angle) => (
        /* Rotate group so its +X axis points outward along the ring */
        <group key={angle} rotation={[0, angle, 0]}>
          <group position={[RING_R, 0, 0]}>
            {/* Main module body */}
            <mesh material={MODULE_MAT} castShadow>
              <boxGeometry args={[0.38, 0.18, 0.28]} />
            </mesh>
            {/* Solar panel slab */}
            <mesh material={STRUT_MAT} position={[0, 0.14, 0]}>
              <boxGeometry args={[0.52, 0.011, 0.20]} />
            </mesh>
            {/* Glowing window strip (front face) */}
            <mesh material={WINDOW_MAT} position={[0, 0, 0.148]}>
              <boxGeometry args={[0.25, 0.052, 0.007]} />
            </mesh>
            {/* Antenna stub */}
            <mesh material={STRUT_MAT} position={[0.14, 0.2, 0]}>
              <cylinderGeometry args={[0.007, 0.004, 0.16, 4]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STRUCTURAL STRUTS — dual-rail truss arms
   ─────────────────────────────────────────────────────────────
   Each strut is a dual-rail ladder truss that visually "grips"
   both the hub and the ring through junction nodes.

   Interconnection technique:
     • Hub-yoke box: positioned at HUB_R from center, overlapping
       the hub cylinder surface → looks like it clamps onto the hub.
     • Ring-collar: a wide cylinder at the ring's inner wall,
       overlapping the torus → looks like it clamps onto the ring.
     • Dual rails + cross-braces fill the space between.
═══════════════════════════════════════════════════════════════ */
function Struts({ count = 3 }: { count?: number }) {
  const angles = useMemo(
    () => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2),
    [count]
  );

  // Arm runs from hub surface (HUB_R) to just inside ring inner wall
  const RING_INNER = RING_R - 0.08; // torus inner wall position
  const ARM_START  = HUB_R + 0.02;
  const ARM_LEN    = RING_INNER - ARM_START;
  const ARM_MID    = ARM_START + ARM_LEN / 2; // centre of arm along +X
  const RAIL_OFFSET = 0.11; // ±Y offset for dual rails

  return (
    <>
      {angles.map((angle) => (
        /* Rotate group so +X faces the ring position */
        <group key={angle} rotation={[0, angle, 0]}>

          {/* ── Hub-yoke node ─────────────────────────────
               A visible box that overlaps the hub cylinder
               surface and the inner end of the arm rails,
               making the strut look bolted to the hub.     */}
          <mesh material={MODULE_MAT} position={[HUB_R - 0.02, 0, 0]}>
            <boxGeometry args={[0.18, 0.28, 0.18]} />
          </mesh>

          {/* ── Upper rail ──────────────────────────────── */}
          <mesh
            material={STRUT_MAT}
            position={[ARM_MID, RAIL_OFFSET, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.028, 0.035, ARM_LEN, 7]} />
          </mesh>

          {/* ── Lower rail ──────────────────────────────── */}
          <mesh
            material={STRUT_MAT}
            position={[ARM_MID, -RAIL_OFFSET, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.028, 0.035, ARM_LEN, 7]} />
          </mesh>

          {/* ── Cross-braces (4 diagonals along the arm) ─ */}
          {[0.22, 0.42, 0.62, 0.82].map((t) => {
            const x = ARM_START + t * ARM_LEN;
            return (
              <mesh
                key={t}
                material={STRUT_MAT}
                position={[x, 0, 0]}
                rotation={[
                  0,
                  0,
                  Math.PI / 2 + Math.atan2(RAIL_OFFSET * 2, ARM_LEN * 0.22),
                ]}
              >
                <cylinderGeometry
                  args={[0.016, 0.016, RAIL_OFFSET * 2.2, 5]}
                />
              </mesh>
            );
          })}

          {/* ── Ring-collar node ────────────────────────────
               Wide collar that overlaps the torus inner wall,
               clamping the arm to the ring visually.         */}
          <mesh material={HULL_MAT} position={[RING_INNER + 0.01, 0, 0]}>
            <cylinderGeometry args={[0.095, 0.075, 0.18, 9]} />
          </mesh>

          {/* ── Small connecting stub from collar to torus ─ */}
          <mesh
            material={HULL_MAT}
            position={[RING_INNER + 0.06, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.042, 0.042, 0.12, 6]} />
          </mesh>

        </group>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CENTRAL HUB — static spine (does NOT rotate with ring)
═══════════════════════════════════════════════════════════════ */
function CentralHub() {
  return (
    <group>
      {/* Main spine cylinder */}
      <mesh material={HULL_MAT} castShadow>
        <cylinderGeometry args={[HUB_R, HUB_R, 1.9, 14]} />
      </mesh>

      {/* 5 module boxes stacked along the spine */}
      {([-0.68, -0.3, 0, 0.3, 0.68] as const).map((y, i) => (
        <mesh key={i} material={MODULE_MAT} position={[0, y, 0]} castShadow>
          <boxGeometry
            args={[i === 2 ? 0.46 : 0.38, 0.25, i === 2 ? 0.46 : 0.38]}
          />
        </mesh>
      ))}

      {/* Centre command-module ring collar */}
      <mesh material={MODULE_MAT} position={[0, 0, 0]}>
        <torusGeometry args={[0.28, 0.045, 8, 22]} />
      </mesh>

      {/* Top docking port cap */}
      <mesh material={HULL_MAT} position={[0, 1.04, 0]}>
        <sphereGeometry args={[0.145, 10, 10]} />
      </mesh>

      {/* 3 hub-side spigots at strut attachment angles
          (stationary — makes the yoke nodes look anchored) */}
      {[0, 120, 240].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <mesh
            key={deg}
            material={STRUT_MAT}
            position={[Math.cos(a) * HUB_R * 0.85, 0, Math.sin(a) * HUB_R * 0.85]}
          >
            <cylinderGeometry args={[0.055, 0.045, 0.32, 6]} />
          </mesh>
        );
      })}

      {/* Bottom engine bell nozzle for the main engine */}
      <mesh material={HULL_MAT} position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.09, 0.15, 0.2, 10]} />
      </mesh>
      {/* Main engine glow */}
      <mesh material={ENGINE_MAT} position={[0, -1.12, 0]} rotation={[Math.PI, 0, 0]}>
        <circleGeometry args={[0.085, 20]} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENGINE PODS — 3 nozzles at strut-ring junctions
═══════════════════════════════════════════════════════════════ */
function EnginePods({ count = 3 }: { count?: number }) {
  const angles = useMemo(
    () => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2),
    [count]
  );

  return (
    <>
      {angles.map((angle) => (
        <group key={angle} rotation={[0, angle, 0]}>
          <group position={[RING_R, 0, 0]}>
            {/* Pod housing */}
            <mesh material={HULL_MAT}>
              <cylinderGeometry args={[0.085, 0.068, 0.22, 9]} />
            </mesh>
            {/* Nozzle disc */}
            <mesh material={ENGINE_MAT} position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]}>
              <circleGeometry args={[0.062, 20]} />
            </mesh>
            {/* Nozzle outer ring */}
            <mesh material={NOZZLE_RING_MAT} position={[0, -0.11, 0]}>
              <torusGeometry args={[0.068, 0.011, 6, 18]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLACEHOLDER SHIP — renders immediately, no model file needed
═══════════════════════════════════════════════════════════════ */
export function PlaceholderShip() {
  const shipRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    /*
     * Outer group: very slow orbital drift (whole ship) — 0.10 rad/s
     * Inner group: habitat ring spin counterclockwise — 0.50 rad/s
     * delta is seconds/frame → animation is frame-rate independent.
     */
    if (shipRef.current)  shipRef.current.rotation.y += delta * 0.10;
    if (ringRef.current)  ringRef.current.rotation.y += delta * 0.50;
  });

  return (
    /*
     * Overall tilt:
     *   X 0.32 rad (~18°) — ring shows as a flattened ellipse, not
     *   a flat circle; gives a clear 3-D perspective.
     *   Y 0.12 rad — slight facing angle for the hub.
     *   Z 0.04 rad — barely-perceptible roll for dynamism.
     */
    <group rotation={[0.32, 0.12, 0.04]}>
      <group ref={shipRef}>

        {/* ── Central hub: does NOT rotate with the ring ── */}
        <CentralHub />

        {/* ── Rotating ring assembly ──────────────────────
             Struts, modules, engine pods all spin together.
             The hub is symmetric (cylinder), so the rotating
             strut hub-yokes always appear to "grip" it.    */}
        <group ref={ringRef}>

          {/* Outer habitat ring torus */}
          <mesh material={HULL_MAT} castShadow receiveShadow>
            <torusGeometry args={[RING_R, 0.07, 22, 130]} />
          </mesh>

          {/* Inner ring track — secondary structural ring */}
          <mesh material={STRUT_MAT}>
            <torusGeometry args={[RING_R * 0.85, 0.038, 14, 130]} />
          </mesh>

          {/* 12 habitat modules */}
          <HabitatModules count={12} />

          {/* 3 dual-rail truss struts */}
          <Struts count={3} />

          {/* 3 engine pods */}
          <EnginePods count={3} />

        </group>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLB MODEL LOADER
   ─────────────────────────────────────────────────────────────
   TO ENABLE:
     1. Place your .glb at  /public/models/endurance.glb
     2. Uncomment the component + preload line below.
     3. In EnduranceScene.tsx replace <PlaceholderShip /> inside
        <Suspense> with <EnduranceGLTF />.
     4. Adjust `scale` to fit your model's real-world dimensions.
═══════════════════════════════════════════════════════════════ */
export function EnduranceGLTF() {
  const { scene } = useGLTF("/models/endurance.glb");
  const ref = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.10;
  });

  return (
    <group ref={ref} rotation={[0.32, 0.12, 0.04]}>
      <primitive object={scene} scale={0.01} castShadow receiveShadow />
    </group>
  );
}
// useGLTF.preload("/models/endurance.glb");

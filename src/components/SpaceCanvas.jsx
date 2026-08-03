import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Particles & Warp Field Component
function StarsField({ isLaunching, mousePos }) {
  const count = 3000;
  const meshRef = useRef();

  // Create geometry positions and colors
  const [positions, colors, originalZ, speedOffsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const origZ = new Float32Array(count);
    const speeds = new Float32Array(count);

    const baseColor = new THREE.Color('#C6B9B0');
    const accentColor = new THREE.Color('#E8DDD5');
    const cyanColor = new THREE.Color('#64D2FF');

    for (let i = 0; i < count; i++) {
      // Distribute stars in a large cylinder/sphere volume
      const radius = 10 + Math.random() * 85;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 140;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius;
      pos[i * 3 + 2] = z;
      origZ[i] = z;

      speeds[i] = 0.05 + Math.random() * 0.15;

      // Color variation
      const randColor = Math.random();
      let c = baseColor;
      if (randColor > 0.8) c = accentColor;
      else if (randColor > 0.95) c = cyanColor;

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col, origZ, speeds];
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const positionsAttr = meshRef.current.geometry.attributes.position;
    const posArr = positionsAttr.array;

    const currentSpeedMultiplier = isLaunching ? 25.0 : 1.0;

    for (let i = 0; i < count; i++) {
      let zIdx = i * 3 + 2;
      posArr[zIdx] += speedOffsets[i] * currentSpeedMultiplier;

      // Wrap around when star moves past camera
      if (posArr[zIdx] > 40) {
        posArr[zIdx] = -100;
      }
    }

    positionsAttr.needsUpdate = true;

    // Smooth subtle rotation & parallax
    meshRef.current.rotation.z += delta * 0.03;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mousePos.current.y * 0.15,
      0.05
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mousePos.current.x * 0.15,
      0.05
    );
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLaunching ? 0.6 : 0.25}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Glowing Sci-Fi Grid Horizon
function SciFiGrid({ isLaunching, mousePos }) {
  const gridRef = useRef();

  useFrame((state, delta) => {
    if (!gridRef.current) return;
    gridRef.current.position.z += (isLaunching ? 1.2 : 0.08);
    if (gridRef.current.position.z > 5) {
      gridRef.current.position.z = 0;
    }

    gridRef.current.rotation.z = THREE.MathUtils.lerp(
      gridRef.current.rotation.z,
      mousePos.current.x * 0.05,
      0.05
    );
  });

  return (
    <group ref={gridRef} position={[0, -12, -20]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <gridHelper
        args={[160, 40, '#C6B9B0', '#3D312A']}
        position={[0, 0, 0]}
      />
    </group>
  );
}

// Glowing Ambient Dust Cloud
function DustCloud({ mousePos }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.02;
    groupRef.current.rotation.x += delta * 0.01;
  });

  const dustCount = 180;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    const col = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;

      col[i * 3] = 0.77; // #C6B9B0 warmth
      col[i * 3 + 1] = 0.72;
      col[i * 3 + 2] = 0.69;
    }
    return [pos, col];
  }, [dustCount]);

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Camera Rig for dynamic mouse tracking
function CameraRig({ mousePos, isLaunching }) {
  useFrame((state) => {
    const targetX = mousePos.current.x * 2.5;
    const targetY = mousePos.current.y * 1.5;
    const targetZ = isLaunching ? 12 : 25;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function SpaceCanvas({ isLaunching }) {
  const mousePos = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    mousePos.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
  };

  return (
    <div id="canvas-container" onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#060403'));
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#C6B9B0" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#5B4B43" />

        <StarsField isLaunching={isLaunching} mousePos={mousePos} />
        <DustCloud mousePos={mousePos} />
        <SciFiGrid isLaunching={isLaunching} mousePos={mousePos} />
        <CameraRig mousePos={mousePos} isLaunching={isLaunching} />
      </Canvas>
    </div>
  );
}

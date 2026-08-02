"use client";

/*
 * TarsWidget.tsx
 * ─────────────────────────────────────────────────────────────────
 * The TARS monolith robot, ported from the standalone FAQ app.
 *
 * MOUNTING — read before editing:
 * This is a SECOND WebGL context. lib/tunnel.ts's context is fixed and
 * never unmounts, so both are live at once whenever this is on screen.
 * That's why FaqSection only renders it on >=768px and only after the
 * section first intersects the viewport. Don't hoist it to page load.
 * ─────────────────────────────────────────────────────────────────
 */

import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function TarsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.5, 2.0, 4.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* Studio lighting — warm fill matches the site's accretion amber */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5e3c, 1.5);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    const tarsGroup = new THREE.Group();
    scene.add(tarsGroup);

    const SEG_WIDTH = 0.37;
    const SEG_HEIGHT = 2.4;
    const SEG_DEPTH = 0.5;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x9999a0,
      metalness: 0.6,
      roughness: 0.35,
    });

    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.2,
    });

    /* Ridged texture for the outer legs */
    const ridgeCanvas = document.createElement("canvas");
    ridgeCanvas.width = 128;
    ridgeCanvas.height = 128;
    const rctx = ridgeCanvas.getContext("2d")!;
    rctx.fillStyle = "#888888";
    rctx.fillRect(0, 0, 128, 128);
    rctx.fillStyle = "#555555";
    for (let x = 8; x < 128; x += 16) rctx.fillRect(x, 0, 4, 128);
    const ridgeTex = new THREE.CanvasTexture(ridgeCanvas);
    ridgeTex.wrapS = THREE.RepeatWrapping;
    ridgeTex.wrapT = THREE.RepeatWrapping;
    ridgeTex.repeat.set(2, 1);
    const ridgeMat = new THREE.MeshStandardMaterial({
      map: ridgeTex,
      metalness: 0.5,
      roughness: 0.7,
      bumpMap: ridgeTex,
      bumpScale: 0.02,
    });

    /* "TARS" label */
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 256;
    textCanvas.height = 1024;
    const tctx = textCanvas.getContext("2d")!;
    tctx.fillStyle = "#F4A233";
    tctx.font = "bold 220px sans-serif";
    tctx.textAlign = "center";
    tctx.textBaseline = "middle";
    const tStr = "TARS";
    for (let i = 0; i < 4; i++) tctx.fillText(tStr[i], 128, 160 + i * 240);
    const textTex = new THREE.CanvasTexture(textCanvas);
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true });

    /* Braille plate */
    const brailleCanvas = document.createElement("canvas");
    brailleCanvas.width = 256;
    brailleCanvas.height = 1024;
    const bctx = brailleCanvas.getContext("2d")!;
    bctx.fillStyle = "#F4A233";
    const br = 16;
    for (let i = 0; i < 4; i++) {
      const cy = 160 + i * 240;
      bctx.beginPath();
      bctx.arc(128 - 25, cy - 20, br, 0, Math.PI * 2);
      bctx.fill();
      if (i % 2 === 0) {
        bctx.beginPath();
        bctx.arc(128 + 25, cy - 20, br, 0, Math.PI * 2);
        bctx.fill();
      }
      if (i > 0) {
        bctx.beginPath();
        bctx.arc(128 - 25, cy + 20, br, 0, Math.PI * 2);
        bctx.fill();
      }
      if (i === 2 || i === 3) {
        bctx.beginPath();
        bctx.arc(128 + 25, cy + 20, br, 0, Math.PI * 2);
        bctx.fill();
      }
    }
    const brailleTex = new THREE.CanvasTexture(brailleCanvas);
    const brailleMat = new THREE.MeshBasicMaterial({ map: brailleTex, transparent: true });

    const segmentGeo = new THREE.BoxGeometry(SEG_WIDTH, SEG_HEIGHT, SEG_DEPTH);
    const screenGeo = new THREE.PlaneGeometry(SEG_WIDTH, 0.4);
    const ridgeGeo = new THREE.BoxGeometry(SEG_WIDTH + 0.002, 0.4, SEG_DEPTH + 0.002);
    const textGeo = new THREE.PlaneGeometry(0.15, 0.6);
    const dataGeo = new THREE.PlaneGeometry(0.2, 0.2);

    const segments: THREE.Mesh[] = [];
    const xOffsets = [-0.6, -0.2, 0.2, 0.6];
    const extraDisposables: { dispose(): void }[] = [];

    for (let i = 0; i < 4; i++) {
      const segMesh = new THREE.Mesh(segmentGeo, bodyMaterial);
      segMesh.position.x = xOffsets[i];
      const Z_OFFSET = SEG_DEPTH / 2 + 0.001;

      if (i === 0 || i === 3) {
        const r1 = new THREE.Mesh(ridgeGeo, ridgeMat);
        r1.position.set(0, 0.6, 0);
        segMesh.add(r1);

        const r2 = new THREE.Mesh(ridgeGeo, ridgeMat);
        r2.position.set(0, -0.6, 0);
        segMesh.add(r2);
      } else {
        const s1 = new THREE.Mesh(screenGeo, screenMaterial);
        s1.position.set(0, 0.6, Z_OFFSET);
        segMesh.add(s1);

        const s2 = new THREE.Mesh(screenGeo, screenMaterial);
        s2.position.set(0, -0.6, Z_OFFSET);
        segMesh.add(s2);

        if (i === 1) {
          const txt = new THREE.Mesh(textGeo, textMat);
          txt.position.set(0, 0, Z_OFFSET);
          segMesh.add(txt);

          const dataCanvas = document.createElement("canvas");
          dataCanvas.width = 64;
          dataCanvas.height = 64;
          const dctx = dataCanvas.getContext("2d")!;
          dctx.fillStyle = "#4ade80";
          dctx.fillRect(10, 20, 10, 5);
          dctx.fillRect(25, 20, 20, 5);
          dctx.fillRect(10, 40, 30, 5);
          const dataTex = new THREE.CanvasTexture(dataCanvas);
          const dataMat = new THREE.MeshBasicMaterial({ map: dataTex, transparent: true });
          extraDisposables.push(dataTex, dataMat);
          const dataPlane = new THREE.Mesh(dataGeo, dataMat);
          dataPlane.position.set(-0.05, 0, 0.001);
          s1.add(dataPlane);
        } else if (i === 2) {
          const brl = new THREE.Mesh(textGeo, brailleMat);
          brl.position.set(0, 0, Z_OFFSET);
          segMesh.add(brl);
        }
      }

      tarsGroup.add(segMesh);
      segments.push(segMesh);
    }

    const BASE_Y = SEG_HEIGHT / 2;
    tarsGroup.position.y = BASE_Y;

    const outerLegs = [segments[0], segments[3]];
    const innerLegs = [segments[1], segments[2]];

    const STATES = { IDLE: 0, WALKING: 1, TRANSITIONING: 2 };
    let currentState = STATES.IDLE;
    let walkTime = 0;
    const WALK_SPEED = 3.0;
    let idleTime = 0;
    let transitionProgress = 0;
    const TRANSITION_DURATION = 0.8;
    let startRotations: number[] = [];
    let targetRotations: number[] = [];
    let startGroupY = BASE_Y;

    function toggleState() {
      if (currentState === STATES.IDLE || currentState === STATES.TRANSITIONING) {
        currentState = STATES.WALKING;
      } else if (currentState === STATES.WALKING) {
        currentState = STATES.TRANSITIONING;
        transitionProgress = 0;
        startGroupY = tarsGroup.position.y;
        startRotations = segments.map((seg) => seg.rotation.x);
        targetRotations = startRotations.map(
          (rot) => Math.round(rot / (Math.PI * 2)) * (Math.PI * 2)
        );
      }
    }

    /* Opening a FAQ accordion makes TARS walk — FaqSection dispatches this */
    const handleTarsInteraction = (e: Event) => {
      const active = (e as CustomEvent<{ active: boolean }>).detail?.active;
      if (active && (currentState === STATES.IDLE || currentState === STATES.TRANSITIONING)) {
        toggleState();
      } else if (!active && currentState === STATES.WALKING) {
        toggleState();
      }
    };

    window.addEventListener("tars-interaction", handleTarsInteraction);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (raycaster.intersectObjects(segments).length > 0) toggleState();
    };

    container.addEventListener("pointerdown", handlePointerDown);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let animationFrameId = 0;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (currentState === STATES.IDLE) {
        idleTime += delta;
        tarsGroup.position.y = BASE_Y + Math.sin(idleTime * 2.5) * 0.04;
      } else if (currentState === STATES.WALKING) {
        walkTime += delta * WALK_SPEED;

        const outerAngle = walkTime;
        const innerAngle = walkTime + Math.PI / 2;

        outerLegs.forEach((leg) => (leg.rotation.x = outerAngle));
        innerLegs.forEach((leg) => (leg.rotation.x = innerAngle));

        /* Keep the lowest corner on the floor as the segments tumble */
        const hOuter =
          (SEG_HEIGHT / 2) * Math.abs(Math.cos(outerAngle)) +
          (SEG_DEPTH / 2) * Math.abs(Math.sin(outerAngle));
        const hInner =
          (SEG_HEIGHT / 2) * Math.abs(Math.cos(innerAngle)) +
          (SEG_DEPTH / 2) * Math.abs(Math.sin(innerAngle));

        tarsGroup.position.y = Math.max(hOuter, hInner);
      } else if (currentState === STATES.TRANSITIONING) {
        transitionProgress += delta / TRANSITION_DURATION;
        const t = Math.min(transitionProgress, 1.0);
        const easeT = 1 - Math.pow(1 - t, 3);

        segments.forEach((seg, i) => {
          seg.rotation.x = THREE.MathUtils.lerp(startRotations[i], targetRotations[i], easeT);
        });

        tarsGroup.position.y = THREE.MathUtils.lerp(startGroupY, BASE_Y, easeT);

        if (t >= 1.0) {
          currentState = STATES.IDLE;
          walkTime = 0;
        }
      }

      tarsGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.08;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("tars-interaction", handleTarsInteraction);
      container.removeEventListener("pointerdown", handlePointerDown);
      resizeObserver.disconnect();

      [
        segmentGeo, screenGeo, ridgeGeo, textGeo, dataGeo,
        bodyMaterial, screenMaterial, ridgeMat, textMat, brailleMat,
        ridgeTex, textTex, brailleTex,
        ...extraDisposables,
      ].forEach((d) => d.dispose());

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 drop-shadow-2xl cursor-pointer"
    />
  );
}

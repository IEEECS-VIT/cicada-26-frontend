import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * TarsWidget - Standalone 3D Procedural TARS Robot Component
 * 
 * @param {Object} props
 * @param {string} [props.className] - CSS classes for the container (must specify dimensions or be flex/absolute)
 * @param {boolean} [props.interactive=true] - Enables direct click/tap raycasting on the 3D robot
 */
export default function TarsWidget({
  className = 'w-full h-full relative cursor-pointer',
  interactive = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 500;

    // --- 1. THREE.JS SCENE & CAMERA SETUP ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(3.0, 1.8, 3.9);
    camera.lookAt(-0.25, 1.2, -0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING RIG ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb58055, 2.4);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.8);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Warm copper/amber accent light to reflect on TARS metallic surfaces
    const accentLight = new THREE.PointLight(0xffaa22, 10.0, 15);
    accentLight.position.set(2, 2.5, 3);
    scene.add(accentLight);

    // --- 3. PROCEDURAL TEXTURES GENERATION ---
    const tarsGroup = new THREE.Group();
    scene.add(tarsGroup);

    const SEG_WIDTH = 0.37;
    const SEG_HEIGHT = 2.4;
    const SEG_DEPTH = 0.5;

    // A. Brushed metal texture with vertical indents/seams
    const bodyCanvas = document.createElement('canvas');
    bodyCanvas.width = 512;
    bodyCanvas.height = 512;
    const bodyCtx = bodyCanvas.getContext('2d');

    // Base metallic fill
    bodyCtx.fillStyle = '#cacad0';
    bodyCtx.fillRect(0, 0, 512, 512);

    // Fine brushed grain streaks
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 512;
      const h = 40 + Math.random() * 200;
      const y = Math.random() * (512 - h);
      const alpha = 0.02 + Math.random() * 0.06;
      
      bodyCtx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      bodyCtx.fillRect(x, y, 1 + Math.random() * 2, h);
      
      bodyCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      bodyCtx.fillRect(x + 1, y, 1 + Math.random() * 2, h);
    }

    // Panel seams
    const drawVerticalIndent = (x) => {
      bodyCtx.fillStyle = '#3a3a3d';
      bodyCtx.fillRect(x - 3, 0, 3, 512);
      bodyCtx.fillStyle = '#1c1c1f';
      bodyCtx.fillRect(x, 0, 4, 512);
      bodyCtx.fillStyle = '#d0d0d5';
      bodyCtx.fillRect(x + 4, 0, 3, 512);
    };
    drawVerticalIndent(128);
    drawVerticalIndent(384);

    const drawHorizontalIndent = (y) => {
      bodyCtx.fillStyle = '#3a3a3d';
      bodyCtx.fillRect(0, y - 2, 512, 2);
      bodyCtx.fillStyle = '#1c1c1f';
      bodyCtx.fillRect(0, y, 512, 2);
      bodyCtx.fillStyle = '#d0d0d5';
      bodyCtx.fillRect(0, y + 2, 512, 2);
    };
    drawHorizontalIndent(80);
    drawHorizontalIndent(432);

    const bodyTex = new THREE.CanvasTexture(bodyCanvas);
    bodyTex.wrapS = THREE.RepeatWrapping;
    bodyTex.wrapT = THREE.RepeatWrapping;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: bodyTex,
      bumpMap: bodyTex,
      bumpScale: 0.008,
      metalness: 0.9,
      roughness: 0.22,
    });

    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.9,
      metalness: 0.1,
    });

    // B. Ridged texture for outer legs
    const ridgeCanvas = document.createElement('canvas');
    ridgeCanvas.width = 128;
    ridgeCanvas.height = 128;
    const rctx = ridgeCanvas.getContext('2d');
    rctx.fillStyle = '#18181b';
    rctx.fillRect(0, 0, 128, 128);
    rctx.fillStyle = '#0d0d0f';
    for (let x = 8; x < 128; x += 16) rctx.fillRect(x, 0, 4, 128);

    const ridgeTex = new THREE.CanvasTexture(ridgeCanvas);
    ridgeTex.wrapS = THREE.RepeatWrapping;
    ridgeTex.wrapT = THREE.RepeatWrapping;
    ridgeTex.repeat.set(2, 1);
    const ridgeMat = new THREE.MeshStandardMaterial({
      map: ridgeTex,
      metalness: 0.2,
      roughness: 0.85,
      bumpMap: ridgeTex,
      bumpScale: 0.02,
    });

    // C. "TARS" Vertical typography canvas
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 256;
    textCanvas.height = 1024;
    const tctx = textCanvas.getContext('2d');
    tctx.fillStyle = '#ff9900';
    tctx.font = 'bold 220px sans-serif';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    const tStr = 'TARS';
    for (let i = 0; i < 4; i++) {
      tctx.fillText(tStr[i], 128, 160 + i * 240);
    }
    const textTex = new THREE.CanvasTexture(textCanvas);
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true });

    // D. Braille decal canvas
    const brailleCanvas = document.createElement('canvas');
    brailleCanvas.width = 256;
    brailleCanvas.height = 1024;
    const bctx = brailleCanvas.getContext('2d');
    bctx.fillStyle = '#ff9900';
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

    // --- 4. GEOMETRIES & SEGMENTS CREATION ---
    const segmentGeo = new THREE.BoxGeometry(SEG_WIDTH, SEG_HEIGHT, SEG_DEPTH);
    const screenGeo = new THREE.PlaneGeometry(SEG_WIDTH, 0.4);
    const ridgeGeo = new THREE.BoxGeometry(SEG_WIDTH + 0.002, 0.4, SEG_DEPTH + 0.002);
    const textGeo = new THREE.PlaneGeometry(0.15, 0.6);
    let dataGeo = null;
    let dataMat = null;
    let dataTex = null;

    const segments = [];
    const xOffsets = [-0.6, -0.2, 0.2, 0.6];

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

          // Telemetry graphic
          const dataCanvas = document.createElement('canvas');
          dataCanvas.width = 64;
          dataCanvas.height = 64;
          const dctx = dataCanvas.getContext('2d');
          dctx.fillStyle = '#4ade80';
          dctx.fillRect(10, 20, 10, 5);
          dctx.fillRect(25, 20, 20, 5);
          dctx.fillRect(10, 40, 30, 5);
          dataTex = new THREE.CanvasTexture(dataCanvas);
          dataMat = new THREE.MeshBasicMaterial({ map: dataTex, transparent: true });
          dataGeo = new THREE.PlaneGeometry(0.2, 0.2);
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
    tarsGroup.scale.set(1.1, 1.1, 1.1);

    // --- 5. STATE MACHINE & ANIMATION CONTROLLER ---
    const STATES = { IDLE: 0, WALKING: 1, TRANSITIONING: 2 };
    let currentState = STATES.IDLE;
    let walkTime = 0;
    const WALK_SPEED = 3.0;
    let idleTime = 0;
    let transitionProgress = 0;
    const TRANSITION_DURATION = 0.8;
    let startRotations = [];
    let targetRotations = [];
    let startGroupY = BASE_Y;

    let introWeight = 0;
    const INTRO_DURATION = 0.6;
    let startWalkRotations = [];

    function toggleState() {
      if (currentState === STATES.IDLE || currentState === STATES.TRANSITIONING) {
        currentState = STATES.WALKING;
        introWeight = 0;
        startWalkRotations = segments.map((seg) => seg.rotation.x);
        walkTime = 0;
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

    // --- 6. EVENT LISTENERS ---
    const handleTarsInteraction = (e) => {
      if (e.detail?.active && (currentState === STATES.IDLE || currentState === STATES.TRANSITIONING)) {
        toggleState();
      } else if (!e.detail?.active && currentState === STATES.WALKING) {
        toggleState();
      }
    };

    window.addEventListener('tars-interaction', handleTarsInteraction);

    // Direct Canvas Click Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouse.x = (x / rect.width) * 2 - 1;
      mouse.y = -(y / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(segments);
      if (intersects.length > 0) {
        toggleState();
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);

    // Responsive Scale & Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);

          tarsGroup.scale.set(1.1, 1.1, 1.1);
        }
      }
    });
    resizeObserver.observe(container);

    // Pause rendering when scrolled out of view to preserve GPU cycles
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: '100px' }
    );
    visibility.observe(container);

    // --- 7. ANIMATION TICK LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (!onScreen) return;

      if (currentState === STATES.IDLE) {
        idleTime += delta;
        tarsGroup.position.y = BASE_Y + Math.sin(idleTime * 2.5) * 0.04;
      } else if (currentState === STATES.WALKING) {
        walkTime += delta * WALK_SPEED;

        if (introWeight < 1.0) {
          introWeight = Math.min(1.0, introWeight + delta / INTRO_DURATION);
        }

        const easeIntro = 1 - Math.pow(1 - introWeight, 3);
        const targetOuterAngle = (startWalkRotations[0] || 0) + walkTime;
        const targetInnerAngle = (startWalkRotations[1] || 0) + walkTime + Math.PI / 2;

        segments.forEach((seg, i) => {
          const isOuter = (i === 0 || i === 3);
          const targetAngle = isOuter ? targetOuterAngle : targetInnerAngle;
          const startAngle = startWalkRotations[i] || 0;
          seg.rotation.x = THREE.MathUtils.lerp(startAngle, targetAngle, easeIntro);
        });

        const hOuter =
          (SEG_HEIGHT / 2) * Math.abs(Math.cos(segments[0].rotation.x)) +
          (SEG_DEPTH / 2) * Math.abs(Math.sin(segments[0].rotation.x));
        const hInner =
          (SEG_HEIGHT / 2) * Math.abs(Math.cos(segments[1].rotation.x)) +
          (SEG_DEPTH / 2) * Math.abs(Math.sin(segments[1].rotation.x));

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

    // --- 8. LIFECYCLE CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('tars-interaction', handleTarsInteraction);
      container.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();
      visibility.disconnect();

      renderer.dispose();
      segmentGeo.dispose();
      screenGeo.dispose();
      ridgeGeo.dispose();
      textGeo.dispose();
      if (dataGeo) dataGeo.dispose();
      bodyMaterial.dispose();
      screenMaterial.dispose();
      ridgeMat.dispose();
      textMat.dispose();
      brailleMat.dispose();
      if (dataMat) dataMat.dispose();
      ridgeTex.dispose();
      textTex.dispose();
      brailleTex.dispose();
      bodyTex.dispose();
      if (dataTex) dataTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return <div ref={containerRef} className={className} />;
}

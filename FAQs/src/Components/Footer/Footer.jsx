import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import backgroundImage from './background.png';

// --- 1. TARS 3D ROBOT ASSISTANT SUB-COMPONENT ---
function TarsWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.5, 2.0, 4.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5e3c, 1.5);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // TARS Group & Materials
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

    // Ridged texture for outer legs
    const ridgeCanvas = document.createElement('canvas');
    ridgeCanvas.width = 128;
    ridgeCanvas.height = 128;
    const rctx = ridgeCanvas.getContext('2d');
    rctx.fillStyle = '#888888';
    rctx.fillRect(0, 0, 128, 128);
    rctx.fillStyle = '#555555';
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

    // "TARS" label canvas
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

    // Braille canvas texture
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

    const segmentGeo = new THREE.BoxGeometry(SEG_WIDTH, SEG_HEIGHT, SEG_DEPTH);
    const screenGeo = new THREE.PlaneGeometry(SEG_WIDTH, 0.4);
    const ridgeGeo = new THREE.BoxGeometry(SEG_WIDTH + 0.002, 0.4, SEG_DEPTH + 0.002);
    const textGeo = new THREE.PlaneGeometry(0.15, 0.6);

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

          const dataCanvas = document.createElement('canvas');
          dataCanvas.width = 64;
          dataCanvas.height = 64;
          const dctx = dataCanvas.getContext('2d');
          dctx.fillStyle = '#4ade80';
          dctx.fillRect(10, 20, 10, 5);
          dctx.fillRect(25, 20, 20, 5);
          dctx.fillRect(10, 40, 30, 5);
          const dataTex = new THREE.CanvasTexture(dataCanvas);
          const dataPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 0.2),
            new THREE.MeshBasicMaterial({ map: dataTex, transparent: true })
          );
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
    let startRotations = [];
    let targetRotations = [];
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

    const handleTarsInteraction = (e) => {
      if (e.detail?.active && (currentState === STATES.IDLE || currentState === STATES.TRANSITIONING)) {
        toggleState();
      } else if (!e.detail?.active && currentState === STATES.WALKING) {
        toggleState();
      }
    };

    window.addEventListener('tars-interaction', handleTarsInteraction);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
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

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
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
    let animationFrameId;

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
      window.removeEventListener('tars-interaction', handleTarsInteraction);
      container.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();

      renderer.dispose();
      segmentGeo.dispose();
      screenGeo.dispose();
      ridgeGeo.dispose();
      textGeo.dispose();
      bodyMaterial.dispose();
      screenMaterial.dispose();
      ridgeMat.dispose();
      textMat.dispose();
      brailleMat.dispose();
      ridgeTex.dispose();
      textTex.dispose();
      brailleTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full absolute inset-0 drop-shadow-2xl cursor-pointer" />;
}

// --- 2. FAQ DATA ---
const FAQ_ITEMS = [
  {
    id: '001',
    question: 'WHAT IS CICADA 2067?',
    answer: 'CICADA 2067 is a cryptic puzzle-solving competition organized by the IEEE Computer Society. Participants work in teams to solve a series of interconnected puzzles that test their logical reasoning, creativity, observation, and problem-solving skills.',
  },
  {
    id: '002',
    question: 'WHO CAN PARTICIPATE?',
    answer: 'The event is open to all eligible students (according to the event rules). Whether you\'re a beginner or an experienced puzzle solver, everyone is welcome.',
  },
  {
    id: '003',
    question: 'DO I NEED PRIOR EXPERIENCE?',
    answer: 'No. While experience with puzzles can be helpful, the event is designed so that anyone with curiosity and logical thinking can participate.',
  },
  {
    id: '004',
    question: 'IS PARTICIPATION INDIVIDUAL OR IN TEAMS?',
    answer: 'Participation is in teams only.',
  },
  {
    id: '005',
    question: 'WILL HINTS BE PROVIDED?',
    answer: 'Hints may be released after specific intervals or may carry a score penalty, depending on the rules.',
  },
  {
    id: '006',
    question: 'WILL OD BE PROVIDED?',
    answer: 'Yes, OD will be provided to the participants if they report to the venue on time and record their attendance.',
  },
  {
    id: '007',
    question: 'WHAT SHOULD PARTICIPANTS BRING?',
    list: [
      'A fully charged laptop',
      'Stable internet connection',
      'Pen and paper for rough work',
      'Student ID',
    ],
  },
];

// --- 3. COMBINED FOOTER COMPONENT (BACKGROUND + TARS 3D WIDGET + FAQ ACCORDION + FULL-WIDTH FOOTER BAR) ---
export default function Footer() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    const nextIndex = openIndex === index ? null : index;
    setOpenIndex(nextIndex);

    // Dispatch TARS interaction event to trigger robot walk cycle animation
    window.dispatchEvent(
      new CustomEvent('tars-interaction', { detail: { active: nextIndex !== null } })
    );
  };

  return (
    <div className="w-full bg-[#131313] text-[#e5e2e1] font-mono relative overflow-x-hidden min-h-screen flex flex-col justify-between">
      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 scanline w-full h-full pointer-events-none z-50 opacity-20"></div>

      {/* Cosmic Background Image Layer */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-50 blur-[3px] scale-105">
        <img className="w-full h-full object-cover" src={backgroundImage} alt="Black Hole Cosmic Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/60 via-transparent to-[#131313]"></div>
      </div>

      {/* FAQ & TARS Assistant Section */}
      <section className="relative z-10 py-32 px-4 md:px-16 w-full max-w-[1440px] mx-auto border-t border-[#353534] flex-1">
        <div className="text-center mb-16">
          <h3 className="text-[#ffdb9d] font-mono text-xs tracking-[0.3em] uppercase mb-4">
            // DATA_ARCHIVE_ACCESS
          </h3>
          <h2 className="font-mono text-3xl text-[#d6c3ba] uppercase tracking-widest opacity-50 font-semibold">
            COMMON DECRYPTED SIGNALS
          </h2>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#feb700]"></div>
            <div className="w-2 h-2 bg-[#feb700]"></div>
            <div className="w-2 h-2 bg-[#feb700]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left Column - Interactive 3D TARS Assistant */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div id="tars-widget" className="w-full h-[500px] flex flex-col items-center justify-end relative">
              <TarsWidget />
            </div>
            <div className="font-mono text-[#f8b898] text-xs uppercase tracking-widest mt-4">TARS</div>
            <div className="w-full font-mono text-sm text-[#ffdb9d]/50 flex flex-col gap-4 uppercase tracking-widest border-t border-[#353534]/30 pt-8 mt-8">
              <div className="mb-4">METADATA_HEADER:</div>
              <div className="flex flex-col gap-1">
                <span>FILE_NAME: FAQ_HUNT.DAT</span>
                <span>SIZE: 128.4 KB</span>
                <span>ENCRYPTION: AES-XTS-512</span>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Accordions */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleFaq(index)}
                  className="group bg-[#201f1f]/50 border border-[#353534]/30 p-6 cursor-pointer transition-all hover:bg-[#353534]/20 rounded"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <span className="text-[#ffdb9d]/40 font-mono">{item.id}</span>
                      <span className="text-[#e5e2e1] font-mono text-lg tracking-widest uppercase">
                        {item.question}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#ffdb9d]/60">
                      {isOpen ? 'remove' : 'add'}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="mt-6 text-[#d6c3ba] font-mono border-l border-[#ffdb9d]/30 pl-4 py-2 transition-all">
                      {item.answer && <p className="text-[#ffdb9d] inline-block">{item.answer}</p>}
                      {item.list && (
                        <ul className="text-[#ffdb9d] inline-block list-disc pl-4 space-y-1">
                          {item.list.map((listItem, i) => (
                            <li key={i}>{listItem}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Edge-to-Edge Full-Width Docked Footer Bar */}
      <footer className="relative z-10 w-full min-h-[120px] py-6 bg-[#131313]/90 backdrop-blur-sm border-t border-[#51443e]">
        <div className="w-full px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#d6c3ba] font-mono text-xs uppercase flex items-center gap-4">
            <span>© IEEE COMPUTER SOCIETY VIT</span>
            <span className="flex items-center gap-2 text-[#f8b898]">
              <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse shadow-[0_0_8px_#feb700]"></span>
              STATUS: ONLINE
            </span>
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-xs uppercase">
            <a
              className="text-[#d6c3ba] hover:text-[#f8b898] transition-all duration-200 opacity-80 hover:opacity-100"
              href="https://www.instagram.com/ieeecs_vit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              INSTAGRAM
            </a>
            <a
              className="text-[#d6c3ba] hover:text-[#f8b898] transition-all duration-200 opacity-80 hover:opacity-100"
              href="https://www.linkedin.com/company/ieee-cs-vit"
              target="_blank"
              rel="noopener noreferrer"
            >
              LINKEDIN
            </a>
            <a
              className="text-[#d6c3ba] hover:text-[#f8b898] transition-all duration-200 opacity-80 hover:opacity-100"
              href="https://twitter.com/ieeecsvit"
              target="_blank"
              rel="noopener noreferrer"
            >
              TWITTER / X
            </a>
            <a
              className="text-[#d6c3ba] hover:text-[#f8b898] transition-all duration-200 opacity-80 hover:opacity-100"
              href="https://www.youtube.com/@ieeecomputersociety-vitcha2386"
              target="_blank"
              rel="noopener noreferrer"
            >
              YOUTUBE
            </a>
            <a
              className="text-[#d6c3ba] hover:text-[#f8b898] transition-all duration-200 opacity-80 hover:opacity-100"
              href="https://github.com/ieeecs-vit"
              target="_blank"
              rel="noopener noreferrer"
            >
              GITHUB
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

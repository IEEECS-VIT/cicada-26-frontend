"use client";

import { useEffect, useRef } from "react";

/* ================================================================
   SpacecraftCanvas.tsx
   Renders an Endurance-style ring spacecraft using Canvas 2D API.
   No Three.js dependency — pure browser canvas, zero DOM overhead.
   Features:
     • Rotating habitat ring with 12 perspective-correct modules
     • 3 structural struts with correct front/back depth ordering
     • Central multi-segment hub with blue window lights
     • Engine glow (radial gradient) at 3 strut-ring junctions
     • Particle system (amber exhaust, max 180 particles)
     • Gentle body bob + drift animation (sine wave)
     • ResizeObserver for fluid responsiveness
     • devicePixelRatio-aware canvas for crisp retina output
   ================================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/* ── Module: one habitat segment on the ring ─────────────────── */
function drawModule(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theta: number,
  R: number,
  Ry: number,
  isFront: boolean
) {
  const ex = cx + Math.cos(theta) * R;
  const ey = cy + Math.sin(theta) * Ry;
  const ix = cx + Math.cos(theta) * R * 0.82;
  const iy = cy + Math.sin(theta) * Ry * 0.82;

  const angle2D = Math.atan2(ey - iy, ex - ix);
  const len = Math.hypot(ex - ix, ey - iy);
  const mw = R * 0.042;

  ctx.save();
  ctx.translate((ex + ix) / 2, (ey + iy) / 2);
  ctx.rotate(angle2D);

  if (isFront) {
    const g = ctx.createLinearGradient(-mw / 2, 0, mw / 2, 0);
    g.addColorStop(0, "rgba(78,84,108,1)");
    g.addColorStop(0.5, "rgba(118,124,155,1)");
    g.addColorStop(1, "rgba(78,84,108,1)");
    ctx.fillStyle = g;
    ctx.fillRect(-mw / 2, -len / 2, mw, len);
    ctx.strokeStyle = "rgba(145,152,185,0.22)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-mw / 2, -len / 2, mw, len);
    /* small detail cross-line */
    ctx.strokeStyle = "rgba(145,152,185,0.12)";
    ctx.beginPath();
    ctx.moveTo(-mw / 2, 0);
    ctx.lineTo(mw / 2, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(48,53,70,0.88)";
    ctx.fillRect(-mw / 2, -len / 2, mw, len);
  }
  ctx.restore();
}

/* ── Strut: arm from hub to ring ─────────────────────────────── */
function drawStrut(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theta: number,
  R: number,
  Ry: number,
  isFront: boolean
) {
  const ex = cx + Math.cos(theta) * R * 0.875;
  const ey = cy + Math.sin(theta) * Ry * 0.875;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = isFront
    ? "rgba(105,112,138,0.92)"
    : "rgba(60,65,85,0.65)";
  ctx.lineWidth = isFront ? R * 0.014 : R * 0.009;
  ctx.stroke();
  /* double-strut detail */
  const offset = isFront ? R * 0.007 : R * 0.004;
  const perp = theta + Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(perp) * offset, cy + Math.sin(perp) * offset);
  ctx.lineTo(
    ex + Math.cos(perp) * offset,
    ey + Math.sin(perp) * offset
  );
  ctx.strokeStyle = isFront
    ? "rgba(90,97,122,0.5)"
    : "rgba(45,50,68,0.4)";
  ctx.lineWidth = isFront ? R * 0.006 : R * 0.004;
  ctx.stroke();
  ctx.restore();
}

/* ── Hub: central spine with segmented modules ───────────────── */
function drawHub(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number
) {
  const hw = R * 0.64;
  const hh = R * 0.088;
  const nSeg = 6;
  const segW = hw / nSeg;

  for (let s = 0; s < nSeg; s++) {
    const sx = cx - hw / 2 + s * segW;
    const segH =
      s === 2 || s === 3
        ? hh * 1.38
        : s === 1 || s === 4
        ? hh * 1.15
        : hh;

    const g = ctx.createLinearGradient(0, cy - segH / 2, 0, cy + segH / 2);
    g.addColorStop(0, "rgba(120,126,158,0.96)");
    g.addColorStop(0.42, "rgba(88,94,120,0.93)");
    g.addColorStop(1, "rgba(48,53,72,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(sx + 1, cy - segH / 2, segW - 2, segH);

    /* top edge highlight */
    ctx.fillStyle = "rgba(155,162,198,0.18)";
    ctx.fillRect(sx + 1, cy - segH / 2, segW - 2, 1.5);

    /* segment divider */
    ctx.strokeStyle = "rgba(38,42,60,0.8)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, cy - segH / 2);
    ctx.lineTo(sx, cy + segH / 2);
    ctx.stroke();
  }

  /* Blue illuminated windows */
  const windowCount = 6;
  for (let w = 0; w < windowCount; w++) {
    const wx = cx - hw * 0.35 + (w / (windowCount - 1)) * hw * 0.7;
    const wr = R * 0.011;
    const brightness = 0.7 + Math.random() * 0.3; // slight flicker
    const wg = ctx.createRadialGradient(wx, cy, 0, wx, cy, wr * 3);
    wg.addColorStop(0, `rgba(180,218,255,${0.92 * brightness})`);
    wg.addColorStop(0.4, `rgba(100,160,230,${0.5 * brightness})`);
    wg.addColorStop(1, "rgba(80,130,200,0)");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(wx, cy, wr, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Docking port cross detail on centre */
  ctx.strokeStyle = "rgba(140,148,180,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.04, cy);
  ctx.lineTo(cx + R * 0.04, cy);
  ctx.moveTo(cx, cy - R * 0.045);
  ctx.lineTo(cx, cy + R * 0.045);
  ctx.stroke();
  const dcg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.03);
  dcg.addColorStop(0, "rgba(200,210,255,0.5)");
  dcg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dcg;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

/* ── Engine glow at a ring position ─────────────────────────── */
function drawEnginePod(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theta: number,
  R: number,
  Ry: number,
  ts: number
) {
  const ex = cx + Math.cos(theta) * R;
  const ey = cy + Math.sin(theta) * Ry;

  /* Pod body */
  const podW = R * 0.038;
  const podH = R * 0.055;
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(theta);
  ctx.fillStyle = "rgba(62,68,88,0.96)";
  ctx.fillRect(-podW / 2, -podH / 2, podW, podH);
  ctx.strokeStyle = "rgba(130,138,168,0.2)";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-podW / 2, -podH / 2, podW, podH);
  ctx.restore();

  /* Engine glow — pulsing intensity */
  const pulse = 0.82 + Math.sin(ts * 0.0028 + theta) * 0.18;
  const glowR = R * 0.09 * pulse;
  const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowR);
  glow.addColorStop(0, `rgba(255,230,130,${0.98 * pulse})`);
  glow.addColorStop(0.28, `rgba(244,162,51,${0.62 * pulse})`);
  glow.addColorStop(0.65, `rgba(220,90,20,${0.22 * pulse})`);
  glow.addColorStop(1, "rgba(200,60,0,0)");
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ex, ey, glowR, 0, Math.PI * 2);
  ctx.fill();

  /* Secondary soft glow halo */
  const halo = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowR * 2.5);
  halo.addColorStop(0, `rgba(244,162,51,${0.12 * pulse})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(ex, ey, glowR * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ================================================================
   Main Component
   ================================================================ */
export default function SpacecraftCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    const particles: Particle[] = [];

    /* ── Resize ─────────────────────────────────────────────── */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = wrap!.clientWidth;
      const ch = wrap!.clientHeight;
      canvas!.width = Math.round(cw * dpr);
      canvas!.height = Math.round(ch * dpr);
      canvas!.style.width = cw + "px";
      canvas!.style.height = ch + "px";
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    /* ── Particle spawning ───────────────────────────────────── */
    function emit(x: number, y: number, theta: number) {
      if (particles.length >= 180) return;
      const outDir = theta + Math.PI; /* away from center */
      const spread = 0.6;
      const speed = 0.35 + Math.random() * 0.65;
      const dir = outDir + (Math.random() - 0.5) * spread;
      particles.push({
        x,
        y,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        life: 60 + Math.random() * 60,
        maxLife: 120,
        size: 0.7 + Math.random() * 2.0,
      });
    }

    /* ── Main render loop ────────────────────────────────────── */
    function drawFrame(ts: number) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas!.width / dpr;
      const H = canvas!.height / dpr;

      ctx!.clearRect(0, 0, W, H);

      /* Animation values */
      const ringRot = ts * 0.000235; /* ring spin speed */
      const bobY = Math.sin(ts * 0.00068) * 9;
      const driftX = Math.cos(ts * 0.00044) * 5;

      /* Ship center — center of the canvas (right hero column) */
      const cx = W * 0.5 + driftX;
      const cy = H * 0.50 + bobY;

      /* Ring geometry */
      const R = Math.min(W, H) * 0.28; /* major radius */
      const Ry = R * 0.265; /* minor radius — perspective tilt */

      /* ── 1. Ambient ring glow ─────────────────────────────── */
      const ambGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, R * 1.45);
      ambGlow.addColorStop(0, "rgba(244,162,51,0.055)");
      ambGlow.addColorStop(0.55, "rgba(244,162,51,0.02)");
      ambGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = ambGlow;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R * 1.45, Ry * 1.45, 0, 0, Math.PI * 2);
      ctx!.fill();

      /* ── 2. Back ring fill (top half, sin θ < 0) ─────────── */
      ctx!.save();
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R, Ry, 0, Math.PI, Math.PI * 2, false);
      ctx!.ellipse(cx, cy, R * 0.82, Ry * 0.82, 0, Math.PI * 2, Math.PI, true);
      ctx!.fillStyle = "rgba(48,53,72,0.72)";
      ctx!.fill("evenodd");
      /* Outer back stroke */
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R, Ry, 0, Math.PI, Math.PI * 2);
      ctx!.strokeStyle = "rgba(68,74,96,0.88)";
      ctx!.lineWidth = R * 0.011;
      ctx!.stroke();
      /* Inner back stroke */
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R * 0.82, Ry * 0.82, 0, Math.PI, Math.PI * 2);
      ctx!.strokeStyle = "rgba(52,58,78,0.72)";
      ctx!.lineWidth = R * 0.007;
      ctx!.stroke();
      ctx!.restore();

      /* ── 3. Back modules & back struts ───────────────────── */
      for (let i = 0; i < 12; i++) {
        const theta = (i / 12) * Math.PI * 2 + ringRot;
        if (Math.sin(theta) >= 0) continue; /* back = sin < 0 */
        drawModule(ctx!, cx, cy, theta, R, Ry, false);
      }
      for (let i = 0; i < 3; i++) {
        const theta = (i / 3) * Math.PI * 2 + ringRot;
        if (Math.sin(theta) >= 0) continue;
        drawStrut(ctx!, cx, cy, theta, R, Ry, false);
      }

      /* ── 4. Central hub ──────────────────────────────────── */
      drawHub(ctx!, cx, cy, R);

      /* ── 5. Front struts & front modules ─────────────────── */
      for (let i = 0; i < 3; i++) {
        const theta = (i / 3) * Math.PI * 2 + ringRot;
        if (Math.sin(theta) < 0) continue;
        drawStrut(ctx!, cx, cy, theta, R, Ry, true);
      }
      for (let i = 0; i < 12; i++) {
        const theta = (i / 12) * Math.PI * 2 + ringRot;
        if (Math.sin(theta) < 0) continue; /* front = sin > 0 */
        drawModule(ctx!, cx, cy, theta, R, Ry, true);
      }

      /* ── 6. Front ring fill (bottom half, sin θ > 0) ─────── */
      ctx!.save();
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R, Ry, 0, 0, Math.PI, false);
      ctx!.ellipse(cx, cy, R * 0.82, Ry * 0.82, 0, Math.PI, 0, true);
      ctx!.fillStyle = "rgba(58,63,84,0.78)";
      ctx!.fill("evenodd");
      /* Outer front stroke */
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R, Ry, 0, 0, Math.PI);
      ctx!.strokeStyle = "rgba(96,102,130,0.96)";
      ctx!.lineWidth = R * 0.015;
      ctx!.stroke();
      /* Inner front stroke */
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R * 0.82, Ry * 0.82, 0, 0, Math.PI);
      ctx!.strokeStyle = "rgba(76,82,108,0.82)";
      ctx!.lineWidth = R * 0.009;
      ctx!.stroke();
      ctx!.restore();

      /* ── 7. Engine pods at 3 strut-ring junctions ─────────── */
      for (let i = 0; i < 3; i++) {
        const theta = (i / 3) * Math.PI * 2 + ringRot;
        drawEnginePod(ctx!, cx, cy, theta, R, Ry, ts);

        /* Spawn exhaust particles (probabilistic) */
        if (Math.random() < 0.22) {
          const ex = cx + Math.cos(theta) * R;
          const ey = cy + Math.sin(theta) * Ry;
          emit(ex, ey, theta);
        }
      }

      /* ── 8. Particle system ───────────────────────────────── */
      ctx!.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; /* drag */
        p.vy *= 0.98;
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const progress = p.life / p.maxLife;
        ctx!.globalAlpha = progress * 0.72;
        ctx!.fillStyle = progress > 0.55 ? "#FFD97D" : "#F4A233";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * Math.max(0.1, progress), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();

      rafId = requestAnimationFrame(drawFrame);
    }

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}

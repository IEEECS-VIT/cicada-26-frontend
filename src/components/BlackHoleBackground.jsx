import { useEffect, useRef } from "react";

export default function BlackHoleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let stars = [];
    let accretionParticles = [];
    let shootingStars = [];
    let nextShootingStar = 600;
    let rafId = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize background stars
      stars = [];
      const starCount = Math.floor(Math.min(width, 1920) * 0.22);
      for (let i = 0; i < starCount; i++) {
        const depth = Math.random();
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          radius: 0.4 + depth * 1.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + depth * 0.06,
          isWarm: Math.random() < 0.38,
          isCyan: Math.random() < 0.15,
        });
      }

      // Initialize accretion disk orbit particles
      accretionParticles = [];
      const diskParticleCount = 420;
      for (let i = 0; i < diskParticleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distRatio = Math.pow(Math.random(), 1.6);
        accretionParticles.push({
          angle,
          distRatio,
          speed: (0.012 + (1 - distRatio) * 0.026) * (Math.random() < 0.08 ? 1.3 : 1),
          size: 1.0 + Math.random() * 2.8,
          alphaBase: 0.45 + Math.random() * 0.55,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = e.clientY / window.innerHeight;
    };

    if (!reduceMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let lastTime = performance.now();

    const animate = (currentTime) => {
      const dt = Math.min(currentTime - lastTime, 48);
      lastTime = currentTime;

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Black hole center position: placed for cinematic backdrop
      const isMobile = width < 768;
      const bhX = isMobile ? width * 0.5 : width * 0.72 + (mouse.x - 0.5) * 35;
      const bhY = isMobile ? height * 0.28 : height * 0.45 + (mouse.y - 0.5) * 25;
      const baseRadius = Math.min(width, height) * (isMobile ? 0.26 : 0.29);
      const horizonRadius = Math.max(baseRadius * 0.56, 58);

      // 1. Deep Space Background Stars (with gravitational warping)
      for (const s of stars) {
        s.y -= s.speed * dt * 0.05;
        if (s.y < -6) {
          s.y = height + 6;
          s.x = Math.random() * width;
        }

        s.phase += dt * 0.0022;
        const twinkle = 0.55 + 0.45 * Math.sin(s.phase);

        // Gravitational Lensing effect around black hole
        const dx = s.x - bhX;
        const dy = s.y - bhY;
        const dist = Math.hypot(dx, dy);
        let px = s.x + (mouse.x - 0.5) * -22 * s.depth;
        let py = s.y + (mouse.y - 0.5) * -16 * s.depth;

        if (dist > horizonRadius && dist < horizonRadius * 4.2) {
          const warp = ((horizonRadius * 4.2 - dist) / (horizonRadius * 4.2)) * 16;
          px += (dx / dist) * warp;
          py += (dy / dist) * warp;
        }

        // Singularity occlusion
        if (dist < horizonRadius * 0.96) continue;

        const alpha = (0.25 + s.depth * 0.75) * twinkle;
        ctx.beginPath();
        if (s.isWarm) {
          ctx.fillStyle = `rgba(246, 214, 184, ${alpha.toFixed(3)})`;
        } else if (s.isCyan) {
          ctx.fillStyle = `rgba(180, 210, 235, ${alpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(245, 238, 230, ${alpha.toFixed(3)})`;
        }
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fill();

        if (s.depth > 0.82 && twinkle > 0.75) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(246, 206, 168, ${(alpha * 0.2).toFixed(3)})`;
          ctx.arc(px, py, s.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Upper Gravitational Lensing Halo (Signature Gargantua Curved Upper Arc - Dashboard Amber/Copper Palette)
      ctx.save();
      const lensGradTop = ctx.createRadialGradient(
        bhX,
        bhY - horizonRadius * 0.15,
        horizonRadius * 0.82,
        bhX,
        bhY,
        horizonRadius * 2.8
      );
      lensGradTop.addColorStop(0, "rgba(255, 244, 230, 0.98)");
      lensGradTop.addColorStop(0.15, "rgba(246, 206, 168, 0.92)");
      lensGradTop.addColorStop(0.42, "rgba(224, 162, 121, 0.72)");
      lensGradTop.addColorStop(0.75, "rgba(166, 95, 52, 0.25)");
      lensGradTop.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.ellipse(
        bhX,
        bhY - horizonRadius * 0.26,
        horizonRadius * 2.35,
        horizonRadius * 1.45,
        -0.08,
        Math.PI * 0.92,
        Math.PI * 2.08
      );
      ctx.lineWidth = horizonRadius * 0.95;
      ctx.strokeStyle = lensGradTop;
      ctx.filter = "blur(10px)";
      ctx.stroke();
      ctx.filter = "none";
      ctx.restore();

      // Lower Gravitational Lensing Reflection
      ctx.save();
      const lensGradBottom = ctx.createRadialGradient(
        bhX,
        bhY + horizonRadius * 0.15,
        horizonRadius * 0.88,
        bhX,
        bhY,
        horizonRadius * 2.4
      );
      lensGradBottom.addColorStop(0, "rgba(255, 238, 218, 0.85)");
      lensGradBottom.addColorStop(0.22, "rgba(224, 162, 121, 0.65)");
      lensGradBottom.addColorStop(0.6, "rgba(155, 85, 45, 0.22)");
      lensGradBottom.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.ellipse(
        bhX,
        bhY + horizonRadius * 0.32,
        horizonRadius * 1.95,
        horizonRadius * 0.98,
        -0.08,
        0,
        Math.PI
      );
      ctx.lineWidth = horizonRadius * 0.72;
      ctx.strokeStyle = lensGradBottom;
      ctx.filter = "blur(12px)";
      ctx.stroke();
      ctx.filter = "none";
      ctx.restore();

      // 3. Primary Accretion Disk Ring (Broad tilted glowing accretion plane)
      ctx.save();
      const diskTilt = -0.21;
      const diskGlow = ctx.createRadialGradient(
        bhX,
        bhY,
        horizonRadius * 0.85,
        bhX,
        bhY,
        horizonRadius * 3.6
      );
      diskGlow.addColorStop(0, "rgba(255, 248, 240, 1.0)");
      diskGlow.addColorStop(0.12, "rgba(248, 216, 185, 0.95)");
      diskGlow.addColorStop(0.32, "rgba(224, 162, 121, 0.85)");
      diskGlow.addColorStop(0.62, "rgba(168, 98, 54, 0.45)");
      diskGlow.addColorStop(0.88, "rgba(95, 45, 20, 0.15)");
      diskGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.ellipse(
        bhX,
        bhY,
        horizonRadius * 3.3,
        horizonRadius * 0.72,
        diskTilt,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = diskGlow;
      ctx.filter = "blur(7px)";
      ctx.fill();
      ctx.filter = "none";
      ctx.restore();

      // 4. Relativistic Swirling Keplerian Dust & Gas Particles
      for (const p of accretionParticles) {
        p.angle += p.speed * (dt / 16.6);
        if (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;
        p.pulse += dt * 0.0035;

        const r = horizonRadius * (1.1 + p.distRatio * 2.2);
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);

        const diskX = bhX + (cosA * r * Math.cos(diskTilt) - sinA * r * 0.24 * Math.sin(diskTilt));
        const diskY = bhY + (cosA * r * Math.sin(diskTilt) + sinA * r * 0.24 * Math.cos(diskTilt));

        // Relativistic Doppler Beaming
        const doppler = Math.sin(p.angle + Math.PI * 0.5);
        const brightness = Math.max(0.15, 0.55 + doppler * 0.45);
        const particleAlpha = Math.min(1, p.alphaBase * brightness * (0.85 + 0.15 * Math.sin(p.pulse)));

        // Occlusion behind singularity
        const distToCenter = Math.hypot(diskX - bhX, diskY - bhY);
        if (sinA < 0 && distToCenter < horizonRadius * 0.95) continue;

        ctx.beginPath();
        if (doppler > 0.35) {
          ctx.fillStyle = `rgba(255, 248, 238, ${particleAlpha.toFixed(3)})`;
        } else if (doppler > -0.15) {
          ctx.fillStyle = `rgba(246, 208, 172, ${(particleAlpha * 0.92).toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(224, 162, 121, ${(particleAlpha * 0.8).toFixed(3)})`;
        }
        ctx.arc(diskX, diskY, p.size * (0.8 + brightness * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Central Singularity (Event Horizon Void)
      ctx.save();
      ctx.beginPath();
      ctx.arc(bhX, bhY, horizonRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#07050a";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.restore();

      // 6. Photon Ring (Razor-sharp intense inner ring)
      ctx.save();
      const photonRing = ctx.createRadialGradient(
        bhX,
        bhY,
        horizonRadius * 0.95,
        bhX,
        bhY,
        horizonRadius * 1.09
      );
      photonRing.addColorStop(0, "rgba(0, 0, 0, 0)");
      photonRing.addColorStop(0.35, "rgba(255, 255, 255, 1.0)");
      photonRing.addColorStop(0.7, "rgba(246, 214, 184, 0.92)");
      photonRing.addColorStop(1, "rgba(224, 162, 121, 0)");

      ctx.beginPath();
      ctx.arc(bhX, bhY, horizonRadius * 1.04, 0, Math.PI * 2);
      ctx.lineWidth = 4.0;
      ctx.strokeStyle = photonRing;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bhX, bhY, horizonRadius * 1.02, 0, Math.PI * 2);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.stroke();
      ctx.restore();

      // 7. Dynamic Shooting Star / Meteor Engine
      nextShootingStar -= dt;
      if (nextShootingStar <= 0) {
        const count = Math.random() < 0.35 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const startX = width * (0.1 + Math.random() * 0.95);
          const startY = height * (Math.random() * 0.7);
          const length = 110 + Math.random() * 260;
          const speed = 0.65 + Math.random() * 0.95;
          const angle = (Math.PI / 5.5) + (Math.random() - 0.5) * 0.3;
          shootingStars.push({
            x: startX,
            y: startY,
            vx: -Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length,
            slopeX: Math.cos(angle),
            slopeY: Math.sin(angle),
            duration: 600 + Math.random() * 550,
            elapsed: -i * 150,
            colorHue: Math.random() < 0.45 ? "copper" : "warmWhite",
          });
        }
        nextShootingStar = 650 + Math.random() * 1600;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.elapsed += dt;
        if (star.elapsed < 0) continue;

        const progress = star.elapsed / star.duration;
        if (progress >= 1) {
          shootingStars.splice(i, 1);
          continue;
        }

        const intensity = progress < 0.2 ? progress / 0.2 : Math.pow(1 - progress, 1.3);
        star.x += star.vx * dt;
        star.y += star.vy * dt;

        const tailX = star.x + star.slopeX * star.length;
        const tailY = star.y - star.slopeY * star.length;

        const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        if (star.colorHue === "copper") {
          grad.addColorStop(0, `rgba(255, 248, 240, ${(1.0 * intensity).toFixed(3)})`);
          grad.addColorStop(0.15, `rgba(246, 206, 168, ${(0.85 * intensity).toFixed(3)})`);
          grad.addColorStop(0.6, `rgba(224, 162, 121, ${(0.4 * intensity).toFixed(3)})`);
          grad.addColorStop(1, "rgba(224, 162, 121, 0)");
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${(1.0 * intensity).toFixed(3)})`);
          grad.addColorStop(0.18, `rgba(246, 214, 184, ${(0.85 * intensity).toFixed(3)})`);
          grad.addColorStop(0.6, `rgba(224, 162, 121, ${(0.35 * intensity).toFixed(3)})`);
          grad.addColorStop(1, "rgba(224, 162, 121, 0)");
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor Head Glow
        ctx.fillStyle = `rgba(255, 255, 255, ${(1.0 * intensity).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = star.colorHue === "copper"
          ? `rgba(246, 206, 168, ${(0.5 * intensity).toFixed(3)})`
          : `rgba(246, 214, 184, ${(0.5 * intensity).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 5.0, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. Deep Space Solid Void Base matching Dashboard */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_82%_42%,#17100c_0%,#0b0709_42%,#07050a_100%)]" />

      {/* 2. Dashboard Nebula Texture */}
      <div className="absolute inset-0 bg-[url('/assets/dashboard-nebula.png')] bg-cover bg-[68%_34%] opacity-55 mix-blend-screen" />

      {/* 3. Black Hole + Shooting Star Canvas (Active 60fps) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full block"
      />

      {/* 4. Atmospheric Accretion Glow Wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(224,162,121,0.18)_0%,rgba(178,104,58,0.08)_35%,transparent_70%)]" />

      {/* 5. Ambient Glowing Orbs matching Dashboard */}
      <div className="absolute rounded-full -right-[14vw] top-[8vh] w-[58vw] h-[58vw] bg-[radial-gradient(circle_at_50%_50%,rgba(232,168,116,.18)_0%,rgba(178,104,58,.08)_34%,transparent_70%)] blur-[24px]" />
      <div className="absolute rounded-full -left-[22vw] -bottom-[18vh] w-[56vw] h-[56vw] bg-[radial-gradient(circle_at_50%_50%,rgba(140,150,190,.08)_0%,rgba(60,70,110,.04)_45%,transparent_70%)] blur-[28px]" />

      {/* 6. Cinematic Vignette Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_45%,transparent_45%,rgba(4,3,6,.55)_78%,rgba(3,2,5,.9)_100%)]" />

      {/* 7. Subtle CRT Scanline overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,rgba(0,0,0,0.18)_3px,rgba(0,0,0,0.18)_4px)] opacity-35" />
    </div>
  );
}

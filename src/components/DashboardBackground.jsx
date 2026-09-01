import { useEffect, useRef } from "react";

export default function DashboardBackground() {
  const skyRef = useRef(null);

  useEffect(() => {
    const c = skyRef.current;
    if (!c) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w = 0, h = 0, stars = [], streaks = [], nextStreak = 900, rafId = 0;
    const mouse = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };

    const build = () => {
      w = c.clientWidth || window.innerWidth;
      h = c.clientHeight || window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      const count = Math.min(140, Math.floor(w * 0.1));
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.1,
          ph: Math.random() * Math.PI * 2,
          sp: 0.08 + z * 0.04 + Math.random() * 0.03,
          warm: Math.random() < 0.34,
        });
      }
    };

    const onResize = () => build();
    window.addEventListener("resize", onResize, { passive: true });
    build();

    const onMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    if (!reduceMotion) window.addEventListener("mousemove", onMouseMove, { passive: true });

    let last = performance.now();
    const frame = (now) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(frame);
        return;
      }

      const dt = Math.min(now - last, 48);
      last = now;
      mouse.cx += (mouse.x - mouse.cx) * 0.045;
      mouse.cy += (mouse.y - mouse.cy) * 0.045;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.x -= s.sp * dt * 0.05;
        if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
        s.ph += dt * 0.0016;
        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        const px = s.x + (mouse.cx - 0.5) * -20 * s.z;
        const py = s.y + (mouse.cy - 0.5) * -14 * s.z;
        const a = (0.18 + s.z * 0.62) * tw;
        ctx.beginPath();
        ctx.fillStyle = s.warm ? `rgba(246,214,184,${a.toFixed(3)})` : `rgba(228,232,244,${a.toFixed(3)})`;
        ctx.arc(px, py, s.r, 0, 6.2832);
        ctx.fill();
        if (s.z > 0.9) {
          ctx.fillStyle = `rgba(246,206,168,${(a * 0.1).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, s.r * 4, 0, 6.2832);
          ctx.fill();
        }
      }

      nextStreak -= dt;
      if (nextStreak <= 0) {
        streaks.push({
          x: w * (0.2 + Math.random() * 0.95),
          y: h * (Math.random() * 0.8 - 0.08),
          len: 70 + Math.random() * 180,
          sp: 0.32 + Math.random() * 0.45,
          slope: 0.28 + Math.random() * 0.22,
          life: 0,
          dur: 700 + Math.random() * 500,
        });
        nextStreak = 1200 + Math.random() * 2600;
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life += dt;
        const p = s.life / s.dur;
        if (p >= 1) { streaks.splice(i, 1); continue; }
        const ease = p < 0.4 ? p / 0.4 : (1 - p) / 0.6;
        s.x -= dt * s.sp;
        s.y += dt * s.sp * s.slope;
        const g = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len * s.slope);
        g.addColorStop(0, `rgba(255,238,218,${(0.8 * ease).toFixed(3)})`);
        g.addColorStop(0.45, `rgba(255,206,158,${(0.3 * ease).toFixed(3)})`);
        g.addColorStop(1, "rgba(255,190,140,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y - s.len * s.slope);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,246,232,${(0.85 * ease).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.4, 0, 6.2832);
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[url('/assets/dashboard-nebula.png')] bg-cover bg-[68%_34%] bg-no-repeat" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,10,.82)_0%,rgba(7,5,10,.45)_14%,transparent_30%),linear-gradient(115deg,rgba(7,5,10,.78)_0%,rgba(9,6,8,.5)_42%,rgba(12,8,7,.34)_70%,rgba(7,5,9,.72)_100%)]" />
      <canvas ref={skyRef} className="absolute inset-0 w-full h-full block" />
      {/* Hardware-accelerated ambient warm glow (static smooth gradient - no continuous GPU blur repaints) */}
      <div className="absolute rounded-full -right-[14vw] top-[8vh] w-[58vw] h-[58vw] bg-[radial-gradient(circle_at_50%_50%,rgba(232,168,116,.14)_0%,rgba(178,104,58,.06)_34%,transparent_70%)]" />
      <div className="absolute rounded-full -left-[22vw] -bottom-[18vh] w-[56vw] h-[56vw] bg-[radial-gradient(circle_at_50%_50%,rgba(140,150,190,.07)_0%,rgba(60,70,110,.03)_45%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_45%,transparent_45%,rgba(4,3,6,.55)_78%,rgba(3,2,5,.9)_100%)]" />
    </div>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import { useEffect, useRef } from "react";

const PILLARS = [
  {
    tag: "TX.01",
    title: "THE SIGNAL",
    body: "Cicada 2067 is a cryptic hunt. Puzzles arrive as fragments — ciphers, images, coordinates, dead ends that are not dead. You do not brute-force the void. You listen.",
    icon: "⌁",
  },
  {
    tag: "TX.02",
    title: "THE CREW",
    body: "You fly in teams of up to five. No solo crossing. Logic, observation, and stubborn curiosity are the only instruments that still work this close to the horizon.",
    icon: "◉",
  },
  {
    tag: "TX.03",
    title: "THE CROSSING",
    body: "Rounds unlock in sequence. Each solved transmission tows the next into range. Time is a tide. Hints exist, and they can cost you.",
    icon: "◇",
  },
];

const MANIFEST = [
  ["FORMAT", "Team cryptic hunt"],
  ["CREW SIZE", "Up to 5"],
  ["ORGANISER", "IEEE Computer Society, VIT"],
  ["BRING", "Laptop, ID, pen, patience"],
  ["OD", "Issued if you report on time"],
];

const BURNS = [
  ["01", "ASSEMBLE", "Form a crew. Share one invite code. No one crosses alone.", "INITIATE_SEQUENCE"],
  ["02", "DECIPHER", "Each round is a locked transmission. Solve it to tow the next into range.", "ORBITAL_MECHANICS"],
  ["03", "ESCAPE", "The last puzzle is the event horizon. There is no spectator deck.", "SINGULARITY_REACHED"],
];

export default function About() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === "admin" || user.role === "GOD");
  const cta = !user
    ? { to: "/login", label: "BOARD THE VESSEL →" }
    : isAdmin
      ? { to: "/admin", label: "ADMIN PANEL →" }
      : { to: "/terminal", label: "ENTER ARENA →" };

  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const magneticRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineFillRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const heroContent = heroContentRef.current;
    if (!page || !canvas || !hero || !heroContent) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let scrollY = window.scrollY;
    let running = true;

    const stars = Array.from({ length: reduced ? 90 : 220 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      size: Math.random() * 1.5 + 0.25,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.00012 + 0.00003,
      warm: i % 13 === 0,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouseMove = (event) => {
      targetMouseX = event.clientX / Math.max(width, 1);
      targetMouseY = event.clientY / Math.max(height, 1);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      updateScroll();
    };

    const updateScroll = () => {
      const heroHeight = Math.max(hero.offsetHeight, 1);
      const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);

      heroContent.style.transform =
        `translate3d(${(mouseX - 0.5) * -18}px, ${-progress * 90 + (mouseY - 0.5) * -8}px, 0) scale(${1 + progress * 0.18})`;
      heroContent.style.opacity = String(Math.max(0, 1 - progress * 1.15));

      page.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (timelineRef.current && timelineFillRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const center = window.innerHeight * 0.52;
        const total = Math.max(rect.height, 1);
        const fill = Math.min(Math.max((center - rect.top) / total, 0), 1);
        timelineFillRef.current.style.height = `${fill * 100}%`;

        timelineRef.current.querySelectorAll("[data-burn]").forEach((node) => {
          const threshold = Number(node.dataset.burn);
          const active = fill * 100 >= threshold;
          node.classList.toggle("is-active", active);
        });
      }
    };

    const draw = (time) => {
      if (!running) return;

      if (!reduced) {
        mouseX += (targetMouseX - mouseX) * 0.045;
        mouseY += (targetMouseY - mouseY) * 0.045;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);

      const cx = width * (0.72 + (mouseX - 0.5) * 0.035);
      const cy = height * (0.42 + (mouseY - 0.5) * 0.025);
      const maxR = Math.min(width, height) * 0.42;

      // Very subtle atmospheric glow.
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      glow.addColorStop(0, "rgba(255,140,66,0.12)");
      glow.addColorStop(0.38, "rgba(255,140,66,0.035)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Multi-depth star field.
      for (const star of stars) {
        const depth = 0.25 + star.z * 1.35;
        const px = star.x * width + (mouseX - 0.5) * depth * 35;
        const py = star.y * height + (mouseY - 0.5) * depth * 25;
        const twinkle = reduced
          ? 0.65
          : 0.45 + Math.sin(time * star.speed + star.twinkle) * 0.25;
        const alpha = Math.max(0.08, twinkle * (0.25 + star.z * 0.75));

        ctx.beginPath();
        ctx.arc(px, py, star.size * (0.45 + star.z), 0, Math.PI * 2);
        ctx.fillStyle = star.warm
          ? `rgba(255,140,66,${alpha})`
          : `rgba(245,245,240,${alpha})`;
        ctx.fill();
      }

      // Gravitational rings.
      const ringPulse = reduced ? 0 : Math.sin(time * 0.00045) * 5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((reduced ? 0 : time * 0.000035) + (mouseX - 0.5) * 0.08);

      [0.62, 0.78, 0.96].forEach((scale, index) => {
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          maxR * scale + ringPulse * (index + 1),
          maxR * scale * (0.28 + index * 0.06),
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = index === 0
          ? "rgba(255,140,66,0.28)"
          : `rgba(255,${170 - index * 20},120,${0.12 - index * 0.025})`;
        ctx.lineWidth = index === 0 ? 1.5 : 1;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.27, 0, Math.PI * 2);
      ctx.fillStyle = "#010101";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.31, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,140,66,0.24)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    updateScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    rafRef.current = requestAnimationFrame(draw);

    const revealNodes = page.querySelectorAll(".about-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealNodes.forEach((node) => observer.observe(node));

    const button = magneticRef.current;
    const onButtonMove = (event) => {
      if (reduced || !button) return;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    };
    const onButtonLeave = () => {
      if (button) button.style.transform = "translate(0,0)";
    };

    button?.addEventListener("mousemove", onButtonMove);
    button?.addEventListener("mouseleave", onButtonLeave);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      button?.removeEventListener("mousemove", onButtonMove);
      button?.removeEventListener("mouseleave", onButtonLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes cicada-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes cicada-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: .35; }
        }
        @keyframes cicada-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cicada-orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes cicada-scan {
          from { transform: translateY(-110%); }
          to { transform: translateY(1100%); }
        }
        @keyframes cicada-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,66,.45); }
          50% { box-shadow: 0 0 0 9px rgba(255,140,66,0); }
        }
        @keyframes cicada-signal {
          0% { transform: scaleX(.15); opacity: 0; }
          20% { opacity: .8; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes cicada-blink {
          50% { opacity: 0; }
        }

        .cicada-about {
          --orange: #ff8c42;
          --orange-bright: #ffaa66;
          --white: #f5f5f0;
          --muted: #b9aaa2;
          background: #030303;
          color: var(--white);
          overflow: clip;
        }

        .cicada-grid {
          background-image:
            linear-gradient(rgba(255,140,66,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,140,66,.055) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }

        .cicada-scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 3px,
            rgba(255,255,255,.018) 4px
          );
          pointer-events: none;
        }

        .cicada-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity .9s cubic-bezier(.22,1,.36,1),
                      transform .9s cubic-bezier(.22,1,.36,1);
        }
        .cicada-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .cicada-marquee {
          animation: cicada-marquee 25s linear infinite;
        }

        .cicada-flicker {
          animation: cicada-flicker 6s linear infinite;
        }

        .cicada-orbit {
          animation: cicada-orbit 42s linear infinite;
        }

        .cicada-orbit-reverse {
          animation: cicada-orbit-reverse 58s linear infinite;
        }

        .cicada-scan {
          animation: cicada-scan 2.4s linear infinite;
        }

        .cicada-pulse {
          animation: cicada-pulse 2.2s ease-out infinite;
        }

        .cicada-signal-line {
          animation: cicada-signal 2.6s ease-out infinite;
          transform-origin: left center;
        }

        .cicada-terminal {
          position: relative;
          border: 1px solid rgba(255,140,66,.24);
          background: rgba(4,4,4,.72);
          transition: transform .5s cubic-bezier(.22,1,.36,1),
                      border-color .35s ease,
                      background .35s ease;
        }

        .cicada-terminal::before,
        .cicada-terminal::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          pointer-events: none;
        }

        .cicada-terminal::before {
          left: -1px;
          top: -1px;
          border-left: 2px solid var(--orange);
          border-top: 2px solid var(--orange);
        }

        .cicada-terminal::after {
          right: -1px;
          bottom: -1px;
          border-right: 2px solid var(--orange);
          border-bottom: 2px solid var(--orange);
        }

        .cicada-terminal:hover {
          transform: translateY(-8px);
          border-color: rgba(255,140,66,.65);
          background: rgba(10,8,7,.82);
        }

        .cicada-scanbar {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          opacity: .55;
          animation: cicada-scan 2.8s linear infinite;
          pointer-events: none;
        }

        .cicada-crew-orbit {
          position: relative;
          width: 130px;
          height: 130px;
          margin: 12px auto 22px;
        }

        .cicada-crew-ring {
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(255,140,66,.28);
          border-radius: 50%;
        }

        .cicada-crew-ring::before {
          content: "";
          position: absolute;
          inset: 17px;
          border: 1px dashed rgba(255,255,255,.13);
          border-radius: 50%;
        }

        .cicada-crew-center {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 12px;
          transform: translate(-50%, -50%);
          background: var(--orange);
          box-shadow: 0 0 22px rgba(255,140,66,.65);
        }

        .cicada-crew-point {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 7px;
          margin: -3.5px;
          border-radius: 50%;
          background: var(--orange-bright);
          box-shadow: 0 0 12px rgba(255,140,66,.75);
        }

        .cicada-point-1 { transform: rotate(0deg) translateY(-48px); }
        .cicada-point-2 { transform: rotate(72deg) translateY(-48px); }
        .cicada-point-3 { transform: rotate(144deg) translateY(-48px); }
        .cicada-point-4 { transform: rotate(216deg) translateY(-48px); }
        .cicada-point-5 { transform: rotate(288deg) translateY(-48px); }

        .cicada-crossing-path {
          position: relative;
          height: 132px;
          overflow: hidden;
          margin: 5px 0 20px;
        }

        .cicada-crossing-path::before {
          content: "";
          position: absolute;
          left: 4%;
          right: 4%;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          box-shadow: 0 0 18px rgba(255,140,66,.45);
        }

        .cicada-crossing-path::after {
          content: "";
          position: absolute;
          right: 5%;
          top: 50%;
          width: 68px;
          height: 68px;
          transform: translateY(-50%);
          border-radius: 50%;
          border: 1px solid rgba(255,140,66,.6);
          box-shadow:
            inset 0 0 24px rgba(255,140,66,.12),
            0 0 28px rgba(255,140,66,.15);
          background: #000;
        }

        .cicada-progress-node {
          transition: background .45s ease, border-color .45s ease, box-shadow .45s ease;
        }

        .cicada-progress-node.is-active {
          background: var(--orange);
          border-color: var(--orange);
          box-shadow: 0 0 18px rgba(255,140,66,.7);
        }

        .cicada-burn {
          opacity: .55;
          transform: translateY(8px);
          transition: opacity .65s ease, transform .65s ease;
        }

        .cicada-burn.is-active {
          opacity: 1;
          transform: translateY(0);
        }

        .cicada-manifest-row {
          position: relative;
          overflow: hidden;
        }

        .cicada-manifest-row::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,140,66,.35), transparent);
          transform: scaleX(.15);
          transform-origin: left;
          transition: transform .6s ease;
        }

        .cicada-manifest-row:hover::after {
          transform: scaleX(1);
        }

        .cicada-cursor {
          animation: cicada-blink 1s step-end infinite;
        }

        .cicada-portal {
          position: relative;
          width: min(52vw, 520px);
          aspect-ratio: 1;
        }

        .cicada-portal::before,
        .cicada-portal::after {
          content: "";
          position: absolute;
          inset: 8%;
          border-radius: 50%;
          border: 1px solid rgba(255,140,66,.28);
        }

        .cicada-portal::before {
          animation: cicada-orbit 28s linear infinite;
          border-top-color: var(--orange);
          box-shadow: 0 0 45px rgba(255,140,66,.08);
        }

        .cicada-portal::after {
          inset: 20%;
          animation: cicada-orbit-reverse 19s linear infinite;
          border-bottom-color: rgba(255,255,255,.5);
        }

        .cicada-portal-core {
          position: absolute;
          inset: 31%;
          border-radius: 50%;
          background: #000;
          box-shadow:
            0 0 45px rgba(255,140,66,.16),
            inset 0 0 35px rgba(255,140,66,.1);
          border: 1px solid rgba(255,140,66,.4);
        }

        .cicada-noise {
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* Readability: thicker borders/lines and slightly larger key text.
           No layout, spacing, animation, or color changes. */
        .cicada-terminal {
          border-width: 2px;
        }

        .cicada-terminal::before,
        .cicada-terminal::after {
          border-width: 3px;
        }

        .cicada-crew-ring {
          border-width: 2px;
        }

        .cicada-crew-ring::before {
          border-width: 2px;
        }

        .cicada-crossing-path::before {
          height: 2px;
        }

        .cicada-crossing-path::after {
          border-width: 2px;
        }

        .cicada-portal::before,
        .cicada-portal::after,
        .cicada-portal-core {
          border-width: 2px;
        }

        /* Key text only — keeping the existing hierarchy intact. */
        .cicada-terminal .font-mono.text-\[9px\] {
          font-size: 11px;
        }

        .cicada-terminal .font-mono.text-\[8px\] {
          font-size: 10px;
        }

        .cicada-terminal p.text-\[14px\] {
          font-size: 16px;
        }

        .cicada-terminal .font-mono.text-sm {
          font-size: 16px;
        }

        .cicada-terminal .font-mono.text-\[10px\] {
          font-size: 11px;
        }

        .cicada-terminal .font-mono.text-\[9px\].leading-6 {
          font-size: 11px;
        }

        .cicada-terminal .font-mono.text-\[9px\].tracking-\[\.2em\] {
          font-size: 11px;
        }

        .cicada-terminal .font-mono.text-\[9px\].tracking-\[\.3em\] {
          font-size: 11px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cicada-marquee,
          .cicada-flicker,
          .cicada-orbit,
          .cicada-orbit-reverse,
          .cicada-scan,
          .cicada-pulse,
          .cicada-signal-line,
          .cicada-cursor,
          .cicada-portal::before,
          .cicada-portal::after {
            animation: none !important;
          }
          .cicada-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .cicada-terminal:hover {
            transform: none;
          }
        }
      `}</style>

      <div ref={pageRef} className="cicada-about">
        <Navbar />

        <div className="fixed inset-0 -z-20 bg-[#030303]" aria-hidden="true">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="cicada-grid absolute inset-0" />
          <div className="cicada-scanlines absolute inset-0" />
          <div className="cicada-noise absolute inset-0" />
        </div>

        {/* Persistent mission progress */}
        <aside className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block">
          <div className="flex flex-col items-end gap-4">
            <span className="mb-1 font-mono text-[9px] tracking-[.28em] text-[#ff8c42]">
              MISSION_PROGRESS
            </span>
            <div className="relative flex flex-col items-end gap-7">
              <div className="absolute right-[3px] top-1 bottom-1 w-px bg-white/10" />
              <div
                className="absolute right-[3px] top-1 w-px bg-[#ff8c42] shadow-[0_0_10px_#ff8c42]"
                style={{ height: "0%" }}
              />
              {[
                ["#hero", "ORBIT"],
                ["#pillars", "SIGNAL"],
                ["#flightplan", "CROSSING"],
                ["#manifest", "CORE"],
              ].map(([href, label], index) => (
                <a
                  key={href}
                  href={href}
                  className="group relative z-10 flex items-center gap-3 font-mono text-[9px] tracking-[.2em] text-white/35 transition-colors hover:text-[#ff8c42]"
                >
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">
                    {label}
                  </span>
                  <span className="cicada-progress-node h-2 w-2 border border-white/30 bg-[#030303]" />
                </a>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative">
          {/* HERO */}
          <section
            id="hero"
            ref={heroRef}
            className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pt-24 md:px-12"
          >
            <div className="absolute left-6 top-28 z-10 hidden font-mono text-[9px] leading-5 tracking-[.22em] text-[#ff8c42]/65 md:block">
              <div>SIGNAL_ID : CX-2067</div>
              <div className="cicada-flicker">LAT_45.9_LONG_-12.4</div>
            </div>

            <div className="absolute right-8 top-28 z-10 hidden text-right font-mono text-[9px] leading-5 tracking-[.22em] text-[#ff8c42]/65 md:block">
              <div>ORIGIN : UNKNOWN</div>
              <div>FREQ : 1420.405 MHz</div>
              <div className="mt-1 text-red-400/60">STATUS : UNRESOLVED</div>
            </div>

            <div
              ref={heroContentRef}
              className="relative z-20 mx-auto w-full max-w-6xl will-change-transform"
            >
              <div className="max-w-5xl">
                <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[9px] tracking-[.3em] text-[#ff8c42] md:text-[10px]">
                  <span className="h-px w-10 bg-[#ff8c42]" />
                  EVENT DOSSIER · IEEE CS VIT
                  <span className="text-white/20">//</span>
                  TRANSMISSION ACTIVE
                </div>

                <h1 className="font-orbitron text-[clamp(4.5rem,15vw,12rem)] font-black leading-[.78] tracking-[.02em]">
                  <span className="block text-[#f5f5f0]">CICADA</span>
                  <span className="block text-[#ff8c42] drop-shadow-[0_0_24px_rgba(255,140,66,.28)]">
                    2067
                  </span>
                </h1>

                <div className="mt-9 flex flex-col gap-8 md:flex-row md:items-end">
                  <div className="max-w-xl">
                    <p className="font-mono text-sm tracking-[.28em] text-[#ff8c42]">
                      PAST THE EVENT HORIZON
                    </p>
                    <p className="mt-5 border-l border-[#ff8c42] pl-5 text-base leading-8 text-[#b9aaa2] md:text-lg">
                      An interstellar cryptic hunt. Transmissions arrive as puzzles.
                      Your crew is the only instrument that still works this close to
                      the disk. Decode them — or remain in orbit forever.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <Link
                      to={cta.to}
                      ref={magneticRef}
                      className="group relative inline-flex overflow-hidden border border-[#ff8c42] px-7 py-4 font-orbitron text-[10px] tracking-[.3em] text-[#ff8c42] transition-all duration-300 hover:text-black"
                    >
                      <span className="absolute inset-0 translate-y-full bg-[#ff8c42] transition-transform duration-300 group-hover:translate-y-0" />
                      <span className="relative">{cta.label}</span>
                    </Link>

                    <a
                      href="#pillars"
                      className="font-mono text-[10px] tracking-[.25em] text-white/45 transition hover:text-[#ff8c42]"
                    >
                      DESCEND ↓
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[8px] tracking-[.35em] text-white/30">
              <span>EVENT HORIZON</span>
              <span className="h-12 w-px bg-gradient-to-b from-[#ff8c42] to-transparent" />
            </div>
          </section>

          {/* TICKER */}
          <div className="relative overflow-hidden border-y border-[#ff8c42]/20 bg-[#ff8c42]/[.025] py-3">
            <div className="cicada-marquee flex w-max whitespace-nowrap font-mono text-[9px] tracking-[.3em] text-[#ff8c42]/70">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="px-5">
                  TRANSMISSION INCOMING · DO NOT DECODE ALONE · THE SIGNAL REPEATS ·
                  CREW OF FIVE MAX · HINTS COST YOU ·
                </span>
              ))}
            </div>
          </div>

          {/* PILLARS */}
          <section id="pillars" className="relative px-5 py-28 md:px-12 md:py-40">
            <div className="mx-auto max-w-6xl">
              <div className="cicada-reveal about-reveal mb-20 max-w-2xl">
                <p className="font-mono text-[9px] tracking-[.35em] text-[#ff8c42]">
                  TRANSMISSION_FRAGMENTS
                </p>
                <h2 className="mt-4 font-orbitron text-3xl tracking-[.08em] md:text-5xl">
                  THREE SIGNALS.
                  <br />
                  ONE CROSSING.
                </h2>
                <p className="mt-5 font-mono text-[10px] tracking-[.2em] text-white/35">
                  DECRYPTING INCOMING PACKETS...
                </p>
              </div>

              <div className="grid gap-7 md:grid-cols-3">
                {PILLARS.map((pillar, index) => (
                  <article
                    key={pillar.title}
                    className={`cicada-terminal cicada-reveal about-reveal overflow-hidden p-7 md:p-9 ${
                      index === 1 ? "md:translate-y-16" : index === 2 ? "md:translate-y-32" : ""
                    }`}
                    style={{ transitionDelay: `${index * 130}ms` }}
                  >
                    <div className="cicada-scan" />
                    <div className="mb-7 flex items-center justify-between border-b border-[#ff8c42]/15 pb-3 font-mono text-[9px] tracking-[.22em] text-[#ff8c42]/80">
                      <span>{pillar.tag} // PACKET_0{index + 1}</span>
                      <span className="text-base">{pillar.icon}</span>
                    </div>

                    {index === 0 && (
                      <div className="relative mb-6 h-16 overflow-hidden border-y border-[#ff8c42]/10">
                        {[0, 1, 2].map((wave) => (
                          <span
                            key={wave}
                            className="cicada-signal-line absolute left-0 top-1/2 h-px w-full bg-[#ff8c42]"
                            style={{ animationDelay: `${wave * 650}ms`, opacity: 0.2 + wave * 0.15 }}
                          />
                        ))}
                        <span className="absolute left-[20%] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#ff8c42] shadow-[0_0_12px_#ff8c42]" />
                        <span className="absolute left-[65%] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_white]" />
                      </div>
                    )}

                    {index === 1 && (
                      <div className="cicada-crew-orbit">
                        <div className="cicada-crew-ring cicada-orbit">
                          {["cicada-point-1","cicada-point-2","cicada-point-3","cicada-point-4","cicada-point-5"].map((cls) => (
                            <span key={cls} className={`cicada-crew-point ${cls}`} />
                          ))}
                        </div>
                        <div className="cicada-crew-ring cicada-orbit-reverse" />
                        <div className="cicada-crew-center cicada-pulse" />
                      </div>
                    )}

                    {index === 2 && (
                      <div className="cicada-crossing-path">
                        <span className="absolute left-[10%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_white]" />
                        <span className="absolute left-[38%] top-[35%] h-1 w-1 rounded-full bg-[#ff8c42] shadow-[0_0_10px_#ff8c42]" />
                        <span className="absolute left-[60%] top-[63%] h-1 w-1 rounded-full bg-[#ff8c42] shadow-[0_0_10px_#ff8c42]" />
                      </div>
                    )}

                    <h3 className="font-orbitron text-lg tracking-[.18em] text-[#f5f5f0] transition-colors group-hover:text-[#ff8c42]">
                      {pillar.title}
                    </h3>
                    <p className="mt-5 text-[14px] leading-7 text-[#b9aaa2]">
                      {pillar.body}
                    </p>
                    <div className="mt-7 font-mono text-[8px] tracking-[.25em] text-[#ff8c42]/45">
                      SIGNAL LOCKED · AWAITING CREW
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FLIGHT PLAN */}
          <section id="flightplan" className="relative px-5 py-28 md:px-12 md:py-40">
            <div className="mx-auto max-w-5xl">
              <div className="cicada-reveal about-reveal mb-24">
                <p className="font-mono text-[9px] tracking-[.35em] text-[#ff8c42]">
                  FLIGHT PLAN
                </p>
                <h2 className="mt-4 font-orbitron text-4xl tracking-[.08em] md:text-6xl">
                  THREE BURNS
                  <br />
                  TO THE CORE.
                </h2>
              </div>

              <div ref={timelineRef} className="relative">
                <div className="absolute bottom-0 left-3 top-0 w-px bg-white/10 md:left-1/2" />
                <div
                  ref={timelineFillRef}
                  className="absolute left-3 top-0 w-px bg-[#ff8c42] shadow-[0_0_12px_#ff8c42] md:left-1/2"
                  style={{ height: "0%" }}
                />

                <div className="space-y-20 md:space-y-32">
                  {BURNS.map(([number, title, body, status], index) => (
                    <div
                      key={title}
                      data-burn={index === 0 ? 15 : index === 1 ? 50 : 85}
                      className="cicada-burn relative grid grid-cols-[30px_1fr] gap-7 md:grid-cols-2 md:gap-20"
                    >
                      <div className="absolute left-[3px] top-1 z-10 h-3 w-3 border border-white/25 bg-[#030303] transition-all duration-500 md:left-[calc(50%-6px)]" />
                      <div className={index % 2 === 0 ? "md:pr-16" : "md:order-2 md:pl-16"}>
                        <div className="font-mono text-[9px] tracking-[.25em] text-[#ff8c42]">
                          {number} // {status}
                        </div>
                        <h3 className="mt-3 font-orbitron text-2xl tracking-[.14em] md:text-3xl">
                          {title}
                        </h3>
                        <p className="mt-5 border-l border-white/10 bg-black/40 p-5 text-sm leading-7 text-[#b9aaa2]">
                          {body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MANIFEST */}
          <section id="manifest" className="relative px-5 py-28 md:px-12 md:py-40">
            <div className="mx-auto max-w-5xl">
              <div className="cicada-terminal cicada-reveal about-reveal overflow-hidden p-6 md:p-10">
                <div className="cicada-scanbar" />

                <div className="flex items-center justify-between border-b border-[#ff8c42]/20 pb-5 font-mono text-[9px] tracking-[.3em] text-[#ff8c42]">
                  <span>DIAGNOSTIC: SHIP_MANIFEST.log</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff8c42]" />
                    ONLINE
                  </span>
                </div>

                <div className="mt-6 divide-y divide-white/[.06]">
                  {MANIFEST.map(([label, value]) => (
                    <div
                      key={label}
                      className="cicada-manifest-row flex flex-col gap-2 py-5 md:flex-row md:items-center md:gap-10"
                    >
                      <span className="w-32 shrink-0 font-mono text-[9px] tracking-[.2em] text-[#ff8c42]/65">
                        &gt; {label}_
                      </span>
                      <span className="font-mono text-sm text-[#f5f5f0]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border border-red-400/20 bg-red-400/[.025] p-5">
                  <p className="font-mono text-[9px] leading-6 tracking-[.18em] text-red-300/70">
                    WARNING: Prior puzzle experience is optional. Curiosity is not.
                    If you can hold a question longer than an easy answer, you already
                    have clearance.
                  </p>
                </div>

                <p className="mt-6 font-mono text-[9px] tracking-[.2em] text-[#ff8c42]/60">
                  &gt; awaiting crew registration<span className="cicada-cursor">_</span>
                </p>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section
            id="cta"
            className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 py-28"
          >
            <div className="cicada-portal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70">
              <div className="cicada-portal-core" />
            </div>

            <div className="cicada-reveal about-reveal relative z-10 max-w-2xl text-center">
              <p className="font-mono text-[9px] tracking-[.35em] text-[#ff8c42]">
                FINAL TRANSMISSION
              </p>
              <h2 className="mt-6 font-orbitron text-3xl tracking-[.08em] md:text-5xl">
                THE JOURNEY
                <br />
                DOESN&apos;T END HERE.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#b9aaa2]">
                The signal is waiting. Gather your crew and cross the horizon.
              </p>
              <Link
                to={cta.to}
                className="group mt-10 inline-flex items-center gap-4 border border-[#ff8c42] px-9 py-5 font-orbitron text-[10px] tracking-[.3em] text-[#ff8c42] transition-all duration-300 hover:bg-[#ff8c42] hover:text-black"
              >
                {cta.label}
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

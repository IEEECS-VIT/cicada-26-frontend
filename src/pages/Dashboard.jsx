import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../landing/Navbar";
import DashboardBackground from "../components/DashboardBackground";

const ACCENT = "#e0a279";
const SCRAMBLE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*/";
const ROLL_MS = 38;
const TAP_HOLD_MS = 380;
const TAP_SLOP_PX = 10;

const isFixedChar = (ch) => ch === " " || ch === "-" || ch === "@" || ch === ".";

function roll(text, p) {
  const cut = p * text.length;
  let str = "";
  for (let i = 0; i < text.length; i++) {
    str += p >= 1 || i < cut || isFixedChar(text[i])
      ? text[i]
      : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
  }
  return str;
}

function holdScramble(el, text, lockWidth) {
  cancelAnimationFrame(el._raf);
  let lastRoll = 0;
  const step = (now) => {
    if (now - lastRoll >= ROLL_MS) {
      lastRoll = now;
      el.textContent = roll(text, 0);
      if (lockWidth) {
        el.style.minWidth = Math.max(parseFloat(el.style.minWidth) || 0, el.offsetWidth) + "px";
      }
    }
    el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

function resolveScramble(el, text, dur, delay) {
  cancelAnimationFrame(el._raf);
  const start = performance.now();
  let lastRoll = 0;
  const step = (now) => {
    const p = Math.max(0, Math.min(1, (now - start - delay) / dur));
    if (p >= 1 || now - lastRoll >= ROLL_MS) {
      lastRoll = now;
      el.textContent = roll(text, p);
    }
    if (p < 1) el._raf = requestAnimationFrame(step);
    else {
      el._raf = 0;
      el.style.minWidth = "";
    }
  };
  el._raf = requestAnimationFrame(step);
}

export default function Dashboard() {
  const { user, teamName, loading, logout } = useAuth();
  const navigate = useNavigate();

  const appRef = useRef(null);
  const videoRef = useRef(null);
  const statusLineRef = useRef(null);
  const clockRef = useRef(null);
  const nameRef = useRef(null);
  const teamRef = useRef(null);
  const team2Ref = useRef(null);
  const regRef = useRef(null);
  const mailRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  const hasTeam = Boolean(teamName);
  const displayName = (user?.display_name || user?.email?.split("@")[0] || "Participant").toUpperCase();
  const team = (teamName || "NO CREW ASSIGNED").toUpperCase();
  const regNo = (user?.register_no || "UNASSIGNED").toUpperCase();
  const email = user?.email || "—";
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Participant";
  
  const readyLine = hasTeam
    ? "ALL SYSTEMS NOMINAL · YOU ARE CLEAR TO PROCEED"
    : "CREW UNASSIGNED · SET UP YOUR CREW TO PROCEED";

  const fields = useMemo(
    () => [
      { ref: nameRef, value: displayName, target: "self" },
      { ref: teamRef, value: team, target: "parent" },
      { ref: team2Ref, value: team, target: "self" },
      { ref: regRef, value: regNo, target: "parent" },
      { ref: mailRef, value: email, target: "parent" },
      { ref: roleRef, value: role, target: "parent" },
    ],
    [displayName, team, regNo, email, role]
  );

  useEffect(() => {
    if (loading || !user || !appRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    appRef.current.style.setProperty("--acc", ACCENT);
    const cleanupFns = [];

    function tickClock() {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      if (clockRef.current) clockRef.current.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }
    tickClock();
    const clockTimer = setInterval(tickClock, 1000);
    cleanupFns.push(() => clearInterval(clockTimer));

    fields.forEach((f) => {
      const el = f.ref.current;
      if (!el) return;
      const target = (f.target === "parent" ? el.parentElement : el) || el;

      const onEnter = (e) => { if (e.pointerType !== "touch") holdScramble(el, f.value, true); };
      const onLeave = (e) => { if (e.pointerType !== "touch") resolveScramble(el, f.value, 520, 0); };
      target.addEventListener("pointerenter", onEnter);
      target.addEventListener("pointerleave", onLeave);

      let sx = 0, sy = 0;
      const onDown = (e) => { if (e.pointerType === "touch") { sx = e.clientX; sy = e.clientY; } };
      const onUp = (e) => {
        if (e.pointerType !== "touch") return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > TAP_SLOP_PX) return;
        clearTimeout(el._tap);
        holdScramble(el, f.value, false);
        el._tap = setTimeout(() => resolveScramble(el, f.value, 520, 0), TAP_HOLD_MS);
      };
      target.addEventListener("pointerdown", onDown, { passive: true });
      target.addEventListener("pointerup", onUp, { passive: true });

      cleanupFns.push(() => {
        target.removeEventListener("pointerenter", onEnter);
        target.removeEventListener("pointerleave", onLeave);
        target.removeEventListener("pointerdown", onDown);
        target.removeEventListener("pointerup", onUp);
        cancelAnimationFrame(el._raf);
        clearTimeout(el._tap);
      });
    });

    if (statusLineRef.current) statusLineRef.current.textContent = "DECRYPTING CREW RECORD…";
    fields.forEach((f, i) => {
      if (f.ref.current) resolveScramble(f.ref.current, f.value, 1200, i * 170);
    });
    const introTimer = setTimeout(() => {
      if (statusLineRef.current) statusLineRef.current.textContent = readyLine;
    }, 1200 + (fields.length - 1) * 170);
    cleanupFns.push(() => clearTimeout(introTimer));

    const sigilVideo = videoRef.current;
    if (sigilVideo) {
      const kick = () => { const r = sigilVideo.play(); if (r) r.catch(() => {}); };
      kick();
      sigilVideo.addEventListener("canplay", kick, { once: true });
      const kickEvents = ["pointerdown", "keydown"];
      kickEvents.forEach((evt) => document.addEventListener(evt, kick, { once: true, passive: true }));
      cleanupFns.push(() => {
        sigilVideo.removeEventListener("canplay", kick);
        kickEvents.forEach((evt) => document.removeEventListener(evt, kick));
      });
    }

    return () => cleanupFns.forEach((fn) => fn());
  }, [loading, user, fields, readyLine]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.32em]">LOADING PROFILE</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes cd-bar { 0%, 100% { transform: scaleY(.18) } 50% { transform: scaleY(1) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
        @keyframes cd-glow { 0%, 100% { opacity: .32; transform: scale(1) } 50% { opacity: .6; transform: scale(1.06) } }
      `}</style>
      <div 
        ref={appRef}
        className="relative h-screen bg-[radial-gradient(120%_90%_at_82%_42%,#17100c_0%,#0b0709_42%,#07050a_100%)] text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif] overflow-hidden box-border selection:bg-[#e0a279]/30"
      >
        <DashboardBackground />

        <div className="relative z-[2] max-w-[1280px] mx-auto pt-[100px] px-11 pb-5 flex flex-col gap-5 h-screen">
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-[26px] font-mono">
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">SHIP TIME</div>
                <div className="text-[22px] font-light tracking-[0.14em] text-[#f0e2d5]" ref={clockRef}>--:--:--</div>
              </div>
              <div className="w-px h-10 bg-[#e0a279]/18" />
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">SIGNAL</div>
                <div className="flex items-end gap-[3px] h-[22px]">
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.18s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.36s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.54s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.72s]" />
                </div>
              </div>
            </div>
            <div>
              <button 
                onClick={logout} 
                className="cursor-pointer flex items-center justify-between sm:justify-start gap-11 py-4 px-6 border border-[#e0a279]/45 rounded-[3px] bg-transparent font-mono text-[12px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/10 hover:border-[#e0a279] hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.5)]"
              >
                <span>LOGOUT</span>
                <span className="text-[#e0a279]">&#8594;</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 grid grid-cols-1 md:grid-cols-[1.55fr_0.95fr] gap-px bg-[#e0a279]/14 border border-[#e0a279]/18 rounded-md overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] animate-[cd-rise_.9s_ease-out_both] [@media(prefers-reduced-motion:reduce)]:animate-none">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
              <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
            </div>

            <div className="relative bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)] pt-[30px] px-[46px] pb-[24px] flex flex-col gap-6">
              <div className="flex flex-col gap-3.5">
                <div className="font-mono text-[11px] tracking-[0.32em] text-[#a89685]">MAIN</div>
                <div className="flex items-baseline gap-3">
                  <div 
                    ref={nameRef}
                    className="text-[clamp(26px,6.4vw,46px)] font-light tracking-[0.09em] text-[#f6e9dd] leading-none whitespace-nowrap cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                  >
                    {displayName}
                  </div>
                  <span className="w-[9px] h-[26px] bg-[#e0a279] animate-[cd-blink_1.15s_step-end_infinite]" />
                </div>
                <div className="flex items-center gap-3.5 font-mono text-[11px] tracking-[0.26em] text-[#e0a279]">
                  <span>CLEARANCE VERIFIED</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-[#e0a279]/50 to-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e0a279]/12">
                <div className="bg-[#0c090b]/55 py-[22px] px-5 flex flex-col gap-[11px]">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">TEAM</div>
                  <div 
                    ref={teamRef}
                    className="font-mono text-[17px] font-light tracking-[0.08em] text-[#eddfd3] whitespace-nowrap w-fit max-w-full cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                  >
                    {team}
                  </div>
                </div>
                <div className="bg-[#0c090b]/55 py-[22px] px-5 flex flex-col gap-[11px]">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">REGISTRATION NO</div>
                  <div 
                    ref={regRef}
                    className="font-mono text-[17px] font-light tracking-[0.08em] text-[#eddfd3] whitespace-nowrap w-fit max-w-full cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                  >
                    {regNo}
                  </div>
                </div>
                <div className="bg-[#0c090b]/55 py-[22px] px-5 flex flex-col gap-[11px]">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">EMAIL ID</div>
                  <div 
                    ref={mailRef}
                    className="font-mono text-[17px] font-light tracking-[0.05em] text-[#eddfd3] whitespace-nowrap w-fit max-w-full overflow-hidden text-ellipsis cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                  >
                    {email}
                  </div>
                </div>
                <div className="bg-[#0c090b]/55 py-[22px] px-5 flex flex-col gap-[11px]">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">ROLE</div>
                  <div 
                    ref={roleRef}
                    className="font-mono text-[17px] font-light tracking-[0.08em] text-[#eddfd3] whitespace-nowrap w-fit max-w-full cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                  >
                    {role}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-[22px] flex-wrap">
                <div 
                  className="cursor-pointer flex items-center gap-11 py-4 px-[26px] border border-[#e0a279]/45 rounded-[3px] bg-transparent font-mono text-[12px] tracking-[0.28em] text-[#f3e6da] transition-all duration-350 hover:bg-[#e0a279]/10 hover:border-[#e0a279] hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.5)] w-full sm:w-auto justify-between"
                  onClick={() => navigate(hasTeam ? "/terminal" : "/team-setup")}
                >
                  <span>{hasTeam ? "ENTER TERMINAL" : "SET UP CREW"}</span>
                  <span className="text-[#e0a279]">&#8594;</span>
                </div>
                <div className="font-mono text-[11px] tracking-[0.18em] text-[#a89685]" ref={statusLineRef}>{readyLine}</div>
              </div>
            </div>

            <div className="relative bg-[linear-gradient(200deg,rgba(18,13,14,.7)_0%,rgba(9,6,9,.82)_100%)] py-[30px] px-10 flex flex-col items-center justify-center gap-[30px]">
              <div className="relative w-[180px] h-[180px] flex-none flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(232,168,116,.16),transparent_66%)] animate-[cd-glow_7s_ease-in-out_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
                <video
                  ref={videoRef}
                  className="absolute -inset-[34px] w-[calc(100%+68px)] h-[calc(100%+68px)] rounded-full object-cover mix-blend-screen contrast-[1.08] sepia-[.34] -hue-rotate-[8deg] saturate-[1.55] brightness-[1.04] pointer-events-none [mask-image:radial-gradient(circle_closest-side_at_50%_50%,#000_54%,transparent_100%)] [-webkit-mask-image:radial-gradient(circle_closest-side_at_50%_50%,#000_54%,transparent_100%)]"
                  src="/assets/dashboard-blackhole.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-hidden="true"
                />
                <div className="absolute inset-0 border border-[#e0a279]/20 rounded-full" />
                <div className="absolute inset-[22px] border border-dashed border-[#e0a279]/30 rounded-full animate-[spin_40s_linear_infinite]" />
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="font-mono text-[11px] tracking-[0.32em] text-[#a89685]">TEAM</div>
                <div 
                  ref={team2Ref}
                  className="text-[15px] tracking-[0.22em] text-[#d5c2b4] whitespace-nowrap cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)] [-webkit-tap-highlight-color:transparent]"
                >
                  {team}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

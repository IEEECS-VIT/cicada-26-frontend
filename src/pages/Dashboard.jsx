import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Dashboard.module.css";

const ACCENT = "#e0a279";
const SCRAMBLE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*/";
const ROLL_MS = 38; // re-roll quantum, so it reads as a terminal not a 60fps blur
const TAP_HOLD_MS = 380; // churn time for a tap, since touch has no "still here"
const TAP_SLOP_PX = 10; // beyond this the gesture was a scroll, not a tap

const cx = (...names) => names.map((n) => styles[n]).filter(Boolean).join(" ");

// structural characters stay put so the string keeps its shape while scrambling
const isFixedChar = (ch) => ch === " " || ch === "-" || ch === "@" || ch === ".";

// p is how much of the string has resolved; p<=0 is fully scrambled, p>=1 is plain text
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

// churn indefinitely; runs until resolveScramble takes over
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
  const skyRef = useRef(null);
  const videoRef = useRef(null);
  const statusLineRef = useRef(null);
  const clockRef = useRef(null);
  const nameRef = useRef(null);
  const teamRef = useRef(null);
  const team2Ref = useRef(null);
  const regRef = useRef(null);
  const mailRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  const hasTeam = Boolean(teamName);
  const displayName = (user?.display_name || user?.email?.split("@")[0] || "Participant").toUpperCase();
  const team = (teamName || "NO CREW ASSIGNED").toUpperCase();
  const regNo = (user?.register_no || "UNASSIGNED").toUpperCase();
  const email = user?.email || "—";
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
    ],
    [displayName, team, regNo, email]
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

    // Hover-to-decrypt. Gate on the event's own pointerType rather than a media query:
    // a touch laptop reports `pointer: coarse` even with a mouse attached.
    fields.forEach((f) => {
      const el = f.ref.current;
      if (!el) return;
      const target = (f.target === "parent" ? el.parentElement : el) || el;

      const onEnter = (e) => { if (e.pointerType !== "touch") holdScramble(el, f.value, true); };
      const onLeave = (e) => { if (e.pointerType !== "touch") resolveScramble(el, f.value, 520, 0); };
      target.addEventListener("pointerenter", onEnter);
      target.addEventListener("pointerleave", onLeave);

      // Touch has no hover, so a tap stands in for it: churn briefly, then resolve.
      let sx = 0, sy = 0;
      const onDown = (e) => { if (e.pointerType === "touch") { sx = e.clientX; sy = e.clientY; } };
      const onUp = (e) => {
        if (e.pointerType !== "touch") return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > TAP_SLOP_PX) return; // scrolled
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

    // starfield canvas
    const c = skyRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, h = 0, stars = [], streaks = [], nextStreak = 900, rafId = 0;
      const mouse = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };

      const build = () => {
        w = c.clientWidth || window.innerWidth;
        h = c.clientHeight || window.innerHeight;
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = [];
        for (let i = 0; i < 240; i++) {
          const z = Math.random();
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            z,
            r: 0.35 + z * 1.25,
            ph: Math.random() * Math.PI * 2,
            sp: 0.09 + z * 0.05 + Math.random() * 0.04,
            warm: Math.random() < 0.34,
          });
        }
      };

      const onResize = () => build();
      window.addEventListener("resize", onResize);
      build();

      const onMouseMove = (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
      };
      if (!reduceMotion) window.addEventListener("mousemove", onMouseMove);

      let last = performance.now();
      const frame = (now) => {
        const dt = Math.min(now - last, 48);
        last = now;
        mouse.cx += (mouse.x - mouse.cx) * 0.045;
        mouse.cy += (mouse.y - mouse.cy) * 0.045;
        ctx.clearRect(0, 0, w, h);

        for (const s of stars) {
          s.x -= s.sp * dt * 0.055;
          if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
          s.ph += dt * 0.0016;
          const tw = 0.55 + 0.45 * Math.sin(s.ph);
          const px = s.x + (mouse.cx - 0.5) * -26 * s.z;
          const py = s.y + (mouse.cy - 0.5) * -18 * s.z;
          const a = (0.18 + s.z * 0.62) * tw;
          ctx.beginPath();
          ctx.fillStyle = s.warm ? `rgba(246,214,184,${a.toFixed(3)})` : `rgba(228,232,244,${a.toFixed(3)})`;
          ctx.arc(px, py, s.r, 0, 6.2832);
          ctx.fill();
          if (s.z > 0.88) {
            ctx.fillStyle = `rgba(246,206,168,${(a * 0.1).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, s.r * 5, 0, 6.2832);
            ctx.fill();
          }
        }

        nextStreak -= dt;
        if (nextStreak <= 0) {
          const burst = Math.random() < 0.22 ? 2 + ((Math.random() * 2) | 0) : 1;
          for (let i = 0; i < burst; i++) {
            streaks.push({
              x: w * (0.2 + Math.random() * 0.95),
              y: h * (Math.random() * 0.8 - 0.08),
              len: 70 + Math.random() * 190,
              sp: 0.32 + Math.random() * 0.5,
              slope: 0.28 + Math.random() * 0.22,
              life: -i * 220,
              dur: 720 + Math.random() * 620,
            });
          }
          nextStreak = 900 + Math.random() * 2400;
        }
        for (let i = streaks.length - 1; i >= 0; i--) {
          const s = streaks[i];
          s.life += dt;
          if (s.life < 0) continue;
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
          ctx.arc(s.x, s.y, 1.5, 0, 6.2832);
          ctx.fill();
        }

        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);

      cleanupFns.push(() => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
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
    <div className={cx("cd-app")} ref={appRef}>
      <div className={cx("cd-bg-image")} />
      <div className={cx("cd-bg-overlay")} />
      <canvas ref={skyRef} className={cx("cd-sky")} />
      <div className={cx("cd-glow", "cd-glow--right")} />
      <div className={cx("cd-glow", "cd-glow--left")} />
      <div className={cx("cd-vignette")} />

      <div className={cx("cd-shell")}>
        <header className={cx("cd-header")}>
          <Link to="/" className={cx("cd-brand")}>
            <div className={cx("cd-logo")}>
              <div className={cx("cd-logo__ring")} />
              <img src="/assets/cicada_logo.jpg" alt="" className={cx("cd-logo__img")} />
            </div>
            <div className={cx("cd-brand-text")}>
              <div className={cx("cd-brand-title")}>CICADA 2067</div>
              <div className={cx("cd-brand-sub")}>LISTEN. ADAPT. SURVIVE.</div>
            </div>
          </Link>

          <nav className={cx("cd-nav")}>
            <Link to="/about" className={cx("cd-nav__link")}>ABOUT</Link>
            <Link to="/puzzles" className={cx("cd-nav__link")}>PUZZLES</Link>
            <Link to="/terminal" className={cx("cd-nav__link")}>ROUNDS</Link>
            <Link to="/terminal" className={cx("cd-nav__link")}>LOGS</Link>
            <button type="button" onClick={logout} className={cx("cd-nav__link")}>SIGN OUT</button>
            <div className={cx("cd-nav__status")}>
              <span className={cx("cd-nav__dot")} />
              <span>DASHBOARD</span>
            </div>
          </nav>
        </header>

        <div className={cx("cd-welcome-row")}>
          <div className={cx("cd-welcome")}>
            <div className={cx("cd-eyebrow")}>CREW DOSSIER &middot; ACCESS GRANTED</div>
            <div className={cx("cd-welcome__title")}>Welcome back to the hunt.</div>
          </div>
          <div className={cx("cd-meta")}>
            <div className={cx("cd-meta__block", "cd-meta__block--right")}>
              <div className={cx("cd-meta__label")}>SHIP TIME</div>
              <div className={cx("cd-meta__value")} ref={clockRef}>--:--:--</div>
            </div>
            <div className={cx("cd-meta__divider")} />
            <div className={cx("cd-meta__block")}>
              <div className={cx("cd-meta__label")}>SIGNAL</div>
              <div className={cx("cd-signal")}>
                <span className={cx("cd-signal__bar")} />
                <span className={cx("cd-signal__bar")} />
                <span className={cx("cd-signal__bar")} />
                <span className={cx("cd-signal__bar")} />
                <span className={cx("cd-signal__bar")} />
              </div>
            </div>
          </div>
        </div>

        <div className={cx("cd-panels")}>
          <div className={cx("cd-panels__scan-wrap")}>
            <div className={cx("cd-panels__scan")} />
          </div>

          <div className={cx("cd-panel--left")}>
            <div className={cx("cd-operative")}>
              <div className={cx("cd-eyebrow")}>MAIN</div>
              <div className={cx("cd-operative__name-row")}>
                <div className={cx("cd-scramble", "cd-hoverable", "cd-operative__name")} ref={nameRef}>{displayName}</div>
                <span className={cx("cd-operative__cursor")} />
              </div>
              <div className={cx("cd-clearance")}>
                <span>CLEARANCE VERIFIED</span>
                <span className={cx("cd-clearance__line")} />
              </div>
            </div>

            <div className={cx("cd-grid2")}>
              <div className={cx("cd-grid2__cell")}>
                <div className={cx("cd-grid2__label")}>TEAM</div>
                <div className={cx("cd-scramble", "cd-grid2__value")} ref={teamRef}>{team}</div>
              </div>
              <div className={cx("cd-grid2__cell")}>
                <div className={cx("cd-grid2__label")}>REGISTRATION NO</div>
                <div className={cx("cd-scramble", "cd-grid2__value")} ref={regRef}>{regNo}</div>
              </div>
              <div className={cx("cd-grid2__cell", "cd-grid2__cell--span2")}>
                <div className={cx("cd-grid2__label")}>EMAIL ID</div>
                <div className={cx("cd-scramble", "cd-grid2__value", "cd-grid2__value--truncate")} ref={mailRef}>{email}</div>
              </div>
            </div>

            <div className={cx("cd-actions")}>
              <div className={cx("cd-enter-btn")} onClick={() => navigate(hasTeam ? "/terminal" : "/team-setup")}>
                <span>{hasTeam ? "ENTER TERMINAL" : "SET UP CREW"}</span>
                <span className={cx("cd-enter-btn__arrow")}>&#8594;</span>
              </div>
              <div className={cx("cd-status-line")} ref={statusLineRef}>{readyLine}</div>
            </div>
          </div>

          <div className={cx("cd-panel--right")}>
            <div className={cx("cd-sigil")}>
              <div className={cx("cd-sigil__glow")} />
              <video
                ref={videoRef}
                className={cx("cd-sigil__video")}
                src="/assets/dashboard-blackhole.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                aria-hidden="true"
              />
              <div className={cx("cd-sigil__ring")} />
              <div className={cx("cd-sigil__ring-dashed")} />
            </div>

            <div className={cx("cd-sigil-caption")}>
              <div className={cx("cd-eyebrow")}>TEAM</div>
              <div className={cx("cd-scramble", "cd-hoverable", "cd-sigil-caption__team")} ref={team2Ref}>{team}</div>
            </div>
          </div>
        </div>

        <footer className={cx("cd-footer")}>
          <span>CICADA 2067 &#183; CREW TERMINAL</span>
          <span>DECRYPTION KEY HELD LOCALLY</span>
        </footer>
      </div>
    </div>
  );
}

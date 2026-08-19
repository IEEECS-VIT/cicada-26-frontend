"use client";

/*
 * CrewPortal.tsx — the /team HUD
 * ─────────────────────────────────────────────────────────────────
 * Ported from Team-page/index.html. The markup is the source's, minus
 * its own <nav> and footer chrome — <Navbar /> and <SiteFooter /> in
 * page.tsx own those now so /team matches every other route.
 *
 * The source drove everything through document.getElementById; here the
 * toast, crew selection and countdown are state. Styles live in team.css.
 * ─────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from "react";

const CREW = ["COOPER", "BRAND", "MURPH", "DOYLE", "NAME 5", "NAME 6"];
const TEAM_CODE = "CICADA-2067-X9";
const PROGRESS_SEGMENTS = 14;
const PROGRESS_ON = 6;

export default function CrewPortal() {
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(CREW[0]);
  const [count, setCount] = useState(null); // null = overlay closed
  const toastTimer = useRef(undefined);
  const tickTimer = useRef(undefined);

  /* gargantua.mp4 is 2.9MB and autoplays. Phones get the poster still instead:
     starts false so the server HTML and the first client render agree (no
     hydration mismatch), then the effect opts desktop in. Same matchMedia gate
     FaqSection.tsx uses to defer TARS. */
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    setShowVideo(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearInterval(tickTimer.current);
    },
    []
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  const copyTeamCode = () => {
    navigator.clipboard.writeText(TEAM_CODE).catch(() => {});
    showToast(`TEAM CODE "${TEAM_CODE}" COPIED TO CLIPBOARD`);
  };

  const initLaunch = () => {
    clearInterval(tickTimer.current);
    setCount(5);
    showToast("LAUNCH SEQUENCE ENGAGED · STANDBY");

    tickTimer.current = setInterval(() => {
      setCount((c) => {
        if (c === null || c > 1) return (c ?? 1) - 1;
        /* Hit zero: swap to the warp panel, fire confetti, auto-close.
           The confetti script is CDN-loaded, so guard it — the sequence
           still completes if it never arrived. */
        clearInterval(tickTimer.current);
        window.confetti?.({
          particleCount: 130,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#C6B9B0", "#E8DDD5", "#FFF8F2", "#64D2FF"],
        });
        setTimeout(resetLaunch, 2000);
        return 0;
      });
    }, 900);
  };

  const resetLaunch = () => {
    clearInterval(tickTimer.current);
    setCount(null);
    showToast("RETURNED TO MISSION COMMAND");
  };

  return (
    <section className="crew-portal" aria-label="Crew portal">
      {/* The still is always the base layer and the video stacks over it when
          present. That gives desktop a real poster without the raw 733KB
          /891208.jpg the `poster` attribute used to pull (poster bypasses
          next/image entirely), and gives mobile the same frame for free once
          the video is gated off — one code path, ~3.6MB lighter on a phone.
          preload="metadata" so laptops stream rather than pre-buffer 2.9MB. */}
      <div className="portal-bg" aria-hidden="true">
        <img src="/landing/891208.jpg" alt="" style={{ objectFit: "cover", position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {showVideo && (
          <video autoPlay loop muted playsInline preload="metadata">
            <source src="/landing/team/gargantua.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="portal-scan" aria-hidden="true" />

      <div className="corner-frame cf-tl" aria-hidden="true" />
      <div className="corner-frame cf-tr" aria-hidden="true" />
      <div className="corner-frame cf-bl" aria-hidden="true" />
      <div className="corner-frame cf-br" aria-hidden="true" />

      <div className="micro micro-bl" aria-hidden="true">
        LAT: 0.00
        <br />
        STATUS: NORMAL
      </div>
      <div className="micro micro-br" aria-hidden="true">STATUS: NORMAL</div>
      <div className="micro micro-side-l" aria-hidden="true">BLINKINGS DISCOVER</div>

      <div className="portal-app">
        <div className="center-col">
          {/* ENDURANCE — 01 */}
          <div
            className="hud-panel ship-panel team-name-panel"
            onClick={() => showToast("VESSEL ENDURANCE-01 · HULL NOMINAL · ALL SYSTEMS GO")}
          >
            <div className="sys-label">SYS READY</div>
            <div className="ship-name">
              <span className="plus">—✛—</span>
              ENDURANCE — 01
              <span className="plus">—✛—</span>
            </div>
            <div className="sys-sub">SYS READY · HULL NOMINAL · ALL SYSTEMS GO</div>
          </div>

          {/* TEAM CODE */}
          <div className="hud-panel ship-panel team-code-btn" onClick={copyTeamCode}>
            <div className="dots" aria-hidden="true"><span /><span /><span /></div>
            <div className="sys-label">TEAM CODE</div>
            <div className="ship-name team-code-text">TEAM CODE</div>
          </div>

          {/* CREW MANIFEST */}
          <div className="crew-section">
            <div className="crew-title">CREW MANIFEST</div>
            <div className="crew-grid">
              {CREW.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`crew-card${selected === name ? " selected" : ""}`}
                  aria-pressed={selected === name}
                  onClick={() => {
                    setSelected(name);
                    showToast(`CREW MEMBER ACTIVE: ${name}`);
                  }}
                >
                  <div className="card-meta-top">
                    <span>
                      LAT: 0.00 <span className="card-status-dot" />
                    </span>
                    <span>SYS READY</span>
                  </div>
                  <div className="card-name">{name}</div>
                  <div className="card-meta-bot">
                    <span>STATUS: ENRL</span>
                    <div className="card-dots"><span /><span /><span /></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="prog-wrap">
            <div className="prog-bar" aria-hidden="true">
              {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
                <div key={i} className={`prog-seg${i < PROGRESS_ON ? " on" : ""}`} />
              ))}
            </div>
            <div className="prog-label">MISSION PHASE: 02 · ORBITAL APPROACH</div>
          </div>

          {/* Launch */}
          <div className="launch-wrap">
            <button type="button" className="launch-btn" onClick={initLaunch}>
              INITIALIZE LAUNCH
            </button>
            <div className="mission-status">MISSION STATUS: AWAITING_INPUT</div>
          </div>
        </div>
      </div>

      {/* Countdown / warp overlay */}
      {count !== null && (
        <div className="launch-overlay" role="dialog" aria-live="polite" aria-label="Launch sequence">
          {count > 0 ? (
            <div style={{ textAlign: "center" }}>
              {/* key forces the pop animation to replay on every tick */}
              <div className="countdown" key={count}>{count}</div>
              <div className="countdown-subtext">WARP DRIVE CHARGING · STABILIZING GRAVITY VECTOR</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "0 20px" }}>
              <div className="warp-title">WARP DRIVES ENGAGED</div>
              <div className="warp-status">STATUS: HYPERSPACE TRAJECTORY ACQUIRED</div>
              <button type="button" className="warp-btn" onClick={resetLaunch}>
                RETURN TO MISSION COMMAND
              </button>
            </div>
          )}
        </div>
      )}

      <div className={`hud-toast${toast ? " show" : ""}`} role="status">
        <span className="toast-tag">[SYS_NOTIFY]</span> {toast}
      </div>
    </section>
  );
}

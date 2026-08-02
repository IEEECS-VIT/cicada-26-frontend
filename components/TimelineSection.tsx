"use client";

/*
 * TimelineSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * The wormhole timeline, mounted below the landing hero on `/`.
 *
 * DOM OWNERSHIP — read before editing:
 * React renders this markup exactly once and never re-renders it. Every
 * dynamic property on a card (transform, opacity, pointer-events, the
 * --focused and --open modifiers) is written imperatively by lib/tunnel.ts
 * through the refs below, up to 60x/second. Do NOT lift card state into
 * useState: a re-render would clobber the class the rAF loop just wrote.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { ROUNDS, statusClass, initTunnel } from "@/lib/tunnel";
import "@/app/timeline.css";

export default function TimelineSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const topFadeRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const ticksRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const el = {
      canvas: canvasRef.current,
      track: trackRef.current,
      viewport: viewportRef.current,
      hero: heroRef.current,
      hud: hudRef.current,
      rail: railRef.current,
      depth: depthRef.current,
      clock: clockRef.current,
      topFade: topFadeRef.current,
      vignette: vignetteRef.current,
    };
    if (Object.values(el).some((v) => !v)) return;

    return initTunnel({
      canvas: el.canvas!,
      track: el.track!,
      viewport: el.viewport!,
      hero: el.hero!,
      hud: el.hud!,
      rail: el.rail!,
      depth: el.depth!,
      clock: el.clock!,
      topFade: el.topFade!,
      vignette: el.vignette!,
      cards: cardsRef.current,
      railTicks: ticksRef.current,
    });
  }, []);

  return (
    <section className="timeline-section" aria-label="Timeline">
      {/* HUD chrome — one wrapper, faded in as a group by the scroll loop */}
      <div className="tunnel-hud" ref={hudRef} aria-hidden="true">
        <div className="hud-corner hud-corner--tl" />
        <div className="hud-corner hud-corner--tr" />
        <div className="hud-readout hud-readout--depth">
          <span className="hud-readout__label">TUNNEL DEPTH</span>
          <span className="hud-readout__value" ref={depthRef}>000%</span>
        </div>
        <div className="hud-readout hud-readout--clock">
          <span className="hud-readout__label">SHIP TIME</span>
          <span className="hud-readout__value" ref={clockRef}>00:00:00</span>
        </div>
      </div>

      <canvas id="tunnel-canvas" ref={canvasRef} aria-hidden="true" />

      {/* Bridge between the landing hero and the tunnel — fades and blurs out
          as the camera takes over. */}
      <section className="timeline-hero" ref={heroRef}>
        <div className="timeline-hero__content">
          <div className="timeline-hero__eyebrow">THE HUNT IN SEQUENCE</div>
          <h2 className="timeline-hero__title">TIMELINE</h2>
          <div className="timeline-hero__rule" aria-hidden="true" />
          <p className="timeline-hero__sub">
            Six rounds. One trajectory.
            <br />
            Every coordinate logs itself as the hunt advances.
          </p>
        </div>
        <div className="timeline-hero__orbit" aria-hidden="true">
          <svg viewBox="0 0 320 320" width="320" height="320" fill="none">
            <circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="1,7" opacity="0.35" />
            <circle cx="160" cy="160" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="1,7" opacity="0.25" />
            <circle cx="160" cy="160" r="70" stroke="var(--amber)" strokeWidth="1" strokeDasharray="1,6" opacity="0.3" />
            <circle cx="230" cy="160" r="3" fill="var(--amber)" />
            <circle cx="160" cy="90" r="2" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <div className="timeline-hero__scrollcue">
          <span className="timeline-hero__scrolldot" aria-hidden="true" />
          SCROLL TO DRIFT
        </div>
      </section>

      <nav className="progress-rail" ref={railRef} aria-label="Round progress">
        <div className="progress-rail__line" aria-hidden="true" />
        <div className="progress-rail__ticks">
          {ROUNDS.map((round, i) => (
            <div
              key={round.code}
              className="progress-rail__tick"
              ref={(node) => { if (node) ticksRef.current[i] = node; }}
            >
              <span className="progress-rail__label">{round.code}</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="tunnel-track" ref={trackRef}>
        <div className="tunnel-viewport" ref={viewportRef}>
          <div className="tunnel-vignette" ref={vignetteRef} aria-hidden="true" />
          <div className="tunnel-fade tunnel-fade--top" ref={topFadeRef} aria-hidden="true" />
          <div className="tunnel-fade tunnel-fade--bottom" aria-hidden="true" />

          <div className="card-layer">
            {ROUNDS.map((round, i) => (
              <div
                key={round.code}
                className={`round-card round-card--${statusClass(round.status)}`}
                ref={(node) => { if (node) cardsRef.current[i] = node; }}
              >
                <div
                  className="round-card__panel"
                  tabIndex={0}
                  role="button"
                  aria-expanded="false"
                  aria-label={`${round.code}, ${round.title}, ${round.status}`}
                >
                  <div className="round-card__top">
                    <span className="round-card__code">{round.code}</span>
                    <span className="round-card__date">
                      {round.status === "LOCKED" ? "TBD" : round.date}
                    </span>
                  </div>
                  <div className="round-card__title">{round.title}</div>
                  <p className="round-card__summary">{round.summary}</p>
                  <div className="round-card__status">
                    <span className="round-card__dot" />
                    <span className="round-card__statustext">{round.status}</span>
                    {/* Swapped to "TAP FOR BRIEFING" by initTunnel on touch devices —
                        doing it here would be a hydration mismatch. */}
                    <span className="round-card__hint">HOVER FOR BRIEFING</span>
                  </div>
                  <div className="round-card__detail">
                    <div className="round-card__detail-inner">
                      <p className="round-card__briefing">{round.briefing}</p>
                      {round.objectives.map(([label, status]) => (
                        <div className="round-card__objective" key={label}>
                          <span className="round-card__objective-label">{label}</span>
                          <span
                            className={`round-card__objective-status${
                              status === "IN PROGRESS" || status === "COMPLETE"
                                ? " round-card__objective-status--live"
                                : ""
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

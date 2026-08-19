import { useEffect, useRef } from "react";
import { ROUNDS, statusClass, initTunnel } from "../lib/tunnel";

const STATUS = {
  active: {
    panel: "border-accretion/55 shadow-[0_0_46px_color-mix(in_oklab,var(--color-accretion)_28%,transparent),0_10px_34px_rgba(0,0,0,.5)]",
    code: "text-accretion",
    title: "text-starlight",
    dot: "border-transparent bg-accretion",
    status: "text-accretion",
  },
  complete: {
    panel: "border-copper/40 shadow-[0_10px_26px_rgba(0,0,0,.4)]",
    code: "text-copper",
    title: "text-starlight",
    dot: "border-transparent bg-copper",
    status: "text-copper",
  },
  locked: {
    panel: "border-white/10 shadow-[0_10px_22px_rgba(0,0,0,.35)]",
    code: "text-starlight-dim",
    title: "text-starlight-dim",
    dot: "border-starlight-dim bg-transparent",
    status: "text-starlight-dim",
  },
};

export default function TimelineSection() {
  const canvasRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const heroRef = useRef(null);
  const hudRef = useRef(null);
  const railRef = useRef(null);
  const depthRef = useRef(null);
  const clockRef = useRef(null);
  const topFadeRef = useRef(null);
  const vignetteRef = useRef(null);
  const cardsRef = useRef([]);
  const ticksRef = useRef([]);

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
      canvas: el.canvas,
      track: el.track,
      viewport: el.viewport,
      hero: el.hero,
      hud: el.hud,
      rail: el.rail,
      depth: el.depth,
      clock: el.clock,
      topFade: el.topFade,
      vignette: el.vignette,
      cards: cardsRef.current,
      railTicks: ticksRef.current,
    });
  }, []);

  const hideOnShortLandscape =
    "[@media(max-height:500px)_and_(orientation:landscape)]:hidden";

  return (
    <section
      className="relative font-mono text-starlight selection:bg-accretion/30 selection:text-starlight"
      aria-label="Timeline"
    >
      <div className="pointer-events-none opacity-0" ref={hudRef} aria-hidden="true">
        <div className={`pointer-events-none fixed top-[18px] left-[18px] z-[90] h-[22px] w-[22px] border-t border-l border-accretion/55 ${hideOnShortLandscape}`} />
        <div className={`pointer-events-none fixed top-[18px] right-[18px] z-[90] h-[22px] w-[22px] border-t border-r border-accretion/55 ${hideOnShortLandscape}`} />
        <div
          className={`pointer-events-none fixed bottom-[max(24px,calc(env(safe-area-inset-bottom,0px)+14px))] left-[max(clamp(20px,6vw,52px),calc(env(safe-area-inset-left,0px)+12px))] z-[90] font-mono text-[10px] leading-[1.6] tracking-[0.14em] text-starlight-dim max-md:text-[9px] ${hideOnShortLandscape}`}
        >
          <span className="block">TUNNEL DEPTH</span>
          <span className="text-[15px] tracking-[0.06em] text-accretion" ref={depthRef}>000%</span>
        </div>
        <div
          className={`pointer-events-none fixed right-[max(clamp(20px,6vw,52px),calc(env(safe-area-inset-right,0px)+12px))] bottom-[max(24px,calc(env(safe-area-inset-bottom,0px)+14px))] z-[90] text-right font-mono text-[10px] leading-[1.6] tracking-[0.14em] text-starlight-dim max-md:text-[9px] ${hideOnShortLandscape}`}
        >
          <span className="block">SHIP TIME</span>
          <span className="text-[15px] tracking-[0.06em] text-starlight" ref={clockRef}>00:00:00</span>
        </div>
      </div>

      <canvas
        id="tunnel-canvas"
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 block h-full w-full opacity-0"
      />

      <section
        className={`relative z-[2] mx-auto flex max-w-7xl items-center px-[clamp(24px,5vw,48px)] pt-[clamp(110px,16vw,150px)] pb-[140px] will-change-[opacity,filter,transform] min-[861px]:min-h-[92vh] min-[861px]:min-h-[92dvh] max-md:items-start max-md:pt-[clamp(90px,22vw,130px)] [@media(max-height:500px)_and_(orientation:landscape)]:min-h-0 [@media(max-height:500px)_and_(orientation:landscape)]:pt-[calc(76px+env(safe-area-inset-top,0px))] [@media(max-height:500px)_and_(orientation:landscape)]:pb-10`}
        ref={heroRef}
      >
        <div className="relative z-[2] max-w-[620px]">
          <div className="mb-[22px] text-[12.5px] tracking-[0.2em] text-accretion/55">THE HUNT IN SEQUENCE</div>
          <h2 className="m-0 font-orbitron text-[clamp(2.6rem,12vw,7.4rem)] font-light leading-[0.96] tracking-[0.03em] text-starlight text-balance">
            TIMELINE
          </h2>
          <div className="my-7 h-0.5 w-16 bg-accretion" aria-hidden="true" />
          <p className="m-0 max-w-[440px] font-mono text-base leading-[1.75] text-starlight-dim">
            Eight hours. One trajectory.
            <br />
            10:00 to 18:00. Every burn is logged.
          </p>
        </div>
        <div
          className={`absolute top-1/2 right-[clamp(0px,2vw,40px)] z-[1] h-[clamp(200px,26vw,320px)] w-[clamp(200px,26vw,320px)] -translate-y-1/2 text-starlight-dim opacity-75 max-md:hidden ${hideOnShortLandscape}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 320 320" className="block h-full w-full fill-none">
            <circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="1,7" opacity="0.35" />
            <circle cx="160" cy="160" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="1,7" opacity="0.25" />
            <circle cx="160" cy="160" r="70" className="stroke-accretion" strokeWidth="1" strokeDasharray="1,6" opacity="0.3" />
            <circle cx="230" cy="160" r="3" className="fill-accretion" />
            <circle cx="160" cy="90" r="2" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <div
          className={`absolute bottom-12 left-[clamp(24px,5vw,48px)] z-[2] flex items-center gap-2.5 text-[10.5px] tracking-[0.18em] text-starlight-dim ${hideOnShortLandscape}`}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accretion motion-safe:animate-blink motion-reduce:opacity-70" aria-hidden="true" />
          SCROLL TO DRIFT
        </div>
      </section>

      <nav
        className={`progress-rail pointer-events-none fixed top-1/2 right-[max(clamp(18px,3.6vw,40px),calc(env(safe-area-inset-right,0px)+10px))] z-[90] h-[min(38vh,260px)] -translate-y-1/2 opacity-0 transition-opacity duration-500 max-md:hidden ${hideOnShortLandscape}`}
        ref={railRef}
        aria-label="Round progress"
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" aria-hidden="true" />
        <div className="relative flex h-full flex-col items-center justify-between">
          {ROUNDS.map((round, i) => (
            <div
              key={round.code}
              className="progress-rail__tick relative z-[1] h-1.5 w-1.5 rounded-full border border-starlight-dim bg-black transition-[background,border-color,transform,box-shadow] duration-200"
              ref={(node) => { if (node) ticksRef.current[i] = node; }}
            >
              <span className="progress-rail__label absolute top-1/2 right-3.5 -translate-y-1/2 whitespace-nowrap text-[9px] tracking-[0.12em] text-starlight-dim opacity-0 transition-opacity duration-[180ms]">
                {round.code}
              </span>
            </div>
          ))}
        </div>
      </nav>

      <div className="relative" ref={trackRef}>
        <div className="sticky top-0 z-[1] h-dvh overflow-hidden" ref={viewportRef}>
          <div
            className="pointer-events-none absolute inset-0 z-[6] opacity-0 shadow-[inset_0_0_260px_40px_oklch(0.04_0.006_60/0.8)]"
            ref={vignetteRef}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 z-[6] h-60 bg-[linear-gradient(oklch(0.11_0.006_60),oklch(0.11_0.006_60/0))] opacity-0"
            ref={topFadeRef}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-[6] h-60 bg-[linear-gradient(oklch(0.11_0.006_60/0),oklch(0.11_0.006_60))]"
            aria-hidden="true"
          />

          <div className="absolute inset-0 z-[5]">
            {ROUNDS.map((round, i) => {
              const kind = statusClass(round.status);
              const look = STATUS[kind];
              return (
                <div
                  key={round.code}
                  className="round-card pointer-events-none absolute top-0 left-0 w-[min(360px,84vw)] opacity-0 will-change-[transform,opacity] max-md:w-[min(320px,88vw)] [@media(max-height:500px)_and_(orientation:landscape)]:w-[min(300px,46vw)]"
                  ref={(node) => { if (node) cardsRef.current[i] = node; }}
                >
                  <div
                    className={`round-card__panel cursor-pointer rounded-[3px] border bg-[oklch(0.12_0.01_60/0.92)] px-[22px] py-5 transition-[border-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] motion-reduce:duration-120 [@media(hover:hover)_and_(pointer:fine)]:hover:border-accretion/55 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-3.5 ${look.panel}`}
                    tabIndex={0}
                    role="button"
                    aria-expanded="false"
                    aria-label={`${round.code}, ${round.title}, ${round.status}`}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <span className={`text-[11px] tracking-[0.16em] ${look.code}`}>{round.code}</span>
                      <span className="text-[10px] tracking-[0.1em] text-starlight-dim">{round.date}</span>
                    </div>
                    <div className={`mb-2 font-orbitron text-[19px] font-medium tracking-[0.03em] ${look.title}`}>
                      {round.title}
                    </div>
                    <p className="mb-3.5 text-[12.5px] leading-[1.65] text-starlight-dim">{round.summary}</p>
                    <div className="flex items-center gap-2">
                      <span className={`h-[5px] w-[5px] shrink-0 rounded-full border ${look.dot}`} />
                      <span className={`text-[10px] tracking-[0.14em] ${look.status}`}>{round.status}</span>
                      <span className="round-card__hint ml-auto text-[9.5px] tracking-[0.12em] text-accretion/55">
                        HOVER FOR BRIEFING
                      </span>
                    </div>
                    <div className="round-card__detail mt-0 grid grid-rows-[0fr] opacity-0 blur-[2px] transition-[grid-template-rows,opacity,filter] duration-[340ms] ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:duration-120 motion-reduce:blur-none">
                      <div className="min-h-0 overflow-hidden">
                        <p className="mt-3.5 mb-3 border-t border-white/10 pt-3.5 text-[12.5px] leading-[1.75] text-starlight-dim">
                          {round.briefing}
                        </p>
                        {round.objectives.map(([label, status]) => (
                          <div
                            className="flex items-center justify-between border-b border-white/10 py-[7px] text-[11px] tracking-[0.06em] last:border-b-0"
                            key={label}
                          >
                            <span className="text-starlight-dim">{label}</span>
                            <span
                              className={`text-[9.5px] tracking-[0.1em] ${
                                status === "IN PROGRESS" || status === "COMPLETE"
                                  ? "text-accretion"
                                  : "text-starlight-dim"
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

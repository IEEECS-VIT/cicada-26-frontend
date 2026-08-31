import React, { useEffect, useState } from "react";
import { useGameState } from "../../context/GameStateContext";
import QuestionPanel from "./QuestionPanel";
import SubmissionTerminal from "./SubmissionTerminal";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Terminal() {
  const { 
    teamName, 
    isTerminalOpen, 
    unlockedRounds, 
    currentRound, 
    unlockedPhases, 
    loading, 
    error, 
    challengeData,
    completedChallenges 
  } = useGameState();
  const [clock, setClock] = useState("20:13:47");
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const roundData = challengeData?.[currentRound];
    if (!roundData || !unlockedRounds.includes(currentRound)) {
      setLineProgress(0);
      return;
    }

    // If we've completed this round and unlocked past it, it's 100%
    if (Math.max(...unlockedRounds) > currentRound) {
      setLineProgress(100);
      return;
    }

    const phasesList = Object.values(roundData.phases || {});
    if (phasesList.length === 0) {
      setLineProgress(0);
      return;
    }

    const completedList = completedChallenges || [];
    const completedInThisRound = phasesList.filter((p) => completedList.includes(p.order_number)).length;

    let pct = 0;
    if (completedInThisRound > 0) {
      pct = Math.min(100, Math.round((completedInThisRound / phasesList.length) * 100));
    } else {
      const currentUnlockedPhase = unlockedPhases[currentRound] || 1;
      const completedArchives = Math.max(0, currentUnlockedPhase - 1);
      pct = Math.min(100, Math.round((completedArchives / phasesList.length) * 100));
    }

    setLineProgress(pct);
  }, [unlockedRounds, currentRound, unlockedPhases, challengeData, completedChallenges]);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative flex h-full max-h-full flex-col items-center justify-between overflow-hidden bg-black px-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 text-accretion sm:px-4 sm:pt-2.5 lg:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/starry-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-25"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-full sm:max-w-[98vw] flex-1 items-stretch justify-center gap-2 sm:gap-4 md:gap-5 lg:gap-6 xl:max-w-[100rem] 2xl:max-w-[110rem] pb-1 sm:pb-4 pt-0.5 sm:pt-1.5">
        {/* Left Window Panel */}
        <div className="relative hidden h-full shrink-0 self-stretch md:block md:w-20 lg:w-24 xl:w-32">
          <svg className="absolute h-0 w-0" aria-hidden="true">
            <defs>
              <clipPath id="left-card-clip" clipPathUnits="objectBoundingBox">
                <path d="M 0.20 0.01 L 0.80 0.05 Q 0.96 0.07, 0.96 0.12 L 0.96 0.88 Q 0.96 0.93, 0.80 0.95 L 0.20 0.99 Q 0.04 1.00, 0.04 0.05 Q 0.04 0.00, 0.20 0.01 Z" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 overflow-hidden bg-black [clip-path:url(#left-card-clip)]">
            <img src="/assets/side-planet.png" alt="" className="h-full w-full object-cover opacity-90" />
          </div>
          {/* Glowing SVG Border */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 120 400"
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 0 8px #D19B83) drop-shadow(0 0 20px rgba(209,155,131,0.65))" }}
          >
            {/* Outer neon glow stroke */}
            <path
              d="M 24 4 L 96 20 Q 115 28, 115 48 L 115 352 Q 115 372, 96 380 L 24 396 Q 5 400, 5 380 L 5 20 Q 5 0, 24 4 Z"
              fill="none"
              stroke="#D19B83"
              strokeWidth="5"
              className="opacity-70"
              style={{ filter: "blur(3px)" }}
              vectorEffect="non-scaling-stroke"
            />
            {/* Crisp primary stroke */}
            <path
              d="M 24 4 L 96 20 Q 115 28, 115 48 L 115 352 Q 115 372, 96 380 L 24 396 Q 5 400, 5 380 L 5 20 Q 5 0, 24 4 Z"
              fill="none"
              stroke="#E8C0AF"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Center Console */}
        <div className="flex h-full min-h-0 min-w-0 max-w-full flex-1 flex-col justify-center">
          <div className="relative mx-auto mb-1.5 sm:mb-2 h-[2.5px] sm:h-[3px] w-[95%] sm:w-[92%] shrink-0 overflow-hidden rounded-full bg-accretion/20 shadow-[0_0_8px_rgba(209,155,131,0.5)]">
            <div
              className="h-full rounded-full bg-accretion shadow-[0_0_12px_#D19B83] transition-all duration-1000"
              style={{ width: `${lineProgress}%` }}
            />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-accretion/40 bg-[rgba(10,12,18,0.55)] backdrop-blur-2xl backdrop-saturate-150 p-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_0_20px_rgba(0,0,0,0.5),0_12px_40px_rgba(0,0,0,0.7),0_0_35px_rgba(209,155,131,0.15)] sm:rounded-3xl sm:p-4">
            {/* Subtle matte glass reflection overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/30" aria-hidden="true" />

            <header className="relative z-10 mb-1.5 flex shrink-0 items-center justify-between gap-2 border-b border-accretion/30 pb-1.5 sm:mb-2 sm:gap-4 sm:pb-2">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-3.5">
                <img
                  src="/assets/cicada_logo.jpg"
                  alt="Cicada 2067"
                  className="h-6 w-6 shrink-0 rounded-md object-contain sm:h-10 sm:w-10 md:h-11 md:w-11"
                />
                <h1 className="truncate font-orbitron text-xs font-bold tracking-[0.08em] text-accretion xs:text-sm sm:text-xl sm:tracking-[0.14em] md:text-2xl">
                  CICADA 2067
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-8">
                <div className="min-w-0 max-w-[32vw] text-right sm:text-left sm:max-w-none">
                  <p className="label-mono text-[7px] sm:text-[8px]">TEAM NAME</p>
                  <p className="truncate font-orbitron text-[9px] tracking-[0.08em] text-accretion xs:text-[10px] sm:text-sm sm:tracking-[0.15em]">{teamName}</p>
                </div>
                <div className="text-right">
                  <p className="font-orbitron text-[10px] tabular-nums tracking-[0.06em] text-accretion xs:text-xs sm:text-base sm:tracking-[0.12em]">{clock}</p>
                  <p className="label-mono text-[7px] sm:text-[8px]">Ship Time</p>
                </div>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-1 items-center justify-center font-orbitron text-sm tracking-[0.28em] text-accretion/70">
                LOADING MISSION DATA
              </div>
            ) : error ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="mb-3 text-sm text-red-300">{error}</p>
                <p className="label-mono text-[10px] text-accretion/50">CHECK YOUR CONNECTION AND RETRY</p>
              </div>
            ) : isTerminalOpen ? (
              <SubmissionTerminal />
            ) : (
              <QuestionPanel />
            )}
          </div>
        </div>

        {/* Right Window Panel */}
        <div className="relative hidden h-full shrink-0 self-stretch md:block md:w-20 lg:w-24 xl:w-32">
          <svg className="absolute h-0 w-0" aria-hidden="true">
            <defs>
              <clipPath id="right-card-clip" clipPathUnits="objectBoundingBox">
                <path d="M 0.20 0.05 L 0.80 0.01 Q 0.96 0.00, 0.96 0.05 L 0.96 0.95 Q 0.96 1.00, 0.80 0.99 L 0.20 0.95 Q 0.04 0.93, 0.04 0.88 L 0.04 0.12 Q 0.04 0.07, 0.20 0.05 Z" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 overflow-hidden bg-black [clip-path:url(#right-card-clip)]">
            <img src="/assets/right-planet.png" alt="" className="h-full w-full object-cover opacity-90" />
          </div>
          {/* Glowing SVG Border */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 120 400"
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 0 8px #D19B83) drop-shadow(0 0 20px rgba(209,155,131,0.65))" }}
          >
            {/* Outer neon glow stroke */}
            <path
              d="M 24 20 L 96 4 Q 115 0, 115 20 L 115 380 Q 115 400, 96 396 L 24 380 Q 5 372, 5 352 L 5 48 Q 5 28, 24 20 Z"
              fill="none"
              stroke="#D19B83"
              strokeWidth="5"
              className="opacity-70"
              style={{ filter: "blur(3px)" }}
              vectorEffect="non-scaling-stroke"
            />
            {/* Crisp primary stroke */}
            <path
              d="M 24 20 L 96 4 Q 115 0, 115 20 L 115 380 Q 115 400, 96 396 L 24 380 Q 5 372, 5 352 L 5 48 Q 5 28, 24 20 Z"
              fill="none"
              stroke="#E8C0AF"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="pointer-events-none relative z-10 mx-auto mt-1 mb-0.5 h-3.5 w-full max-w-full shrink-0 sm:mt-2.5 sm:mb-1 sm:h-8 lg:h-10 sm:max-w-[98vw] xl:max-w-[100rem] 2xl:max-w-[110rem]">
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <clipPath id="large-bottom-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0 1 L 0.064 0.20 Q 0.08 0, 0.116 0 L 0.884 0 Q 0.92 0, 0.936 0.20 L 1 1 Z" />
            </clipPath>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md [clip-path:url(#large-bottom-clip)]" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 1000 90"
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(0 0 8px #D19B83) drop-shadow(0 0 22px rgba(209,155,131,0.7))" }}
        >
          {/* Outer neon glow stroke */}
          <path
            d="M 0 90 L 64 18 Q 80 0, 116 0 L 884 0 Q 920 0, 936 18 L 1000 90"
            fill="none"
            stroke="#D19B83"
            strokeWidth="6"
            className="opacity-70"
            style={{ filter: "blur(3px)" }}
            vectorEffect="non-scaling-stroke"
          />
          {/* Crisp primary stroke */}
          <path
            d="M 0 90 L 64 18 Q 80 0, 116 0 L 884 0 Q 920 0, 936 18 L 1000 90"
            fill="none"
            stroke="#E8C0AF"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </main>
  );
}

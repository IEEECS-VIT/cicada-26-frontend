import React, { useEffect, useState } from "react";
import { useGameState } from "../../context/GameStateContext";
import QuestionPanel from "./QuestionPanel";
import SubmissionTerminal from "./SubmissionTerminal";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Terminal() {
  const { teamName, isTerminalOpen, unlockedRounds, currentRound, unlockedPhases, loading, error, challengeData } =
    useGameState();
  const [clock, setClock] = useState("20:13:47");
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    let current = (unlockedRounds.length - 1) * 100;
    current += ((unlockedPhases[currentRound] || 1) / (challengeData?.[currentRound]?.totalPhases || 4)) * 100;
    setLineProgress(Math.min(100, Math.round((current / 300) * 100)));
  }, [unlockedRounds, currentRound, unlockedPhases, challengeData]);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative flex h-full max-h-full flex-col items-center justify-between overflow-hidden bg-black px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-2 text-accretion sm:px-4 sm:pt-2.5 lg:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/starry-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-25"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[98vw] flex-1 items-stretch justify-center gap-3 pb-3 pt-1.5 sm:gap-4 sm:pb-4 md:gap-5 lg:gap-6 xl:max-w-[100rem] 2xl:max-w-[110rem]">
        <div className="relative hidden h-full w-16 shrink-0 self-stretch lg:block lg:w-24 xl:w-32">
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
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 120 400" preserveAspectRatio="none">
            <path
              d="M 24 4 L 96 20 Q 115 28, 115 48 L 115 352 Q 115 372, 96 380 L 24 396 Q 5 400, 5 380 L 5 20 Q 5 0, 24 4 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="flex h-full min-h-0 min-w-0 max-w-full flex-1 flex-col justify-center">
          <div className="relative mx-auto mb-2 h-[3px] w-[92%] shrink-0 overflow-hidden bg-accretion/20">
            <div
              className="h-full bg-accretion transition-all duration-1000"
              style={{ width: `${lineProgress}%` }}
            />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border border-accretion/45 bg-black/90 p-3 sm:p-5">
            <header className="mb-2 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-accretion/40 pb-2 sm:mb-3 sm:gap-4 sm:pb-2.5 sm:flex sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-5">
                <img
                  src="/assets/cicada_logo.jpg"
                  alt="Cicada 2067"
                  className="h-10 w-10 shrink-0 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20"
                />
                <h1 className="truncate font-orbitron text-lg font-bold tracking-[0.1em] text-accretion sm:text-3xl sm:tracking-[0.14em] md:text-4xl">
                  CICADA 2067
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:gap-10">
                <div className="min-w-0 max-w-[28vw] sm:max-w-none">
                  <p className="label-mono text-[8px] sm:text-[9px]">TEAM NAME</p>
                  <p className="truncate font-orbitron text-[10px] tracking-[0.12em] text-accretion sm:text-base sm:tracking-[0.15em]">{teamName}</p>
                </div>
                <div className="text-right">
                  <p className="font-orbitron text-xs tracking-[0.1em] text-accretion sm:text-lg sm:tracking-[0.12em]">{clock}</p>
                  <p className="label-mono text-[8px] sm:text-[9px]">Ship Time</p>
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

        <div className="relative hidden h-full w-16 shrink-0 self-stretch lg:block lg:w-24 xl:w-32">
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
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 120 400" preserveAspectRatio="none">
            <path
              d="M 24 20 L 96 4 Q 115 0, 115 20 L 115 380 Q 115 400, 96 396 L 24 380 Q 5 372, 5 352 L 5 48 Q 5 28, 24 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto mt-2 mb-1 h-6 w-full max-w-[98vw] shrink-0 sm:mt-2.5 sm:h-8 lg:h-10 xl:max-w-[100rem] 2xl:max-w-[110rem]">
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <clipPath id="large-bottom-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0 1 L 0.064 0.20 Q 0.08 0, 0.116 0 L 0.884 0 Q 0.92 0, 0.936 0.20 L 1 1 Z" />
            </clipPath>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md [clip-path:url(#large-bottom-clip)]" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 90" preserveAspectRatio="none">
          <path
            d="M 0 90 L 64 18 Q 80 0, 116 0 L 884 0 Q 920 0, 936 18 L 1000 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </main>
  );
}

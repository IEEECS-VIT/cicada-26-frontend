import React, { useEffect, useState } from "react";
import { useGameState, GameStateProvider } from "../../context/GameStateContext";

import emblem from "./assets/cicada-logo.jpg";
import sidePlanet from "./assets/side-planet.png";
import rightPlanet from "./assets/right-planet.png";
import starryBg from "./assets/starry-bg.jpg";

import QuestionPanel from "./QuestionPanel";
import SubmissionTerminal from "./SubmissionTerminal";

function pad(n) {
  return String(n).padStart(2, "0");
}

function TerminalShell() {
  const { teamName, isTerminalOpen } = useGameState();
  const [clock, setClock] = useState("20:13:47");
  const [goldenLineProgress, setGoldenLineProgress] = useState(0);

  // Simple overall progress calculation for the golden line
  const { unlockedRounds, currentRound, unlockedPhases } = useGameState();
  useEffect(() => {
    let current = (unlockedRounds.length - 1) * 100;
    current += ((unlockedPhases[currentRound] || 1) / 4) * 100; // rough calculation
    setGoldenLineProgress(Math.min(100, Math.round((current / 300) * 100)));
  }, [unlockedRounds, currentRound, unlockedPhases]);


  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative h-screen max-h-screen overflow-hidden bg-background px-2 py-2.5 sm:px-4 lg:px-6 flex flex-col justify-between items-center pb-0">
      {/* Darkened background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none"
        style={{ backgroundImage: `url(${starryBg})` }}
      />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-[98vw] 2xl:max-w-[110rem] xl:max-w-[100rem] items-stretch justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-1 min-h-0 pb-3 sm:pb-4 pt-1.5">
        {/* left viewport window */}
        <div className="relative hidden w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 h-full shrink-0 self-stretch sm:block">
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <clipPath id="left-card-clip" clipPathUnits="objectBoundingBox">
                <path d="M 0.20 0.01 L 0.80 0.05 Q 0.96 0.07, 0.96 0.12 L 0.96 0.88 Q 0.96 0.93, 0.80 0.95 L 0.20 0.99 Q 0.04 1.00, 0.04 0.05 Q 0.04 0.00, 0.20 0.01 Z" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 bg-black overflow-hidden" style={{ clipPath: "url(#left-card-clip)" }}>
            <img src={sidePlanet} alt="Planet view" className="h-full w-full object-cover opacity-90" />
          </div>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(209,155,131,0.9)] drop-shadow-[0_0_24px_rgba(209,155,131,0.5)]"
            viewBox="0 0 120 400" preserveAspectRatio="none"
          >
            <path d="M 24 4 L 96 20 Q 115 28, 115 48 L 115 352 Q 115 372, 96 380 L 24 396 Q 5 400, 5 380 L 5 20 Q 5 0, 24 4 Z" fill="none" stroke="#D29A84" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="min-w-0 flex-1 flex flex-col h-full min-h-0 max-w-full justify-center">
          {/* top light bar / round progress bar */}
          <div className="mx-auto mb-2 h-[3px] w-[92%] shrink-0 rounded-full bg-[#D19B83]/20 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-[#D19B83] transition-all duration-1000"
              style={{
                width: `${goldenLineProgress}%`,
                boxShadow: "0 0 16px rgba(209, 155, 131, 0.9), 0 0 30px rgba(209, 155, 131, 0.7)"
              }}
            />
          </div>

          <div
            className="rounded-[2rem] border border-[#D19B83] bg-black/80 p-4 sm:p-5 flex-1 flex flex-col overflow-hidden min-h-0 relative shadow-[0_0_35px_rgba(209,155,131,0.35)]"
            style={{ boxShadow: "0 0 25px rgba(209, 155, 131, 0.4), 0 0 50px rgba(209, 155, 131, 0.2), inset 0 0 25px rgba(209, 155, 131, 0.08)" }}
          >
            {/* header */}
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[#D19B83]/40 pb-2.5 sm:flex sm:justify-between shrink-0 mb-3">
              <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
                <img src={emblem} alt="Cicada 2067 emblem" className="h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 shrink-0 object-contain mix-blend-screen rounded-full" />
                <h1 className="truncate font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.14em] text-primary">
                  CICADA 2067
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-6 sm:gap-10">
                <div>
                  <p className="label-mono text-[9px]">TEAM NAME</p>
                  <p className="font-display text-xs tracking-[0.15em] text-primary sm:text-base">
                    {teamName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm tracking-[0.12em] text-primary sm:text-lg">{clock}</p>
                  <p className="label-mono text-[9px]">Ship Time</p>
                </div>
              </div>
            </header>

            {/* Dynamic Body */}
            {isTerminalOpen ? <SubmissionTerminal /> : <QuestionPanel />}
            
          </div>
        </div>

        {/* right viewport window */}
        <div className="relative hidden w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 h-full shrink-0 self-stretch sm:block">
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <clipPath id="right-card-clip" clipPathUnits="objectBoundingBox">
                <path d="M 0.20 0.05 L 0.80 0.01 Q 0.96 0.00, 0.96 0.05 L 0.96 0.95 Q 0.96 1.00, 0.80 0.99 L 0.20 0.95 Q 0.04 0.93, 0.04 0.88 L 0.04 0.12 Q 0.04 0.07, 0.20 0.05 Z" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 bg-black overflow-hidden" style={{ clipPath: "url(#right-card-clip)" }}>
            <img src={rightPlanet} alt="Galaxy view" loading="lazy" className="h-full w-full object-cover opacity-90" />
          </div>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(209,155,131,0.9)] drop-shadow-[0_0_24px_rgba(209,155,131,0.5)]"
            viewBox="0 0 120 400" preserveAspectRatio="none"
          >
            <path d="M 24 20 L 96 4 Q 115 0, 115 20 L 115 380 Q 115 400, 96 396 L 24 380 Q 5 372, 5 352 L 5 48 Q 5 28, 24 20 Z" fill="none" stroke="#D29A84" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      {/* Relative Bottom Frame Element */}
      <div className="relative z-10 mx-auto shrink-0 w-full max-w-[98vw] 2xl:max-w-[110rem] xl:max-w-[100rem] h-6 sm:h-8 lg:h-10 pointer-events-none mb-1 mt-2 sm:mt-2.5">
          
          {/* 
            Updated Clip Path:
            - The curve (Q) now spans a wider area (from 0.064 to 0.116)
            - This creates a much softer, rounded transition
          */}
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <clipPath id="large-bottom-clip" clipPathUnits="objectBoundingBox">
                <path d="M 0 1 L 0.064 0.20 Q 0.08 0, 0.116 0 L 0.884 0 Q 0.92 0, 0.936 0.20 L 1 1 Z" />
              </clipPath>
            </defs>
          </svg>
          
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md" 
            style={{ clipPath: "url(#large-bottom-clip)" }} 
          />
          
          {/* 
            Updated Glowing Border:
            - Perfectly matches the new soft corners of the clip path
            - The curve smoothly arcs from (64,18) through control point (80,0) to (116,0)
          */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-4px_16px_rgba(209,155,131,0.9)] drop-shadow-[0_0_30px_rgba(209,155,131,0.5)]"
            viewBox="0 0 1000 90" 
            preserveAspectRatio="none"
          >
            <path 
              d="M 0 90 L 64 18 Q 80 0, 116 0 L 884 0 Q 920 0, 936 18 L 1000 90" 
              fill="none" 
              stroke="#D29A84" 
              strokeWidth="2" 
              vectorEffect="non-scaling-stroke" 
            />
          </svg>
          
        </div>
    </main>
  );
}

export default function Terminal() {
  return (
    <GameStateProvider>
      <TerminalShell />
    </GameStateProvider>
  );
}

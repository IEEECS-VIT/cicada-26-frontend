import React, { useEffect } from "react";
import { useGameState } from "../../context/GameStateContext";

export default function RoundTransition() {
  const { roundTransition, dismissRoundTransition } = useGameState();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && roundTransition) dismissRoundTransition();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roundTransition, dismissRoundTransition]);

  if (!roundTransition) return null;

  const isMission = roundTransition.type === "mission";
  const fragment = roundTransition.fragment;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={isMission ? "Mission complete" : `Round ${roundTransition.nextRoundKey} unlocked`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/starry-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-20"
        aria-hidden="true"
      />

      <div className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-accretion/40 bg-[rgba(10,12,18,0.92)] text-center shadow-[0_0_60px_rgba(209,155,131,0.25),0_25px_80px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/40" aria-hidden="true" />

        <div className="relative shrink-0 overflow-y-auto pt-8 sm:pt-12 px-6 sm:px-10">
          <p className="label-mono tracking-[0.3em] text-accretion/70">
            {isMission ? "FINAL TRANSMISSION // SIGNAL LOST" : `SECTOR ${String(roundTransition.nextRoundKey).padStart(2, "0")} UNLOCKED`}
          </p>

          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-accretion/40" aria-hidden="true" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-accretion shadow-[0_0_12px_#D19B83]" aria-hidden="true" />
            <span className="h-px w-12 bg-accretion/40" aria-hidden="true" />
          </div>

          <h2 className="font-orbitron text-xl font-bold uppercase tracking-[0.18em] text-accretion sm:text-3xl">
            {isMission ? "Mission Complete" : "Archive Online"}
          </h2>

          {!isMission && (
            <p className="mt-2 font-orbitron text-xs tracking-[0.14em] text-accretion/90 sm:text-sm">
              {roundTransition.nextRoundTitle}
            </p>
          )}

          {isMission && (
            <p className="mt-2 font-orbitron text-xs tracking-[0.14em] text-accretion/90 sm:text-sm">
              UPLINK SECURED // ALL ARCHIVES DECRYPTED
            </p>
          )}
        </div>

        {!isMission && fragment?.content && (
          <div className="relative mx-6 sm:mx-10 mt-5 shrink-0 rounded-xl border border-accretion/30 bg-black/60 p-4 text-left sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_0_20px_rgba(0,0,0,0.5)]">
            <p className="mb-2 label-mono text-[9px] tracking-[0.25em] text-accretion/70">
              TRANSMISSION // {fragment.title}
            </p>
            <p className="max-h-56 overflow-y-auto scrollbar-hide whitespace-pre-wrap font-mono text-xs leading-relaxed text-accretion/90 sm:text-sm">
              {fragment.content}
            </p>
          </div>
        )}

        <div className="relative shrink-0 p-8 pt-6 sm:p-10 sm:pt-7">
          <button
            onClick={dismissRoundTransition}
            className="mx-auto block cursor-pointer rounded-lg border border-accretion/60 bg-accretion/10 px-10 py-3 font-orbitron text-xs tracking-[0.25em] text-accretion uppercase transition-all hover:bg-accretion/25 hover:shadow-[0_0_20px_rgba(209,155,131,0.35)] focus:outline-none focus:ring-2 focus:ring-accretion/60"
          >
            {isMission ? "Exit Uplink" : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}

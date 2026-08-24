import React, { useState } from "react";
import { useGameState } from "../../context/GameStateContext";
import { ArrowRight, Compass, FileText, Radio, Terminal as TerminalIcon } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import ResourceViewer from "./ResourceViewer";
import GuidelinesViewer from "./GuidelinesViewer";
import FaqViewer from "./FaqViewer";

const PANE_CONFIG = [
  { id: "nav", label: "MISSION", icon: Compass },
  { id: "brief", label: "BRIEFING", icon: FileText },
  { id: "hints", label: "HINTS", icon: Radio },
];

export default function QuestionPanel() {
  const { setIsTerminalOpen, activeTab, hints, currentRound } = useGameState();
  const [pane, setPane] = useState("brief");

  const currentHintsCount = (hints || []).filter((h) => h.round === currentRound).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-stretch overflow-hidden lg:flex-row lg:gap-3">
      {/* Mobile Tab Navigator */}
      <div className="mb-2 grid shrink-0 grid-cols-3 gap-1.5 lg:hidden" role="tablist" aria-label="Arena panels">
        {PANE_CONFIG.map(({ id, label, icon: Icon }) => {
          const isActive = pane === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setPane(id)}
              className={`relative flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border px-1 py-1 font-orbitron text-[10px] tracking-[0.12em] transition-all xs:text-[11px] ${
                isActive
                  ? "border-accretion bg-accretion/20 text-accretion shadow-[0_0_12px_rgba(209,155,131,0.3)] font-bold"
                  : "border-accretion/25 bg-black/40 text-copper/80 hover:bg-accretion/10 hover:text-accretion"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
              {id === "hints" && currentHintsCount > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accretion px-1 font-mono text-[9px] font-bold text-black">
                  {currentHintsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={`${pane === "nav" ? "flex min-h-0 flex-1 flex-col" : "hidden"} h-full lg:flex lg:w-56 lg:shrink-0 lg:flex-col xl:w-64`}>
        <LeftSidebar onNavigate={() => setPane("brief")} />
      </div>

      <div
        className={`${
          pane === "brief" ? "flex" : "hidden"
        } panel h-full min-h-0 flex-1 flex-col overflow-hidden p-2.5 sm:p-4 lg:flex`}
      >
        {activeTab === "guidelines" ? (
          <GuidelinesViewer />
        ) : activeTab === "faq" ? (
          <FaqViewer />
        ) : (
          <ResourceViewer />
        )}

        <div className="mt-2.5 shrink-0 sm:mt-4">
          <button
            type="button"
            onClick={() => setIsTerminalOpen(true)}
            className="group relative flex min-h-[42px] w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-accretion bg-accretion/10 px-3 py-2 font-orbitron text-[11px] uppercase tracking-[0.14em] text-accretion transition-all hover:bg-accretion hover:text-black sm:min-h-12 sm:px-4 sm:text-sm sm:tracking-[0.2em] shadow-[0_0_12px_rgba(209,155,131,0.2)] hover:shadow-[0_0_20px_rgba(209,155,131,0.5)]"
          >
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-left font-bold">Initialize Submission Terminal</span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className={`${pane === "hints" ? "flex min-h-0 flex-1 flex-col" : "hidden"} h-full lg:flex lg:w-56 lg:shrink-0 lg:flex-col xl:w-64`}>
        <RightSidebar />
      </div>
    </div>
  );
}

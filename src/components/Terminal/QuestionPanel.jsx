import React, { useState } from "react";
import { useGameState } from "../../context/GameStateContext";
import { ArrowRight } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import ResourceViewer from "./ResourceViewer";
import GuidelinesViewer from "./GuidelinesViewer";
import FaqViewer from "./FaqViewer";

const PANES = [
  ["nav", "MISSION"],
  ["brief", "BRIEFING"],
  ["hints", "HINTS"],
];

export default function QuestionPanel() {
  const { setIsTerminalOpen, activeTab } = useGameState();
  const [pane, setPane] = useState("brief");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:gap-3">
      <div className="mb-2 grid shrink-0 grid-cols-3 gap-1 lg:hidden" role="tablist" aria-label="Arena panels">
        {PANES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pane === id}
            onClick={() => setPane(id)}
            className={`min-h-11 border font-orbitron text-[10px] tracking-[0.16em] ${
              pane === id
                ? "border-accretion bg-accretion/15 text-accretion"
                : "border-accretion/25 text-copper"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`${pane === "nav" ? "flex min-h-0 flex-1 flex-col" : "hidden"} lg:flex lg:w-56 lg:shrink-0 lg:flex-col xl:w-64`}>
        <LeftSidebar onNavigate={() => setPane("brief")} />
      </div>

      <div
        className={`${
          pane === "brief" ? "flex" : "hidden"
        } panel min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 lg:flex`}
      >
        {activeTab === "guidelines" ? (
          <GuidelinesViewer />
        ) : activeTab === "faq" ? (
          <FaqViewer />
        ) : (
          <ResourceViewer />
        )}

        <div className="mt-3 shrink-0 sm:mt-4">
          <button
            type="button"
            onClick={() => setIsTerminalOpen(true)}
            className="group flex min-h-12 w-full items-center justify-between gap-3 border border-accretion px-3 py-3 font-orbitron text-[11px] uppercase tracking-[0.14em] text-accretion transition hover:bg-accretion hover:text-black sm:px-4 sm:text-sm sm:tracking-[0.2em]"
          >
            <span className="text-left">Initialize Submission Terminal</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className={`${pane === "hints" ? "flex min-h-0 flex-1 flex-col" : "hidden"} lg:flex lg:w-56 lg:shrink-0 lg:flex-col xl:w-64`}>
        <RightSidebar />
      </div>
    </div>
  );
}

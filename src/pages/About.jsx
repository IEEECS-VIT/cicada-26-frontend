import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import DashboardBackground from "../components/DashboardBackground";
import {
  Globe,
  Layers,
  Radio,
  MessageSquare,
  Terminal,
  Clock,
  FoldVertical,
  RadioTower,
} from "lucide-react";

const EVENT_FLOW_STEPS = [
  {
    number: "01",
    title: "Website Access",
    icon: Globe,
    text: "Participants will receive access to the CICADA 2067 website at the beginning of the event.",
  },
  {
    number: "02",
    title: "Central Platform",
    icon: Terminal,
    text: "The website will serve as the primary platform for accessing challenges, entering answers, progressing through checkpoints, and receiving event updates.",
  },
  {
    number: "03",
    title: "Three Rounds of Challenges",
    icon: Layers,
    text: "Participants will progress through three rounds of challenges, with each round introducing increasingly difficult puzzles.",
  },
  {
    number: "04",
    title: "Simultaneous Hints",
    icon: Radio,
    text: "Hints cannot be individually requested. Standardised hints will be released to all participants simultaneously at regular intervals.",
  },
  {
    number: "05",
    title: "Organizer Communications",
    icon: MessageSquare,
    text: "Participants may communicate with organizers through the official Discord server for doubts, technical issues, or assistance at designated checkpoints.",
  },
  {
    number: "06",
    title: "Answer Submissions",
    icon: Terminal,
    text: "Answers and submissions must be entered through the official event website unless specifically instructed otherwise.",
  },
  {
    number: "07",
    title: "Event Close",
    icon: Clock,
    text: "The competition and all submissions close at 5:00 PM.",
    highlight: true,
  },
];

// High-performance 3D accordion fold card that unfolds smoothly on scroll
function AccordionFoldCard({ step, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = step.icon;
  const initialRotateX = index % 2 === 0 ? -45 : -35;

  return (
    <div className="relative [perspective:1200px]">
      {/* Accordion hinge joint and perforation seam */}
      {index > 0 && (
        <div className="relative my-2 flex items-center justify-between px-6 py-1 opacity-80">
          <div className="h-px flex-1 border-t border-dashed border-[#e0a279]/30" />
          <div className="flex items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#a89685]">
            <span>HINGE // 0{index}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#e0a279]" />
            <span className="text-[#e0a279]">FOLD SEAM</span>
          </div>
          <div className="h-px flex-1 border-t border-dashed border-[#e0a279]/30" />
        </div>
      )}

      {/* 3D folding dossier card leaf */}
      <motion.div
        initial={{
          rotateX: initialRotateX,
          opacity: 0,
          y: -18,
        }}
        whileInView={{
          rotateX: 0,
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 0.65,
          delay: Math.min(index * 0.06, 0.3),
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformOrigin: "top center",
          willChange: "transform, opacity",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative overflow-hidden rounded-md border p-6 sm:p-7 transition-all duration-200 ${
          step.highlight
            ? "border-red-500/40 bg-[linear-gradient(150deg,rgba(40,10,12,.88)_0%,rgba(20,8,10,.92)_60%,rgba(14,6,9,.95)_100%)] shadow-[0_20px_60px_-20px_rgba(239,68,68,0.25)] hover:border-red-500/75 hover:shadow-[0_0_30px_-6px_rgba(239,68,68,.4)]"
            : isHovered
              ? "border-[#e0a279] bg-[linear-gradient(150deg,rgba(32,22,18,.92)_0%,rgba(18,12,15,.95)_60%,rgba(12,8,12,.98)_100%)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9),0_0_30px_-8px_rgba(224,162,121,.4)]"
              : "border-[#e0a279]/18 bg-[linear-gradient(150deg,rgba(28,20,16,.85)_0%,rgba(14,10,12,.9)_60%,rgba(10,7,10,.94)_100%)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)] hover:border-[#e0a279]/50"
        }`}
      >
        {/* Top edge subtle reflection */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] ${
            step.highlight
              ? "bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#e0a279]/50 to-transparent"
          }`}
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Number badge */}
          <div className="flex shrink-0 items-center gap-4">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-[3px] border font-mono text-sm font-light tracking-wider transition-all sm:h-12 sm:w-12 ${
                step.highlight
                  ? "border-red-500/60 bg-red-500/15 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                  : isHovered
                    ? "border-[#e0a279] bg-[#e0a279] text-[#0c090b] shadow-[0_0_20px_rgba(224,162,121,0.6)] font-normal"
                    : "border-[#e0a279]/45 bg-[#e0a279]/10 text-[#f3e6da]"
              }`}
            >
              {step.number}
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[#e0a279]/20 bg-[#e0a279]/5 text-[#e0a279] sm:hidden">
              <Icon className="h-4 w-4" />
            </div>
          </div>

          {/* Text body */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-['Chakra_Petch',sans-serif] text-[16px] sm:text-[18px] font-light tracking-[0.09em] text-[#f6e9dd] transition-colors duration-150 group-hover:text-[#fff3e6]">
                {step.title}
              </h3>

              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-[11px] tracking-[0.28em] text-[#a89685] sm:inline">
                  PROTOCOL // #{step.number}
                </span>

                <Icon
                  className={`hidden h-4 w-4 transition-transform duration-200 group-hover:scale-110 sm:block ${
                    step.highlight ? "text-red-400" : "text-[#e0a279]"
                  }`}
                />
              </div>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-[#eddfd3] font-light sm:text-[16px]">
              {step.text}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function About() {
  return (
    <>
      <Navbar />

      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes cd-bar { 0%, 100% { transform: scaleY(.18) } 50% { transform: scaleY(1) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div className="relative min-h-screen bg-[radial-gradient(120%_90%_at_82%_42%,#17100c_0%,#0b0709_42%,#07050a_100%)] text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif] overflow-x-hidden box-border selection:bg-[#e0a279]/30">
        {/* Optimized Dashboard Background */}
        <DashboardBackground />

        {/* HUD Corner Brackets */}
        <div
          className="pointer-events-none absolute left-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-l border-t border-[#e0a279]/50 sm:left-6 sm:h-10 sm:w-10 z-[1]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-r border-t border-[#e0a279]/50 sm:right-6 sm:h-10 sm:w-10 z-[1]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-6 left-4 h-8 w-8 border-b border-l border-[#e0a279]/50 sm:bottom-8 sm:left-6 sm:h-10 sm:w-10 z-[1]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-6 right-4 h-8 w-8 border-b border-r border-[#e0a279]/50 sm:bottom-8 sm:right-6 sm:h-10 sm:w-10 z-[1]"
          aria-hidden="true"
        />

        <main className="relative z-[2] max-w-[1280px] mx-auto w-full pt-[calc(var(--nav-height)+1rem)] px-4 sm:px-8 pb-16 flex flex-col gap-12">
          {/* Top Status & Telemetry Bar */}
          <div className="flex items-center justify-between gap-6 px-1 pt-2">
            <div className="flex items-center gap-6 sm:gap-8 font-mono">
              <div className="flex flex-col gap-1">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">TRANSMISSION</div>
                <div className="text-lg sm:text-xl font-light tracking-[0.14em] text-[#f0e2d5]">CICADA 2067</div>
              </div>
              <div className="w-px h-10 bg-[#e0a279]/18" />
              <div className="flex flex-col gap-1">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">SIGNAL</div>
                <div className="flex items-end gap-[3px] h-[22px]">
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.18s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.36s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.54s]" />
                  <span className="w-[3px] h-full bg-[#e0a279]/85 origin-bottom animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.72s]" />
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] tracking-[0.26em] text-[#e0a279]">
              <span>DECLASSIFIED DOSSIER</span>
              <span className="w-8 h-px bg-[#e0a279]/45" />
            </div>
          </div>

          {/* ================================================================
              CICADA 2067 SECTION
          ================================================================= */}
          <section className="relative w-full">
            {/* Header Title Display */}
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e0a279]/30 bg-[#e0a279]/10 px-4 py-1 font-mono text-[11px] uppercase tracking-[0.32em] text-[#e0a279]">
                <RadioTower className="h-3.5 w-3.5 animate-pulse" />
                <span>INTERSTELLAR TRANSMISSION</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <h1 className="text-[clamp(32px,6.5vw,56px)] font-light tracking-[0.09em] text-[#f6e9dd] leading-tight cursor-default transition-all duration-150 hover:text-[#fff3e6] hover:drop-shadow-[0_0_20px_rgba(224,162,121,.45)]">
                  CICADA 2067
                </h1>
                <span className="w-[9px] h-[32px] sm:h-[42px] bg-[#e0a279] animate-[cd-blink_1.15s_step-end_infinite]" />
              </div>

              <p className="mt-3 font-mono text-[15px] sm:text-[17px] font-light tracking-[0.2em] text-[#e0a279]">
                The signal was never meant to reach us.
              </p>
            </div>

            {/* Main Mission Dossier Panel */}
            <div className="relative w-full border border-[#e0a279]/18 rounded-md overflow-hidden bg-[linear-gradient(150deg,rgba(28,20,16,.85)_0%,rgba(14,10,12,.9)_60%,rgba(10,7,10,.94)_100%)] p-7 sm:p-11 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] flex flex-col gap-8">
              {/* Scanline Sweep Overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
                <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
              </div>

              {/* Dossier Header Info */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[11px] tracking-[0.32em] text-[#a89685]">MAIN ARCHIVE</div>
                <div className="flex items-center gap-3.5 font-mono text-[11px] tracking-[0.26em] text-[#e0a279]">
                  <span>RECORD CLEARANCE: PUBLIC // RECOVERED</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-[#e0a279]/50 to-transparent" />
                </div>
              </div>

              {/* Grid content panel with Dashboard cells */}
              <div className="flex flex-col gap-px bg-[#e0a279]/12">
                <div className="bg-[#0c090b]/75 p-6 sm:p-8">
                  <p className="text-base sm:text-[17px] font-light leading-relaxed text-[#eddfd3]">
                    Buried beneath layers of noise, corrupted data, fragmented
                    transmissions, and impossible patterns lies a message waiting
                    to be decoded.{" "}
                    <strong className="font-medium text-[#f6e9dd]">
                      CICADA 2067
                    </strong>{" "}
                    is an interstellar technical puzzle hunt that sends
                    participants through three increasingly difficult rounds of
                    ciphers, hidden data, digital forensics, steganography, and
                    unconventional problem-solving.
                  </p>
                </div>

                <div className="bg-[#0c090b]/75 p-6 sm:p-8 border-l-2 border-[#e0a279]">
                  <p className="font-mono text-[15px] sm:text-[17px] font-light italic leading-relaxed text-[#f3e6da] tracking-wide">
                    “Every file could be a clue. Every anomaly could be
                    intentional. Every answer takes you one step deeper into the
                    transmission.”
                  </p>
                </div>

                <div className="bg-[#0c090b]/75 p-6 sm:p-8">
                  <p className="text-base sm:text-[17px] font-light leading-relaxed text-[#d5c2b4]">
                    You are free to use every resource available to you, from
                    code and forensic tools to search engines and AI agents.
                    What matters is whether you can recognise the signal before
                    the clock runs out.
                  </p>
                </div>
              </div>

              {/* Footer status tagline */}
              <div className="flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.24em] text-[#a89685] pt-1 border-t border-[#e0a279]/15">
                <div className="flex items-center gap-2 text-[#e0a279]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e0a279] animate-pulse" />
                  <span>ALL FREQUENCIES OPEN</span>
                </div>
                <span>STATUS: ACTIVE SCAN</span>
              </div>
            </div>
          </section>

          {/* ================================================================
              EVENT FLOW SECTION
          ================================================================= */}
          <section className="relative w-full pt-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#e0a279]/30 bg-[#e0a279]/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#e0a279]">
                <FoldVertical className="h-3.5 w-3.5" />
                <span>UNFOLDING FLIGHT DOSSIER</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.09em] text-[#f6e9dd]">
                EVENT FLOW
              </h2>

              <p className="mt-2 font-mono text-[12px] sm:text-[13px] tracking-[0.24em] text-[#a89685]">
                SCROLL TO UNRAVEL PROTOCOL CHECKPOINTS
              </p>
            </div>

            {/* Accordion unfolding list */}
            <div className="space-y-1">
              {EVENT_FLOW_STEPS.map((step, index) => (
                <AccordionFoldCard
                  key={step.number}
                  step={step}
                  index={index}
                />
              ))}
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

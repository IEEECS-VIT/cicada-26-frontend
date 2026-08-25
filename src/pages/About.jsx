import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import BlackHoleBackground from "../components/BlackHoleBackground";
import {
  Globe,
  Layers,
  Radio,
  MessageSquare,
  Terminal,
  Clock,
  FoldVertical,
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

// Single Accordion Fold Card that uncreases and unfolds in 3D when scrolled down to
function AccordionFoldCard({ step, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = step.icon;

  // Alternate perspective fold angles for genuine accordion pleated fold physics
  const initialRotateX = index % 2 === 0 ? -65 : -48;

  return (
    <div className="relative [perspective:1400px]">
      {/* Accordion Hinge Joint & Perforation Line connecting each pleat */}
      {index > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          className="relative my-1 flex items-center justify-between px-6 py-1"
        >
          <div className="h-px flex-1 border-t border-dashed border-accretion/30" />
          <div className="flex items-center gap-2 px-3 font-mono text-[9px] uppercase tracking-[0.25em] text-accretion/60">
            <span>HINGE // 0{index}</span>
            <span className="h-1 w-1 rounded-full bg-accretion animate-pulse" />
            <span>FOLD SEAM</span>
          </div>
          <div className="h-px flex-1 border-t border-dashed border-accretion/30" />
        </motion.div>
      )}

      {/* 3D Folding Paper Leaf */}
      <motion.div
        initial={{
          rotateX: initialRotateX,
          opacity: 0,
          y: -24,
          scale: 0.94,
        }}
        whileInView={{
          rotateX: 0,
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.85,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1], // Smooth paper uncrease curve
        }}
        whileHover={{
          y: -4,
          scale: 1.015,
          transition: { duration: 0.25 },
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
        }}
        className={`group relative overflow-hidden rounded-xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 ${
          step.highlight
            ? "border-red-500/50 bg-gradient-to-r from-red-950/35 via-black/75 to-black/85 shadow-[0_12px_36px_rgba(239,68,68,0.25)]"
            : isHovered
            ? "border-accretion bg-black/80 shadow-[0_12px_36px_rgba(244,162,51,0.3)]"
            : "border-accretion/25 bg-black/60 hover:border-accretion/60 hover:bg-black/75 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Paper Fold Crease Shadow overlay that dissolves as it straightens */}
        <motion.div
          initial={{ opacity: 0.8 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: index * 0.1 }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-20"
        />

        {/* Top Paper Edge Light Reflection */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accretion/60 to-transparent opacity-75" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Number Badge */}
          <div className="flex items-center gap-4 shrink-0">
            <motion.span
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border font-mono text-sm font-bold transition-colors ${
                step.highlight
                  ? "border-red-500/60 bg-red-500/15 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : isHovered
                  ? "border-accretion bg-accretion text-black shadow-[0_0_20px_rgba(244,162,51,0.6)]"
                  : "border-accretion/35 bg-accretion/10 text-accretion-bright"
              }`}
            >
              {step.number}
            </motion.span>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-copper sm:hidden">
              <Icon className="h-4 w-4" />
            </div>
          </div>

          {/* Text Body */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron text-sm sm:text-base font-bold tracking-[0.14em] text-starlight group-hover:text-accretion-bright transition-colors">
                {step.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-copper/50 hidden sm:inline">
                  FOLD #{step.number}
                </span>
                <Icon
                  className={`hidden sm:block h-4 w-4 transition-transform group-hover:scale-110 ${
                    step.highlight ? "text-red-400" : "text-accretion"
                  }`}
                />
              </div>
            </div>
            <p className="mt-1.5 text-base sm:text-[17px] leading-relaxed text-copper">
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
    <div className="relative min-h-screen text-starlight selection:bg-accretion/30 selection:text-starlight font-rajdhani bg-transparent">
      {/* Black hole + Shooting star background */}
      <BlackHoleBackground />

      <Navbar />

      <main className="relative z-10 pt-[var(--nav-height)]">
        {/* ========================================================================= */}
        {/* CICADA 2067 SECTION */}
        {/* ========================================================================= */}
        <section className="relative mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-8 md:pt-20 md:pb-24 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-3 font-rajdhani text-xs font-semibold uppercase tracking-[0.4em] text-accretion sm:text-sm">
              <span className="h-px w-6 bg-accretion shadow-[0_0_8px_#F4A233]" />
              INTERSTELLAR TRANSMISSION
              <span className="h-px w-6 bg-accretion shadow-[0_0_8px_#F4A233]" />
            </p>

            <h1 className="mt-4 font-orbitron text-[clamp(2.8rem,8vw,5.5rem)] font-black tracking-[0.05em] leading-[0.95]">
              <span className="bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,162,51,0.35)]">
                CICADA 2067
              </span>
            </h1>

            <p className="mt-6 font-orbitron text-lg sm:text-xl font-bold tracking-[0.18em] text-accretion-bright">
              The signal was never meant to reach us.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-accretion/25 bg-black/60 p-6 sm:p-10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-6 text-base sm:text-lg leading-relaxed text-copper/90">
            <p>
              Buried beneath layers of noise, corrupted data, fragmented transmissions, and impossible patterns lies a message waiting to be decoded. <strong className="text-starlight font-semibold">CICADA 2067</strong> is an interstellar technical puzzle hunt that sends participants through three increasingly difficult rounds of ciphers, hidden data, digital forensics, steganography, and unconventional problem-solving.
            </p>

            <p className="border-l-2 border-accretion pl-4 sm:pl-6 text-starlight font-medium italic">
              Every file could be a clue. Every anomaly could be intentional. Every answer takes you one step deeper into the transmission.
            </p>

            <p className="text-copper">
              You are free to use every resource available to you, from code and forensic tools to search engines and AI agents. What matters is whether you can recognise the signal before the clock runs out.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EVENT FLOW (ACCORDION UNFOLD ON SCROLL) */}
        {/* ========================================================================= */}
        <section className="relative border-t border-accretion/20 bg-black/40 py-16 sm:py-24 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-14"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-accretion/30 bg-accretion/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.28em] text-accretion mb-3">
                <FoldVertical className="h-3.5 w-3.5" />
                <span>UNFOLDING FLIGHT DOSSIER</span>
              </div>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-black tracking-[0.08em] text-starlight">
                EVENT FLOW
              </h2>
              <p className="mt-2 text-sm text-copper/70 font-mono tracking-wider">
                SCROLL TO UNRAVEL PROTOCOL CHECKPOINTS
              </p>
            </motion.div>

            {/* Accordion Unfolding List */}
            <div className="space-y-0.5">
              {EVENT_FLOW_STEPS.map((step, index) => (
                <AccordionFoldCard
                  key={step.number}
                  step={step}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import BlackHoleBackground from "../components/BlackHoleBackground";
import { Sparkles, Globe, Layers, Radio, MessageSquare, Terminal, Clock } from "lucide-react";

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

export default function About() {
  return (
    <div className="relative min-h-screen bg-black text-starlight selection:bg-accretion/30 selection:text-starlight font-rajdhani">
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
        {/* EVENT FLOW SECTION */}
        {/* ========================================================================= */}
        <section className="relative border-t border-accretion/20 bg-black/65 py-16 sm:py-24 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-2xl mx-auto">
              <p className="font-rajdhani text-xs font-semibold uppercase tracking-[0.38em] text-accretion">
                CHECKPOINTS & PROTOCOL
              </p>
              <h2 className="mt-2 font-orbitron text-3xl sm:text-4xl font-black tracking-[0.08em] text-starlight">
                EVENT FLOW
              </h2>
            </div>

            <div className="mt-12 space-y-4 sm:space-y-5">
              {EVENT_FLOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${step.highlight
                      ? "border-red-500/40 bg-gradient-to-r from-red-950/25 via-black/80 to-black/90 shadow-[0_0_24px_rgba(239,68,68,0.15)]"
                      : "border-accretion/25 bg-black/70 hover:border-accretion/50 hover:bg-black/85 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                      }`}
                  >
                    {/* Number Badge */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border font-mono text-sm font-bold ${step.highlight
                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-accretion/30 bg-accretion/10 text-accretion-bright"
                          }`}
                      >
                        {step.number}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-copper sm:hidden">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Text Body */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-orbitron text-sm font-bold tracking-[0.14em] text-starlight">
                          {step.title}
                        </h3>
                        <Icon
                          className={`hidden sm:block h-4 w-4 ${step.highlight ? "text-red-400" : "text-accretion"
                            }`}
                        />
                      </div>
                      <p className="mt-1.5 text-base sm:text-[17px] leading-relaxed text-copper">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

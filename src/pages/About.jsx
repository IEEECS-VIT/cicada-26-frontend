import { useEffect, useRef } from "react";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import DashboardBackground from "../components/DashboardBackground";

const ACCENT = "#e0a279";

const EVENT_FLOW_STEPS = [
  {
    number: "01",
    title: "Website Access",
    text: "Participants will receive access to the CICADA 2067 website at the beginning of the event.",
  },
  {
    number: "02",
    title: "Central Platform",
    text: "The website will serve as the primary platform for accessing challenges, entering answers, progressing through checkpoints, and receiving event updates.",
  },
  {
    number: "03",
    title: "Three Rounds of Challenges",
    text: "Participants will progress through three rounds of challenges, with each round introducing increasingly difficult puzzles.",
  },
  {
    number: "04",
    title: "Simultaneous Hints",
    text: "Hints cannot be individually requested. Standardised hints will be released to all participants simultaneously at regular intervals.",
  },
  {
    number: "05",
    title: "Organizer Communications",
    text: "Participants may communicate with organizers through the official Discord server for doubts, technical issues, or assistance at designated checkpoints.",
  },
  {
    number: "06",
    title: "Answer Submissions",
    text: "Answers and submissions must be entered through the official event website unless specifically instructed otherwise.",
  },
  {
    number: "07",
    title: "Event Close",
    text: "The competition and all submissions close at 5:00 PM.",
    highlight: true,
  },
];

export default function About() {
  const clockRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      if (clockRef.current) {
        clockRef.current.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      }
    };
    tick();
    const timer = setInterval(tick, 1000);

    const sigilVideo = videoRef.current;
    const kick = () => {
      if (!sigilVideo) return;
      const play = sigilVideo.play();
      if (play) play.catch(() => {});
    };
    kick();
    sigilVideo?.addEventListener("canplay", kick, { once: true });
    const kickEvents = ["pointerdown", "keydown"];
    kickEvents.forEach((evt) => document.addEventListener(evt, kick, { once: true, passive: true }));

    return () => {
      clearInterval(timer);
      sigilVideo?.removeEventListener("canplay", kick);
      kickEvents.forEach((evt) => document.removeEventListener(evt, kick));
    };
  }, []);

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes cd-bar { 0%, 100% { transform: scaleY(.18) } 50% { transform: scaleY(1) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
        @keyframes cd-glow { 0%, 100% { opacity: .32; transform: scale(1) } 50% { opacity: .6; transform: scale(1.06) } }
      `}</style>
      <div
        className="relative min-h-screen bg-[radial-gradient(120%_90%_at_82%_42%,#17100c_0%,#0b0709_42%,#07050a_100%)] text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif] overflow-x-hidden box-border selection:bg-[#e0a279]/30"
        style={{ "--acc": ACCENT }}
      >
        <DashboardBackground />

        <div className="pointer-events-none absolute left-4 top-[calc(var(--nav-height)+1rem)] z-[1] h-8 w-8 border-l border-t border-[#e0a279]/50 sm:left-6 sm:h-10 sm:w-10" aria-hidden="true" />
        <div className="pointer-events-none absolute right-4 top-[calc(var(--nav-height)+1rem)] z-[1] h-8 w-8 border-r border-t border-[#e0a279]/50 sm:right-6 sm:h-10 sm:w-10" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-6 left-4 z-[1] hidden h-8 w-8 border-b border-l border-[#e0a279]/50 sm:left-6 sm:h-10 sm:w-10 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-6 right-4 z-[1] hidden h-8 w-8 border-b border-r border-[#e0a279]/50 sm:right-6 sm:h-10 sm:w-10 lg:block" aria-hidden="true" />

        <main className="relative z-[2] mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 pb-16 pt-[calc(var(--nav-height)+1rem)] sm:px-8 sm:pb-20">
          <div className="flex items-center justify-between gap-6 px-1">
            <div className="flex items-center gap-6 font-mono sm:gap-8">
              <div className="flex flex-col gap-1">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">SHIP TIME</div>
                <div ref={clockRef} className="text-xl font-light tracking-[0.14em] text-[#f0e2d5] sm:text-2xl">
                  --:--:--
                </div>
              </div>
              <div className="h-10 w-px bg-[#e0a279]/18" />
              <div className="flex flex-col gap-1">
                <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">SIGNAL</div>
                <div className="flex h-[22px] items-end gap-[3px]">
                  <span className="h-full w-[3px] origin-bottom bg-[#e0a279]/85 animate-[cd-bar_1.4s_ease-in-out_infinite]" />
                  <span className="h-full w-[3px] origin-bottom bg-[#e0a279]/85 animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.18s]" />
                  <span className="h-full w-[3px] origin-bottom bg-[#e0a279]/85 animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.36s]" />
                  <span className="h-full w-[3px] origin-bottom bg-[#e0a279]/85 animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.54s]" />
                  <span className="h-full w-[3px] origin-bottom bg-[#e0a279]/85 animate-[cd-bar_1.4s_ease-in-out_infinite] [animation-delay:0.72s]" />
                </div>
              </div>
            </div>
            <div className="hidden flex-col items-end gap-1 font-mono sm:flex">
              <div className="text-[11px] tracking-[0.28em] text-[#b3a191]">FILE</div>
              <div className="text-[12px] tracking-[0.22em] text-[#e0a279]">ABOUT / OPEN</div>
            </div>
          </div>

          <section className="relative grid w-full grid-cols-1 gap-px overflow-hidden rounded-md border border-[#e0a279]/18 bg-[#e0a279]/14 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] animate-[cd-rise_.9s_ease-out_both] md:grid-cols-[1.55fr_0.95fr] [@media(prefers-reduced-motion:reduce)]:animate-none">
            <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
              <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
            </div>

            <div className="relative flex flex-col justify-between gap-7 bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)] p-8 sm:p-11">
              <div className="flex flex-col gap-3.5">
                <div className="font-mono text-[11px] tracking-[0.32em] text-[#a89685]">TRANSMISSION</div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-[clamp(26px,5vw,42px)] font-light leading-none tracking-[0.09em] text-[#f6e9dd]">
                    CICADA 2067
                  </h1>
                  <span className="h-[26px] w-[9px] bg-[#e0a279] animate-[cd-blink_1.15s_step-end_infinite]" />
                </div>
                <div className="flex items-center gap-3.5 font-mono text-[11px] tracking-[0.26em] text-[#e0a279]">
                  <span>THE SIGNAL WAS NEVER MEANT TO REACH US</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[#e0a279]/50 to-transparent" />
                </div>
              </div>

              <div className="space-y-5 text-[15px] font-light leading-7 tracking-[0.02em] text-[#d5c2b4] sm:text-[16px] sm:leading-8">
                <p>
                  Buried beneath layers of noise, corrupted data, fragmented transmissions, and impossible patterns lies a
                  message waiting to be decoded.{" "}
                  <strong className="font-medium text-[#f6e9dd]">CICADA 2067</strong> is an interstellar technical puzzle hunt
                  that sends participants through three increasingly difficult rounds of ciphers, hidden data, digital
                  forensics, steganography, and unconventional problem-solving.
                </p>
                <p className="border-l border-[#e0a279]/55 pl-4 text-[#f0e2d5] sm:pl-5">
                  Every file could be a clue. Every anomaly could be intentional. Every answer takes you one step deeper
                  into the transmission.
                </p>
                <p>
                  You are free to use every resource available to you, from code and forensic tools to search engines and
                  AI agents. What matters is whether you can recognise the signal before the clock runs out.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-7 bg-[linear-gradient(200deg,rgba(18,13,14,.7)_0%,rgba(9,6,9,.82)_100%)] p-8 sm:p-11">
              <div className="relative flex h-[190px] w-[190px] flex-none items-center justify-center sm:h-[210px] sm:w-[210px]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(232,168,116,.16),transparent_66%)] animate-[cd-glow_7s_ease-in-out_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
                <video
                  ref={videoRef}
                  className="pointer-events-none absolute -inset-[32px] h-[calc(100%+64px)] w-[calc(100%+64px)] rounded-full object-cover mix-blend-screen contrast-[1.08] sepia-[.34] saturate-[1.55] brightness-[1.04] -hue-rotate-[8deg] [mask-image:radial-gradient(circle_closest-side_at_50%_50%,#000_54%,transparent_100%)] [-webkit-mask-image:radial-gradient(circle_closest-side_at_50%_50%,#000_54%,transparent_100%)]"
                  src="/assets/dashboard-blackhole.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-hidden="true"
                />
                <div className="absolute inset-0 rounded-full border border-[#e0a279]/20" />
                <div className="absolute inset-[22px] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-[#e0a279]/30" />
              </div>

              <div className="grid w-full max-w-[260px] grid-cols-1 gap-px bg-[#e0a279]/12">
                <div className="flex flex-col gap-1.5 bg-[#0c090b]/55 px-5 py-4 text-center">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">ROUNDS</div>
                  <div className="font-mono text-[17px] font-light tracking-[0.12em] text-[#eddfd3]">03</div>
                </div>
                <div className="flex flex-col gap-1.5 bg-[#0c090b]/55 px-5 py-4 text-center">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">HINTS</div>
                  <div className="font-mono text-[17px] font-light tracking-[0.12em] text-[#eddfd3]">SIMULTANEOUS</div>
                </div>
                <div className="flex flex-col gap-1.5 bg-[#0c090b]/55 px-5 py-4 text-center">
                  <div className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">CLOSE</div>
                  <div className="font-mono text-[17px] font-light tracking-[0.12em] text-[#eddfd3]">17:00</div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-md border border-[#e0a279]/18 bg-[#e0a279]/14 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] animate-[cd-rise_.9s_ease-out_both] [animation-delay:120ms] [@media(prefers-reduced-motion:reduce)]:animate-none">
            <div className="bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)]">
              <div className="flex flex-col gap-3 border-b border-[#e0a279]/14 px-8 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-11">
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[11px] tracking-[0.32em] text-[#a89685]">PROTOCOL</div>
                  <h2 className="text-[clamp(22px,3.4vw,32px)] font-light tracking-[0.12em] text-[#f6e9dd]">EVENT FLOW</h2>
                </div>
                <div className="font-mono text-[11px] tracking-[0.22em] text-[#b3a191]">07 CHECKPOINTS · HARD LOCK AT 17:00</div>
              </div>

              <div className="relative">
                <span
                  className="pointer-events-none absolute bottom-10 left-[3.85rem] top-10 hidden w-px bg-gradient-to-b from-[#e0a279]/35 via-[#e0a279]/18 to-[#e0a279]/08 sm:block"
                  aria-hidden="true"
                />
                <ol className="m-0 list-none p-0">
                  {EVENT_FLOW_STEPS.map((step) => (
                    <li
                      key={step.number}
                      className={`grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 border-b border-[#e0a279]/10 px-8 py-6 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,13rem)_1fr] sm:gap-x-8 sm:px-11 sm:py-7 ${
                        step.highlight ? "bg-[linear-gradient(90deg,rgba(160,48,32,.16),transparent_62%)]" : ""
                      }`}
                    >
                      <span
                        className={`relative z-[1] flex h-10 w-10 items-center justify-center border font-mono text-[12px] tracking-[0.12em] ${
                          step.highlight
                            ? "border-[#e07a62]/70 bg-[#e07a62]/15 text-[#f3b8a8]"
                            : "border-[#e0a279]/40 bg-[#0c090b]/70 text-[#e0a279]"
                        }`}
                      >
                        {step.number}
                      </span>
                      <h3
                        className={`self-center font-mono text-[13px] tracking-[0.16em] sm:self-start sm:pt-2 sm:text-[14px] ${
                          step.highlight ? "text-[#f3b8a8]" : "text-[#e0a279]"
                        }`}
                      >
                        {step.title.toUpperCase()}
                      </h3>
                      <p className="col-span-2 max-w-3xl text-[15px] font-light leading-7 text-[#d5c2b4] sm:col-span-1 sm:pt-1.5 sm:text-[16px] sm:leading-8">
                        {step.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

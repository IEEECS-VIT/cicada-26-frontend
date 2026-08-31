import { lazy, Suspense, useEffect, useRef, useState } from "react";

const TarsWidget = lazy(() => import("./TarsWidget"));

const FAQ_ITEMS = [
  {
    id: "001",
    question: "WHERE WILL THE EVENT TAKE PLACE?",
    answer:
      "The challenge will primarily run through the official CICADA 2067 website. Participants should keep the website accessible throughout the event for challenges, submissions, checkpoints, hints, and announcements.",
  },
  {
    id: "002",
    question: "WHAT IF I FACE A PROBLEM WITH THE WEBSITE?",
    answer:
      "For login issues, broken pages, submission errors, or other technical problems, contact the organizers immediately through the official Discord server.",
  },
  {
    id: "003",
    question: "HOW MANY SUBMISSIONS ARE ALLOWED?",
    answer:
      "The number of submissions allowed may differ between challenges.\nThe submission limit for each challenge will be specified along with the challenge itself on the website.",
  },
  {
    id: "004",
    question: "HOW DO HINTS WORK?",
    answer:
      "Participants cannot request hints individually.\nStandardised hints will be released to all participants simultaneously at regular intervals throughout each round.",
  },
  {
    id: "005",
    question: "WHAT IS THE EVENT TIMELINE?",
    list: [
      "10:00 AM – 1:00 PM: Round 1",
      "1:00 PM – 2:00 PM: Break",
      "2:00 PM – 3:30 PM: Round 2",
      "3:30 PM – 5:00 PM: Round 3",
      "5:00 PM: Competition ends",
      "5:00 PM – 6:00 PM: Result verification, winner announcement, prize distribution, and closing",
    ],
    note: "The event concludes by 6:00 PM.",
  },
  {
    id: "006",
    question: "HOW DO WE COMMUNICATE WITH THE ORGANIZERS?",
    answer: "There are two primary communication channels:",
    list: [
      "Website: Challenges, submissions, checkpoints, hints, and official event information.",
      "Discord: Doubts, technical issues, checkpoint communication, and contacting organizers.",
    ],
    note: "Important announcements may also be communicated through Discord during the event.",
  },
  {
    id: "007",
    question: "CAN WE SKIP A CHALLENGE?",
    answer:
      "Unless explicitly stated otherwise, participants must complete the required challenge or checkpoint before progressing further.",
  },
  {
    id: "008",
    question: "CAN WE USE EXTERNAL RESOURCES OR AI?",
    answer: "Yes. Participants are allowed to use any resource at their disposal, including:",
    list: [
      "Search engines and online resources",
      "Programming and analysis tools",
      "AI agents and AI assistants",
      "Cryptography, steganography, image, audio, and forensic tools",
      "Any other software or technical resources that may assist in solving the challenges",
    ],
    note: "However, sharing answers, flags, or challenge solutions with other competing teams is prohibited.",
  },
  {
    id: "009",
    question: "WHAT HAPPENS IF TWO TEAMS FINISH AT THE SAME TIME?",
    answer:
      "Final rankings will be determined according to the official scoring and tie-breaking criteria established by the organizers.",
  },
  {
    id: "010",
    question: "WHAT SHOULD WE DO AFTER REACHING A CHECKPOINT?",
    answer:
      "Follow the instructions displayed on the website. If organizer verification is required, contact the designated coordinator through Discord before continuing.",
  },
];

const TARS_MQ = "(min-width: 1024px)";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showTars, setShowTars] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mq = window.matchMedia(TARS_MQ);
    let observer;

    const sync = () => {
      if (!mq.matches) {
        setShowTars(false);
        observer?.disconnect();
        observer = undefined;
        return;
      }
      if (observer) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShowTars(true);
            observer?.disconnect();
            observer = undefined;
          }
        },
        { rootMargin: "300px" }
      );
      observer.observe(el);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#faq") return;
    const jump = () =>
      sectionRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    const frame = requestAnimationFrame(jump);
    const timer = window.setTimeout(jump, 400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  const toggleFaq = (index) => {
    const nextIndex = openIndex === index ? null : index;
    setOpenIndex(nextIndex);
    if (!showTars) return;
    window.dispatchEvent(
      new CustomEvent("tars-interaction", { detail: { active: nextIndex !== null } })
    );
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="faq-section relative z-[2] overflow-hidden px-[clamp(20px,5vw,64px)] py-[clamp(64px,12vw,128px)] font-mono text-starlight [scroll-margin-top:var(--nav-height)]"
      aria-labelledby="faq-heading"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_0,oklch(0.11_0.006_60)_220px,oklch(0.11_0.006_60)_calc(100%-96px),#000_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 scale-105 opacity-[0.28] blur-[3px] [mask-image:linear-gradient(to_bottom,transparent_0,#000_220px)]"
        aria-hidden="true"
      >
        <img src="/assets/891208.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.11_0.006_60)_0%,oklch(0.11_0.006_60/0.35)_38%,oklch(0.11_0.006_60)_78%,#000_100%)]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background:linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_2px,3px_100%] [mask-image:linear-gradient(to_bottom,transparent_0,#000_220px)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-[clamp(40px,7vw,72px)] text-center">
          <p className="mb-3.5 text-[11px] uppercase tracking-[0.3em] text-accretion/70">// DATA_ARCHIVE_ACCESS</p>
          <h2 id="faq-heading" className="m-0 font-orbitron text-[clamp(1.5rem,5vw,2.4rem)] font-light uppercase tracking-[0.12em] text-starlight/60">
            COMMON DECRYPTED SIGNALS
          </h2>
          <div className="mt-[18px] flex justify-center gap-2" aria-hidden="true">
            <span className="h-1.5 w-1.5 bg-accretion" />
            <span className="h-1.5 w-1.5 bg-accretion" />
            <span className="h-1.5 w-1.5 bg-accretion" />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-[clamp(32px,5vw,56px)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-[clamp(48px,6vw,96px)]">
          <div className="hidden flex-col items-center lg:flex">
            {showTars && (
              <div className="hidden w-full flex-col items-center lg:flex">
                <div className="relative h-[clamp(360px,45vw,560px)] w-full">
                  <Suspense fallback={null}>
                    <TarsWidget />
                  </Suspense>
                </div>
                <div className="mt-3.5 text-[11px] tracking-[0.2em] text-accretion">TARS</div>
              </div>
            )}

          </div>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`border bg-black/55 transition ${isOpen ? "border-accretion/50" : "border-white/10 hover:border-white/20"
                    }`}
                >
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-3.5 px-4 py-4 text-left font-[inherit] text-inherit md:px-5"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="shrink-0 text-[11px] tracking-[0.14em] text-accretion/70">{item.id}</span>
                    <span className="flex-1 text-xs uppercase leading-5 tracking-[0.1em] text-starlight md:text-[13px]">{item.question}</span>
                    <span
                      className={`relative h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-[135deg]" : ""}`}
                      aria-hidden="true"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-accretion" />
                      <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rotate-90 bg-accretion" />
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mx-4 mb-5 border-l border-accretion/50 py-0 pl-4 pt-3.5 text-[12.5px] leading-7 text-copper md:mx-5">
                        {item.answer && (
                          <p className="whitespace-pre-line">{item.answer}</p>
                        )}
                        {item.list && (
                          <ul className="list-disc pl-5 py-1">
                            {item.list.map((listItem) => (
                              <li key={listItem} className="py-0.5">{listItem}</li>
                            ))}
                          </ul>
                        )}
                        {item.note && (
                          <p className="mt-1 whitespace-pre-line text-copper/90">{item.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
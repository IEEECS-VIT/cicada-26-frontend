import { lazy, Suspense, useEffect, useRef, useState } from "react";

const TarsWidget = lazy(() => import("./TarsWidget"));

const FAQ_ITEMS = [
  {
    id: "001",
    question: "WHAT IS CICADA 2067?",
    answer:
      "CICADA 2067 is a cryptic puzzle-solving competition organized by the IEEE Computer Society. Participants work in teams to solve a series of interconnected puzzles that test their logical reasoning, creativity, observation, and problem-solving skills.",
  },
  {
    id: "002",
    question: "WHO CAN PARTICIPATE?",
    answer:
      "The event is open to all eligible students (according to the event rules). Whether you're a beginner or an experienced puzzle solver, everyone is welcome.",
  },
  {
    id: "003",
    question: "DO I NEED PRIOR EXPERIENCE?",
    answer:
      "No. While experience with puzzles can be helpful, the event is designed so that anyone with curiosity and logical thinking can participate.",
  },
  {
    id: "004",
    question: "IS PARTICIPATION INDIVIDUAL OR IN TEAMS?",
    answer: "Participation is in teams only.",
  },
  {
    id: "005",
    question: "WILL HINTS BE PROVIDED?",
    answer:
      "Hints may be released after specific intervals or may carry a score penalty, depending on the rules.",
  },
  {
    id: "006",
    question: "WILL OD BE PROVIDED?",
    answer:
      "Yes, OD will be provided to the participants if they report to the venue on time and record their attendance.",
  },
  {
    id: "007",
    question: "WHAT SHOULD PARTICIPANTS BRING?",
    list: [
      "A fully charged laptop",
      "Stable internet connection",
      "Pen and paper for rough work",
      "Student ID",
    ],
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
                <div className="relative h-[clamp(320px,40vw,500px)] w-full">
                  <Suspense fallback={null}>
                    <TarsWidget />
                  </Suspense>
                </div>
                <div className="mt-3.5 text-[11px] tracking-[0.2em] text-accretion">TARS</div>
              </div>
            )}
            <dl className="mt-8 w-full border-t border-white/10 pt-7 text-xs uppercase tracking-[0.14em] text-copper/60">
              <div className="mb-4">METADATA_HEADER:</div>
              <div className="flex gap-2 py-0.5"><dt>FILE_NAME:</dt><dd className="m-0 text-accretion/70">FAQ_HUNT.DAT</dd></div>
              <div className="flex gap-2 py-0.5"><dt>SIZE:</dt><dd className="m-0 text-accretion/70">128.4 KB</dd></div>
              <div className="flex gap-2 py-0.5"><dt>ENCRYPTION:</dt><dd className="m-0 text-accretion/70">AES-XTS-512</dd></div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`border bg-black/55 transition ${
                    isOpen ? "border-accretion/50" : "border-white/10 hover:border-white/20"
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
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      {item.answer && (
                        <p className="mx-4 mb-5 border-l border-accretion/50 py-0 pl-4 pt-3.5 text-[12.5px] leading-7 text-copper md:mx-5">
                          {item.answer}
                        </p>
                      )}
                      {item.list && (
                        <ul className="mx-4 mb-5 list-disc border-l border-accretion/50 py-0 pl-8 pt-3.5 text-[12.5px] leading-7 text-copper md:mx-5">
                          {item.list.map((listItem) => (
                            <li key={listItem} className="py-0.5">{listItem}</li>
                          ))}
                        </ul>
                      )}
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
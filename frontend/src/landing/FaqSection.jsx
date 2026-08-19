import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "../styles/faq.css";

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

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showTars, setShowTars] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !window.matchMedia("(min-width: 768px)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTars(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
    window.dispatchEvent(
      new CustomEvent("tars-interaction", { detail: { active: nextIndex !== null } })
    );
  };

  return (
    <section ref={sectionRef} id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-bg" aria-hidden="true">
        <img
          src="/landing/891208.jpg"
          alt=""
          style={{ objectFit: "cover", position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <div className="faq-bg__wash" />
      </div>
      <div className="faq-scanline" aria-hidden="true" />

      <div className="faq-inner">
        <header className="faq-header">
          <p className="faq-eyebrow">// DATA_ARCHIVE_ACCESS</p>
          <h2 id="faq-heading" className="faq-title">COMMON DECRYPTED SIGNALS</h2>
          <div className="faq-pips" aria-hidden="true">
            <span /><span /><span />
          </div>
        </header>

        <div className="faq-grid">
          <div className="faq-aside">
            {showTars && (
              <>
                <div className="faq-tars">
                  <Suspense fallback={null}>
                    <TarsWidget />
                  </Suspense>
                </div>
                <div className="faq-tars-label">TARS</div>
              </>
            )}
            <dl className="faq-meta">
              <div className="faq-meta__head">METADATA_HEADER:</div>
              <div className="faq-meta__row"><dt>FILE_NAME:</dt><dd>FAQ_HUNT.DAT</dd></div>
              <div className="faq-meta__row"><dt>SIZE:</dt><dd>128.4 KB</dd></div>
              <div className="faq-meta__row"><dt>ENCRYPTION:</dt><dd>AES-XTS-512</dd></div>
            </dl>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.id} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
                  <button
                    type="button"
                    className="faq-item__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="faq-item__id">{item.id}</span>
                    <span className="faq-item__q">{item.question}</span>
                    <span className="faq-item__glyph" aria-hidden="true" />
                  </button>

                  <div className="faq-item__detail" id={`faq-panel-${item.id}`} role="region">
                    <div className="faq-item__detail-inner">
                      {item.answer && <p className="faq-item__answer">{item.answer}</p>}
                      {item.list && (
                        <ul className="faq-item__answer faq-item__answer--list">
                          {item.list.map((listItem) => (
                            <li key={listItem}>{listItem}</li>
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
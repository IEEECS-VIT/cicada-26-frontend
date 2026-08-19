"use client";

/*
 * FaqSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * Ported from the standalone FAQ app (FAQs/src/Components/Footer).
 * Replaces the old "TRANSMISSION HORIZON" closing screen.
 *
 * TWO THINGS THAT ARE NOT COSMETIC:
 *  1. The section MUST paint an opaque background and sit above
 *     z-index 0. #tunnel-canvas is position:fixed and stays mounted for
 *     the life of the page — an unpainted section lets the tunnel show
 *     straight through it.
 *  2. The source's scanline and background layers were `fixed inset-0`.
 *     Left that way they cover the whole viewport for the entire page,
 *     not just this section. Both are `absolute` here.
 *
 * Colours come from timeline.css's :root tokens rather than the source's
 * hard-coded hexes, so this reads as the same site as the tunnel above it.
 * ─────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import "@/app/faq.css";

/* Second WebGL context — see the note in TarsWidget.tsx */
const TarsWidget = dynamic(() => import("./TarsWidget"), {
  ssr: false,
  loading: () => null,
});

interface FaqItem {
  id: string;
  question: string;
  answer?: string;
  list?: string[];
}

const FAQ_ITEMS: FaqItem[] = [
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showTars, setShowTars] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* TARS is desktop-only and deferred: it's a second live WebGL context next
     to the tunnel's, at the very bottom of a long page. No reason to build it
     until the section is actually approaching. */
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

  /* Arriving from another route via /#faq, the browser resolves the hash at
     navigation time — before lib/tunnel.ts has sized .tunnel-track to 636dvh.
     The FAQ is ~5000px lower once that lands, so the native jump falls far
     short. Re-run it after layout settles: once on the next frame, and again
     at 400ms to catch late image/font reflow. scroll-margin-top on
     .faq-section (app/faq.css) keeps it clear of the fixed navbar. The
     navbar's same-page click path doesn't come through here — it re-measures
     per frame instead (see Navbar.tsx). */
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

  const toggleFaq = (index: number) => {
    const nextIndex = openIndex === index ? null : index;
    setOpenIndex(nextIndex);
    /* Opening a question sets TARS walking; closing the last one settles it */
    window.dispatchEvent(
      new CustomEvent("tars-interaction", { detail: { active: nextIndex !== null } })
    );
  };

  return (
    /* id: target of the navbar's FAQs link. The .faq-section CLASS must stay —
       lib/tunnel.ts finds this node by that selector to drive its exit fade. */
    <section ref={sectionRef} id="faq" className="faq-section" aria-labelledby="faq-heading">
      {/* Background — reuses the hero's image, already fetched and cached, so
          the end of the page ties back to its opening at zero extra bytes.
          That claim depends on this quality matching app/page.tsx's hero
          <Image>: quality lands in the /_next/image query string, and a
          different q= is a different URL, i.e. a second full fetch.

          75 because that is the only value next.config.js allows. Next 16
          gates /_next/image on `images.qualities`, which defaults to [75] and
          400s anything else; the client loader silently coerces the prop to
          the nearest allowed value. This read 60 against the hero's 90 and
          both were being served as 75 regardless — declaring 75 is just the
          declaration catching up with what ships. To actually raise it, add
          the value to `images.qualities` and change BOTH call sites. */}
      <div className="faq-bg" aria-hidden="true">
        <Image src="/891208.jpg" alt="" fill sizes="100vw" quality={75} style={{ objectFit: "cover" }} />
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
          {/* Left — TARS + file metadata */}
          <div className="faq-aside">
            {showTars && (
              <>
                <div className="faq-tars">
                  <TarsWidget />
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

          {/* Right — accordions */}
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
                    {/* CSS glyph: a + that rotates 45deg into an x when open.
                        The source used the Material Symbols webfont for this. */}
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

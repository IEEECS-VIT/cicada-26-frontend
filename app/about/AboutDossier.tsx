"use client";

/*
 * AboutDossier.tsx — the /about page body
 * ─────────────────────────────────────────────────────────────────
 * A mission dossier: what Cicada 2067 is, what it costs a
 * participant, and how to take part. Eight sections, eight
 * different layouts, so no two read as the same template.
 *
 * CONTENT RULE: nothing here is invented. Every claim is either
 * derived from FAQ_ITEMS (components/FaqSection.tsx), from ROUNDS
 * (lib/rounds.ts), or sits in the EVENT block below as a TBD. If
 * you need to state something new about the event, add it to EVENT
 * rather than writing it inline, so there is one place to audit.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { ROUNDS, statusClass } from "@/lib/rounds";

/*
 * THE ONLY PLACE REAL-WORLD LOGISTICS LIVE.
 * Swap a TBD for a real value and the page updates everywhere it appears.
 * Anything left as TBD renders dimmed (.ad-tbd) rather than blank.
 */
const EVENT = {
  organiser: "IEEE Computer Society, VIT",
  dates: "TBD",
  venue: "TBD",
  teamSize: "TBD",
  entry: "TBD",
  prizePool: "TBD",
  /* Registration portal. The home hero's CTA points at /puzzles today
     (components/HeroSection.tsx); change both together if that moves. */
  registerHref: "/login",
  discordHref: "/discord",
};

const TBD = "TBD";

/* Small helper so a pending value is styled consistently everywhere. */
function Value({ children }: { children: string }) {
  return children === TBD ? <span className="ad-tbd">PENDING</span> : <>{children}</>;
}

/* The five things a participant actually does, in order. Verb-noun labels:
   the step content is the label, so no "Stage 1 / Stage 2" scaffolding. */
const STEPS: [string, string][] = [
  [
    "REGISTER",
    "Sign up with your team before entries close. You get the credentials that let you into the hunt portal.",
  ],
  [
    "ASSEMBLE",
    "Lock your crew. Participation is in teams only, so bring people who notice things and argue well.",
  ],
  [
    "DECODE",
    "Each round drops a set of interconnected puzzles. They are meant to be solved in order, because every answer feeds the next one.",
  ],
  [
    "SUBMIT",
    "Enter each solution in the portal. Hints may open on a timer or cost you points, depending on the round.",
  ],
  [
    "ADVANCE",
    "Clear the round and the next coordinate unlocks. Six rounds stand between the first transmission and the final descent.",
  ],
];

/* Straight from FAQ_ITEMS 007 in components/FaqSection.tsx. */
const BRING = [
  "A fully charged laptop",
  "Stable internet connection",
  "Pen and paper for rough work",
  "Student ID",
];

/* Each of these restates one of FAQ_ITEMS 002-006. Nothing new is claimed. */
const RULES = [
  "Participation is in teams only. There is no individual entry.",
  "No prior puzzle experience is required. Curiosity and logical thinking are enough.",
  "Hints may be released after set intervals, or may carry a score penalty, depending on the rules of the round.",
  "OD is provided if you report to the venue on time and record your attendance.",
  "Entry is open to all eligible students under the event rules.",
];

export default function AboutDossier() {
  const rootRef = useRef<HTMLDivElement>(null);

  /*
   * Scroll reveal. The `js` class is what arms the hidden state in about.css —
   * it is added here, on mount, so a page rendered without JavaScript (or by a
   * crawler, or in a headless screenshot) never hides its own content behind a
   * transition that will not fire.
   *
   * IntersectionObserver rather than a scroll listener: lib/tunnel.ts already
   * runs a per-frame scroll loop on this site, and a second listener would add
   * main-thread work for something the platform does off it. Each node is
   * unobserved once it lands; the reveal is a one-way door.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.classList.add("js");

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  /* Stagger index. Reset per group so a late section does not inherit a huge
     delay from the top of the page. */
  const step = (i: number) => ({ "--i": i } as CSSProperties);

  return (
    <div className="about-page" ref={rootRef}>
      {/*
       * BACKDROP — a child of .about-page, NOT of the header section.
       *
       * Nested in the section it inherited that box exactly: it started at
       * y=80 (under the fixed navbar, leaving a hard horizontal seam where the
       * image began) and stopped dead at y=604. Hoisted here it spans from the
       * true top of the page, behind the translucent navbar, and its own mask
       * decides where it ends.
       */}
      <div className="ad-backdrop" aria-hidden="true">
        {/* quality={75} is mandatory, not a preference. next.config.js leaves
            images.qualities at its default [75] and Next 16 400s anything
            else, so a different q= is a different URL and therefore a second
            full fetch of a 733KB JPEG. Matching the hero and the FAQ means
            this background costs zero extra bytes. */}
        <div className="ad-backdrop__drift">
          <Image
            src="/891208.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={75}
            priority
            /* Same trick as the home hero: push the bright accretion disk into
               the right half, clear of the title column on the left. */
            style={{ objectFit: "cover", objectPosition: "68% 42%" }}
          />
        </div>
        <div className="ad-backdrop__wash" />
      </div>

      {/* Fixed atmospheric layer. .about-page no longer paints an opaque
          background, so globals.css's body::before starfield reads through the
          whole page; this only adds warmth and a vignette on top of it. */}
      <div className="ad-atmos" aria-hidden="true" />

      <main>
      {/* ═══ 1 · DOSSIER HEADER ═══════════════════════════
          A <section>, not a <header>: an unnested <header> maps to the banner
          landmark, and <Navbar /> already owns that role on every route. */}
      <section className="ad-section ad-header-wrap" aria-labelledby="ad-title">

        <div className="ad-inner ad-header">
          <div>
            <p className="ad-eyebrow" data-reveal style={step(0)}>
              // MISSION_DOSSIER &middot; CLEARANCE: PUBLIC
            </p>
            <h1 className="ad-title" id="ad-title" data-reveal style={step(1)}>
              ABOUT
              <span className="ad-title__sub">THE HUNT</span>
            </h1>
            <div className="ad-rule" data-reveal style={step(2)} aria-hidden="true" />
            <p className="ad-header__sub" data-reveal style={step(3)}>
              Cicada 2067 is a cryptic hunt run by {EVENT.organiser}. Six rounds, one
              trajectory, and a signal that does not repeat itself.
            </p>
          </div>

          {/* Built like timeline.css's .timeline-hero__orbit so it reads as the
              same instrument, but plots a different figure. Geometry, not an
              illustration. */}
          <div className="ad-orbit" data-reveal style={step(4)} aria-hidden="true">
            <svg viewBox="0 0 320 320" fill="none">
              <circle cx="160" cy="160" r="148" stroke="currentColor" strokeWidth="1" strokeDasharray="1,7" opacity="0.3" />
              <circle cx="160" cy="160" r="104" stroke="currentColor" strokeWidth="1" strokeDasharray="1,6" opacity="0.22" />
              <path d="M22 190 A150 150 0 0 1 250 52" stroke="var(--amber)" strokeWidth="1" opacity="0.5" />
              <path d="M56 160 A104 104 0 0 1 160 56" stroke="var(--amber)" strokeWidth="1" strokeDasharray="3,5" opacity="0.35" />
              <circle cx="160" cy="160" r="3" fill="var(--amber)" />
              <g className="ad-orbit__spin">
                <circle cx="160" cy="12" r="3.5" fill="var(--amber)" opacity="0.9" />
                <circle cx="264" cy="160" r="2" fill="currentColor" opacity="0.55" />
              </g>
            </svg>
          </div>
        </div>
      </section>

        {/* ═══ 2 · WHAT YOU ARE SIGNING UP FOR ════════════ */}
        <section className="ad-section" aria-labelledby="ad-brief">
          <div className="ad-inner">
            <h2 className="ad-h2" id="ad-brief" data-reveal style={step(0)}>
              What you are signing up for
            </h2>
            <div className="ad-rule" data-reveal style={step(1)} aria-hidden="true" />

            <div className="ad-brief__body">
              <p className="ad-lede" data-reveal style={step(2)}>
                A cryptic hunt is a chain of interconnected puzzles wrapped in a story.
                You work through it as a team, and each solution is the key to the next
                puzzle, so the hunt only moves forward when the whole chain holds.
              </p>
              <p className="ad-lede" data-reveal style={step(3)}>
                It tests logical reasoning, creativity, observation and plain
                stubbornness rather than anything from a syllabus. There is nothing to
                revise for. If you are curious and you think in patterns, you already
                have what the hunt asks for.
              </p>
            </div>

            <div className="ad-strip" data-reveal style={step(4)}>
              <div className="ad-strip__cell">
                <span className="ad-strip__label">Format</span>
                <span className="ad-strip__value">Team cryptic hunt</span>
              </div>
              <div className="ad-strip__cell">
                <span className="ad-strip__label">Rounds</span>
                <span className="ad-strip__value">{ROUNDS.length} in sequence</span>
              </div>
              <div className="ad-strip__cell">
                <span className="ad-strip__label">Experience</span>
                <span className="ad-strip__value">None required</span>
              </div>
              <div className="ad-strip__cell">
                <span className="ad-strip__label">Entry</span>
                <span className="ad-strip__value"><Value>{EVENT.entry}</Value></span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3 · MISSION VITALS ═════════════════════════ */}
        <section className="ad-section" aria-labelledby="ad-vitals">
          <div className="ad-inner">
            <p className="ad-eyebrow" data-reveal style={step(0)}>// VITALS</p>
            <h2 className="ad-h2" id="ad-vitals" data-reveal style={step(1)}>
              Mission vitals
            </h2>

            <div className="ad-vitals__grid">
              <div className="ad-vital" data-reveal style={step(2)}>
                <span className="ad-vital__label">Dates</span>
                <span className="ad-vital__value"><Value>{EVENT.dates}</Value></span>
                <span className="ad-vital__note">
                  Each round carries its own date. They are published on the timeline as
                  the round opens.
                </span>
              </div>

              <div className="ad-vital" data-reveal style={step(3)}>
                <span className="ad-vital__label">Venue</span>
                <span className="ad-vital__value"><Value>{EVENT.venue}</Value></span>
              </div>

              <div className="ad-vital" data-reveal style={step(4)}>
                <span className="ad-vital__label">Team size</span>
                <span className="ad-vital__value"><Value>{EVENT.teamSize}</Value></span>
              </div>

              <div className="ad-vital" data-reveal style={step(5)}>
                <span className="ad-vital__label">Rounds</span>
                <span className="ad-vital__value">
                  {String(ROUNDS.length).padStart(2, "0")}
                </span>
                <span className="ad-vital__note">
                  Every round unlocks at the close of the one before it. Nothing can be
                  skipped ahead.
                </span>
              </div>

              <div className="ad-vital" data-reveal style={step(6)}>
                <span className="ad-vital__label">Prize pool</span>
                <span className="ad-vital__value"><Value>{EVENT.prizePool}</Value></span>
              </div>

              <div className="ad-vital" data-reveal style={step(7)}>
                <span className="ad-vital__label">On duty</span>
                <span className="ad-vital__value">Provided</span>
                <span className="ad-vital__note">
                  Granted to participants who report to the venue on time and record
                  their attendance.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 4 · HOW IT RUNS ════════════════════════════ */}
        <section className="ad-section" aria-labelledby="ad-steps">
          <div className="ad-inner">
            <h2 className="ad-h2" id="ad-steps" data-reveal style={step(0)}>
              How it runs
            </h2>
            <div className="ad-rule" data-reveal style={step(1)} aria-hidden="true" />

            {/* data-reveal here drives the rail's draw-down (its ::before);
                about.css pins the list itself visible so the five steps keep
                their own stagger. */}
            <ol className="ad-steps__list" data-reveal>
              {STEPS.map(([title, body], i) => (
                <li className="ad-step" key={title} data-reveal style={step(i + 2)}>
                  <div className="ad-step__head">
                    <span className="ad-step__index">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="ad-step__title">{title}</h3>
                  </div>
                  <p className="ad-step__body">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ 5 · THE SIX ROUNDS ═════════════════════════ */}
        <section className="ad-section" aria-labelledby="ad-rounds">
          <div className="ad-inner">
            <div className="ad-rounds__head">
              <h2 className="ad-h2" id="ad-rounds" data-reveal style={step(0)}>
                The {ROUNDS.length} rounds
              </h2>
              <Link href="/#timeline" className="ad-link" data-reveal style={step(1)}>
                Fly the full timeline
                <span className="ad-link__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="ad-rounds__grid">
              {ROUNDS.map((round, i) => (
                <article
                  key={round.code}
                  className={`ad-round ad-round--${statusClass(round.status)}`}
                  data-reveal
                  style={step(i + 2)}
                >
                  <div className="ad-round__top">
                    <span className="ad-round__code">{round.code}</span>
                    {/* Same rule as the tunnel cards: a locked round has no
                        published date yet, so it must not show one. */}
                    <span className="ad-round__date">
                      {round.status === "LOCKED" ? "TBD" : round.date}
                    </span>
                  </div>
                  <h3 className="ad-round__title">{round.title}</h3>
                  <p className="ad-round__summary">{round.summary}</p>
                  <p className="ad-round__status">
                    <span className="ad-round__dot" aria-hidden="true" />
                    {round.status}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 6 · RULES OF ENGAGEMENT ════════════════════ */}
        <section className="ad-section" aria-labelledby="ad-protocol">
          <div className="ad-inner">
            <p className="ad-eyebrow" data-reveal style={step(0)}>// PROTOCOL</p>
            <h2 className="ad-h2" id="ad-protocol" data-reveal style={step(1)}>
              Rules of engagement
            </h2>

            <div className="ad-protocol__cols">
              <div data-reveal style={step(2)}>
                <h3 className="ad-protocol__title">What to bring</h3>
                <ul className="ad-checklist">
                  {BRING.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div data-reveal style={step(3)}>
                <h3 className="ad-protocol__title">Before you enter</h3>
                <ul className="ad-checklist">
                  {RULES.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              </div>
            </div>

            <div className="ad-protocol__foot" data-reveal style={step(4)}>
              <Link href="/#faq" className="ad-link">
                Read the full FAQ
                <span className="ad-link__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 7 · WHO RUNS IT ════════════════════════════ */}
        <section className="ad-section ad-org" aria-labelledby="ad-org">
          <div className="ad-inner ad-org__inner">
            <Image
              src="/ieee_cs.png"
              alt="IEEE Computer Society, VIT Chapter"
              width={180}
              height={50}
              sizes="180px"
              className="ad-org__logo"
              data-reveal
              style={step(0)}
            />
            <div>
              <h2 className="ad-h2" id="ad-org" data-reveal style={step(1)}>
                Who runs it
              </h2>
              <div className="ad-rule" data-reveal style={step(2)} aria-hidden="true" />
              <p className="ad-org__body" data-reveal style={step(3)}>
                {/* Keep the interpolation at the end of a clause. A trailing
                    " student chapter" here rendered as "VITstudent chapter" —
                    JSX dropped the space between the expression and the text
                    that continued onto the next line. */}
                Cicada 2067 is built and run by the student chapter of{" "}
                {EVENT.organiser}. Everything you will solve, from the first
                transmission to the final descent, was written and tested by the
                chapter&apos;s own team.
              </p>
              <span data-reveal style={step(4)}>
                <Link href="/team" className="ad-link">
                  Meet the crew
                  <span className="ad-link__arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </span>
            </div>
          </div>
        </section>

        {/* ═══ 8 · CLOSING CTA ════════════════════════════ */}
        <section className="ad-section ad-cta" aria-labelledby="ad-cta">
          <div className="ad-inner ad-cta__inner">
            <h2 className="ad-h2" id="ad-cta" data-reveal style={step(0)}>
              Ready to decode?
            </h2>
            <div className="ad-rule" data-reveal style={step(1)} aria-hidden="true" />
            <p className="ad-cta__body" data-reveal style={step(2)}>
              Registration runs through the hunt portal. If you would rather ask
              something first, Discord is where the signal traffic is.
            </p>

            <div className="ad-cta__row" data-reveal style={step(3)}>
              <Link href={EVENT.registerHref} className="ad-btn ad-btn--primary">
                <span className="ad-btn__sweep" aria-hidden="true" />
                Register now
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href={EVENT.discordHref} className="ad-btn ad-btn--ghost">
                <span className="ad-btn__sweep" aria-hidden="true" />
                Join Discord
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

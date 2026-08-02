"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * HeroSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * Hero layout — text column LEFT, 3D spacecraft RIGHT.
 *
 * EnduranceShip is dynamically imported with ssr:false because the
 * <endurance-ship> custom element only exists in the browser; rendering
 * the tag server-side would emit an un-upgraded, unstyled element.
 *
 * The ship UNMOUNTS once the timeline takes over (see shipVisible below).
 * .spacecraft-scene is position:fixed, so it would otherwise hover over
 * the tunnel for the rest of the page — and a ~1600-plane preserve-3d
 * subtree left alive next to the tunnel is real battery cost on mobile.
 * ─────────────────────────────────────────────────────────────────
 */

/* Dynamic import → the web component registers itself in the browser only */
const EnduranceShip = dynamic(() => import("./EnduranceShip"), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection() {
  const [shipVisible, setShipVisible] = useState(true);

  useEffect(() => {
    /* Asymmetric thresholds (1.1 / 0.9) so scrolling around the boundary
       can't thrash the WebGL context in and out every frame. */
    const onScroll = () =>
      setShipVisible((visible) =>
        visible
          ? window.scrollY < window.innerHeight * 1.1
          : window.scrollY < window.innerHeight * 0.9
      );
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="hero" className="hero-section" aria-label="Hero">

      {/* ── Left Column — text content ───────────────────── */}
      <div className="hero-left">

        {/* Eyebrow */}
        <p className="hero-eyebrow" aria-label="Tagline">
          A CRYPTIC HUNT BEYOND THE STARS
        </p>

        {/* Main Heading */}
        <h1 className="hero-heading" aria-label="Cicada 2067">
          <span className="glow-line">CICADA</span>
          <span className="glow-line">2067</span>
        </h1>

        {/* Body */}
        <p className="hero-body">
          <strong>Solve. Decipher. Escape.</strong> An interstellar cryptic hunt
          that blends logic and curiosity. Decode the unknown.
        </p>

        {/* CTA */}
        <Link
          href="/puzzles"
          id="cta-register"
          className="cta-button"
          aria-label="Register for Cicada 2067"
        >
          REGISTER NOW &nbsp;→
        </Link>
      </div>

      {/* ── Right Column — React Three Fiber spacecraft ──── */}
      {/*
       * aria-hidden: the 3D canvas is purely decorative — screen
       * readers don't need to know about it.
       * pointer-events: none on .spacecraft-scene (in globals.css)
       * ensures clicks pass through to the navbar / buttons.
       */}
      <div className="hero-right" aria-hidden="true">
        {shipVisible && (
          <div className="spacecraft-scene">
            <EnduranceShip />
          </div>
        )}
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────
           Sibling of hero-left (NOT inside it) so position:absolute
           left:1.75rem is relative to hero-section's edge, completely
           clear of all text content.
      ──────────────────────────────────────────────────────── */}
      <div className="scroll-indicator" aria-hidden="true">
        <div className="scroll-indicator-line" />
        <span className="scroll-indicator-text">SCROLL TO DISCOVER</span>
      </div>

    </section>
  );
}

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * HeroSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * Hero layout — text column LEFT, three.js Endurance RIGHT.
 *
 * EnduranceShip is dynamically imported with ssr:false because it builds a
 * WebGL context on mount; there is nothing meaningful to render server-side.
 *
 * The ship UNMOUNTS once the timeline takes over (see shipVisible below).
 * .spacecraft-scene is position:fixed, so it would otherwise hover over the
 * tunnel for the rest of the page — and leaving a second WebGL context alive
 * next to the tunnel's is real battery cost on mobile. lib/tunnel.ts fades
 * .spacecraft-scene's opacity to 0 before this threshold so the unmount is
 * invisible; the two ranges are coupled, change them together.
 * ─────────────────────────────────────────────────────────────────
 */

/* Dynamic import → three.js and the scene build stay out of the server bundle */
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
    /* is-idle pauses the infinite heading shimmer once the hero is off-screen —
       it re-rasterizes background-clip:text under a drop-shadow every frame,
       which is pure waste while invisible. The animation itself is untouched. */
    <section
      id="hero"
      className={`hero-section${shipVisible ? "" : " is-idle"}`}
      aria-label="Hero"
    >

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

      {/* ── Right Column — three.js Endurance ──────────────── */}
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

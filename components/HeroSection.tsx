"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
 * HeroSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * Hero layout — text column LEFT, grid column 2 deliberately empty so the
 * black-hole background reads through it.
 *
 * The only live state here is heroActive, which drives .is-idle: past ~1.1vh
 * the hero is off-screen and its two infinite animations are pure waste. See
 * the .is-idle rules in globals.css.
 * ─────────────────────────────────────────────────────────────────
 */

export default function HeroSection() {
  const [heroActive, setHeroActive] = useState(true);

  useEffect(() => {
    /* Asymmetric thresholds (1.1 / 0.9) so scrolling around the boundary
       can't thrash the class on and off every frame. */
    const onScroll = () =>
      setHeroActive((active) =>
        active
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
      className={`hero-section${heroActive ? "" : " is-idle"}`}
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

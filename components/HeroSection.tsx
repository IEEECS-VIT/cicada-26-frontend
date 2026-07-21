import Link from "next/link";
import Endurance from "./Endurance";

export default function HeroSection() {
  return (
    <main id="hero" className="hero-section" aria-label="Hero">

      {/* ── Left Column ── */}
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
          <strong>Solve. Decipher. Escape.</strong> An interstellar cryptic hunt that
          blends logic and curiosity. Decode the unknown.
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

        {/* Scroll Indicator */}
        <div className="scroll-indicator" aria-hidden="true">
          <div className="scroll-indicator-line" />
          <span className="scroll-indicator-text">SCROLL TO DISCOVER</span>
        </div>
      </div>

      {/* ── Right Column — Endurance Spacecraft ── */}
      <div className="hero-right" aria-hidden="true">
        <div className="spacecraft-scene">
          <Endurance />
        </div>
      </div>

    </main>
  );
}

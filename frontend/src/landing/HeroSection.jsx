import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";

const EnduranceShip = lazy(() => import("./EnduranceShip"));

export default function HeroSection() {
  const [heroActive, setHeroActive] = useState(true);

  useEffect(() => {
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
    <section
      id="hero"
      className={`hero-section${heroActive ? "" : " is-idle"}`}
      aria-label="Hero"
    >
      <div className="hero-left">
        <p className="hero-eyebrow" aria-label="Tagline">
          A CRYPTIC HUNT BEYOND THE STARS
        </p>

        <h1 className="hero-heading" aria-label="Cicada 2067">
          <span className="glow-line">CICADA</span>
          <span className="glow-line">2067</span>
        </h1>

        <p className="hero-body">
          <strong>Solve. Decipher. Escape.</strong> An interstellar cryptic hunt
          that blends logic and curiosity. Decode the unknown.
        </p>

        <Link
          to="/login"
          id="cta-register"
          className="cta-button"
          aria-label="Register for Cicada 2067"
        >
          REGISTER NOW &nbsp;→
        </Link>
      </div>

      <div className="hero-right" aria-hidden="true">
        <Suspense fallback={null}>
          <EnduranceShip idle={!heroActive} />
        </Suspense>
      </div>

      <div className="scroll-indicator" aria-hidden="true">
        <div className="scroll-indicator-line" />
        <span className="scroll-indicator-text">SCROLL TO DISCOVER</span>
      </div>
    </section>
  );
}
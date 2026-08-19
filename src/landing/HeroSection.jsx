import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const EnduranceShip = lazy(() => import("./EnduranceShip"));

export default function HeroSection() {
  const [heroActive, setHeroActive] = useState(true);
  const { user } = useAuth();
  const isAdmin = user && (user.role === "admin" || user.role === "GOD");
  const cta = !user
    ? { to: "/login", label: "REGISTER NOW  →", aria: "Register for Cicada 2067" }
    : isAdmin
      ? { to: "/admin", label: "Admin Panel →", aria: "Open the admin panel" }
      : { to: "/terminal", label: "Arena", aria: "Enter the arena" };

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
      aria-label="Hero"
      className={`relative grid min-h-dvh w-full grid-cols-1 grid-rows-[auto_45vh] items-stretch overflow-clip pt-[calc(var(--nav-height)+1rem)] md:min-h-screen md:grid-cols-[52%_48%] md:grid-rows-[1fr_auto] md:pt-[var(--nav-height)] max-lg:md:grid-cols-[60%_40%] ${
        heroActive ? "" : "[&_.glow-line]:[animation-play-state:paused]"
      }`}
    >
      <div className="relative z-10 flex min-h-0 flex-col justify-center px-6 pb-6 pt-8 md:min-h-[calc(100vh-var(--nav-height))] md:row-start-1 md:px-[clamp(2rem,6vw,6rem)] md:pr-[clamp(1rem,3vw,3rem)] md:py-[clamp(2rem,6vw,6rem)]">
        <p
          className="mb-5 flex animate-fade-in items-center gap-4 font-rajdhani text-[clamp(0.6rem,1.2vw,0.8rem)] font-semibold uppercase tracking-[0.28em] text-accretion [animation-delay:0.2s] [animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100 sm:tracking-[0.5em]"
          aria-label="Tagline"
        >
          <span className="inline-block h-px w-10 shrink-0 bg-accretion shadow-[0_0_6px_rgba(244,162,51,0.5)]" />
          A CRYPTIC HUNT BEYOND THE STARS
        </p>

        <h1
          className="relative mb-8 animate-fade-in font-orbitron text-[clamp(2rem,12vw,3rem)] font-black uppercase leading-[0.95] tracking-[0.05em] text-starlight [animation-delay:0.4s] [animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100 sm:text-[clamp(2.5rem,10vw,4rem)] md:text-[clamp(3rem,7.5vw,7rem)]"
          aria-label="Cicada 2067"
        >
          <span className="glow-line block bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(244,162,51,0.4)] motion-safe:animate-shimmer max-md:animate-none max-md:bg-[position:50%_center]">
            CICADA
          </span>
          <span className="glow-line block bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(244,162,51,0.4)] motion-safe:animate-shimmer max-md:animate-none max-md:bg-[position:50%_center]">
            2067
          </span>
        </h1>

        <p className="mb-10 max-w-[480px] animate-fade-in text-[0.9rem] font-light leading-7 tracking-[0.02em] text-starlight-dim [animation-delay:0.6s] [animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100 md:text-[clamp(0.9rem,1.5vw,1.05rem)]">
          <strong className="font-normal text-starlight">Solve. Decipher. Escape.</strong> An interstellar cryptic hunt
          that blends logic and curiosity. Decode the unknown.
        </p>

        <Link
          to={cta.to}
          id="cta-register"
          aria-label={cta.aria}
          className="inline-flex animate-fade-in items-center gap-3 self-start border border-accretion px-6 py-[0.85rem] font-orbitron text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-accretion transition hover:-translate-y-0.5 hover:bg-accretion/10 hover:tracking-[0.35em] hover:shadow-[0_0_20px_rgba(244,162,51,0.2)] [animation-delay:0.8s] [animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100 sm:px-8 sm:py-4 sm:text-xs"
        >
          {cta.label}
        </Link>
      </div>

      <div className="relative col-start-1 row-start-2 min-h-0 pointer-events-none md:col-start-2 md:row-start-1" aria-hidden="true">
        <Suspense fallback={null}>
          <EnduranceShip idle={!heroActive} />
        </Suspense>
      </div>

      <div
        className="pointer-events-none absolute bottom-8 left-7 z-10 hidden animate-fade-in flex-col items-center gap-2 [animation-delay:1.2s] [animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100 md:flex md:col-start-1 md:row-start-2"
        aria-hidden="true"
      >
        <div className="relative h-[60px] w-px overflow-hidden bg-gradient-to-b from-transparent via-accretion-dim to-accretion">
          <span className="absolute top-[-20px] left-0 h-5 w-full animate-scroll-bounce bg-accretion-bright motion-reduce:animate-none" />
        </div>
        <span className="origin-center rotate-180 font-rajdhani text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-accretion-dim [writing-mode:vertical-rl]">
          SCROLL TO DISCOVER
        </span>
      </div>
    </section>
  );
}

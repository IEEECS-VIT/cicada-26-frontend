import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";

export default function NotFound() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = "404 — Cicada 2067";
    return () => {
      document.title = "Cicada 2067 - Interstellar Cryptic Hunt";
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-black" aria-hidden="true">
        <img
          src="/assets/891208.jpg"
          alt=""
          className="h-full w-full object-cover object-[58%_62%] opacity-55 saturate-[1.15] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/55 to-black" />
      </div>

      <Navbar />

      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pt-[var(--nav-height)] pb-16 text-starlight sm:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(560px,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accretion/10 after:absolute after:left-1/2 after:top-1/2 after:size-[min(340px,56vw)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-accretion/15"
          aria-hidden="true"
        />

        <p className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-rajdhani text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-accretion sm:mb-6 sm:tracking-[0.42em]">
          <span className="hidden h-px w-[30px] bg-accretion sm:block" aria-hidden="true" />
          SIGNAL LOST
          <span className="hidden h-px w-[30px] bg-accretion sm:block" aria-hidden="true" />
        </p>

        <h1 className="bg-gradient-to-br from-starlight via-accretion-bright to-accretion bg-clip-text text-center font-orbitron text-[clamp(3.25rem,28vw,10rem)] font-black leading-none tracking-[0.08em] text-transparent sm:tracking-[0.12em]">
          404
        </h1>

        <p className="mt-4 text-center font-orbitron text-xs tracking-[0.2em] text-starlight sm:text-base sm:tracking-[0.28em]">
          COORDINATES NOT FOUND
        </p>

        <div className="mx-auto my-8 h-16 w-px bg-gradient-to-b from-accretion to-transparent" aria-hidden="true" />

        <p className="max-w-md text-center text-sm leading-7 text-copper sm:text-base">
          This sector is not on the chart. The transmission you requested never left the horizon.
        </p>

        {pathname && pathname !== "/" && (
          <p className="mt-4 max-w-full truncate font-mono text-[11px] tracking-[0.16em] text-copper/50">
            {pathname}
          </p>
        )}

        <Link
          to="/"
          className="mt-10 inline-flex min-h-12 items-center border border-accretion px-8 py-3 font-orbitron text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accretion transition hover:bg-accretion/10"
        >
          ← RETURN TO BASE
        </Link>
      </main>

      <SiteFooter />
    </>
  );
}

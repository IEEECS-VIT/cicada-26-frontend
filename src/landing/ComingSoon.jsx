import { Link } from "react-router-dom";

export default function ComingSoon({ pageName }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-24 sm:px-8" role="main">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(600px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accretion/10 after:absolute after:left-1/2 after:top-1/2 after:size-[min(400px,60vw)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-accretion/15"
        aria-hidden="true"
      />

      <p
        className="mb-6 flex items-center gap-3 font-rajdhani text-[0.7rem] font-semibold uppercase tracking-[0.5em] text-accretion before:block before:h-px before:w-[30px] before:bg-accretion after:block after:h-px after:w-[30px] after:bg-accretion"
        aria-label={`${pageName} section`}
      >
        {pageName}
      </p>

      <h1 className="mb-6 bg-gradient-to-br from-starlight via-accretion-bright to-starlight bg-clip-text text-center font-orbitron text-[clamp(2.5rem,8vw,6rem)] font-black uppercase tracking-[0.15em] text-transparent">
        COMING SOON
      </h1>

      <div className="mx-auto my-8 h-20 w-px bg-gradient-to-b from-accretion to-transparent" aria-hidden="true" />

      <p className="max-w-[400px] text-center font-rajdhani text-[clamp(0.85rem,2vw,1.1rem)] uppercase leading-8 tracking-[0.25em] text-starlight-dim">
        This sector is currently classified.
        <br />
        Transmissions pending&hellip;
      </p>

      <Link
        to="/"
        id={`back-home-${pageName.toLowerCase().replace(/\s/g, "-")}`}
        className="mt-4 border border-accretion/25 px-6 py-3 font-orbitron text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accretion-dim transition hover:border-accretion hover:text-accretion"
        aria-label="Return to home page"
      >
        ← RETURN TO BASE
      </Link>
    </div>
  );
}

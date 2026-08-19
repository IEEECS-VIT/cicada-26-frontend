import { Link } from "react-router-dom";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import { useAuth } from "../context/AuthContext";

const PILLARS = [
  {
    title: "THE SIGNAL",
    body: "Cicada 2067 is a cryptic hunt. Puzzles arrive as fragments — ciphers, images, coordinates, dead ends that are not dead. You do not brute-force the void. You listen.",
  },
  {
    title: "THE CREW",
    body: "You fly in teams of up to five. No solo crossing. Logic, observation, and stubborn curiosity are the only instruments that still work this close to the horizon.",
  },
  {
    title: "THE CROSSING",
    body: "Rounds unlock in sequence. Each solved transmission tows the next into range. Time is a tide. Hints exist, and they can cost you.",
  },
];

const MANIFEST = [
  { label: "Format", value: "Team cryptic hunt" },
  { label: "Crew size", value: "Up to 5" },
  { label: "Organiser", value: "IEEE Computer Society, VIT" },
  { label: "Bring", value: "Laptop, ID, pen, patience" },
  { label: "OD", value: "Issued if you report on time" },
];

export default function About() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === "admin" || user.role === "GOD");
  const cta = !user
    ? { to: "/login", label: "BOARD THE VESSEL →" }
    : isAdmin
      ? { to: "/admin", label: "ADMIN PANEL →" }
      : { to: "/terminal", label: "ENTER ARENA →" };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-black" aria-hidden="true">
        <img
          src="/assets/891208.jpg"
          alt=""
          className="h-full w-full object-cover object-[58%_62%] opacity-80 saturate-[1.2] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/35 to-black" />
      </div>

      <Navbar />

      <main className="relative pt-[var(--nav-height)] text-starlight">
        <section className="relative mx-auto flex max-w-6xl flex-col justify-start px-5 pb-12 pt-6 md:min-h-[88dvh] md:justify-end md:px-10 md:pb-24 md:pt-16 lg:px-16">
          <p className="mb-5 flex items-center gap-3 font-rajdhani text-[10px] font-semibold tracking-[0.28em] text-accretion sm:mb-6 sm:gap-4 sm:text-[11px] sm:tracking-[0.48em]">
            <span className="inline-block h-px w-10 bg-accretion" />
            EVENT DOSSIER · IEEE CS VIT
          </p>
          <h1 className="font-orbitron text-[clamp(3.2rem,10vw,8rem)] font-black leading-[0.88] tracking-[0.06em]">
            <span className="block bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-clip-text text-transparent">
              CICADA
            </span>
            <span className="block bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-clip-text text-transparent">
              2067
            </span>
          </h1>
          <p className="mt-8 max-w-xl font-rajdhani text-lg tracking-[0.22em] text-accretion">
            PAST THE EVENT HORIZON
          </p>
          <p className="mt-5 max-w-xl text-base leading-8 text-copper sm:text-lg">
            An interstellar cryptic hunt. Transmissions arrive as puzzles. Your crew is the only instrument that still works this close to the disk. Decode them — or remain in orbit forever.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              to={cta.to}
              className="inline-flex border border-accretion px-8 py-4 font-orbitron text-[11px] tracking-[0.32em] text-accretion transition hover:bg-accretion/10"
            >
              {cta.label}
            </Link>
            <Link
              to="/#faq"
              className="font-rajdhani text-sm tracking-[0.28em] text-copper transition hover:text-accretion-bright"
            >
              READ THE ARCHIVE →
            </Link>
          </div>
        </section>

        <section className="relative border-t border-accretion/15 bg-black/55 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl gap-px bg-accretion/10 px-0 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="bg-black/80 px-5 py-10 sm:px-10 sm:py-12">
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-accretion-bright">
                  {pillar.title}
                </h2>
                <p className="mt-5 max-w-sm text-[15px] leading-7 text-copper">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mx-auto grid max-w-6xl items-start gap-12 px-5 py-16 sm:px-10 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16">
          <div>
            <p className="font-rajdhani text-[11px] tracking-[0.4em] text-accretion">FLIGHT PLAN</p>
            <h2 className="mt-3 font-orbitron text-3xl tracking-[0.12em] sm:text-4xl">
              THREE BURNS
              <br />
              TO THE CORE.
            </h2>
            <ol className="mt-10 space-y-8">
              {[
                ["Assemble", "Form a crew. Share one invite code. No one crosses alone."],
                ["Decipher", "Each round is a locked transmission. Solve it to tow the next into range."],
                ["Escape", "The last puzzle is the event horizon. There is no spectator deck."],
              ].map(([title, body]) => (
                <li key={title} className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accretion" />
                  <div>
                    <p className="font-orbitron text-sm tracking-[0.22em]">{title}</p>
                    <p className="mt-2 text-[15px] leading-7 text-copper">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="border border-accretion/25 bg-black/60 p-5 backdrop-blur-md sm:p-8">
            <p className="font-rajdhani text-[11px] tracking-[0.35em] text-accretion">SHIP MANIFEST</p>
            <dl className="mt-6 divide-y divide-accretion/10">
              {MANIFEST.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-copper/70">{row.label}</dt>
                  <dd className="text-right text-sm text-starlight">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-xs leading-6 tracking-wide text-copper/70">
              Prior puzzle experience is optional. Curiosity is not. If you can hold a question longer than an easy answer, you already have clearance.
            </p>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

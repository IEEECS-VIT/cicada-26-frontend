/*
 * SiteFooter.tsx
 * ─────────────────────────────────────────────────────────────────
 * Chapter footer: IEEE CS VIT mark on the left, socials on the right.
 *
 * Icons are inline 24x24 paths (fill=currentColor) rather than an icon
 * library — six paths is not worth a dependency, and currentColor lets
 * the hover/focus colour come straight from CSS.
 * ─────────────────────────────────────────────────────────────────
 */

/* Chapter social accounts. */
const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/ieeecs_vit/",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ieee-cs-vit",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13m1.78 13.02H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0",
  },
  {
    name: "X",
    href: "https://twitter.com/ieeecsvit",
    path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@ieeecomputersociety-vitcha2386",
    path: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81M9.55 15.57V8.43L15.82 12z",
  },
  {
    name: "GitHub",
    href: "https://github.com/ieeecs-vit",
    path: "M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58l-.01-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.75.09-.73.09-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5.99.1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3",
  },
  {
    name: "Discord",
    href: "https://discord.gg/BZFNt9qem",
    path: "M20.32 4.37A19.8 19.8 0 0 0 15.89 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-4.6 0C10.54 3.85 10.3 3.36 10.1 3A19.7 19.7 0 0 0 5.67 4.38C1.73 10.06.88 15.6 1.3 21.07a19.94 19.94 0 0 0 6.05 3.03c.48-.67.91-1.37 1.28-2.12a13.1 13.1 0 0 1-2.01-.96c.17-.12.33-.25.49-.38a14.1 14.1 0 0 0 12.08 0c.16.14.32.26.49.38-.64.38-1.32.7-2.02.96.37.75.8 1.45 1.28 2.12a19.9 19.9 0 0 0 6.06-3.03c.5-6.34-.83-11.83-3.68-16.7M8.02 16.17c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41s2.18 1.09 2.15 2.41c0 1.32-.95 2.4-2.15 2.4m7.96 0c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41 1.2 0 2.18 1.09 2.15 2.41 0 1.32-.95 2.4-2.15 2.4",
  },
];

export default function SiteFooter() {
  const socialClass =
    "inline-flex h-11 w-11 items-center justify-center text-copper/70 transition hover:bg-white/5 hover:text-accretion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accretion";
  const icon = (path) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="block h-5 w-5">
      <path fill="currentColor" d={path} />
    </svg>
  );

  return (
    <footer
      className="relative z-[2] bg-black px-[clamp(20px,5vw,64px)] pt-10 pb-[calc(28px+env(safe-area-inset-bottom,0px))] font-mono"
      role="contentinfo"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[oklch(0.11_0.006_60)] to-black"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-accretion/25 to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-3.5 md:items-start">
          <img
            src="/assets/ieee_cs.png"
            alt="IEEE Computer Society — VIT Chapter"
            className="block h-[38px] w-auto opacity-90"
          />
          <p className="m-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-copper/70">
            <span>© IEEE COMPUTER SOCIETY VIT</span>
            <span className="inline-flex items-center gap-1.5 text-accretion/70">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accretion motion-reduce:animate-none" aria-hidden="true" />
              STATUS: ONLINE
            </span>
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-1" aria-label="Social links">
          {SOCIALS.map(({ name, href, path }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className={socialClass}
            >
              {icon(path)}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

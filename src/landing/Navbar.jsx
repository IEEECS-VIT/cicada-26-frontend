import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const DASHBOARD_PATHS = ["/dashboard"];
const SCROLL_MS = 900;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const linkClass = (active) =>
  `relative font-rajdhani text-[0.8rem] font-semibold uppercase tracking-[0.2em] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accretion after:transition-[width] hover:text-accretion-bright hover:after:w-full ${
    active ? "text-accretion" : "text-starlight-dim"
  }`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const flightRef = useRef(0);
  const { user, teamName } = useAuth();
  const isParticipant = user?.role === "participant";

  const navLinks = useMemo(
    () => [
      { label: "HOME", href: "/" },
      { label: "ABOUT", href: "/about" },
      { label: "FAQs", href: "/#faq" },
      ...(isParticipant ? [{ label: "TEAM", href: "/team" }] : []),
      user
        ? { label: "DASHBOARD", href: "/dashboard" }
        : { label: "LOGIN", href: "/login" },
      { label: "DISCORD", href: "https://discord.gg/BZFNt9qem", external: true },
    ],
    [user, isParticipant, teamName]
  );

  const isActive = (href, label) => {
    if (label === "DASHBOARD") return DASHBOARD_PATHS.includes(pathname);
    if (label === "ABOUT") return pathname === "/about" || pathname === "/puzzles";
    if (label === "TEAM") return pathname === "/team";
    return pathname === href;
  };

  useEffect(() => () => cancelAnimationFrame(flightRef.current), []);

  useEffect(() => {
    if (!menuOpen) return;
    const { documentElement: html, body } = document;
    html.style.overflow = body.style.overflow = "hidden";
    return () => {
      html.style.overflow = body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const scrollToFaq = useCallback(
    (e) => {
      if (pathname !== "/") return;
      const target = document.getElementById("faq");
      if (!target) return;
      e.preventDefault();
      setMenuOpen(false);
      cancelAnimationFrame(flightRef.current);
      const navH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height"), 10) || 80;
      const from = window.scrollY;
      const started = performance.now();
      const liveTarget = () => target.getBoundingClientRect().top + window.scrollY - navH;
      const step = () => {
        const t = Math.min((performance.now() - started) / SCROLL_MS, 1);
        const to = liveTarget();
        window.scrollTo({ top: from + (to - from) * easeInOutCubic(t), behavior: "instant" });
        if (t < 1) flightRef.current = requestAnimationFrame(step);
      };
      flightRef.current = requestAnimationFrame(step);
    },
    [pathname]
  );

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
        role="banner"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent"
          aria-hidden="true"
        />
        <div className="pointer-events-auto relative z-10 flex h-20 items-center justify-between px-[clamp(1.5rem,5vw,4rem)]">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex shrink-0 items-center"
              aria-label="Cicada 2067 — Home"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src="/assets/cicada_logo.jpg"
                alt="Cicada 2067"
                className="h-10 w-auto object-cover object-[50%_45%] mix-blend-screen contrast-125 brightness-105 [aspect-ratio:120/52] [mask-image:radial-gradient(118%_118%_at_50%_50%,#000_50%,transparent_100%)] sm:h-[52px]"
              />
            </Link>
            <div className="h-7 w-px bg-white/20 sm:h-10" aria-hidden="true" />
            <a
              href="https://www.bankofbaroda.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center translate-y-1 sm:translate-y-1.5 transition-opacity hover:opacity-80"
              aria-label="Bank of Baroda"
            >
              <img
                src="/assets/bob_logo.png"
                alt="Bank of Baroda"
                className="h-10 w-auto object-contain sm:h-14 md:h-[62px]"
              />
            </a>
          </div>

        <nav aria-label="Main navigation">
          <ul className="hidden items-center gap-[clamp(1.5rem,3vw,2.5rem)] md:flex">
            {navLinks.map(({ label, href, external }) => {
              const active = isActive(href, label);
              return (
                <li key={label}>
                  {external ? (
                    <a
                      href={href}
                      id={`nav-${label.toLowerCase()}`}
                      className={linkClass(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      id={`nav-${label.toLowerCase()}`}
                      className={linkClass(active)}
                      aria-current={active ? "page" : undefined}
                      onClick={href === "/#faq" ? scrollToFaq : undefined}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          data-open={menuOpen || undefined}
          className="group z-[110] flex min-h-11 min-w-11 flex-col items-center justify-center gap-[5px] bg-transparent p-2 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="block h-0.5 w-6 bg-accretion shadow-[0_0_4px_rgba(244,162,51,0.4)] transition group-data-[open]:translate-y-[7px] group-data-[open]:rotate-45" />
          <span className="block h-0.5 w-6 bg-accretion shadow-[0_0_4px_rgba(244,162,51,0.4)] transition group-data-[open]:scale-x-0 group-data-[open]:opacity-0" />
          <span className="block h-0.5 w-6 bg-accretion shadow-[0_0_4px_rgba(244,162,51,0.4)] transition group-data-[open]:-translate-y-[7px] group-data-[open]:-rotate-45" />
        </button>
        </div>
      </header>

      <nav
        id="mobile-menu"
        className={`fixed inset-x-0 top-20 z-[99] flex flex-col bg-gradient-to-b from-black/90 to-black/95 px-8 py-6 transition md:hidden ${
          menuOpen
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2.5 opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        {navLinks.map(({ label, href, external }) => {
          const active = isActive(href, label);
          const className = `block border-b border-accretion/8 py-4 font-rajdhani text-lg font-semibold uppercase tracking-[0.25em] last:border-0 ${
            active ? "text-accretion" : "text-starlight-dim hover:text-accretion-bright"
          }`;
          if (external) {
            return (
              <a
                key={label}
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            );
          }
          return (
            <Link
              key={label}
              to={href}
              className={className}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (href === "/#faq") scrollToFaq(e);
                setMenuOpen(false);
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        className={`fixed inset-0 z-[98] bg-black/60 transition md:hidden ${
          menuOpen ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
    </>
  );
}

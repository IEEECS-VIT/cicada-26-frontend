"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "HOME",    href: "/" },
  { label: "ABOUT",   href: "/puzzles" },
  { label: "FAQs",    href: "/#faq" },
  { label: "TEAM",    href: "/team" },
  { label: "LOGIN",   href: "/login" },
  { label: "DISCORD", href: "/discord" },
];

const SCROLL_MS = 900;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const flightRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(flightRef.current), []);

  /*
   * #faq sits ~7000px down, past the entire WebGL tunnel. Native smooth scroll
   * crawls that and fights `html { scroll-behavior: smooth }` in globals.css,
   * so drive it here with behavior:"instant" — the same reason lib/tunnel.ts
   * uses it for the snap. The tunnel's snap leaves this landing alone because
   * it is gated on exitT === 0 (see `snappable` there), not because of anything
   * this function does.
   */
  const scrollToFaq = useCallback(
    (e: React.MouseEvent) => {
      if (pathname !== "/") return; // different route — let Next navigate, hash resolves on arrival
      const target = document.getElementById("faq");
      if (!target) return;
      e.preventDefault();
      setMenuOpen(false);

      cancelAnimationFrame(flightRef.current);
      const navH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height"), 10) || 80;
      const from = window.scrollY;
      const started = performance.now();

      /* Re-measured every frame, NOT captured once up front. lib/tunnel.ts sizes
         .tunnel-track to 636dvh from an effect, and the FAQ grows again when TARS
         mounts — so the FAQ's document position moves by thousands of pixels
         during and after page load. A target captured at click time is stale the
         moment the layout settles, and the flight lands short. rect.top + scrollY
         is scroll-invariant, so re-reading it mid-flight converges instead of
         chasing itself. One forced layout per frame for ~900ms is a fair price. */
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
      <header className="navbar" role="banner">
        {/* Logo — the wordmark is baked into the image, so there is no
            separate text lockup. The source is a 1280² with heavy black
            padding; .navbar-logo img crops it to the mark. */}
        <Link
          href="/"
          className="navbar-logo"
          aria-label="Cicada 2067 — Home"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/cicada_logo.jpg"
            alt="Cicada 2067"
            width={1280}
            height={1280}
            priority
            quality={90}
            sizes="200px"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation">
          <ul className="navbar-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  id={`nav-${label.toLowerCase()}`}
                  className={`navbar-link${label === "DISCORD" ? " discord-link" : ""}${
                    pathname === href ? " active" : ""
                  }`}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={href === "/#faq" ? scrollToFaq : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hamburger button */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="mobile-menu-link"
            aria-current={pathname === href ? "page" : undefined}
            onClick={(e) => {
              if (href === "/#faq") scrollToFaq(e);
              setMenuOpen(false);
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

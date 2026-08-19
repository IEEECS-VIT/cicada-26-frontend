import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "HOME",    href: "/" },
  { label: "ABOUT",   href: "/puzzles" },
  { label: "FAQs",    href: "/#faq" },
  { label: "TEAM",    href: "/team" },
  { label: "LOGIN",   href: "/login" },
  { label: "DISCORD", href: "/discord" },
];

const SCROLL_MS = 900;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const flightRef = useRef(0);

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
      <header className="navbar" role="banner">
        <Link
          to="/"
          className="navbar-logo"
          aria-label="Cicada 2067 — Home"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/landing/cicada_logo.jpg"
            alt="Cicada 2067"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation">
          <ul className="navbar-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  to={href}
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
            to={href}
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

      {/* Scrim */}
      <div
        className={`mobile-menu-scrim${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
    </>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "HOME",    href: "/" },
  { label: "PUZZLES", href: "/puzzles" },
  { label: "INSIGHTS",href: "/insights" },
  { label: "TEAM",    href: "/team" },
  { label: "LOGIN",   href: "/login" },
  { label: "DISCORD", href: "/discord" },
];

/* Glowing cicada SVG logo */
function CicadaIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="20" cy="22" rx="4" ry="10" fill="#F4A233" opacity="0.9" />
      {/* Head */}
      <circle cx="20" cy="11" r="3.5" fill="#FFD97D" opacity="0.95" />
      {/* Eyes */}
      <circle cx="18" cy="10.5" r="1" fill="#000" />
      <circle cx="22" cy="10.5" r="1" fill="#000" />
      {/* Upper wings */}
      <ellipse cx="11" cy="16" rx="7" ry="3.5" fill="#F4A233" opacity="0.5" transform="rotate(-20 11 16)" />
      <ellipse cx="29" cy="16" rx="7" ry="3.5" fill="#F4A233" opacity="0.5" transform="rotate(20 29 16)" />
      {/* Lower wings */}
      <ellipse cx="12" cy="23" rx="6" ry="2.5" fill="#C07810" opacity="0.4" transform="rotate(-10 12 23)" />
      <ellipse cx="28" cy="23" rx="6" ry="2.5" fill="#C07810" opacity="0.4" transform="rotate(10 28 23)" />
      {/* Antenna */}
      <line x1="18" y1="8" x2="13" y2="3" stroke="#F4A233" strokeWidth="1" opacity="0.7" />
      <line x1="22" y1="8" x2="27" y2="3" stroke="#F4A233" strokeWidth="1" opacity="0.7" />
      <circle cx="13" cy="3" r="1" fill="#FFD97D" opacity="0.8" />
      <circle cx="27" cy="3" r="1" fill="#FFD97D" opacity="0.8" />
      {/* Wing veins */}
      <line x1="11" y1="15" x2="7" y2="19" stroke="#FFD97D" strokeWidth="0.5" opacity="0.3" />
      <line x1="29" y1="15" x2="33" y2="19" stroke="#FFD97D" strokeWidth="0.5" opacity="0.3" />
      {/* Glow ring */}
      <circle cx="20" cy="20" r="18" stroke="#F4A233" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="navbar" role="banner">
        {/* Logo */}
        <Link
          href="/"
          className="navbar-logo"
          aria-label="Cicada 2067 — Home"
          onClick={() => setMenuOpen(false)}
        >
          <div className="navbar-logo-icon">
            <CicadaIcon />
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-name">CICADA 2067</span>
            <span className="navbar-logo-sub">LISTEN. ADAPT. SURVIVE.</span>
          </div>
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
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

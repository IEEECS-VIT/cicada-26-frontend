"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "HOME",    href: "/" },
  { label: "ABOUT",   href: "/puzzles" },
  { label: "FAQs",    href: "/insights" },
  { label: "TEAM",    href: "/team" },
  { label: "LOGIN",   href: "/login" },
  { label: "DISCORD", href: "/discord" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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

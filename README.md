# 🪲 Cicada 2067 — Project README

> *"Listen. Adapt. Survive."*
> An interstellar cryptic hunt. Solve, decipher, and decode the unknown.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [File-by-File Description](#file-by-file-description)
- [Key Feature Locations](#key-feature-locations)
- [Current Progress](#current-progress)
- [Development Guide](#development-guide)

---

## Overview

Cicada 2067 is an **Interstellar-themed cryptic hunt** landing page built with Next.js 14. The design is dark, cinematic, and enigmatic — inspired by the film *Interstellar* and the aesthetics of deep space. The site features:

- A **photorealistic black hole background** (Gargantua-inspired)
- Smooth entrance animations and gold accretion-toned UI
- A fully responsive layout from 4K desktop down to 375px mobile

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Next.js | 14.2.5 | React framework, file-based routing |
| React | 18 | Component model |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4.1 | Utility classes (used sparingly) |
| Google Fonts | (next/font) | Orbitron, Inter, Rajdhani |

---

## Folder Structure

```
cicada/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, metadata, global CSS
│   ├── page.tsx                  # Home page: blackhole background + Navbar + Hero
│   ├── globals.css               # Global design system, all component styles
│   │
│   ├── insights/                 # /insights route
│   │   └── page.tsx              # Insights coming-soon page
│   ├── puzzles/                  # /puzzles route
│   │   └── page.tsx              # Puzzles coming-soon page
│   ├── team/                     # /team route
│   │   └── page.tsx              # Team coming-soon page
│   ├── login/                    # /login route
│   │   └── page.tsx              # Login coming-soon page
│   └── discord/                  # /discord route
│       └── page.tsx              # Discord redirect / coming-soon page
│
├── components/                   # Reusable React components
│   ├── Navbar.tsx                # Fixed navigation header + mobile hamburger menu
│   ├── HeroSection.tsx           # Full-viewport hero layout (text)
│   └── ComingSoon.tsx            # Generic coming-soon page wrapper
│
├── public/                       # Static assets served at root URL
│   ├── blackhole.png             # Cinematic Gargantua black hole background image
│   └── blackhole.jpg             # LEGACY — old lower-quality background
│
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration + font variables
├── tsconfig.json                 # TypeScript compiler options
├── postcss.config.js             # PostCSS (Tailwind + autoprefixer)
├── package.json                  # Dependencies and npm scripts
└── README.md                     # This file
```

---

## File-by-File Description

### `app/layout.tsx`
**Root layout** shared across all pages. Responsibilities:
- Loads three Google Font families via `next/font/google`: `Orbitron` (display/headings), `Inter` (body), `Rajdhani` (UI labels)
- Injects CSS custom property variables for each font family
- Sets SEO metadata: title, description, keywords, Open Graph
- Imports `globals.css` — the single source of truth for all visual styles

### `app/page.tsx`
**Home page** (`/`). Composes three layers:
1. `.blackhole-bg` — a `next/image` `fill` component using `/public/blackhole.png` as the fixed background
2. `<Navbar />` — fixed navigation bar at `z-index: 100`
3. `<HeroSection />` — the main hero content

### `app/globals.css`
**Global design system** (~820 lines). Contains:
- CSS custom properties (brand colours, font variables, layout tokens)
- CSS reset and body base styles
- Star-field background on `body::before` using stacked `radial-gradient`s
- All component styles: `.navbar`, `.hero-section`, `.hero-left`, `.cta-button`, `.scroll-indicator`, `.coming-soon-*`
- All keyframe animations: `fadeSlideIn`, `textShimmer`, `scrollBounce`
- Full responsive breakpoints: `@media (max-width: 1024px)`, `768px`, `480px`

### `components/Navbar.tsx`
**Navigation header**. Features:
- Cicada SVG logo (inline, animated with CSS `drop-shadow` glow)
- Desktop nav links with underline-slide hover effect
- Hamburger toggle for mobile with transform animations
- `usePathname()` for active link highlighting
- Separate `<nav id="mobile-menu">` that slides down on mobile

### `components/HeroSection.tsx`
**Hero section layout**. Structure:
- `<main class="hero-section">` — CSS Grid: `52% | 48%`
- `.hero-left` — eyebrow text → h1 heading → body copy → CTA button
- Grid column 2 is intentionally empty — the black-hole background reads through it
- `.scroll-indicator` — **placed as a sibling of hero-left** (outside the left column) so that `position: absolute; left: 1.75rem` anchors it to the hero-section edge, preventing any text overlap

### `components/ComingSoon.tsx`
Reusable **coming-soon page** component. Accepts a `title` and optional `subtitle` prop. Used by all sub-routes (puzzles, insights, team, etc.) that are not yet built.

### `public/blackhole.png`
**Cinematic Gargantua background image** — AI-generated at high resolution with warm golden/amber accretion disk tones, gravitational lensing arcs, and deep star-field background. Displayed as a fixed `next/image` background on the home page with CSS filter `saturate(1.25) brightness(0.88) contrast(1.06)`.

---

## Key Feature Locations

| Feature | File(s) | Lines / Notes |
|---|---|---|
| **Black hole background** | `app/page.tsx` + `globals.css` | `.blackhole-bg` styles |
| **Hero text layout** | `components/HeroSection.tsx` | Left column DOM |
| **Scroll indicator (fixed)** | `HeroSection.tsx` + `globals.css` | Outside `.hero-left`, `left: 1.75rem` |
| **Navigation** | `components/Navbar.tsx` | Full file |
| **Mobile hamburger** | `Navbar.tsx` + `globals.css` | `.hamburger`, `.mobile-menu` |
| **CTA button** | `HeroSection.tsx` + `globals.css` | `.cta-button` + `#cta-register` |
| **Text shimmer animation** | `globals.css` | `@keyframes textShimmer` |
| **Responsive breakpoints** | `globals.css` | Bottom of file, 3 breakpoints |

---

## Current Progress

### ✅ Done
- [x] Cinematic black hole background (high-quality AI-generated PNG)
- [x] Fixed navigation with SVG Cicada logo
- [x] Hero headline with shimmer/glow animation
- [x] Scroll indicator repositioned (no text overlap)
- [x] Mobile responsive layout
- [x] All sub-routes returning ComingSoon pages

### 🚧 To Do (future)
- [ ] Puzzles page — actual puzzle content
- [ ] Team page — team member grid
- [ ] Login page — authentication UI
- [ ] Insights page — blog/updates content
- [ ] Discord integration / redirect
- [ ] Sound design (optional ambient audio)

---

## Development Guide

### Install & Run

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

### Adding a New Page

1. Create `app/<route-name>/page.tsx`
2. Export a default component using `<ComingSoon title="Your Title" />`
3. Add the route to `NAV_LINKS` in `components/Navbar.tsx`

### Modifying the Background

The black hole image is at `public/blackhole.png`. To swap it:
1. Place your image in `public/`
2. Update the `src` in `app/page.tsx`
3. Adjust `.blackhole-bg img` filter values in `globals.css`

### Design Tokens

All colours and typography are defined as CSS custom properties in `globals.css`:

```css
--color-accretion: #F4A233;        /* primary gold/amber accent */
--color-accretion-bright: #FFD97D; /* lighter amber for glows */
--color-starlight: #F5F5F0;        /* near-white text */
--font-orbitron: "Orbitron";       /* headings, titles, CTA */
--font-rajdhani: "Rajdhani";       /* nav links, labels */
--font-inter: "Inter";             /* body copy */
```

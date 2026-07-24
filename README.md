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
- A **Canvas 2D animated spacecraft** (Endurance-style ring station) orbiting in the foreground
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
| Canvas 2D API | Browser native | Spacecraft animation (no external lib) |
| Google Fonts | (next/font) | Orbitron, Inter, Rajdhani |

> ⚠️ **No Three.js / React Three Fiber** is used. The spacecraft is rendered entirely via the native Canvas 2D API to keep the bundle lightweight and eliminate WebGL context overhead on mobile.

---

## Folder Structure

```
cicada/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, metadata, global CSS
│   ├── page.tsx                  # Home page: blackhole background + Navbar + Hero
│   ├── globals.css               # Global design system, all component styles
│   ├── endurance.css             # LEGACY — CSS-only spaceship (not imported, kept for reference)
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
│   ├── HeroSection.tsx           # Full-viewport hero layout (text + spacecraft)
│   ├── SpacecraftCanvas.tsx      # 🚀 Canvas 2D animated Endurance spacecraft
│   ├── ComingSoon.tsx            # Generic coming-soon page wrapper
│   └── Endurance.tsx             # LEGACY — CSS-only ring spacecraft (not used)
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
- All component styles: `.navbar`, `.hero-section`, `.hero-left`, `.cta-button`, `.scroll-indicator`, `.spacecraft-scene`, `.coming-soon-*`
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
- `.hero-right` → `.spacecraft-scene` → `<SpacecraftCanvas />`
- `.scroll-indicator` — **placed as a sibling of hero-left** (outside the left column) so that `position: absolute; left: 1.75rem` anchors it to the hero-section edge, preventing any text overlap

### `components/SpacecraftCanvas.tsx` ⭐ KEY FILE
**JavaScript spacecraft animation** using Canvas 2D. Architecture:

```
useEffect
  └── ResizeObserver (canvas dimensions + DPR scaling)
  └── requestAnimationFrame loop → drawFrame(timestamp)
        ├── Compute: ringRot, bobY, driftX from timestamp
        ├── Compute: cx, cy (ship centre), R, Ry (ring radii)
        ├── [Layer 1] Ambient ring glow (radial gradient)
        ├── [Layer 2] Back ring fill + stroke (top half ellipse)
        ├── [Layer 3] Back modules (12 segments, sin θ < 0)
        ├── [Layer 4] Back struts (3 arms, sin θ < 0)
        ├── [Layer 5] Central hub (drawHub)
        ├── [Layer 6] Front struts (3 arms, sin θ > 0)
        ├── [Layer 7] Front modules (12 segments, sin θ > 0)
        ├── [Layer 8] Front ring fill + stroke (bottom half ellipse)
        ├── [Layer 9] Engine pods + glow (drawEnginePod × 3)
        └── [Layer 10] Particle system (max 180 amber particles)
```

**Depth ordering principle**: The ring habitat is a rotating torus. Viewed from the side, modules with `sin(effectiveAngle) < 0` are at the TOP of the ellipse (behind the hub) and drawn first. Modules with `sin > 0` are at the BOTTOM (in front of the hub) and drawn after. This creates correct 3D layering without WebGL.

**Performance safeguards**:
- `devicePixelRatio` capped at `2` (prevents 3x DPR on ultra-HiDPI from tripling draw time)
- `ResizeObserver` replaces `window.resize` event (more efficient)
- `cancelAnimationFrame` cleanup on unmount prevents memory leaks
- Particle count capped at 180

### `components/ComingSoon.tsx`
Reusable **coming-soon page** component. Accepts a `title` and optional `subtitle` prop. Used by all sub-routes (puzzles, insights, team, etc.) that are not yet built.

### `public/blackhole.png`
**Cinematic Gargantua background image** — AI-generated at high resolution with warm golden/amber accretion disk tones, gravitational lensing arcs, and deep star-field background. Displayed as a fixed `next/image` background on the home page with CSS filter `saturate(1.25) brightness(0.88) contrast(1.06)`.

---

## Key Feature Locations

| Feature | File(s) | Lines / Notes |
|---|---|---|
| **Spacecraft animation** | `components/SpacecraftCanvas.tsx` | Entire file — Canvas 2D loop |
| **Ring depth ordering** | `SpacecraftCanvas.tsx` | `Math.sin(theta)` check per module/strut |
| **Engine glow + particles** | `SpacecraftCanvas.tsx` | `drawEnginePod()` + `emit()` |
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
- [x] Canvas 2D Endurance spacecraft (smooth, 60fps, no lag)
- [x] Spacecraft depth-correct ring rendering (front/back layering)
- [x] Engine glow pods with pulsing radial gradients
- [x] Amber particle exhaust system
- [x] Hub with segmented modules and blue window lights
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

### Modifying the Spacecraft

All spacecraft logic is in `components/SpacecraftCanvas.tsx`.

- **Ring speed**: Adjust `ts * 0.000235` in `drawFrame`
- **Bob amplitude**: Adjust `* 9` in `bobY` calculation
- **Ring size**: Adjust `Math.min(W, H) * 0.28` for `R`
- **Engine glow intensity**: Adjust `pulse` multipliers in `drawEnginePod`
- **Particle spawn rate**: Adjust `< 0.22` probability in the engine loop
- **Module count**: Change `12` in the module loop (and match in `3` for struts if desired)

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

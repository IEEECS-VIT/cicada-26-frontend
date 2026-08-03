import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TimelineSection from "@/components/TimelineSection";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";

/*
 * page.tsx — Home page
 * ─────────────────────────────────────────────────────────────────
 * One continuous scroll: landing hero → timeline tunnel → closing.
 *
 * Layer order (back → front):
 *   z-index -1 → .blackhole-bg   : fixed 891208.jpg background
 *   z-index  0 → #tunnel-canvas  : fixed WebGL tunnel (opaque)
 *   z-index 100 → Navbar         : fixed top nav
 *   z-index 10  → HeroSection    : text + R3F canvas
 *
 * .blackhole-bg's opacity is driven per-frame by lib/tunnel.ts, which
 * cross-fades it out as the tunnel canvas fades in. It's reached from
 * there by selector because this is a server component.
 *
 * Background image setup
 * ──────────────────────
 * Place your file at:   /public/891208.jpg
 * The `next/image` fill + priority ensures it's preloaded and
 * rendered without layout shift. object-position "60% 50%"
 * nudges the bright accretion disk into the empty right half of
 * the hero, away from the copy in the left column.
 * ─────────────────────────────────────────────────────────────────
 */

export default function HomePage() {
  return (
    <>
      {/* ── Fixed background: 891208.jpg ─────────────────── */}
      <div className="blackhole-bg" aria-hidden="true">
        <Image
          /*
           * IMPORTANT: place your image at /public/891208.jpg
           * (exactly this filename). Next.js serves /public/** at root.
           */
          src="/891208.jpg"
          alt="Gargantua black hole — Interstellar cinematic background"
          fill
          priority          /* preloads as LCP image */
          quality={90}
          sizes="100vw"
          style={{
            objectFit: "cover",
            /* Pull the bright accretion disk (right side of 891208.jpg)
               into frame and keep it clearly visible behind the ship. */
            objectPosition: "62% 50%",
          }}
        />
      </div>

      <Navbar />

      <main>
        <HeroSection />
        <TimelineSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </>
  );
}

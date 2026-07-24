import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

/*
 * page.tsx — Home page
 * ─────────────────────────────────────────────────────────────────
 * Layer order (back → front):
 *   z-index -1 → .blackhole-bg   : fixed 891208.jpg background
 *   z-index 100 → Navbar         : fixed top nav
 *   z-index 10  → HeroSection    : text + R3F canvas
 *
 * Background image setup
 * ──────────────────────
 * Place your file at:   /public/891208.jpg
 * The `next/image` fill + priority ensures it's preloaded and
 * rendered without layout shift. object-position "60% 50%"
 * nudges the bright accretion disk to the right, matching the
 * expected composition when the spacecraft canvas overlays it.
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
      <HeroSection />
    </>
  );
}

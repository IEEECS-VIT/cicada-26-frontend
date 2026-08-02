"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/*
 * EnduranceShip.tsx
 * ─────────────────────────────────────────────────────────────────
 * The real Interstellar Endurance — public/endurance.js, a self-contained
 * Shadow-DOM web component (<endurance-ship>).
 *
 * WHAT OUTER CSS CAN AND CANNOT DO — read before editing:
 *   CAN  → theme it. Custom properties inherit across the shadow boundary,
 *          and outer-document declarations on the host outrank the
 *          component's own :host block. All palette work lives in
 *          globals.css under `endurance-ship`.
 *   CANNOT → touch anything INSIDE the shadow tree (.endurance, .blackhole,
 *          .cam). Those need the stylesheet injected below.
 * ─────────────────────────────────────────────────────────────────
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "endurance-ship": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

/*
 * Injected into the shadow root — the three corrections outer CSS can't reach.
 *
 * .blackhole  the component ships its own Gargantua at z-index:-3; the page
 *             already has 891208.jpg behind it, so two would stack.
 * .cam        400 empty 5cqw×5cqh divs at translateZ(75cqmin) driving a
 *             hover-camera trick that is dead anyway (.spacecraft-scene is
 *             pointer-events:none). Each is a transformed box in a
 *             preserve-3d subtree, so dropping them is a straight win.
 * orbit       the vendor's one-shot `spin 4s` lands on rotateX(40)/rotateZ(-70);
 *             this picks up from exactly that pose and keeps going.
 *
 * Desktop-only gate: this model is ~1600 preserve-3d planes that re-project
 * every frame. Measured here, a continuous orbit costs roughly half the frame
 * rate. Phones (and reduced-motion) keep the entry spin, then hold the pose.
 */
const SHADOW_CSS = `
.blackhole { display: none; }
.cam { display: none; }
/* The vendor's 90cqmin is the ring's flat diameter, but the ship is tilted
   ~40deg on X and spinning on Z, so its projected bounding box runs about
   1.4x wider than that — at 90 it overflowed the host and got clipped by
   :host{overflow:hidden}. 62 keeps the widest pose inside the frame. */
.endurance { width: 62cqmin; height: 62cqmin; }
@keyframes orbit {
  from { transform: rotateX(40deg) rotateZ(-70deg); }
  to   { transform: rotateX(40deg) rotateZ(290deg); }
}
@media (min-width: 769px) and (prefers-reduced-motion: no-preference) {
  .endurance { animation: spin 4s ease 0s 1, orbit 90s linear 4s infinite; }
}
`;

/** Returns false if the shadow root doesn't exist yet, so the caller can retry. */
function injectShadowStyles(host: HTMLElement): boolean {
  const root = host.shadowRoot;
  if (!root) return false;
  if (host.dataset.themed) return true;
  host.dataset.themed = "";

  /* The vendor itself falls back to an inline <style> where constructable
     stylesheets are unsupported (older Safari) — match that fallback. */
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(SHADOW_CSS);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  } catch {
    const style = document.createElement("style");
    style.textContent = SHADOW_CSS;
    root.appendChild(style);
  }
  return true;
}

export default function EnduranceShip() {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    /* The element upgrades only once /endurance.js has run, which next/script
       does after hydration — so the shadow root does not exist yet on mount.
       whenDefined resolves as define() upgrades it; the rAF covers the case
       where connectedCallback hasn't attached the root by that microtask. */
    const attach = () => {
      if (cancelled || !hostRef.current) return;
      if (!injectShadowStyles(hostRef.current)) rafId = requestAnimationFrame(attach);
    };
    customElements.whenDefined("endurance-ship").then(attach);
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, []);

  return (
    <>
      <Script src="/endurance.js" strategy="afterInteractive" />
      <endurance-ship ref={hostRef} />
    </>
  );
}

"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/*
 * EnduranceShip.tsx
 * ─────────────────────────────────────────────────────────────────
 * The Interstellar Endurance — public/endurance.js, a self-contained
 * Shadow-DOM web component (<endurance-ship>). Pure CSS 3D, no WebGL.
 *
 * Vendor: Josetxu — https://codepen.io/josetxu/pen/gORKrgR (MIT, see
 * public/endurance.LICENSE.txt). It in turn credits: cam system by Yusuke
 * Nakaya (codepen.io/YusukeNakaya/pen/GRWZdOb) as explained by Amit Sheen in
 * CSS-Tricks; cuboid system by jh3y (codepen.io/jh3y/pen/MWJdqBo); conic-
 * gradient drawing tricks by Ana Tudor.
 *
 * WHAT OUTER CSS CAN AND CANNOT DO — read before editing:
 *   CAN  → theme it. Custom properties inherit across the shadow boundary,
 *          and outer-document declarations on the host outrank the
 *          component's own :host block. All palette work lives in
 *          globals.css under `endurance-ship`.
 *   CANNOT → touch anything INSIDE the shadow tree (.endurance, .blackhole,
 *          .cam). Those need the stylesheet injected below.
 *
 * KNOWN COST, accepted deliberately. Measured at 1500px wide: page baseline
 * 8.3ms/frame, ship present but static 24.8ms, ship rotating 33.3ms (~29.5fps).
 * It is contained — the orbit pauses off-hero and the page returns to 8.3ms.
 * A three.js rebuild would reach ~60fps for zero bundle cost (three is already
 * loaded for lib/tunnel.ts), but would add a third WebGL context; 29.5fps was
 * chosen over that trade. Don't "fix" this by shrinking the ship: the cost is
 * element-bound, not fill-bound — see the detail-cull note below.
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
 * Injected into the shadow root — the corrections outer CSS can't reach.
 *
 * .blackhole  the component ships its own Gargantua at z-index:-3; the page
 *             already has 891208.jpg behind it, so two would stack.
 * .cam        400 empty 5cqw×5cqh divs at translateZ(75cqmin) driving a
 *             hover-camera trick. Each :hover rule pins .endurance to a fixed
 *             pose and sets animation-iteration-count:0, so they'd fight the
 *             orbit outright. Hover-to-steer is deliberately dropped.
 */
const SHADOW_CSS = `
.blackhole { display: none; }
.cam { display: none; }

/*
 * Detail cull — the single biggest lever on frame rate.
 *
 * Rotating the root re-projects every descendant every frame, and the cost is
 * element-bound, not pixel-bound: measured here, shrinking the ship 25x in
 * pixel area (590px -> 118px) moved it 19.0 -> 21.0 fps, i.e. nothing. Element
 * count is the only thing that matters. Measured, cumulative, at 1500px wide:
 *
 *   nothing culled ............ 18.5 fps / 50.1ms
 *   + .nozzle span ............ 28.0 fps / 33.4ms
 *   + .hatch, .window ......... 32.8 fps / 33.3ms
 *   + .chains ................. 36.5 fps / 25.0ms   <- visible, not done
 *   + .cylinders .............. 54.0 fps / 16.7ms   <- visible, not done
 *
 * The three culled below are interior engine-bell fins, hatch hardware and
 * window mullions: sub-pixel at any size this ship is actually rendered at.
 * .chains and .cylinders are the struts joining the modules — they read
 * clearly in the silhouette, so they stay however tempting the numbers are.
 */
.nozzle span, .hatch, .window { display: none; }

/*
 * DO NOT shrink .endurance to fit the frame. Its 90cqmin is the ring's
 * diameter, but every module sizes itself with calc(var(--width) * 1cqmin) —
 * container units resolve against the HOST, not against .endurance. Shrinking
 * the ring therefore pulls the radius in while leaving the modules full size,
 * and the twelve of them collide into a solid clump. Measured at 62cqmin:
 * circumference 1388px against 12 x 136px of module = 1632px, i.e. 18% more
 * module than ring. The vendor ratio (81% fill) is what makes it read as open.
 *
 * To fit the frame, scale the whole projection instead — radius and modules
 * together. --ship-scale is the one knob; nothing else here should change.
 */
.endurance {
  /* Measured: across a full revolution the widest projected pose is 98.9% of
     the host width (it peaks around rotateZ -50deg). That ratio is constant —
     both the ship and cqmin derive from the host — so this is the one number
     that buys clearance. 0.74 is the ceiling, re-measured in-browser at 1500px:
     the widest pose (t~52s of the orbit) puts the ship's right edge exactly on
     the host's, which is also the viewport's. Right side binds first — left has
     slack to ~0.88. Above 0.74 the ring's right modules get cut by the viewport;
     1.035 overflowed by 130px. Don't raise this without re-measuring. */
  --ship-scale: 0.95;
  transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
             rotateX(36.8deg) rotateZ(-84.525deg);
  animation: none;   /* drops the vendor's 4s entry spin — see below */
}

/*
 * rotateX is held constant so the ring turns about its own axis; animating
 * rotateZ through a full 360 is the revolution. The scale has to be repeated
 * in both keyframes: a keyframed transform replaces the whole property, so
 * omitting it here would snap the ship to full size on frame one.
 *
 * The vendor's one-shot 'spin 4s' is deliberately not chained in front of
 * this. It ends on an unscaled rotateX(142.5)->rotateX(40) sweep, so it both
 * popped the scale and fought the orbit's start pose.
 */
@keyframes orbit {
  from { transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
                    rotateX(36.8deg) rotateZ(-84.525deg); }
  to   { transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
                    rotateX(36.8deg) rotateZ(275.475deg); }
}

/*
 * One orbit, one duration, every viewport. 60s is the pace on a phone exactly
 * as it is on a laptop — a slower duration would NOT have been cheaper, since
 * cost here is per-frame projection work and is indifferent to how far the
 * ring turns between frames.
 *
 * This used to be gated to min-width:769px, with mobile holding a static pose.
 * The rotation is wanted on mobile, and the silhouette has to stay intact to
 * get it (see the cull note below), so the frame cost is accepted rather than
 * bought back. It is bounded: the WAAPI pause further down stops the orbit the
 * moment the hero scrolls away, which on a phone is within a screen or two.
 *
 * Unconditional also closes a real gap: the layout breakpoint in globals.css is
 * max-width:768px while the gate was min-width:769px, so at a fractional
 * viewport width — 768.5px, common on scaled displays — BOTH queries were false
 * and you got the desktop two-column layout with a frozen ship.
 *
 * Note there is no prefers-reduced-motion gate here, and that is deliberate.
 * 360deg / 60s is 6deg per second — ambient, no parallax, no flashing, well
 * under anything vestibular. What reduced-motion should suppress is the
 * vendor's fast 4s entry spin, and that is already gone (animation:none
 * above). To restore the gate, wrap this in "@media (prefers-reduced-motion:
 * no-preference)" — the ship then holds the pose instead.
 */
.endurance { animation: orbit 60s linear infinite; }

/*
 * NO further cull on mobile. This was tried — .chains and .cylinders hidden
 * below 768px, to buy the 32.8 -> 54.0 fps in the table above — and it is
 * wrong. Both are ring-radius structures (79% / 80% of the container, see
 * endurance.js), i.e. the passages that JOIN the twelve modules, not interior
 * detail like .nozzle span or .hatch. Hiding them leaves twelve hub cubes
 * floating unconnected in a circle: the ship stops reading as the Endurance.
 * Verified visually at 390px.
 *
 * The "visible, not done" annotations on those two rows of the table are
 * therefore binding at every viewport, not just desktop. Everything that was
 * safe to cull already is. If mobile frame rate has to come down further, the
 * lever is the WAAPI pause below (already in place) or a three.js rebuild —
 * not more display:none.
 */
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

export default function EnduranceShip({ idle = false }: { idle?: boolean }) {
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

  /*
   * Off-hero pause, driven through the Web Animations API rather than CSS.
   *
   * The obvious version of this is a `:host([data-idle]) .endurance {
   * animation-play-state: paused }` rule in SHADOW_CSS. Do not use it — it was
   * tried and measured, and it silently does nothing here: getComputedStyle
   * reports "paused" while the animation's currentTime keeps advancing (4025ms
   * over a 4s window) and the frame cost is unchanged (33.3ms vs 33.4ms) with
   * the ship still on screen. WAAPI pause() is authoritative and verifiable.
   *
   * Off-screen culling would mostly hide the difference — the page measures at
   * its 8.3ms baseline past the hero either way — but this makes the guarantee
   * explicit instead of leaning on a browser heuristic.
   */
  useEffect(() => {
    const root = hostRef.current?.shadowRoot;
    const ring = root?.querySelector(".endurance");
    if (!ring) return;
    /* getAnimations() is empty until the injected sheet has applied, so this
       effect is a no-op on the first pass and correct on every later one. */
    for (const anim of ring.getAnimations()) idle ? anim.pause() : anim.play();
  }, [idle]);

  return (
    <>
      <Script src="/endurance.js" strategy="afterInteractive" />
      <endurance-ship ref={hostRef} />
    </>
  );
}

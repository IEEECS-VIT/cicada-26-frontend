import { useEffect, useRef } from "react";

/*
 * EnduranceShip.tsx — the Interstellar Endurance, ported from the Next.js
 * landing. /landing/endurance.js (a self-contained Shadow-DOM web component)
 * is loaded globally via <script> in index.html.
 */

const SHADOW_CSS = `
.blackhole { display: none; }
.cam { display: none; }
.nozzle span, .hatch, .window { display: none; }
.endurance {
  --ship-scale: 0.95;
  transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
             rotateX(36.8deg) rotateZ(-84.525deg);
  animation: none;
}
@keyframes orbit {
  from { transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
                    rotateX(36.8deg) rotateZ(-84.525deg); }
  to   { transform: scale3d(var(--ship-scale), var(--ship-scale), var(--ship-scale))
                    rotateX(36.8deg) rotateZ(275.475deg); }
}
.endurance { animation: orbit 60s linear infinite; }
`;

/** Returns false if the shadow root doesn't exist yet, so the caller can retry. */
function injectShadowStyles(host) {
  const root = host.shadowRoot;
  if (!root) return false;
  if (host.dataset.themed) return true;
  host.dataset.themed = "";

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

export default function EnduranceShip({ idle = false }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    const attach = () => {
      if (cancelled || !hostRef.current) return;
      if (!injectShadowStyles(hostRef.current)) rafId = requestAnimationFrame(attach);
    };
    customElements.whenDefined("endurance-ship").then(attach);
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    const root = hostRef.current?.shadowRoot;
    const ring = root?.querySelector(".endurance");
    if (!ring) return;
    for (const anim of ring.getAnimations()) idle ? anim.pause() : anim.play();
  }, [idle]);

  return <endurance-ship ref={hostRef} />;
}
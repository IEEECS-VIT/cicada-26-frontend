import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

const MOBILE_BREAKPOINT = 768;

export default function MobileBarrier({ children }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!isMobile) return children;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: "url(/landing/891208.jpg)" }} />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 max-w-md text-center panel p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#D19B83]/60 text-primary shadow-[0_0_24px_rgba(209,155,131,0.4)]">
          <Monitor className="h-8 w-8" />
        </div>
        <p className="label-mono text-primary/70 mb-3">DESKTOP REQUIRED</p>
        <h1 className="font-display text-2xl tracking-[0.14em] text-primary mb-4">MISSION CONTROL IS DESKTOP-ONLY</h1>
        <p className="text-sm text-foreground/70 leading-relaxed">
          This sector of the terminal is optimized for a desktop experience. Please switch to a laptop or desktop computer to proceed.
        </p>
        <p className="label-mono text-[10px] text-primary/40 mt-8">
          CICADA 2067 · MISSION SYSTEMS ONLINE
        </p>
      </div>
    </div>
  );
}
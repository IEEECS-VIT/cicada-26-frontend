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
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-6 text-starlight">
      <div className="max-w-md text-center">
        <Monitor className="mx-auto mb-6 h-10 w-10 text-accretion" />
        <p className="mb-3 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">DESKTOP REQUIRED</p>
        <h1 className="font-orbitron text-2xl tracking-[0.14em]">ADMIN CONSOLE IS DESKTOP-ONLY</h1>
        <p className="mt-4 text-sm leading-7 text-copper">
          Switch to a laptop or desktop to reach mission control. The hunt itself is open on this device.
        </p>
      </div>
    </div>
  );
}

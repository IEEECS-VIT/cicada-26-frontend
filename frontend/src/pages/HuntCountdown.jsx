import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { huntStartDate, msUntilHunt, pad, splitCountdown } from "../config/hunt";

export default function HuntCountdown({ onOpen, teamName, onLogout }) {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(() => msUntilHunt());

  useEffect(() => {
    const tick = () => {
      const next = msUntilHunt();
      setRemaining(next);
      if (next <= 0) onOpen?.();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [onOpen]);

  const { days, hours, minutes, seconds } = splitCountdown(remaining);
  const units = [
    ...(days > 0 ? [["DAYS", pad(days)]] : []),
    ["HRS", pad(hours)],
    ["MIN", pad(minutes)],
    ["SEC", pad(seconds)],
  ];

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-black px-4 py-12 text-starlight sm:px-6 sm:py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-12 flex items-start justify-between gap-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 font-rajdhani text-[11px] tracking-[0.36em] text-copper transition hover:text-accretion"
          >
            <Home className="h-3.5 w-3.5" /> HOME
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 border border-copper/30 px-3 py-2 font-rajdhani text-[11px] tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
            >
              <LogOut className="h-4 w-4" /> SIGNOUT
            </button>
          )}
        </div>

        <p className="mb-3 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">TERMINAL LOCKED</p>
        <h1 className="font-orbitron text-3xl tracking-[0.1em] sm:text-5xl sm:tracking-[0.14em]">T-MINUS</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-copper">
          The arena opens {huntStartDate().toLocaleString()}. Hold station until then.
        </p>
        {teamName && (
          <p className="mt-3 font-rajdhani text-sm tracking-[0.16em] text-copper">
            CREW · <span className="text-accretion">{teamName}</span>
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:grid-cols-4 sm:gap-6">
          {units.map(([label, value]) => (
            <div key={label} className="border-t border-accretion/30 pt-4 text-center sm:text-left">
              <p className="font-orbitron text-4xl tracking-[0.06em] text-starlight sm:text-6xl sm:tracking-[0.08em]">{value}</p>
              <p className="mt-3 font-rajdhani text-[11px] tracking-[0.32em] text-copper">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

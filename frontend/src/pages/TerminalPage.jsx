import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GameStateProvider } from "../context/GameStateContext";
import Terminal from "../components/Terminal/Terminal";
import HuntCountdown from "./HuntCountdown";
import { HUNT_LOCK_ENABLED, isHuntOpen } from "../config/hunt";
import { LogOut, Home } from "lucide-react";

export default function TerminalPage() {
  const { user, teamName, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [huntOpen, setHuntOpen] = useState(() => isHuntOpen());

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
    else if (!teamName) navigate("/team-setup", { replace: true });
  }, [loading, user, teamName, navigate]);

  useEffect(() => {
    if (huntOpen) return;
    const id = setInterval(() => {
      if (isHuntOpen()) setHuntOpen(true);
    }, 1000);
    return () => clearInterval(id);
  }, [huntOpen]);

  if (loading || !user || !teamName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.32em]">ACCESSING TERMINAL</p>
      </div>
    );
  }

  /*
   * Hunt lock — OFF while testing.
   * To go live: set HUNT_LOCK_ENABLED to true in src/config/hunt.js
   */
  const lockParticipants =
    HUNT_LOCK_ENABLED &&
    !huntOpen &&
    user.role === "participant";

  if (lockParticipants) {
    return (
      <HuntCountdown
        teamName={teamName}
        onOpen={() => setHuntOpen(true)}
        onLogout={logout}
      />
    );
  }

  return (
    <GameStateProvider>
      <div className="flex h-dvh flex-col bg-black text-starlight">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-accretion/20 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-11 items-center gap-1.5 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:text-accretion sm:tracking-[0.22em]"
            >
              <Home className="h-3.5 w-3.5 shrink-0" /> HOME
            </button>
            <span className="hidden text-copper/30 sm:inline">|</span>
            <span className="min-w-0 truncate font-rajdhani text-[11px] tracking-[0.16em] text-copper sm:tracking-[0.22em]">
              CREW: <span className="text-accretion">{teamName}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:text-accretion sm:tracking-[0.22em]"
          >
            <LogOut className="h-3.5 w-3.5" /> SIGNOUT
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Terminal />
        </div>
      </div>
    </GameStateProvider>
  );
}

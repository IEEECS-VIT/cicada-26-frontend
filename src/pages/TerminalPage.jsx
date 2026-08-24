import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GameStateProvider } from "../context/GameStateContext";
import Terminal from "../components/Terminal/Terminal";
import HuntCountdown from "./HuntCountdown";
import { HUNT_LOCK_ENABLED, isHuntOpen } from "../config/hunt";
import { LogOut, Home, LayoutDashboard } from "lucide-react";

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
      <div className="terminal-theme flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
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
      <div className="terminal-theme">
        <HuntCountdown
          teamName={teamName}
          onOpen={() => setHuntOpen(true)}
          onLogout={logout}
        />
      </div>
    );
  }

  return (
    <GameStateProvider>
      <div className="terminal-theme flex h-dvh flex-col bg-black text-starlight">
        <div className="flex shrink-0 items-center justify-between gap-1.5 border-b border-accretion/20 px-2.5 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] sm:px-4 sm:py-2">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1 py-1 px-1.5 font-rajdhani text-[11px] tracking-[0.14em] text-copper transition-colors hover:text-accretion sm:text-xs sm:tracking-[0.22em] rounded"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="inline">HOME</span>
            </button>
            <span className="text-copper/30">|</span>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1 py-1 px-1.5 font-rajdhani text-[11px] tracking-[0.14em] text-copper transition-colors hover:text-accretion sm:text-xs sm:tracking-[0.22em] rounded"
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              <span className="inline">DASHBOARD</span>
            </button>
            <span className="text-copper/30">|</span>
            <span className="min-w-0 truncate font-rajdhani text-[11px] tracking-[0.12em] text-copper sm:text-xs sm:tracking-[0.22em]">
              <span className="hidden xs:inline">CREW: </span>
              <span className="text-accretion font-medium">{teamName}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex shrink-0 items-center gap-1 py-1 px-1.5 font-rajdhani text-[11px] tracking-[0.14em] text-copper transition-colors hover:text-accretion sm:text-xs sm:tracking-[0.22em] rounded"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">SIGNOUT</span>
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Terminal />
        </div>
      </div>
    </GameStateProvider>
  );
}

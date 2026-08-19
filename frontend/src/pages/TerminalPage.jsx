import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GameStateProvider } from "../context/GameStateContext";
import Terminal from "../components/Terminal/Terminal";
import { LogOut, Home } from "lucide-react";

export default function TerminalPage() {
  const { user, teamName, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
    else if (!teamName) navigate("/team-setup", { replace: true });
  }, [loading, user, teamName, navigate]);

  if (loading || !user || !teamName) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
        <div className="animate-pulse text-primary">Accessing secure terminal...</div>
      </div>
    );
  }

  return (
    <GameStateProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-mono">
        <div className="shrink-0 flex items-center justify-between border-b border-[#D19B83]/30 bg-black/60 px-4 py-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </button>
            <span className="text-primary/20">|</span>
            <span className="label-mono text-[10px] text-primary/60">CREW: <span className="text-primary">{teamName}</span></span>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Signout
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Terminal />
        </div>
      </div>
    </GameStateProvider>
  );
}
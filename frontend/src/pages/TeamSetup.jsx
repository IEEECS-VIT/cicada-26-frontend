import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTeam, joinTeam, leaveTeam } from "../api/teams";
import { LogOut, Rocket, Users, ArrowRight } from "lucide-react";

export default function TeamSetup() {
  const { user, teamName, setTeamName, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("create"); // 'create' | 'join'
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (teamName) setInfo(`You are assigned to TEAM "${teamName}".`);
  }, [teamName]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await createTeam(teamNameInput.trim());
      setTeamName(teamNameInput.trim());
      setInfo(`TEAM "${teamNameInput.trim()}" CREATED. Invite code: ${data.invite_code}`);
      setTimeout(() => navigate("/terminal", { replace: true }), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await joinTeam(inviteCode.trim().toUpperCase());
      setInfo("Successfully joined the team. Entering mission control...");
      setTimeout(() => navigate("/terminal", { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setError("");
    try {
      await leaveTeam();
      setTeamName(null);
      setInfo("You have left the team.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
        <div className="animate-pulse text-primary">Establishing secure channel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: "url(/landing/891208.jpg)" }} />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg panel p-6 sm:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="label-mono text-primary/70">CREW ASSIGNMENT</p>
            <h1 className="font-display text-2xl tracking-[0.18em] text-primary">TEAM DEPLOYMENT</h1>
          </div>
          {user && (
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 border border-[#D19B83]/60 rounded text-primary hover:bg-primary/20 transition-colors text-xs">
              <LogOut className="h-4 w-4" /> SIGNOUT
            </button>
          )}
        </div>

        {user && (
          <div className="mb-6 bg-black/40 border border-[#D19B83]/30 rounded p-3 text-sm">
            <p className="text-primary/80">OPERATOR: <span className="text-primary">{user.display_name || user.email}</span></p>
            {teamName && (
              <p className="mt-1 text-primary/80">TEAM: <span className="text-primary">{teamName}</span></p>
            )}
          </div>
        )}

        {info && (
          <div className="mb-4 border border-[#D19B83]/40 bg-[#D19B83]/10 rounded p-3 text-sm text-primary/90">{info}</div>
        )}
        {error && (
          <div className="mb-4 border border-red-400/50 bg-red-500/10 rounded p-3 text-sm text-red-300">{error}</div>
        )}

        {teamName ? (
          <div className="text-center">
            <p className="text-sm text-foreground/70 mb-6">You are already deployed with a team.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/terminal")} className="w-full flex items-center justify-center gap-2 rounded-md border border-[#D19B83] px-4 py-3 font-display text-sm tracking-[0.18em] uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Rocket className="h-4 w-4" /> Enter Terminal
              </button>
              <button onClick={handleLeave} className="w-full rounded-md border border-[#D19B83]/60 px-4 py-3 font-display text-sm tracking-[0.18em] uppercase text-primary/70 hover:bg-[#D19B83]/20 transition-colors">
                Leave Team
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setMode("create")}
                className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 font-display text-sm tracking-widest uppercase transition-colors ${
                  mode === "create" ? "border-[#D19B83] bg-[#D19B83]/20 text-primary" : "border-[#D19B83]/40 text-foreground/70 hover:bg-[#D19B83]/10"
                }`}
              >
                <Rocket className="h-4 w-4" /> Create
              </button>
              <button
                onClick={() => setMode("join")}
                className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 font-display text-sm tracking-widest uppercase transition-colors ${
                  mode === "join" ? "border-[#D19B83] bg-[#D19B83]/20 text-primary" : "border-[#D19B83]/40 text-foreground/70 hover:bg-[#D19B83]/10"
                }`}
              >
                <Users className="h-4 w-4" /> Join
              </button>
            </div>

            {mode === "create" ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label-mono text-[10px] text-primary/60 mb-2 block">TEAM NAME</label>
                  <input
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    required
                    maxLength={40}
                    placeholder="Enter your team name"
                    className="w-full bg-black/40 border border-[#D19B83]/50 rounded px-4 py-3 outline-none text-primary placeholder:text-primary/30 focus:border-[#D19B83]"
                  />
                </div>
                <button disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-md border border-[#D19B83] px-4 py-3 font-display text-sm tracking-[0.18em] uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
                  <ArrowRight className="h-4 w-4" /> {busy ? "Deploying..." : "Create Team"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="label-mono text-[10px] text-primary/60 mb-2 block">INVITE CODE</label>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="XXXXXX"
                    className="w-full bg-black/40 border border-[#D19B83]/50 rounded px-4 py-3 outline-none text-primary placeholder:text-primary/30 focus:border-[#D19B83] uppercase tracking-[0.4em] text-center"
                  />
                </div>
                <button disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-md border border-[#D19B83] px-4 py-3 font-display text-sm tracking-[0.18em] uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
                  <ArrowRight className="h-4 w-4" /> {busy ? "Joining..." : "Join Team"}
                </button>
              </form>
            )}

            <p className="label-mono text-[10px] text-primary/40 mt-6 text-center">
              MAX 5 CREW MEMBERS PER TEAM
            </p>
          </>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTeam, joinTeam, leaveTeam } from "../api/teams";
import { LogOut, Rocket, Users, ArrowRight, Home } from "lucide-react";

export default function TeamSetup() {
  const { user, teamName, setTeamName, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("create");
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (teamName) setInfo(`Assigned to ${teamName}.`);
  }, [teamName]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await createTeam(teamNameInput.trim());
      setTeamName(teamNameInput.trim());
      setInfo(`Crew created. Invite code ${data.invite_code}`);
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
      setInfo("Joined. Entering the arena...");
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
      setInfo("You left the crew.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.32em]">ESTABLISHING CHANNEL</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-black px-4 py-12 text-starlight sm:px-6 sm:py-16">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-5 inline-flex items-center gap-2 font-rajdhani text-[11px] tracking-[0.36em] text-copper transition hover:text-accretion"
            >
              <Home className="h-3.5 w-3.5" /> HOME
            </button>
            <p className="mb-3 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">CREW ASSIGNMENT</p>
            <h1 className="font-orbitron text-3xl tracking-[0.14em] sm:text-4xl">DEPLOY</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-copper">
              Assemble a crew or enter an invite code. Five people. One vessel.
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 w-fit items-center gap-2 border border-copper/30 px-3 py-2 font-rajdhani text-[11px] tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
            >
              <LogOut className="h-4 w-4" /> SIGNOUT
            </button>
          )}
        </div>

        {user && (
          <p className="mb-6 font-rajdhani text-sm tracking-[0.16em] text-copper">
            {user.display_name || user.email}
            {teamName ? ` · ${teamName}` : ""}
          </p>
        )}

        {info && <p className="mb-4 border border-accretion/30 px-4 py-3 text-sm text-accretion">{info}</p>}
        {error && <p className="mb-4 border border-red-400/40 px-4 py-3 text-sm text-red-300">{error}</p>}

        {teamName ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/terminal")}
              className="inline-flex min-h-14 items-center justify-center gap-2 border border-accretion bg-accretion px-4 font-orbitron text-[11px] tracking-[0.22em] text-black hover:bg-accretion-bright"
            >
              <Rocket className="h-4 w-4" /> ENTER ARENA
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex min-h-14 items-center justify-center border border-copper/30 px-4 font-orbitron text-[11px] tracking-[0.22em] text-copper hover:border-accretion hover:text-accretion"
            >
              LEAVE CREW
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex gap-6 overflow-x-auto border-b border-accretion/20 sm:gap-8">
              {[
                ["create", "CREATE", Rocket],
                ["join", "JOIN", Users],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`relative pb-3 font-rajdhani text-sm tracking-[0.28em] ${
                    mode === id ? "text-accretion" : "text-copper/70 hover:text-starlight"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  {mode === id && <span className="absolute inset-x-0 bottom-0 h-px bg-accretion" />}
                </button>
              ))}
            </div>

            {mode === "create" ? (
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="mb-2 block font-rajdhani text-[11px] tracking-[0.28em] text-copper">CREW NAME</label>
                  <input
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    required
                    maxLength={40}
                    placeholder="Name your vessel"
                    className="min-h-12 w-full border border-copper/25 bg-black px-4 py-3 text-base text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  />
                </div>
                <button
                  disabled={busy}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 border border-accretion bg-accretion font-orbitron text-[11px] tracking-[0.22em] text-black hover:bg-accretion-bright disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" /> {busy ? "DEPLOYING" : "CREATE CREW"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label className="mb-2 block font-rajdhani text-[11px] tracking-[0.28em] text-copper">INVITE CODE</label>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="XXXXXX"
                    className="min-h-12 w-full border border-copper/25 bg-black px-4 py-3 text-center font-orbitron text-base tracking-[0.4em] text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  />
                </div>
                <button
                  disabled={busy}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 border border-accretion bg-accretion font-orbitron text-[11px] tracking-[0.22em] text-black hover:bg-accretion-bright disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" /> {busy ? "JOINING" : "JOIN CREW"}
                </button>
              </form>
            )}
            <p className="mt-8 text-center font-rajdhani text-[11px] tracking-[0.28em] text-copper/60">MAX 5 CREW</p>
          </>
        )}
      </div>
    </div>
  );
}

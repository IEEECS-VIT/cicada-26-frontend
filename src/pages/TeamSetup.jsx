import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTeam, joinTeam, leaveTeam } from "../api/teams";
import { LogOut, Rocket, Users, ArrowRight } from "lucide-react";
import Navbar from "../landing/Navbar";
import DashboardBackground from "../components/DashboardBackground";

export default function TeamSetup() {
  const { user, teamName, setTeamName, loading, refresh, logout } = useAuth();
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
    if (teamName) setInfo(`ASSIGNED TO CREW: ${teamName}`);
  }, [teamName]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await createTeam(teamNameInput.trim());
      setInfo(`CREW CREATED. INVITE CODE: ${data.invite_code}`);
      setTeamName(teamNameInput.trim());
      refresh();
      navigate("/terminal", { replace: true });
    } catch (err) {
      setError(err.message.toUpperCase());
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await joinTeam(inviteCode.trim().toUpperCase());
      setInfo("JOINED CREW. ENTERING THE ARENA...");
      if (res?.team_name) setTeamName(res.team_name);
      refresh();
      navigate("/terminal", { replace: true });
    } catch (err) {
      setError(err.message.toUpperCase());
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setError("");
    try {
      await leaveTeam();
      setTeamName(null);
      setInfo("YOU HAVE LEFT THE CREW.");
    } catch (err) {
      setError(err.message.toUpperCase());
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-[#e0a279]">
        <p className="animate-pulse tracking-[0.32em]">ESTABLISHING CHANNEL</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div className="relative h-screen bg-[radial-gradient(120%_90%_at_82%_42%,#17100c_0%,#0b0709_42%,#07050a_100%)] text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif] overflow-hidden box-border selection:bg-[#e0a279]/30">
        <DashboardBackground />
        
        <div className="relative z-[2] max-w-2xl mx-auto pt-[100px] px-6 h-screen flex flex-col justify-center pb-20">
          
          <div className="flex flex-col items-center text-center mb-8 animate-[cd-rise_.9s_ease-out_both]">
            <div className="font-mono text-[12px] tracking-[0.32em] text-[#a89685] mb-2">CREW ASSIGNMENT</div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-[0.14em] text-[#f6e9dd]">DEPLOYMENT PROTOCOL</h1>
            <p className="mt-4 text-[14px] text-[#b3a191] max-w-md">Assemble a crew or enter an active invite code to proceed.</p>
          </div>

          <div className="relative bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)] border border-[#e0a279]/18 rounded-md overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] p-8 sm:p-12 animate-[cd-rise_.9s_ease-out_both] [animation-delay:200ms] [@media(prefers-reduced-motion:reduce)]:animate-none">
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
              <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
            </div>

            {info && <p className="mb-6 border border-[#e0a279]/30 bg-[#e0a279]/10 px-4 py-3 text-[13px] font-mono tracking-widest text-[#e0a279] text-center">{info}</p>}
            {error && <p className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] font-mono tracking-widest text-red-400 text-center">{error}</p>}

            {teamName ? (
              <div className="flex flex-col gap-5 relative z-10">
                <button
                  type="button"
                  onClick={() => navigate("/terminal")}
                  className="cursor-pointer flex items-center justify-center gap-4 py-4 px-[26px] border border-[#e0a279] bg-[#e0a279]/10 rounded-[3px] font-mono text-[13px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/20 hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.6)] w-full"
                >
                  <Rocket className="h-5 w-5 text-[#e0a279]" /> <span>ENTER ARENA</span>
                </button>
                <button
                  type="button"
                  onClick={handleLeave}
                  className="cursor-pointer flex items-center justify-center py-4 px-[26px] border border-[#e0a279]/45 rounded-[3px] bg-transparent font-mono text-[12px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 w-full"
                >
                  LEAVE CREW
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex justify-center gap-10 border-b border-[#e0a279]/20 mb-8 pb-2">
                  {[
                    ["create", "CREATE CREW", Rocket],
                    ["join", "JOIN CREW", Users],
                  ].map(([id, label, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setMode(id); setError(""); }}
                      className={`relative pb-3 font-mono text-[12px] tracking-[0.28em] transition-colors ${
                        mode === id ? "text-[#e0a279]" : "text-[#a89685] hover:text-[#f6e9dd]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {mode === id && <span className="absolute inset-x-0 -bottom-[3px] h-px bg-[#e0a279] shadow-[0_0_10px_rgba(224,162,121,0.8)]" />}
                    </button>
                  ))}
                </div>

                {mode === "create" ? (
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div>
                      <label className="block font-mono text-[11px] tracking-[0.28em] text-[#a89685] mb-3">CREW NAME</label>
                      <input
                        value={teamNameInput}
                        onChange={(e) => setTeamNameInput(e.target.value)}
                        required
                        maxLength={40}
                        placeholder="NAME YOUR VESSEL"
                        className="w-full bg-[#0c090b]/55 border border-[#e0a279]/30 rounded-[3px] px-5 py-4 text-[16px] font-mono tracking-widest text-[#eddfd3] outline-none placeholder:text-[#a89685]/40 focus:border-[#e0a279] focus:bg-[#e0a279]/5 transition-all"
                      />
                    </div>
                    <button
                      disabled={busy}
                      className="cursor-pointer flex items-center justify-center gap-4 py-4 px-[26px] border border-[#e0a279] bg-[#e0a279]/10 rounded-[3px] font-mono text-[13px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/20 hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.6)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="h-4 w-4 text-[#e0a279]" /> <span>{busy ? "DEPLOYING..." : "CREATE CREW"}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                      <label className="block font-mono text-[11px] tracking-[0.28em] text-[#a89685] mb-3 text-center">INVITE CODE</label>
                      <input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                        maxLength={6}
                        placeholder="XXXXXX"
                        className="w-full bg-[#0c090b]/55 border border-[#e0a279]/30 rounded-[3px] px-5 py-4 text-center text-[22px] font-mono tracking-[0.4em] text-[#eddfd3] outline-none placeholder:text-[#a89685]/40 focus:border-[#e0a279] focus:bg-[#e0a279]/5 transition-all uppercase"
                      />
                    </div>
                    <button
                      disabled={busy}
                      className="cursor-pointer flex items-center justify-center gap-4 py-4 px-[26px] border border-[#e0a279] bg-[#e0a279]/10 rounded-[3px] font-mono text-[13px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/20 hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.6)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="h-4 w-4 text-[#e0a279]" /> <span>{busy ? "JOINING..." : "JOIN CREW"}</span>
                    </button>
                  </form>
                )}
                
                <div className="mt-8 pt-6 border-t border-[#e0a279]/10 text-center">
                  <p className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]/60">MAXIMUM 5 OPERATIVES PER CREW</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

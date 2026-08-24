import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyTeam } from "../api/teams";
import { useAuth } from "../context/AuthContext";
import { Rocket, Copy, Check, Users } from "lucide-react";

export default function CrewPortal({ onNoTeam }) {
  const { user, teamName, setTeamName } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowVideo(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyTeam();
        if (cancelled) return;
        setTeam(data.team);
        setSelectedId(data.team?.members?.[0]?.id || null);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          if (onNoTeam) onNoTeam();
          setTeamName(null);
          return;
        }
        setError(err.message || "Unable to reach mission command.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const copyTeamCode = () => {
    if (!team?.invite_code) return;
    navigator.clipboard.writeText(team.invite_code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const members = team?.members || [];
  const displayName = team?.name || teamName || "UNASSIGNED";

  return (
    <section className="relative isolate h-screen overflow-hidden bg-black text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif]" aria-label="Crew portal">
      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
        @keyframes cd-blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
      `}</style>
      
      {/* Retained original background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img src="/assets/891208.jpg" alt="" className="h-full w-full object-cover" />
        {showVideo && (
          <video autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
            <source src="/assets/gargantua.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,rgba(0,0,0,0.18)_3px,rgba(0,0,0,0.18)_4px)] opacity-40" />
      </div>

      <div className="pointer-events-none absolute left-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-l border-t border-[#e0a279]/50 sm:left-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-r border-t border-[#e0a279]/50 sm:right-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-8 w-8 border-b border-l border-[#e0a279]/50 sm:bottom-8 sm:left-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 right-4 h-8 w-8 border-b border-r border-[#e0a279]/50 sm:bottom-8 sm:right-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />

      <div className="relative z-[2] mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center pt-[var(--nav-height)] px-4 sm:px-6 pb-12">
        {loading ? (
          <p className="font-mono text-[12px] tracking-[0.4em] text-[#e0a279] animate-pulse">RETRIEVING CREW MANIFEST</p>
        ) : error ? (
          <div className="max-w-md text-center bg-[#0c090b]/80 border border-red-500/30 p-8 rounded backdrop-blur-md">
            <p className="font-mono text-lg tracking-[0.2em] text-red-400">SIGNAL LOST</p>
            <p className="mt-3 text-sm text-[#e0a279]/80">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 border border-[#e0a279] px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-[#e0a279] transition hover:bg-[#e0a279]/10"
            >
              RETRY UPLINK
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-[cd-rise_.9s_ease-out_both]">
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="font-mono text-[12px] tracking-[0.32em] text-[#a89685] mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> CREW MANIFEST
              </div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-[0.14em] text-[#f6e9dd] flex items-baseline gap-3">
                {displayName.toUpperCase()}
                <span className="w-[8px] h-[22px] bg-[#e0a279] animate-[cd-blink_1.15s_step-end_infinite] hidden sm:block" />
              </h1>
            </div>

            <div className="relative w-full bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)] border border-[#e0a279]/18 rounded-md overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] p-6 sm:p-10 flex flex-col gap-8">
              
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
                <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#e0a279]/20 pb-8">
                <div className="flex flex-col gap-2 w-full sm:w-auto text-center sm:text-left">
                  <span className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">INVITE CODE</span>
                  <div className="font-mono text-2xl tracking-[0.35em] text-[#eddfd3] bg-[#0c090b]/55 px-5 py-3 border border-[#e0a279]/30 rounded">
                    {team?.invite_code || "————"}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={copyTeamCode}
                  className={`w-full sm:w-auto cursor-pointer flex items-center justify-center gap-3 py-4 px-8 border rounded-[3px] font-mono text-[12px] tracking-[0.28em] transition-all duration-300 ${copied ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-transparent border-[#e0a279]/45 text-[#f3e6da] hover:bg-[#e0a279]/10 hover:border-[#e0a279] hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.5)]'}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> <span>COPIED</span></> : <><Copy className="w-4 h-4 text-[#e0a279]" /> <span>COPY CODE</span></>}
                </button>
              </div>

              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">OPERATIVES ({members.length}/5)</h2>
                </div>
                
                {members.length === 0 ? (
                  <p className="border border-dashed border-[#e0a279]/25 py-10 text-center text-[13px] font-mono text-[#a89685]">
                    NO CREW DETECTED.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#e0a279]/12">
                    {members.map((member) => {
                      const you = member.id === user?.id;
                      return (
                        <div
                          key={member.id}
                          className="bg-[#0c090b]/65 py-5 px-5 flex flex-col gap-[8px] transition-colors hover:bg-[#1a1310]/80"
                        >
                          <p className="font-mono text-[11px] tracking-[0.28em] text-[#e0a279]">
                            {member.is_leader ? "CAPTAIN" : "OPERATIVE"} {you && " (YOU)"}
                          </p>
                          <p className="font-mono text-[16px] font-light tracking-[0.08em] text-[#eddfd3] truncate">
                            {member.display_name.toUpperCase()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative z-10 flex justify-center mt-2">
                <Link
                  to="/terminal"
                  className="cursor-pointer flex items-center justify-center gap-4 py-4 px-[36px] border border-[#e0a279] bg-[#e0a279]/10 rounded-[3px] font-mono text-[13px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/20 hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.6)] w-full sm:w-auto"
                >
                  <Rocket className="h-5 w-5 text-[#e0a279]" /> <span>ENTER ARENA</span>
                </Link>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}

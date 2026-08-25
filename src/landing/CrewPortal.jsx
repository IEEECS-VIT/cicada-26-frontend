import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyTeam, leaveTeam } from "../api/teams";
import { useAuth } from "../context/AuthContext";
import { Rocket, Copy, Check, Users, Crown, User, LogOut, AlertTriangle } from "lucide-react";

export default function CrewPortal({ onNoTeam }) {
  const { user, teamName, setTeamName, inviteCode: authInviteCode, refresh } = useAuth();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(() => !teamName);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    setShowVideo(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const loadTeamData = useCallback(async (isCancelled) => {
    try {
      const res = await fetchMyTeam();
      if (isCancelled()) return;
      setTeamData(res);
    } catch (err) {
      if (isCancelled()) return;
      if (err.status === 404) {
        if (onNoTeam) onNoTeam();
        setTeamName(null);
        return;
      }
      setError(err.message || "Unable to reach mission command.");
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [onNoTeam, setTeamName]);

  useEffect(() => {
    let cancelled = false;
    loadTeamData(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadTeamData]);

  // Extract team metadata flexibly from various possible backend response formats
  const normalizedTeam = useMemo(() => {
    if (!teamData && !teamName) return null;

    const root = teamData?.data || teamData?.team || teamData || {};

    const rawInviteCode =
      root?.invite_code ||
      teamData?.invite_code ||
      teamData?.team?.invite_code ||
      teamData?.data?.invite_code ||
      authInviteCode ||
      "";

    const rawTeamName =
      root?.name ||
      root?.team_name ||
      teamData?.name ||
      teamData?.team_name ||
      teamName ||
      "UNASSIGNED";

    const leaderId =
      root?.leader_id ||
      teamData?.leader_id ||
      root?.leaderId ||
      teamData?.leaderId ||
      root?.leader?.id ||
      teamData?.leader?.id ||
      null;

    const leaderName =
      root?.leader_name ||
      teamData?.leader_name ||
      root?.leaderName ||
      (typeof root?.leader === "string" ? root.leader : root?.leader?.display_name || root?.leader?.name) ||
      null;

    let rawMembers = [];
    if (Array.isArray(teamData)) {
      rawMembers = teamData;
    } else if (Array.isArray(root?.members)) {
      rawMembers = root.members;
    } else if (Array.isArray(teamData?.members)) {
      rawMembers = teamData.members;
    } else if (Array.isArray(teamData?.data)) {
      rawMembers = teamData.data;
    } else if (Array.isArray(root?.team_members)) {
      rawMembers = root.team_members;
    }

    let parsedMembers = rawMembers.map((m, idx) => {
      if (typeof m === "string") {
        const isThisLeader = leaderName ? m === leaderName : idx === 0;
        return {
          id: `member-${idx}`,
          displayName: m,
          email: "",
          registerNo: "",
          isLeader: isThisLeader,
        };
      }

      const id = m.id || m._id || m.user_id || m.user?.id || `member-${idx}`;
      const name =
        m.display_name ||
        m.name ||
        m.username ||
        m.user?.display_name ||
        m.user?.name ||
        (m.email ? m.email.split("@")[0] : `OPERATIVE ${idx + 1}`);

      const email = m.email || m.user?.email || "";
      const registerNo = m.register_no || m.registration_no || m.user?.register_no || "";

      const isLeaderFlag =
        m.is_leader === true ||
        m.is_captain === true ||
        m.role === "leader" ||
        m.role === "captain" ||
        m.role === "CAPTAIN" ||
        m.role === "LEADER" ||
        (leaderId != null && (id === leaderId || m.user_id === leaderId || m.user?.id === leaderId)) ||
        (leaderName != null && (name.toLowerCase() === leaderName.toLowerCase() || email.toLowerCase() === leaderName.toLowerCase()));

      return {
        id,
        displayName: name,
        email,
        registerNo,
        isLeader: Boolean(isLeaderFlag),
      };
    });

    // If there is no explicit leader marked among members, assume first member is the captain
    if (parsedMembers.length > 0 && !parsedMembers.some((m) => m.isLeader)) {
      parsedMembers[0].isLeader = true;
    }

    // Sort so Captain is always shown first
    parsedMembers.sort((a, b) => (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0));

    // Fallback: If no members returned from backend but current user is authenticated with a team
    if (parsedMembers.length === 0 && user) {
      parsedMembers = [
        {
          id: user.id || "me",
          displayName: user.display_name || user.email?.split("@")[0] || "OPERATIVE",
          email: user.email || "",
          registerNo: user.register_no || "",
          isLeader: true,
        },
      ];
    }

    return {
      name: rawTeamName,
      inviteCode: rawInviteCode,
      members: parsedMembers,
    };
  }, [teamData, teamName, authInviteCode, user]);

  const copyTeamCode = async () => {
    const code = normalizedTeam?.inviteCode;
    if (!code || code === "————") return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silent catch
    }
  };

  const handleLeaveTeam = () => {
    setLeaveError("");
    setShowLeaveModal(true);
  };

  const confirmLeaveTeam = async () => {
    if (leaving) return;
    setLeaving(true);
    setLeaveError("");
    try {
      await leaveTeam();
      setTeamName(null);
      if (refresh) await refresh();
      if (onNoTeam) onNoTeam();
      else navigate("/team-setup", { replace: true });
    } catch (err) {
      setLeaveError(err.message || "Failed to leave crew");
      setLeaving(false);
    }
  };

  const members = normalizedTeam?.members || [];
  const displayName = normalizedTeam?.name || teamName || "UNASSIGNED";
  const displayInviteCode = normalizedTeam?.inviteCode || "————";

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-black text-[#e9dcd2] font-['Chakra_Petch',system-ui,sans-serif]" aria-label="Crew portal">
      <style>{`
        @keyframes cd-scan { 0% { transform: translateY(-10%) } 100% { transform: translateY(1100%) } }
        @keyframes cd-rise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
        @keyframes cd-blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
      `}</style>
      
      {/* Background aesthetics */}
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

      {/* Corner HUD brackets */}
      <div className="pointer-events-none absolute left-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-l border-t border-[#e0a279]/50 sm:left-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-r border-t border-[#e0a279]/50 sm:right-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-8 w-8 border-b border-l border-[#e0a279]/50 sm:bottom-8 sm:left-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 right-4 h-8 w-8 border-b border-r border-[#e0a279]/50 sm:bottom-8 sm:right-6 sm:h-10 sm:w-10 z-[1]" aria-hidden="true" />

      <div className="relative z-[2] mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center pt-[calc(var(--nav-height)+1.5rem)] px-4 sm:px-6 pb-12">
        {loading ? (
          <p className="font-mono text-[12px] tracking-[0.4em] text-[#e0a279] animate-pulse">RETRIEVING CREW MANIFEST</p>
        ) : error ? (
          <div className="max-w-md text-center bg-[#0c090b]/80 border border-red-500/30 p-8 rounded backdrop-blur-md">
            <p className="font-mono text-lg tracking-[0.2em] text-red-400">SIGNAL LOST</p>
            <p className="mt-3 text-sm text-[#e0a279]/80">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 border border-[#e0a279] px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-[#e0a279] transition hover:bg-[#e0a279]/10 cursor-pointer"
            >
              RETRY UPLINK
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-[cd-rise_.9s_ease-out_both]">
            
            {/* Header / Team Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="font-mono text-[12px] tracking-[0.32em] text-[#a89685] mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e0a279]" /> CREW MANIFEST
              </div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-[0.14em] text-[#f6e9dd] flex items-baseline gap-3">
                {displayName.toUpperCase()}
                <span className="w-[8px] h-[22px] bg-[#e0a279] animate-[cd-blink_1.15s_step-end_infinite] hidden sm:block" />
              </h1>
            </div>

            {/* Manifest HUD Card */}
            <div className="relative w-full bg-[linear-gradient(150deg,rgba(28,20,16,.72)_0%,rgba(14,10,12,.78)_60%,rgba(10,7,10,.82)_100%)] border border-[#e0a279]/18 rounded-md overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,225,200,.05)] backdrop-blur-[3px] p-6 sm:p-10 flex flex-col gap-8">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
                <div className="absolute left-0 right-0 top-0 h-[9%] bg-[linear-gradient(180deg,transparent,rgba(232,178,130,.055)_50%,transparent)] animate-[cd-scan_9s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-none" />
              </div>
              
              {/* Invite Code Top Row */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-2 border-b border-[#e0a279]/20 pb-8 w-full text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">INVITE CODE</span>
                  {copied && (
                    <span className="font-mono text-[10px] tracking-[0.2em] text-green-400 flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3" /> COPIED
                    </span>
                  )}
                </div>
                <div
                  onClick={copyTeamCode}
                  title="Click to copy invite code"
                  className="group font-mono text-2xl tracking-[0.35em] text-[#eddfd3] bg-[#0c090b]/55 px-6 py-3.5 border border-[#e0a279]/30 rounded flex items-center justify-center gap-3.5 cursor-pointer hover:border-[#e0a279] hover:bg-[#e0a279]/10 hover:shadow-[0_0_24px_-6px_rgba(224,162,121,0.35)] transition-all select-all"
                >
                  <span>{displayInviteCode}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#a89685] group-hover:text-[#e0a279] transition-colors" />
                  )}
                </div>
              </div>

              {/* Crew Manifest Members List */}
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-[11px] tracking-[0.28em] text-[#a89685]">
                    OPERATIVES ({members.length}/5)
                  </h2>
                </div>
                
                {members.length === 0 ? (
                  <p className="border border-dashed border-[#e0a279]/25 py-10 text-center text-[13px] font-mono text-[#a89685]">
                    NO CREW DETECTED.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {members.map((member) => {
                      const you = Boolean(
                        (user?.id && member.id === user.id) ||
                        (user?.email && member.email && member.email.toLowerCase() === user.email.toLowerCase()) ||
                        (user?.display_name && member.displayName.toUpperCase() === user.display_name.toUpperCase())
                      );

                      return (
                        <div
                          key={member.id}
                          className={`relative py-5 px-5 flex flex-col gap-2 rounded transition-all duration-200 ${
                            member.isLeader
                              ? "bg-[linear-gradient(145deg,rgba(224,162,121,0.08)_0%,rgba(12,9,11,0.75)_100%)] border border-[#e0a279]/50 shadow-[0_0_20px_-8px_rgba(224,162,121,0.25)]"
                              : "bg-[#0c090b]/65 border border-[#e0a279]/15 hover:bg-[#1a1310]/80 hover:border-[#e0a279]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.22em]">
                              {member.isLeader ? (
                                <>
                                  <Crown className="w-3.5 h-3.5 text-[#e0a279]" />
                                  <span className="text-[#e0a279] font-medium">CAPTAIN</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3.5 h-3.5 text-[#a89685]" />
                                  <span className="text-[#a89685]">OPERATIVE</span>
                                </>
                              )}
                              {you && <span className="text-[#f6e9dd] font-semibold"> (YOU)</span>}
                            </div>
                            
                            {member.isLeader && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#e0a279] shadow-[0_0_8px_#e0a279]" />
                            )}
                          </div>

                          <p className="font-mono text-[16px] font-light tracking-[0.08em] text-[#eddfd3] truncate" title={member.displayName}>
                            {member.displayName.toUpperCase()}
                          </p>

                          {(member.registerNo || member.email) && (
                            <p className="font-mono text-[11px] tracking-[0.1em] text-[#a89685]/75 truncate">
                              {member.registerNo ? member.registerNo.toUpperCase() : member.email}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CTA Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                <Link
                  to="/terminal"
                  className="cursor-pointer flex items-center justify-center gap-3.5 py-4 px-8 border border-[#e0a279] bg-[#e0a279]/10 rounded-[3px] font-mono text-[13px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-[#e0a279]/20 hover:shadow-[0_0_34px_-8px_rgba(224,162,121,.6)] w-full sm:w-auto"
                >
                  <Rocket className="h-5 w-5 text-[#e0a279]" /> <span>ENTER ARENA</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLeaveTeam}
                  disabled={leaving}
                  className="group cursor-pointer flex items-center justify-center gap-3 py-4 px-8 border border-[#e0a279]/45 rounded-[3px] bg-transparent font-mono text-[12px] tracking-[0.28em] text-[#f3e6da] transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 hover:shadow-[0_0_30px_-6px_rgba(239,68,68,0.35)] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-4 w-4 text-[#e0a279] transition-colors group-hover:text-red-400" />
                  <span>{leaving ? "LEAVING..." : "LEAVE CREW"}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Custom Sci-Fi HUD Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[linear-gradient(150deg,rgba(28,20,16,.96)_0%,rgba(14,10,12,.98)_60%,rgba(10,7,10,.99)_100%)] border border-red-500/40 rounded-md overflow-hidden shadow-[0_0_60px_-10px_rgba(239,68,68,0.35)] p-6 sm:p-8 flex flex-col gap-5 animate-[cd-rise_.3s_ease-out]">
            {/* Top Scanline effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
              <div className="absolute left-0 right-0 top-0 h-[12%] bg-[linear-gradient(180deg,transparent,rgba(239,68,68,.08)_50%,transparent)] animate-[cd-scan_5s_linear_infinite]" />
            </div>

            {/* Corner accents */}
            <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-red-500/50" />
            <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-red-500/50" />
            <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-red-500/50" />
            <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-red-500/50" />

            <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.28em] text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>CREW DECOUPLING PROTOCOL</span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-xl tracking-[0.1em] text-[#f6e9dd]">
                ABANDON VESSEL?
              </h3>
              <p className="font-mono text-[13px] leading-relaxed text-[#b3a191]">
                You are about to disconnect from vessel <span className="text-[#e0a279] font-bold">{displayName.toUpperCase()}</span>. You will lose access to team channels and progress until reassigned.
              </p>
            </div>

            {leaveError && (
              <p className="border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-[12px] font-mono tracking-wider text-red-400 text-center">
                {leaveError.toUpperCase()}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e0a279]/15">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leaving}
                className="cursor-pointer py-3 px-5 border border-[#e0a279]/30 rounded-[3px] bg-transparent font-mono text-[12px] tracking-[0.2em] text-[#a89685] hover:text-[#f3e6da] hover:border-[#e0a279] hover:bg-[#e0a279]/5 transition-all disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmLeaveTeam}
                disabled={leaving}
                className="cursor-pointer flex items-center justify-center gap-2 py-3 px-6 border border-red-500/60 bg-red-500/15 rounded-[3px] font-mono text-[12px] tracking-[0.2em] text-red-300 hover:bg-red-500/25 hover:border-red-500 hover:text-red-200 hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{leaving ? "DECOUPLING..." : "CONFIRM LEAVE"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

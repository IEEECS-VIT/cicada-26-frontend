import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyTeam } from "../api/teams";
import { useAuth } from "../context/AuthContext";

export default function CrewPortal() {
  const { user, teamName } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const toastTimer = useRef(undefined);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowVideo(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

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
          navigate("/team-setup", { replace: true });
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

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const copyTeamCode = () => {
    if (!team?.invite_code) return;
    navigator.clipboard.writeText(team.invite_code).catch(() => {});
    showToast(`INVITE CODE ${team.invite_code} COPIED`);
  };

  const members = team?.members || [];
  const displayName = team?.name || teamName || "UNASSIGNED";

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-black pt-[var(--nav-height)] text-copper" aria-label="Crew portal">
      <div className="absolute inset-0" aria-hidden="true">
        <img src="/assets/891208.jpg" alt="" className="h-full w-full object-cover" />
        {showVideo && (
          <video autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
            <source src="/assets/gargantua.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,rgba(0,0,0,0.18)_3px,rgba(0,0,0,0.18)_4px)] opacity-40" />
      </div>

      <div className="pointer-events-none absolute left-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-l border-t border-copper/50 sm:left-6 sm:h-10 sm:w-10" aria-hidden="true" />
      <div className="pointer-events-none absolute right-4 top-[calc(var(--nav-height)+1rem)] h-8 w-8 border-r border-t border-copper/50 sm:right-6 sm:h-10 sm:w-10" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-8 w-8 border-b border-l border-copper/50 sm:bottom-8 sm:left-6 sm:h-10 sm:w-10" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 right-4 h-8 w-8 border-b border-r border-copper/50 sm:bottom-8 sm:right-6 sm:h-10 sm:w-10" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-var(--nav-height))] w-full max-w-4xl flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        {loading ? (
          <p className="font-orbitron text-xs tracking-[0.4em] text-accretion">RETRIEVING CREW MANIFEST</p>
        ) : error ? (
          <div className="max-w-md text-center">
            <p className="font-orbitron text-lg tracking-[0.2em] text-starlight">SIGNAL LOST</p>
            <p className="mt-3 text-sm text-copper/80">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 border border-accretion px-6 py-3 font-orbitron text-[11px] tracking-[0.28em] text-accretion transition hover:bg-accretion/10"
            >
              RETRY UPLINK
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="w-full max-w-xl border border-copper/35 bg-black/55 px-6 py-5 text-center backdrop-blur-sm"
              onClick={() => showToast(`VESSEL ${displayName.toUpperCase()}`)}
            >
              <p className="break-words font-orbitron text-lg tracking-[0.16em] text-starlight sm:text-2xl sm:tracking-[0.28em]">
                — {displayName.toUpperCase()} —
              </p>
              <p className="mt-2 text-[10px] tracking-[0.22em] text-copper/70">
                {members.length} {members.length === 1 ? "CREW MEMBER" : "CREW MEMBERS"}
              </p>
            </button>

            <button
              type="button"
              onClick={copyTeamCode}
              className="mt-4 w-full max-w-xl border border-copper/25 bg-black/45 px-6 py-4 text-center backdrop-blur-sm transition hover:border-accretion/50"
            >
              <p className="text-[10px] tracking-[0.28em] text-accretion">INVITE CODE · TAP TO COPY</p>
              <p className="mt-1 break-all font-orbitron text-lg tracking-[0.28em] text-starlight sm:tracking-[0.35em]">
                {team?.invite_code || "————"}
              </p>
            </button>

            <div className="mt-10 w-full max-w-xl">
              <p className="mb-4 text-center text-[11px] tracking-[0.35em] text-copper/80">CREW MANIFEST</p>
              {members.length === 0 ? (
                <p className="border border-dashed border-copper/25 py-8 text-center text-sm text-copper/70">
                  No crew on board yet.
                </p>
              ) : (
                <div className={`grid gap-3 ${members.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {members.map((member) => {
                    const active = selectedId === member.id;
                    const you = member.id === user?.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setSelectedId(member.id);
                          showToast(member.display_name.toUpperCase());
                        }}
                        className={`border bg-black/50 px-5 py-6 text-left backdrop-blur-sm transition ${
                          active ? "border-accretion shadow-[0_0_24px_rgba(244,162,51,0.18)]" : "border-copper/25 hover:border-copper/55"
                        }`}
                      >
                        <p className="break-words font-orbitron text-base tracking-[0.12em] text-starlight sm:text-lg sm:tracking-[0.18em]">
                          {member.display_name.toUpperCase()}
                        </p>
                        <p className="mt-2 text-[10px] tracking-[0.22em] text-accretion/80">
                          {member.is_leader ? "CAPTAIN" : "CREW"}
                          {you ? " · YOU" : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/terminal"
              className="mt-10 inline-flex border border-accretion px-10 py-4 font-orbitron text-xs tracking-[0.35em] text-accretion transition hover:bg-accretion/10 hover:tracking-[0.4em]"
            >
              ENTER ARENA →
            </Link>
          </>
        )}
      </div>

      <div
        className={`pointer-events-none fixed bottom-8 left-1/2 z-20 -translate-x-1/2 border border-copper/30 bg-black/80 px-4 py-2 text-[11px] tracking-[0.18em] text-copper transition ${
          toast ? "opacity-100" : "opacity-0"
        }`}
        role="status"
      >
        {toast}
      </div>
    </section>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight, Check, ChevronRight, Clock3, Copy, LogOut, Rocket,
  ShieldCheck, UsersRound,
} from "lucide-react";
import Navbar from "../landing/Navbar";
import { useAuth } from "../context/AuthContext";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-accretion/10 py-3 last:border-0">
      <span className="font-rajdhani text-[11px] tracking-[0.2em] text-copper/70">{label}</span>
      <span className={`truncate text-right text-sm text-starlight ${mono ? "font-mono text-xs tracking-[0.08em]" : ""}`}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user, teamName, loading, logout } = useAuth();
  const navigate = useNavigate();
  const hasTeam = Boolean(teamName);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.32em]">LOADING PROFILE</p>
      </div>
    );
  }

  const displayName = user.display_name || user.email?.split("@")[0] || "Participant";

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-black text-starlight">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden="true">
        <img src="/assets/starry-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(244,162,51,0.15),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.18),#000_86%)]" />
      </div>

      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-7 border-b border-accretion/20 pb-8 md:flex-row md:items-end">
          <div className="animate-fade-in">
            <p className="mb-4 flex items-center gap-3 font-rajdhani text-[11px] tracking-[0.42em] text-accretion"><span className="inline-block h-2 w-2 rounded-full bg-accretion shadow-[0_0_12px_var(--color-accretion)]" /> PARTICIPANT CONSOLE</p>
            <h1 className="max-w-3xl font-orbitron text-3xl font-black uppercase leading-[1.08] tracking-[0.08em] sm:text-5xl lg:text-6xl">Welcome back,<br /><span className="text-accretion">{displayName.split(" ")[0]}.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-copper">Your mission status, crew assignment, and access point for Cicada 2067.</p>
          </div>
          <button type="button" onClick={logout} className="inline-flex min-h-11 items-center gap-2 self-start border border-copper/25 px-4 font-rajdhani text-[11px] tracking-[0.22em] text-copper transition hover:border-accretion hover:text-accretion md:self-auto"><LogOut className="h-3.5 w-3.5" /> SIGN OUT</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="panel relative overflow-hidden p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-32 w-32 border-l border-b border-accretion/15" aria-hidden="true" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-5"><div className="flex h-16 w-16 shrink-0 items-center justify-center border border-accretion bg-accretion/10 font-orbitron text-xl text-accretion">{initials(displayName)}</div><div><p className="font-rajdhani text-[11px] tracking-[0.32em] text-copper">IDENTITY VERIFIED</p><h2 className="mt-2 font-orbitron text-xl tracking-[0.08em]">{displayName}</h2><p className="mt-1 truncate text-sm text-copper">{user.email}</p></div></div>
              <div className="flex items-center gap-2 font-rajdhani text-[11px] tracking-[0.24em] text-accretion"><ShieldCheck className="h-4 w-4" /> ACTIVE</div>
            </div>
            <div className="mt-8 grid gap-x-8 sm:grid-cols-2"><DetailRow label="REGISTER NO." value={user.register_no || "Not assigned"} mono /><DetailRow label="ACCESS LEVEL" value={user.role || "participant"} /><DetailRow label="ENLISTED" value={formatDate(user.created_at)} /><DetailRow label="TEAM STATUS" value={hasTeam ? "Crew assigned" : "Awaiting crew"} /></div>
          </section>

          <section className={`relative overflow-hidden border p-6 sm:p-8 ${hasTeam ? "border-accretion/50 bg-accretion/10" : "border-copper/25 bg-black/60"}`}>
            <div className="mb-8 flex items-start justify-between"><div><p className="font-rajdhani text-[11px] tracking-[0.32em] text-copper">CREW ASSIGNMENT</p><h2 className="mt-3 font-orbitron text-2xl tracking-[0.08em]">{hasTeam ? teamName || "CREW ASSIGNED" : "NO CREW YET"}</h2></div><UsersRound className="h-6 w-6 text-accretion" /></div>
            <p className="max-w-sm text-sm leading-7 text-copper">{hasTeam ? "Your crew is ready. Enter the arena when the mission window opens." : "Every mission needs a crew. Create one or join a teammate with an invite code."}</p>
            <button type="button" onClick={() => navigate(hasTeam ? "/terminal" : "/team-setup")} className="mt-8 inline-flex min-h-12 w-full items-center justify-between border border-accretion bg-accretion px-4 font-orbitron text-[11px] tracking-[0.2em] text-black transition hover:bg-accretion-bright"><span className="flex items-center gap-2">{hasTeam ? <Rocket className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />} {hasTeam ? "ENTER ARENA" : "SET UP CREW"}</span><ArrowUpRight className="h-4 w-4" /></button>
          </section>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <section className="border border-copper/20 bg-black/60 p-6"><div className="flex items-center justify-between"><p className="font-rajdhani text-[11px] tracking-[0.3em] text-copper">MISSION ACCESS</p><Rocket className="h-5 w-5 text-accretion" /></div><p className="mt-6 font-orbitron text-2xl tracking-[0.08em]">{hasTeam ? "READY" : "LOCKED"}</p><p className="mt-2 text-sm leading-6 text-copper">{hasTeam ? "Arena access is available to your crew." : "Assign yourself to a crew to unlock the arena."}</p></section>
          <section className="border border-copper/20 bg-black/60 p-6"><div className="flex items-center justify-between"><p className="font-rajdhani text-[11px] tracking-[0.3em] text-copper">ACCOUNT CHECK</p><Check className="h-5 w-5 text-accretion" /></div><p className="mt-6 font-orbitron text-2xl tracking-[0.08em]">100%</p><p className="mt-2 text-sm leading-6 text-copper">Your participant profile is fully registered.</p></section>
          <section className="border border-copper/20 bg-black/60 p-6"><div className="flex items-center justify-between"><p className="font-rajdhani text-[11px] tracking-[0.3em] text-copper">NEXT SIGNAL</p><Clock3 className="h-5 w-5 text-accretion" /></div><p className="mt-6 font-orbitron text-2xl tracking-[0.08em]">STANDBY</p><p className="mt-2 text-sm leading-6 text-copper">Watch this console for mission updates.</p></section>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-accretion/15 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="font-rajdhani text-[11px] tracking-[0.26em] text-copper/60">CICADA 2067 / PARTICIPANT ID {user.id?.slice(0, 8).toUpperCase()}</p><button type="button" onClick={() => navigator.clipboard?.writeText(user.id)} className="inline-flex items-center gap-2 self-start font-rajdhani text-[11px] tracking-[0.2em] text-copper hover:text-accretion"><Copy className="h-3.5 w-3.5" /> COPY ID <ChevronRight className="h-3.5 w-3.5" /></button></div>
      </main>
    </div>
  );
}

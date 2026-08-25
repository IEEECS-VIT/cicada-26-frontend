import { LogOut, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { useAdmin } from "./AdminContext";
import { COMMAND_TABS } from "./constants";

export default function AdminHeader() {
  const {
    navigate,
    liveLoading,
    liveError,
    authUser,
    safeguardActive,
    setSafeguardActive,
    ipTrackingEnabled,
    ipTrackingLoading,
    handleToggleIpTracking,
    handleLogout,
    logout,
    activeTab,
    setActiveTab,
  } = useAdmin();

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-6 pb-2 pt-10 md:px-10">
        <div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-5 font-rajdhani text-[11px] tracking-[0.36em] text-copper transition hover:text-accretion"
          >
            ← HOME
          </button>
          <p className="mb-3 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">
            OPERATIONS · LIVE
          </p>
          <h1 className="font-orbitron text-[clamp(2.4rem,6vw,4.6rem)] font-black leading-[0.9] tracking-[0.08em] text-starlight">
            CICADA
          </h1>
          <p className="mt-2 font-rajdhani text-sm tracking-[0.42em] text-accretion">
            2067 · COMMAND
          </p>
          {liveLoading && (
            <p className="mt-3 text-xs tracking-[0.18em] text-copper/70">Syncing live crews…</p>
          )}
          {liveError && <p className="mt-3 text-xs text-red-400">{liveError}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {authUser && (
            <span className="font-rajdhani text-xs tracking-[0.22em] text-copper">
              {authUser.display_name || authUser.email}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSafeguardActive(!safeguardActive)}
            className={`border px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.22em] transition ${
              safeguardActive ? "border-accretion/50 text-accretion" : "border-red-400/50 text-red-300"
            }`}
            title={safeguardActive ? "Destructive actions locked" : "Destructive actions unlocked"}
          >
            {safeguardActive ? "SAFEGUARD ON" : "SAFEGUARD OFF"}
          </button>
          <button
            type="button"
            onClick={handleToggleIpTracking}
            disabled={ipTrackingLoading}
            className={`flex items-center gap-2 border px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.22em] transition ${
              ipTrackingLoading
                ? "border-accretion/30 bg-black/40 text-accretion/50 cursor-wait"
                : ipTrackingEnabled
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] cursor-pointer"
                : "border-red-400/60 bg-red-500/10 text-red-300 hover:bg-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] cursor-pointer"
            } disabled:opacity-60`}
            title={
              ipTrackingEnabled
                ? "IP Lock / Tracking is ACTIVE: Challenges are bound to the team's initial network IP."
                : "IP Lock / Tracking is OFF: Operatives can submit answers from any IP address."
            }
          >
            {ipTrackingLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-accretion" />
                <span>UPDATING IP LOCK...</span>
              </>
            ) : ipTrackingEnabled ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>IP LOCK: ACTIVE</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500/80" />
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                <span>IP LOCK: DISABLED</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={async () => {
              handleLogout();
              await logout();
              navigate("/");
            }}
            className="inline-flex items-center gap-2 border border-copper/30 px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.22em] text-copper hover:border-accretion hover:text-accretion transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            SIGNOUT
          </button>
        </div>
      </div>

      <nav className="mx-auto mt-8 flex max-w-[1400px] gap-8 overflow-x-auto border-b border-accretion/20 px-6 md:px-10">
        {COMMAND_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-4 font-rajdhani text-sm tracking-[0.28em] transition ${
              activeTab === tab.id ? "text-accretion" : "text-copper/70 hover:text-starlight"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-accretion" />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}

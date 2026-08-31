import { AdminContext } from "./AdminContext";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminLogin from "./AdminLogin";
import AdminHeader from "./AdminHeader";
import AdminModals from "./modals/AdminModals";
import TeamsTab from "./tabs/TeamsTab";
import ChallengesTab from "./tabs/ChallengesTab";
import LogsTab from "./tabs/LogsTab";
import LeaderboardTab from "./tabs/LeaderboardTab";
import UsersTab from "./tabs/UsersTab";

export default function AdminDashboard() {
  const admin = useAdminDashboard();

  return (
    <AdminContext.Provider value={admin}>
      {!admin.isAuthenticated ? (
        <AdminLogin />
      ) : (
        <div className="min-h-screen w-full bg-black pb-24 text-starlight">
          <AdminHeader />

          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <section className="mt-10 grid grid-cols-2 gap-y-8 border-b border-accretion/15 pb-8 lg:grid-cols-4">
              {[
                [admin.teams.length, "Crews"],
                [`${admin.unlockedCount} / ${admin.challenges.length}`, "Open locks"],
                [admin.logs.length, "Intercepts"],
                [admin.highScore, "High score"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="lg:border-l lg:border-accretion/15 lg:pl-8 first:lg:border-l-0 first:lg:pl-0"
                >
                  <p className="font-orbitron text-3xl tracking-[0.08em] text-starlight">
                    {value}
                  </p>
                  <p className="mt-2 font-rajdhani text-[11px] tracking-[0.28em] text-copper">
                    {label}
                  </p>
                </div>
              ))}
            </section>

            <main className="w-full pt-10">
              {admin.activeTab === "teams" && <TeamsTab />}
              {admin.activeTab === "challenges" && <ChallengesTab />}
              {admin.activeTab === "logs" && <LogsTab />}
              {admin.activeTab === "export" && <LeaderboardTab />}
              {admin.activeTab === "users" && <UsersTab />}
            </main>
          </div>

          <AdminModals />
        </div>
      )}
    </AdminContext.Provider>
  );
}

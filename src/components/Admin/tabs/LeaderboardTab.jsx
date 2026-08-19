import { useAdmin } from '../AdminContext';
import {
  Lock,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function LeaderboardTab() {
  const {
    safeguardActive,
    setShowResetLeaderboardConfirmModal,
    setResetLeaderboardConfirmInput,
    getLeaderboardData,
    exportToCSV,
    handlePrint
  } = useAdmin();

  return (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">STANDING</h2>
                <p className="mt-1 text-sm text-copper/80">Crews ranked by score, then round.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-2 border border-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-accretion hover:bg-accretion/10"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 border border-copper/30 px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  <Download className="h-4 w-4" />
                  PRINT
                </button>
                <button
                  type="button"
                  disabled={safeguardActive}
                  onClick={() => {
                    setResetLeaderboardConfirmInput('');
                    setShowResetLeaderboardConfirmModal(true);
                  }}
                  title={safeguardActive ? 'Reset Leaderboard (Safeguard Locked)' : 'Reset Leaderboard'}
                  className={`inline-flex items-center gap-2 border px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] ${
                    safeguardActive
                      ? 'cursor-not-allowed border-copper/15 text-copper/30'
                      : 'border-red-400/40 text-red-300 hover:bg-red-500/10'
                  }`}
                >
                  {safeguardActive ? <Lock className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  RESET
                </button>
              </div>
            </div>

            <div className="mb-8 hidden text-center text-black print:block">
              <h1 className="text-2xl font-bold tracking-widest">CICADA 2067 - EVENT LEADERBOARD</h1>
              <p className="mt-1 text-xs font-bold uppercase">Generated: {new Date().toLocaleString()}</p>
              <hr className="my-4 border-black" />
            </div>

            <div className="overflow-x-auto print:text-black">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-accretion/20 font-rajdhani text-[11px] tracking-[0.24em] text-copper print:text-black">
                    <th className="py-3 pr-4 font-normal">Rank</th>
                    <th className="py-3 pr-4 font-normal">Crew</th>
                    <th className="py-3 pr-4 font-normal">Members</th>
                    <th className="py-3 pr-4 font-normal">Round</th>
                    <th className="py-3 font-normal">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {getLeaderboardData().map((team, idx) => (
                    <tr key={team.id} className="border-b border-white/5 transition hover:bg-white/[0.03] print:hover:bg-transparent">
                      <td className="py-4 pr-4 font-orbitron text-accretion print:text-black">{idx + 1}</td>
                      <td className="py-4 pr-4 font-orbitron text-sm tracking-[0.06em] print:text-black">{team.name}</td>
                      <td className="py-4 pr-4 text-sm text-copper print:text-black">{team.members.length > 0 ? team.members.join(', ') : '—'}</td>
                      <td className="py-4 pr-4 text-sm text-copper print:text-black">{team.round}</td>
                      <td className="py-4 text-sm text-accretion print:text-black">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  );
}

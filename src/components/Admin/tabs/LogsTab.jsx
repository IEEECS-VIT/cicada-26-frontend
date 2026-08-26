import { useAdmin } from '../AdminContext';
import {
  Search,
} from 'lucide-react';

export default function LogsTab() {
  const {
    logSearch,
    setLogSearch,
    logStatusFilter,
    setLogStatusFilter,
    filteredLogs
  } = useAdmin();

  return (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">INTERCEPTS</h2>
                <p className="mt-1 text-sm text-copper/80">Every answer that crossed the disk.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/50" />
                  <input
                    type="text"
                    className="w-full border border-copper/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    placeholder="Search intercepts"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>
                <select
                  className="border border-copper/20 bg-black/40 px-3 py-2.5 text-sm text-starlight outline-none focus:border-accretion"
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-accretion/20 font-rajdhani text-[11px] tracking-[0.24em] text-copper">
                    <th className="py-3 pr-4 font-normal">Time</th>
                    <th className="py-3 pr-4 font-normal">Crew</th>
                    <th className="py-3 pr-4 font-normal">Lock</th>
                    <th className="py-3 pr-4 font-normal">Answer</th>
                    <th className="py-3 pr-4 font-normal">By</th>
                    <th className="py-3 pr-4 font-normal">Result</th>
                    <th className="py-3 font-normal">Try</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                        <td className="py-4 pr-4 text-sm text-copper">{log.timestamp}</td>
                        <td className="py-4 pr-4 font-orbitron text-sm tracking-[0.06em]">{log.teamName}</td>
                        <td className="py-4 pr-4 text-sm text-copper">{log.challengeTitle}</td>
                        <td className="py-4 pr-4 break-all text-sm text-accretion">{log.answer}</td>
                        <td className="py-4 pr-4 text-sm text-copper">{log.adminName || '—'}</td>
                        <td className={`py-4 pr-4 text-sm tracking-[0.12em] ${log.correct ? 'text-accretion' : 'text-red-300'}`}>
                          {log.correct ? 'HIT' : 'MISS'}
                        </td>
                        <td className="py-4 text-sm text-copper">{log.attempts}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-sm tracking-[0.18em] text-copper/60">
                        No intercepts match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
  );
}

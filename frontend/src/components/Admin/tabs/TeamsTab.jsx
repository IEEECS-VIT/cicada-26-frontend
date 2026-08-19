import { useAdmin } from '../AdminContext';
import AdminRowMenu from '../AdminRowMenu';
import {
  Lock,
  RotateCcw,
  Edit,
  Trash2,
  Key,
  Plus,
  Search,
  ChevronRight,
  Award,
} from 'lucide-react';

export default function TeamsTab() {
  const {
    teamSearch,
    setTeamSearch,
    setShowCreateTeamModal,
    setActiveTeam,
    setShowAdjustScoreModal,
    setAdjustScoreType,
    setAdjustScoreValue,
    safeguardActive,
    openActionMenu,
    setOpenActionMenu,
    handleResetTeamProgress,
    handleOpenEditTeam,
    handleOpenDeleteConfirm,
    handleOpenResetPassword,
    handleOpenProgressOverride,
    filteredTeams
  } = useAdmin();

  return (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">CREWS</h2>
                <p className="mt-1 text-sm text-copper/80">Every vessel currently in the hunt.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/50" />
                  <input
                    type="text"
                    className="w-full border border-copper/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    placeholder="Search crews"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(true)}
                  className="inline-flex items-center gap-2 border border-accretion bg-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  <Plus className="h-4 w-4" />
                  NEW CREW
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-accretion/20 font-rajdhani text-[11px] tracking-[0.24em] text-copper">
                    <th className="py-3 pr-4 font-normal">Crew</th>
                    <th className="py-3 pr-4 font-normal">Members</th>
                    <th className="py-3 pr-4 font-normal">Score</th>
                    <th className="py-3 pr-4 font-normal">Round</th>
                    <th className="py-3 font-normal text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <tr key={team.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                        <td className="py-4 pr-4 font-orbitron text-sm tracking-[0.08em] text-starlight">
                          {team.name}
                        </td>
                        <td className="max-w-xs py-4 pr-4 text-sm text-copper">
                          {team.members.length > 0 ? team.members.join(', ') : '—'}
                        </td>
                        <td className="py-4 pr-4 text-sm text-accretion">{team.points}</td>
                        <td className="py-4 pr-4 text-sm text-copper">{team.round}</td>
                        <td className="py-4 text-right">
                          <AdminRowMenu
                            menuId={`team-${team.id}`}
                            openMenu={openActionMenu}
                            setOpenMenu={setOpenActionMenu}
                            label={`Actions for ${team.name}`}
                            items={[
                              {
                                label: 'Adjust score',
                                icon: <Award className="w-3.5 h-3.5" />,
                                onClick: () => {
                                  setActiveTeam(team);
                                  setAdjustScoreType('add');
                                  setAdjustScoreValue(0);
                                  setShowAdjustScoreModal(true);
                                },
                              },
                              {
                                label: 'Override round',
                                icon: <ChevronRight className="w-3.5 h-3.5" />,
                                onClick: () => handleOpenProgressOverride(team),
                              },
                              {
                                label: 'Reset password',
                                icon: <Key className="w-3.5 h-3.5" />,
                                onClick: () => handleOpenResetPassword(team),
                              },
                              {
                                label: 'Edit team',
                                icon: <Edit className="w-3.5 h-3.5" />,
                                onClick: () => handleOpenEditTeam(team),
                              },
                              {
                                label: 'Reset progress',
                                icon: <RotateCcw className="w-3.5 h-3.5" />,
                                onClick: () => handleResetTeamProgress(team.id, team.name),
                              },
                              {
                                label: safeguardActive ? 'Delete locked' : 'Delete team',
                                icon: safeguardActive ? <Lock className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />,
                                danger: true,
                                disabled: safeguardActive,
                                onClick: () => handleOpenDeleteConfirm(team),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-sm tracking-[0.18em] text-copper/60">
                        No crews match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
  );
}

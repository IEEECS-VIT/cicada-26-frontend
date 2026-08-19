import { useAdmin } from '../AdminContext';
import {
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

export default function UsersTab() {
  const {
    users,
    userSearch,
    setUserSearch,
    setShowBulkImportAdminsModal,
    handleApproveAdmin,
    handleToggleAdminRole,
    handleDeleteUser
  } = useAdmin();

  return (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">PERSONNEL</h2>
                <p className="mt-1 text-sm text-copper/80">Participants, admins, and clearance.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/50" />
                  <input
                    type="text"
                    placeholder="Search personnel"
                    className="w-full border border-copper/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkImportAdminsModal(true)}
                  className="inline-flex items-center gap-2 border border-accretion bg-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  <Plus className="h-4 w-4" />
                  IMPORT
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-accretion/20 font-rajdhani text-[11px] tracking-[0.24em] text-copper">
                    <th className="py-3 pr-4 font-normal">Name</th>
                    <th className="py-3 pr-4 font-normal">Email</th>
                    <th className="py-3 pr-4 font-normal">Role</th>
                    <th className="py-3 pr-4 font-normal">Clearance</th>
                    <th className="py-3 font-normal text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter((user) =>
                    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearch.toLowerCase())
                  ).map((user) => (
                    <tr key={user.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                      <td className="py-4 pr-4 font-orbitron text-sm tracking-[0.06em]">{user.username}</td>
                      <td className="py-4 pr-4 text-sm text-copper">{user.email}</td>
                      <td className="py-4 pr-4 text-sm text-accretion">{user.role}</td>
                      <td className="py-4 pr-4 text-sm text-copper">
                        {user.role === 'Admin'
                          ? (user.isApprovedAdmin ? 'Approved' : 'Pending')
                          : '—'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === 'Admin' && !user.isApprovedAdmin && (
                            <button
                              type="button"
                              onClick={() => handleApproveAdmin(user.id)}
                              className="border border-accretion/40 px-2.5 py-1 font-rajdhani text-[11px] tracking-[0.16em] text-accretion hover:bg-accretion/10"
                            >
                              APPROVE
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleAdminRole(user.id)}
                            className="border border-copper/25 px-2.5 py-1 font-rajdhani text-[11px] tracking-[0.16em] text-copper hover:border-accretion hover:text-accretion"
                          >
                            TOGGLE
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="border border-copper/25 p-1.5 text-copper hover:border-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-sm tracking-[0.18em] text-copper/60">
                        No personnel registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
  );
}

import { useAdmin } from '../AdminContext';
import {
  INITIAL_TEAMS,
  INITIAL_CHALLENGES,
  INITIAL_USERS,
  INITIAL_LOGS,
} from '../constants';
import {
  CheckCircle,
  Edit,
  Key,
  Plus,
  Sliders,
  X,
  ChevronRight,
  AlertCircle,
  Upload,
} from 'lucide-react';

export default function AdminModals() {
  const {
    teams,
    setTeams,
    challenges,
    setChallenges,
    logs,
    setLogs,
    showCreateTeamModal,
    setShowCreateTeamModal,
    showEditTeamModal,
    setShowEditTeamModal,
    showResetPwdModal,
    setShowResetPwdModal,
    showProgressOverrideModal,
    setShowProgressOverrideModal,
    showEditAnswerModal,
    setShowEditAnswerModal,
    showOverrideChallengeModal,
    setShowOverrideChallengeModal,
    activeTeam,
    setActiveTeam,
    activeChallenge,
    setActiveChallenge,
    newTeamName,
    setNewTeamName,
    newTeamMembers,
    setNewTeamMembers,
    newTeamPassword,
    setNewTeamPassword,
    editTeamName,
    setEditTeamName,
    editTeamMembers,
    setEditTeamMembers,
    editTeamPoints,
    setEditTeamPoints,
    editTeamStatus,
    setEditTeamStatus,
    manuallyResetPassword,
    setManuallyResetPassword,
    overrideTargetRound,
    setOverrideTargetRound,
    editAnswerValue,
    setEditAnswerValue,
    overrideChallengeTeamId,
    setOverrideChallengeTeamId,
    setUsers,
    showAdjustScoreModal,
    setShowAdjustScoreModal,
    adjustScoreType,
    setAdjustScoreType,
    adjustScoreValue,
    setAdjustScoreValue,
    showCreateChallengeModal,
    setShowCreateChallengeModal,
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeRound,
    setNewChallengeRound,
    newChallengeAnswer,
    setNewChallengeAnswer,
    newChallengePoints,
    setNewChallengePoints,
    newChallengeTimeLimit,
    setNewChallengeTimeLimit,
    newChallengeAssets,
    setNewChallengeAssets,
    tempAssetName,
    setTempAssetName,
    tempAssetUrl,
    setTempAssetUrl,
    showTimeLimitModal,
    setShowTimeLimitModal,
    editTimeLimitValue,
    setEditTimeLimitValue,
    showEditAssetModal,
    setShowEditAssetModal,
    activeAsset,
    setActiveAsset,
    setActiveAssetChallengeId,
    editAssetName,
    setEditAssetName,
    editAssetUrl,
    setEditAssetUrl,
    showBulkImportAdminsModal,
    setShowBulkImportAdminsModal,
    bulkAdminsCSVText,
    setBulkAdminsCSVText,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    deleteConfirmInput,
    setDeleteConfirmInput,
    showSkipConfirmModal,
    setShowSkipConfirmModal,
    skipConfirmInput,
    setSkipConfirmInput,
    showResetChallengeConfirmModal,
    setShowResetChallengeConfirmModal,
    resetChallengeConfirmInput,
    setResetChallengeConfirmInput,
    showResetDemoConfirmModal,
    setShowResetDemoConfirmModal,
    resetDemoConfirmInput,
    setResetDemoConfirmInput,
    showResetLeaderboardConfirmModal,
    setShowResetLeaderboardConfirmModal,
    resetLeaderboardConfirmInput,
    setResetLeaderboardConfirmInput,
    handleBulkImportAdmins,
    handleAdjustScore,
    handleRemoveMember,
    handleCreateChallenge,
    handleAddAssetToChallenge,
    handleRemoveAssetFromChallenge,
    handleUpdateTimeLimit,
    handleEditAssetSave,
    handleResetLeaderboard,
    handleCreateTeam,
    handleSaveTeamEdit,
    handleSaveResetPassword,
    handleSaveProgressOverride,
    handleSaveEditAnswer,
    handleSaveOverrideChallenge,
    handleDeleteTeam
  } = useAdmin();

  return (
    <>
      {/* 1. Modal: Register/Create Team */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Plus className="w-4 h-4 text-accretion" />
                <span>Register New Team</span>
              </h3>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">TEAM_NAME</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  placeholder="e.g. Shadow Guild"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">REGISTERED_MEMBERS (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  placeholder="e.g. Jane Doe, John Smith"
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">INITIAL_SECRET_PASSPHRASE</label>
                <input
                  type="text"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  placeholder="Leave empty for auto-generated passphrase"
                  value={newTeamPassword}
                  onChange={(e) => setNewTeamPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Team Details */}
      {showEditTeamModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Edit className="w-4 h-4 text-copper" />
                <span>Edit Team Settings</span>
              </h3>
              <button
                onClick={() => setShowEditTeamModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamEdit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">TEAM_NAME</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">REGISTERED_MEMBERS (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editTeamMembers}
                  onChange={(e) => setEditTeamMembers(e.target.value)}
                />
              </div>

              {activeTeam.members && activeTeam.members.length > 0 && (
                <div className="border border-copper/20 bg-black/40 p-3 text-sm">
                  <div className="mb-2 font-rajdhani text-[11px] tracking-[0.22em] text-copper">Current members</div>
                  <div className="max-h-32 space-y-1.5 overflow-y-auto">
                    {activeTeam.members.map((member) => (
                      <div key={member} className="flex items-center justify-between border-b border-white/5 py-1.5">
                        <span className="text-starlight">{member}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(activeTeam.id, member)}
                          className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">SCORE (Points)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={editTeamPoints}
                    onChange={(e) => setEditTeamPoints(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">ACCOUNT_STATUS</label>
                  <select
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={editTeamStatus}
                    onChange={(e) => setEditTeamStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditTeamModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Reset Team Password */}
      {showResetPwdModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Key className="w-4 h-4 text-accretion" />
                <span>Reset Team Credentials</span>
              </h3>
              <button
                onClick={() => setShowResetPwdModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4">
              <div className="border border-copper/20 bg-black/40 p-3 text-sm text-copper">
                YOU ARE UPDATING CREDENTIALS FOR:
                <div className="font-bold text-accretion-bright mt-1 text-sm">{activeTeam.name.toUpperCase()}</div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">NEW_ACCESS_PASSPHRASE</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  placeholder="Enter custom new passphrase"
                  value={manuallyResetPassword}
                  onChange={(e) => setManuallyResetPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetPwdModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/35 text-red-400 font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
                >
                  Force Reset Pwd
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Progress Override (Manually Advance Round) */}
      {showProgressOverrideModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <ChevronRight className="w-4 h-4 text-accretion" />
                <span>Manual Progress Override</span>
              </h3>
              <button
                onClick={() => setShowProgressOverrideModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgressOverride} className="space-y-4">
              <div className="border border-copper/20 bg-black/40 p-3 text-sm text-copper">
                OVERRIDING LOCATION FOR TEAM:
                <div className="font-bold text-accretion mt-1 text-sm">{activeTeam.name.toUpperCase()}</div>
                <div className="mt-2 text-[10px] text-orange-400/80 uppercase">
                  Important: Manual advancement moves the team directly to the target round without requiring completion of earlier round challenges.
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">TARGET_QUALIFIED_ROUND</label>
                <select
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-accretion"
                  value={overrideTargetRound}
                  onChange={(e) => setOverrideTargetRound(e.target.value)}
                >
                  <option value={1}>Round 1 (Initial Stage)</option>
                  <option value={2}>Round 2 (Qualified Stage)</option>
                  <option value={3}>Round 3 (Final Decryption Stage)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressOverrideModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer border border-accretion bg-accretion py-2 font-orbitron text-xs uppercase tracking-wider text-black hover:bg-accretion-bright"
                >
                  Advance Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Edit Challenge Answer Key */}
      {showEditAnswerModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Edit className="w-4 h-4 text-copper" />
                <span>Modify Challenge Key</span>
              </h3>
              <button
                onClick={() => setShowEditAnswerModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAnswer} className="space-y-4">
              <div className="border border-copper/20 bg-black/40 p-3 text-sm text-copper">
                CHALLENGE:
                <div className="font-bold text-starlight mt-1 text-sm">{activeChallenge.title.toUpperCase()}</div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">CORRECT_DECRYPTION_ANSWER</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editAnswerValue}
                  onChange={(e) => setEditAnswerValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditAnswerModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Update Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Force Complete Challenge (Override Completion) */}
      {showOverrideChallengeModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <CheckCircle className="w-4 h-4 text-copper" />
                <span>Force Challenge Completion</span>
              </h3>
              <button
                onClick={() => setShowOverrideChallengeModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideChallenge} className="space-y-4">
              <div className="border border-copper/20 bg-black/40 p-3 text-sm text-copper">
                TARGET CHALLENGE:
                <div className="font-bold text-copper mt-1 text-sm">{activeChallenge.title.toUpperCase()}</div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">SELECT_TEAM_TO_GRANT_CREDIT</label>
                <select
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-accretion"
                  value={overrideChallengeTeamId}
                  onChange={(e) => setOverrideChallengeTeamId(e.target.value)}
                >
                  <option value="">-- Choose Team --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Round {t.round})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOverrideChallengeModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer border border-copper bg-copper py-2 font-orbitron text-xs uppercase tracking-wider text-black hover:bg-starlight"
                >
                  Override Solved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Purge/Delete Team Confirmation */}
      {showDeleteConfirmModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-400/40 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>PURGE_TEAM_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setActiveTeam(null);
                  setDeleteConfirmInput('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 border border-red-400/25 bg-black/40 p-4 text-sm text-copper">
              WARNING: You are about to permanently purge team <span className="text-red-400 font-bold font-mono">"{activeTeam.name}"</span> and all of their scoring logs and credentials. This action cannot be reversed.
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  TYPE THE TEAM NAME <span className="text-red-400 font-bold font-mono">"{activeTeam.name}"</span> TO CONFIRM:
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-red-400"
                  placeholder="Type team name exactly"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setActiveTeam(null);
                    setDeleteConfirmInput('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmInput !== activeTeam.name}
                  onClick={() => {
                    handleDeleteTeam(activeTeam.id);
                  }}
                  className="flex-1 cursor-pointer border border-red-500 bg-red-600 py-2 font-orbitron text-xs uppercase tracking-wider text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  PURGE TEAM DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Skip Challenge Confirmation */}
      {showSkipConfirmModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/40 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-accretion uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>SKIP_CHALLENGE_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowSkipConfirmModal(false);
                  setActiveChallenge(null);
                  setSkipConfirmInput('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 border border-accretion/25 bg-black/40 p-4 text-sm text-copper">
              WARNING: You are forcing a skip of challenge <span className="text-accretion font-bold font-mono">"{activeChallenge.title}"</span>. This will automatically advance ALL teams currently in Round {activeChallenge.round} to the next round.
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  TYPE <span className="text-accretion font-bold">"SKIP"</span> TO CONFIRM THIS ACTION:
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-accretion"
                  placeholder="Type SKIP"
                  value={skipConfirmInput}
                  onChange={(e) => setSkipConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSkipConfirmModal(false);
                    setActiveChallenge(null);
                    setSkipConfirmInput('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={skipConfirmInput !== 'SKIP'}
                  onClick={() => {
                    const targetRound = activeChallenge.round;
                    setTeams(teams.map(t => {
                      if (t.round === targetRound) {
                        return { ...t, round: targetRound + 1 };
                      }
                      return t;
                    }));

                    const newLog = {
                      id: `log-${Date.now()}`,
                      teamId: 'all',
                      teamName: 'ALL TEAMS',
                      challengeId: activeChallenge.id,
                      challengeTitle: activeChallenge.title,
                      answer: 'SKIPPED BY ADMIN ACTION',
                      correct: true,
                      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      attempts: 0
                    };
                    setLogs([newLog, ...logs]);

                    setShowSkipConfirmModal(false);
                    setActiveChallenge(null);
                    setSkipConfirmInput('');
                  }}
                  className="flex-1 cursor-pointer border border-accretion bg-accretion py-2 font-orbitron text-xs uppercase tracking-wider text-black hover:bg-accretion-bright disabled:cursor-not-allowed disabled:opacity-40"
                >
                  FORCE SKIP ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Reset Challenge Stats Confirmation */}
      {showResetChallengeConfirmModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-400/40 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>RESET_CHALLENGE_STATS_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetChallengeConfirmModal(false);
                  setActiveChallenge(null);
                  setResetChallengeConfirmInput('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 border border-red-400/25 bg-black/40 p-4 text-sm text-copper">
              WARNING: You are about to clear all scoreboard points, submissions, and logs for challenge <span className="text-red-400 font-bold font-mono">"{activeChallenge.title}"</span>. This will revert all solved marks for all teams.
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  TYPE <span className="text-red-400 font-bold">"RESET"</span> TO CONFIRM THIS ACTION:
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-red-400"
                  placeholder="Type RESET"
                  value={resetChallengeConfirmInput}
                  onChange={(e) => setResetChallengeConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetChallengeConfirmModal(false);
                    setActiveChallenge(null);
                    setResetChallengeConfirmInput('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetChallengeConfirmInput !== 'RESET'}
                  onClick={() => {
                    setLogs(logs.filter(l => l.challengeId !== activeChallenge.id));
                    setChallenges(challenges.map(c => {
                      if (c.id === activeChallenge.id) {
                        return { ...c, solvedCount: 0 };
                      }
                      return c;
                    }));

                    setShowResetChallengeConfirmModal(false);
                    setActiveChallenge(null);
                    setResetChallengeConfirmInput('');
                  }}
                  className="flex-1 cursor-pointer border border-red-500 bg-red-600 py-2 font-orbitron text-xs uppercase tracking-wider text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  CLEAR ALL DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Reset System Demo Confirmation */}
      {showResetDemoConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-400/40 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>PURGE_DATABASE_DEMO_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetDemoConfirmModal(false);
                  setResetDemoConfirmInput('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 border border-red-400/25 bg-black/40 p-4 text-sm text-copper">
              WARNING: This will completely wipe all local changes, team creations, submissions, and resets, and restore the default dataset configuration.
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  TYPE <span className="text-red-400 font-bold">"RESTORE"</span> TO WIPE ALL ACTIVE DATA:
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-red-400"
                  placeholder="Type RESTORE"
                  value={resetDemoConfirmInput}
                  onChange={(e) => setResetDemoConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetDemoConfirmModal(false);
                    setResetDemoConfirmInput('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetDemoConfirmInput !== 'RESTORE'}
                  onClick={() => {
                    localStorage.removeItem('cicada_teams');
                    localStorage.removeItem('cicada_challenges');
                    localStorage.removeItem('cicada_logs');
                    localStorage.removeItem('cicada_users');
                    setTeams(INITIAL_TEAMS);
                    setChallenges(INITIAL_CHALLENGES);
                    setLogs(INITIAL_LOGS);
                    setUsers(INITIAL_USERS);
                    setShowResetDemoConfirmModal(false);
                    setResetDemoConfirmInput('');
                  }}
                  className="flex-1 cursor-pointer border border-red-500 bg-red-600 py-2 font-orbitron text-xs uppercase tracking-wider text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  RESTORE DEFAULTS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Modal: Adjust Score */}
      {showAdjustScoreModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Sliders className="w-4 h-4 text-accretion" />
                <span>Adjust Score: {activeTeam.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAdjustScoreModal(false);
                  setActiveTeam(null);
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustScore} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('add')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'add'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'border-white/10 text-copper hover:bg-white/5'
                    }`}
                  >
                    Add (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('subtract')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'subtract'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'border-white/10 text-copper hover:bg-white/5'
                    }`}
                  >
                    Subtract (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('set')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'set'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'border-white/10 text-copper hover:bg-white/5'
                    }`}
                  >
                    Set Exact (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  {adjustScoreType === 'add' && 'Points to Add (API: PATCH Adjust Score Delta)'}
                  {adjustScoreType === 'subtract' && 'Points to Subtract (API: PATCH Adjust Score Delta)'}
                  {adjustScoreType === 'set' && 'New Score Value (API: POST Set Any Score)'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={adjustScoreValue}
                  onChange={(e) => setAdjustScoreValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustScoreModal(false);
                    setActiveTeam(null);
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. Modal: Create Challenge */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Plus className="w-4 h-4 text-accretion" />
                <span>Create New Challenge</span>
              </h3>
              <button
                onClick={() => setShowCreateChallengeModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Buffer Overflow"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeTitle}
                  onChange={(e) => setNewChallengeTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Round Level</label>
                  <select
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={newChallengeRound}
                    onChange={(e) => setNewChallengeRound(e.target.value)}
                  >
                    <option value="1">Round 1</option>
                    <option value="2">Round 2</option>
                    <option value="3">Round 3</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Point Value</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={newChallengePoints}
                    onChange={(e) => setNewChallengePoints(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Flag / Solution Key</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. c1c4d4_fl4g_value"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeAnswer}
                  onChange={(e) => setNewChallengeAnswer(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeTimeLimit}
                  onChange={(e) => setNewChallengeTimeLimit(e.target.value)}
                />
              </div>

              {/* Assets Section */}
              <div className="space-y-2 border border-accretion/20 p-3">
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Assets</label>
                
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const files = Array.from(e.dataTransfer.files);
                      const newAssets = files.map(file => ({
                        name: file.name,
                        url: `https://assets.cicada.org/uploads/${encodeURIComponent(file.name)}`
                      }));
                      setNewChallengeAssets([...newChallengeAssets, ...newAssets]);
                    }
                  }}
                  onClick={() => document.getElementById('modal-file-upload').click()}
                  className="border border-dashed border-copper/30 hover:border-accretion bg-black p-4 text-center rounded text-xs text-copper flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-accretion/50 animate-pulse" />
                  <span>DRAG & DROP LOCAL FILES HERE OR CLICK TO SELECT</span>
                  <input
                    id="modal-file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        const newAssets = files.map(file => ({
                          name: file.name,
                          url: `https://assets.cicada.org/uploads/${encodeURIComponent(file.name)}`
                        }));
                        setNewChallengeAssets([...newChallengeAssets, ...newAssets]);
                      }
                    }}
                  />
                </div>

                {/* Current Assets list */}
                {newChallengeAssets.length > 0 && (
                  <div className="space-y-1 mb-2 max-h-24 overflow-y-auto font-mono">
                    {newChallengeAssets.map((asset, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black border border-white/10/40 px-2 py-1 rounded text-[10px]">
                        <span className="truncate max-w-[150px] text-starlight font-semibold">{asset.name}</span>
                        <span className="truncate max-w-[120px] text-gray-500 text-[9px]">{asset.url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssetFromChallenge(idx)}
                          className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Asset Name (e.g. file.zip)"
                      className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                      value={tempAssetName}
                      onChange={(e) => setTempAssetName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="URL (optional)"
                      className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                      value={tempAssetUrl}
                      onChange={(e) => setTempAssetUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAssetToChallenge}
                    className="w-full py-2 bg-accretion/10 hover:bg-accretion/20 border border-accretion/40 text-accretion text-[10px] uppercase tracking-widest rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Asset to List</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChallengeModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. Modal: Update Time Limit */}
      {showTimeLimitModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Edit className="w-4 h-4 text-accretion" />
                <span>Set Time Limit: {activeChallenge.title}</span>
              </h3>
              <button
                onClick={() => {
                  setShowTimeLimitModal(false);
                  setActiveChallenge(null);
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTimeLimit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Time Limit (Minutes, 0 for unlimited)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editTimeLimitValue}
                  onChange={(e) => setEditTimeLimitValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeLimitModal(false);
                    setActiveChallenge(null);
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Save Time Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. Modal: Bulk Import Admins */}
      {showBulkImportAdminsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Plus className="w-4 h-4 text-accretion" />
                <span>Bulk Import Administrators</span>
              </h3>
              <button
                onClick={() => setShowBulkImportAdminsModal(false)}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImportAdmins} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Admins CSV (Format: username,email - one per line)</label>
                <textarea
                  required
                  rows="6"
                  placeholder="cyber_operator_1,ops1@cicada.org&#10;netsec_auditor,auditor@cicada.org"
                  className="w-full bg-black border border-white/10 p-3 text-xs text-starlight font-mono rounded focus:outline-none focus:border-accretion"
                  value={bulkAdminsCSVText}
                  onChange={(e) => setBulkAdminsCSVText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImportAdminsModal(false)}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Import Admins
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 15. Modal: Reset Leaderboard Confirmation */}
      {showResetLeaderboardConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-400/40 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>RESET_LEADERBOARD_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetLeaderboardConfirmModal(false);
                  setResetLeaderboardConfirmInput('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 border border-red-400/25 bg-black/40 p-4 text-sm text-copper">
              WARNING: This will completely wipe all leaderboard points and progress metrics, locking all challenges.
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                  TYPE <span className="text-red-400 font-bold">"RESET"</span> TO CONFIRM RESET LEADERBOARD:
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-red-400"
                  placeholder="Type RESET"
                  value={resetLeaderboardConfirmInput}
                  onChange={(e) => setResetLeaderboardConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetLeaderboardConfirmModal(false);
                    setResetLeaderboardConfirmInput('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetLeaderboardConfirmInput !== 'RESET'}
                  onClick={() => {
                    handleResetLeaderboard();
                    setShowResetLeaderboardConfirmModal(false);
                    setResetLeaderboardConfirmInput('');
                  }}
                  className="flex-1 cursor-pointer border border-red-500 bg-red-600 py-2 font-orbitron text-xs uppercase tracking-wider text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  RESET LEADERBOARD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. Modal: Edit Asset Details */}
      {showEditAssetModal && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Edit className="w-4 h-4 text-accretion" />
                <span>Edit Asset: {activeAsset.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditAssetModal(false);
                  setActiveAsset(null);
                  setActiveAssetChallengeId('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAssetSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Asset Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editAssetName}
                  onChange={(e) => setEditAssetName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Download URL / Path</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editAssetUrl}
                  onChange={(e) => setEditAssetUrl(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAssetModal(false);
                    setActiveAsset(null);
                    setActiveAssetChallengeId('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { uploadStandaloneAssetFile } from '../../../api/admin';
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


const mapMimeTypeToEnum = (mimeType) => {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.includes('document') || mimeType.includes('msword') || mimeType.includes('officedocument')) return 'document';
  return 'file';
};

export default function AdminModals() {

  const [isUploading, setIsUploading] = useState(false);
  const {
    newChallengeHints,
    setNewChallengeHints,
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
    editingChallenge,
    setEditingChallenge,
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeRound,
    setNewChallengeRound,
    newChallengeArchive,
    setNewChallengeArchive,
    newChallengeAnswer,
    setNewChallengeAnswer,
    newChallengePoints,
    setNewChallengePoints,
    newChallengeTimeLimit,
    setNewChallengeTimeLimit,
    newChallengeAssets,
    setNewChallengeAssets,
    newChallengeFragmentTitle,
    setNewChallengeFragmentTitle,
    newChallengeFragmentHeader,
    setNewChallengeFragmentHeader,
    newChallengeFragmentContent,
    setNewChallengeFragmentContent,
    tempAssetName,
    setTempAssetName,
    tempAssetUrl,
    setTempAssetUrl,
    tempAssetSet,
    setTempAssetSet,
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
    editAssetSet,
    setEditAssetSet,
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
    handleForceSkipChallenge,
    handleDeleteTeam,
    overrideRoundOptions,
    showRoundModal,
    setShowRoundModal,
    activeRound,
    setActiveRound,
    newRoundName,
    setNewRoundName,
    newRoundTimeLimit,
    setNewRoundTimeLimit,
    newRoundOrder,
    setNewRoundOrder,
    newRoundIsActive,
    setNewRoundIsActive,
    newRoundFragmentTitle,
    setNewRoundFragmentTitle,
    newRoundFragmentHeader,
    setNewRoundFragmentHeader,
    newRoundFragmentContent,
    setNewRoundFragmentContent,
    deleteRoundId,
    setDeleteRoundId,
    showDeleteRoundConfirmModal,
    setShowDeleteRoundConfirmModal,
    handleSaveRound,
    handleDeleteRound,
    showHintModal, setShowHintModal,
    newHintText, setNewHintText,
    newHintUnlockMinutes, setNewHintUnlockMinutes,
    handleAddHint, handleDeleteHint, handleToggleHintVisibility,
  } = useAdmin();

  return (
    <>
      {/* Hint Modal */}
      {showHintModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl border border-accretion/30 bg-black p-8 text-starlight mb-4 max-h-[50vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                <Plus className="w-4 h-4 text-accretion" />
                <span>Manage Hints: {activeChallenge.title}</span>
              </h3>
              <button onClick={() => setShowHintModal(false)} className="text-copper hover:text-starlight">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {activeChallenge.hints && activeChallenge.hints.length > 0 ? (
                activeChallenge.hints.map((hint, idx) => (
                  <div key={hint.id} className="border border-copper/20 p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-starlight/80">Hint {idx + 1}: {hint.text}</p>
                      <p className="text-xs text-copper mt-1">Unlocks in: {hint.unlock_minutes} mins</p>
                    </div>
                                          <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={hint.is_visible !== false} 
                            onChange={() => handleToggleHintVisibility(hint.id, hint.is_visible)} 
                          />
                          <div className="w-9 h-5 bg-copper/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accretion"></div>
                          <span className={`ml-3 text-xs font-rajdhani tracking-widest ${hint.is_visible ? 'text-accretion' : 'text-copper/50'}`}>
                            {hint.is_visible ? 'VISIBLE' : 'HIDDEN'}
                          </span>
                        </label>
                        <button onClick={() => handleDeleteHint(hint.id)} className="px-3 py-1 text-xs border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors">
                          DELETE
                        </button>
                      </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-copper/50 italic">No hints yet.</p>
              )}
            </div>
            
            <form onSubmit={handleAddHint} className="border-t border-copper/20 pt-6 space-y-4">
              <h4 className="font-rajdhani text-[12px] tracking-[0.2em] text-accretion">ADD NEW HINT</h4>
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Hint Text</label>
                <input
                  type="text"
                  required
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newHintText}
                  onChange={(e) => setNewHintText(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Unlock Time (mins, 0=immediate)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newHintUnlockMinutes}
                  onChange={(e) => setNewHintUnlockMinutes(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright">
                ADD HINT
              </button>
            </form>
          </div>
        </div>
      )}

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
                  {overrideRoundOptions.length > 0 ? (
                    overrideRoundOptions.map((opt) => (
                      <option key={opt.roundId} value={opt.firstChallengeOrder}>
                        {opt.roundName} (Challenge {opt.firstChallengeOrder})
                      </option>
                    ))
                  ) : (
                    <option value={1}>Round 1</option>
                  )}
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
                  onClick={() => handleForceSkipChallenge(activeChallenge)}
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
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${adjustScoreType === 'add'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'border-white/10 text-copper hover:bg-white/5'
                      }`}
                  >
                    Add (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('subtract')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${adjustScoreType === 'subtract'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'border-white/10 text-copper hover:bg-white/5'
                      }`}
                  >
                    Subtract (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('set')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${adjustScoreType === 'set'
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

      {/* 12. Modal: Create / Edit Challenge */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                {editingChallenge ? (
                  <>
                    <Edit className="w-4 h-4 text-accretion" />
                    <span>Edit Challenge: {editingChallenge.title}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-accretion" />
                    <span>Create New Challenge</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowCreateChallengeModal(false);
                  setEditingChallenge(null);
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Round Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={newChallengeRound}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setNewChallengeRound(val);
                      const archivesInRound = challenges.filter(c => c.round === val).map(c => c.archiveNumber || 1);
                      const nextArchive = Math.max(0, ...archivesInRound) + 1;
                      setNewChallengeArchive(nextArchive);
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Archive Sequence #</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={newChallengeArchive}
                    onChange={(e) => setNewChallengeArchive(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Archive / Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Archive 01: Signal Intrusion"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeTitle}
                  onChange={(e) => setNewChallengeTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                {(() => {
              const uniqueSets = Array.from(new Set((newChallengeAssets || []).filter(a => typeof a.asset_set === 'number' || a.asset_set).map(a => Number(a.asset_set)))).sort((a,b)=>a-b);
              
              let answerObj = {};
              try {
                if (typeof newChallengeAnswer === 'string' && newChallengeAnswer.startsWith('{')) {
                  answerObj = JSON.parse(newChallengeAnswer);
                } else if (newChallengeAnswer) {
                  answerObj['global'] = newChallengeAnswer;
                }
              } catch(e) {}

              const isHash = (str) => typeof str === 'string' && str.startsWith('$2b$');

              if (uniqueSets.length > 0) {
                return (
                  <div className="space-y-4">
                    <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Set-Specific Solution Keys</label>
                    {uniqueSets.map(setNum => {
                      const currentVal = answerObj[setNum];
                      const displayVal = currentVal || '';
                      const placeholderStr = `e.g. flag_for_set_${setNum}`;
                      
                      return (
                      <div key={setNum} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-copper w-16">Set {setNum}</span>
                        <input
                          type="text"
                          placeholder={placeholderStr}
                          className="flex-1 border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                          value={displayVal}
                          onChange={(e) => {
                            const newObj = { ...answerObj, [setNum]: e.target.value };
                            setNewChallengeAnswer(JSON.stringify(newObj));
                          }}
                        />
                      </div>
                    )})}
                  </div>
                );
              }

              const globalVal = answerObj['global'] || newChallengeAnswer;
              const displayVal = globalVal || '';
              const placeholderStr = 'e.g. c1c4d4_fl4g_value';

              return (
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Global Solution Key</label>
                  <input
                    type="text"
                    placeholder={placeholderStr}
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={displayVal}
                    onChange={(e) => {
                      const newObj = { ...answerObj, 'global': e.target.value };
                      setNewChallengeAnswer(JSON.stringify(newObj));
                    }}
                  />
                </div>
              );
            })()}
              </div>

              {/* Story Fragment Section */}
              <div className="space-y-2 border border-accretion/20 p-3">
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Story Fragment</label>
                <input
                  type="text"
                  placeholder="Fragment title (defaults to challenge title)"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeFragmentTitle}
                  onChange={(e) => setNewChallengeFragmentTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Header (e.g. FIRST CONTACT)"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeFragmentHeader}
                  onChange={(e) => setNewChallengeFragmentHeader(e.target.value)}
                />
                <textarea
                  rows="3"
                  placeholder="Fragment content (e.g. Decrypted archive transmission data...)"
                  className="w-full resize-none border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newChallengeFragmentContent}
                  onChange={(e) => setNewChallengeFragmentContent(e.target.value)}
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
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isUploading) return;
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const files = Array.from(e.dataTransfer.files);
                      setIsUploading(true);
                      try {
                        const uploadedAssets = [];
                        for (const file of files) {
                          const res = await uploadStandaloneAssetFile(file);
                          const asset = res?.data || {};
                          uploadedAssets.push({ name: asset.name || file.name, type: asset.type || mapMimeTypeToEnum(file.type), url: asset.url || '#' });
                        }
                        setNewChallengeAssets([...newChallengeAssets, ...uploadedAssets]);
                      } catch (err) {
                        console.error('Upload failed:', err);
                        alert('Upload failed: ' + err.message);
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  onClick={() => { if (!isUploading) document.getElementById('modal-file-upload').click(); }}
                  className={`border border-dashed border-copper/30 bg-black p-4 text-center rounded text-xs text-copper flex flex-col items-center justify-center gap-1.5 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-accretion cursor-pointer'}`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accretion border-t-transparent rounded-full animate-spin"></div>
                      <span>UPLOADING TO S3...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-accretion/50 animate-pulse" />
                      <span>DRAG & DROP LOCAL FILES HERE OR CLICK TO SELECT</span>
                    </>
                  )}
                  <input
                    id="modal-file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        setIsUploading(true);
                        try {
                          const uploadedAssets = [];
                          for (const file of files) {
                            const res = await uploadStandaloneAssetFile(file);
                            const asset = res?.data || {};
                            uploadedAssets.push({ name: asset.name || file.name, type: asset.type || mapMimeTypeToEnum(file.type), url: asset.url || '#' });
                          }
                          setNewChallengeAssets([...newChallengeAssets, ...uploadedAssets]);
                        } catch (err) {
                          console.error('Upload failed:', err);
                          alert('Upload failed: ' + err.message);
                        } finally {
                          setIsUploading(false);
                          e.target.value = null; // reset input
                        }
                      }
                    }}
                  />
                </div>

            {/* Current Assets list */}
            {newChallengeAssets.length > 0 && (
              <div className="space-y-1 mb-2 max-h-48 overflow-y-auto font-mono">
                {newChallengeAssets.map((asset, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black border border-white/10/40 px-2 py-1 rounded text-[10px]">
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span className="truncate text-starlight font-semibold">
                        {asset.name}
                      </span>
                      <span className="truncate text-gray-500 text-[9px]">{asset.url}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-copper/60 text-[9px] uppercase">Set:</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="All"
                          className="w-12 bg-black border border-copper/30 rounded px-1 py-0.5 text-center text-starlight text-[10px] outline-none focus:border-accretion"
                          value={asset.asset_set || ''}
                          onChange={(e) => {
                            const newAssets = [...newChallengeAssets];
                            if (e.target.value) {
                              newAssets[idx].asset_set = parseInt(e.target.value, 10);
                            } else {
                              delete newAssets[idx].asset_set;
                            }
                            setNewChallengeAssets(newAssets);
                          }}
                          title="Leave empty to give to all teams. Enter a number to restrict to a specific set."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssetFromChallenge(idx)}
                        className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

              {/* Hints Section */}
              <div className="space-y-2 border border-accretion/20 p-3 mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Hints</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newHint = { id: crypto.randomUUID(), text: '', is_visible: true, unlock_minutes: 0 };
                      setNewChallengeHints([...(newChallengeHints || []), newHint]);
                    }}
                    className="text-[10px] bg-copper/10 text-copper px-2 py-0.5 rounded hover:bg-copper/20"
                  >
                    + ADD HINT
                  </button>
                </div>
                
                {(!newChallengeHints || newChallengeHints.length === 0) ? (
                  <div className="text-xs text-copper/50 italic py-2 text-center">No hints defined for this challenge.</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newChallengeHints.map((hint, idx) => (
                      <div key={hint.id || idx} className="bg-black border border-white/10 p-2 rounded relative flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...newChallengeHints];
                            updated.splice(idx, 1);
                            setNewChallengeHints(updated);
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                          title="Remove hint"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-copper/60 mb-1 block">Hint Text</label>
                          <textarea
                            placeholder="Type hint here..."
                            className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-xs text-starlight outline-none focus:border-accretion resize-none h-12"
                            value={hint.text}
                            onChange={(e) => {
                              const updated = [...newChallengeHints];
                              updated[idx] = { ...updated[idx], text: e.target.value };
                              setNewChallengeHints(updated);
                            }}
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-[9px] uppercase tracking-wider text-copper/60 mb-1 block">Unlock Delay (Minutes)</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-xs text-starlight outline-none focus:border-accretion"
                              value={hint.unlock_minutes || 0}
                              onChange={(e) => {
                                const updated = [...newChallengeHints];
                                updated[idx] = { ...updated[idx], unlock_minutes: parseInt(e.target.value, 10) || 0 };
                                setNewChallengeHints(updated);
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-4">
                            <input
                              type="checkbox"
                              checked={hint.is_visible !== false}
                              onChange={(e) => {
                                const updated = [...newChallengeHints];
                                updated[idx] = { ...updated[idx], is_visible: e.target.checked };
                                setNewChallengeHints(updated);
                              }}
                            />
                            <span className="text-[10px] text-starlight">Visible</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateChallengeModal(false);
                    setEditingChallenge(null);
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
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

              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Set # (Optional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave blank for all teams"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={editAssetSet || ''}
                  onChange={(e) => setEditAssetSet(e.target.value)}
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
      {/* 17. Modal: Create / Edit Round */}
      {showRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-accretion/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-starlight">
                {activeRound ? <Edit className="w-4 h-4 text-accretion" /> : <Plus className="w-4 h-4 text-accretion" />}
                <span>{activeRound ? `Edit Round: ${activeRound.name.toUpperCase()}` : 'Create New Round'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowRoundModal(false);
                  setActiveRound(null);
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRound} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Round Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signal Acquisition"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Time Limit (mins)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Unlimited (0)"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newRoundTimeLimit}
                  onChange={(e) => setNewRoundTimeLimit(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Order Number</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Auto"
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={newRoundOrder}
                    onChange={(e) => setNewRoundOrder(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Active</label>
                  <select
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none focus:border-accretion"
                    value={newRoundIsActive ? 'true' : 'false'}
                    onChange={(e) => setNewRoundIsActive(e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 border border-accretion/20 p-3">
                <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Story Fragment</label>
                <input
                  type="text"
                  placeholder="Fragment title"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newRoundFragmentTitle}
                  onChange={(e) => setNewRoundFragmentTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Header (e.g. MISSION BRIEFING)"
                  className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newRoundFragmentHeader}
                  onChange={(e) => setNewRoundFragmentHeader(e.target.value)}
                />
                <textarea
                  rows="3"
                  placeholder="Fragment content"
                  className="w-full resize-none border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                  value={newRoundFragmentContent}
                  onChange={(e) => setNewRoundFragmentContent(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoundModal(false);
                    setActiveRound(null);
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border border-accretion bg-accretion py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
                >
                  {activeRound ? 'Save Round' : 'Create Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 18. Modal: Delete Round Confirmation */}
      {showDeleteRoundConfirmModal && activeRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-500/30 bg-black p-8 text-starlight">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-orbitron text-sm tracking-[0.22em] text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span>Delete Round</span>
              </h3>
              <button
                onClick={() => {
                  setShowDeleteRoundConfirmModal(false);
                  setActiveRound(null);
                  setDeleteRoundId('');
                }}
                className="text-copper hover:text-starlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-red-500/20 bg-black/40 p-3 text-sm text-red-200">
              PERMANENTLY DELETE ROUND:
              <div className="font-bold text-red-300 mt-1">{activeRound.name.toUpperCase()}</div>
              <div className="mt-2 text-[10px] text-orange-400/80 uppercase">
                Rounds with assigned challenges cannot be deleted. Type the round name to confirm.
              </div>
            </div>

            <form onSubmit={handleDeleteRound} className="mt-4 space-y-4">
              <input
                type="text"
                required
                placeholder={`Type "${activeRound.name}" to confirm`}
                className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-red-400"
                value={deleteRoundId}
                onChange={(e) => setDeleteRoundId(e.target.value)}
              />
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteRoundConfirmModal(false);
                    setActiveRound(null);
                    setDeleteRoundId('');
                  }}
                  className="flex-1 border border-copper/30 py-2.5 font-rajdhani text-sm tracking-[0.2em] text-copper hover:border-accretion hover:text-accretion"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer border border-red-500 bg-red-600 py-2 font-orbitron text-xs uppercase tracking-wider text-white hover:bg-red-500"
                >
                  DELETE ROUND
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import { useAdmin } from '../AdminContext';
import {
  Lock,
  Unlock,
  RotateCcw,
  Edit,
  Plus,
  X,
  File,
} from 'lucide-react';

export default function ChallengesTab() {
  const {
    challenges,
    setActiveChallenge,
    setShowCreateChallengeModal,
    setShowTimeLimitModal,
    setEditTimeLimitValue,
    setShowEditAssetModal,
    setActiveAsset,
    setActiveAssetChallengeId,
    setEditAssetName,
    setEditAssetUrl,
    dragOverChallengeId,
    setDragOverChallengeId,
    safeguardActive,
    setShowSkipConfirmModal,
    setSkipConfirmInput,
    setShowResetChallengeConfirmModal,
    setResetChallengeConfirmInput,
    handleAddAssetToChallengeDirect,
    handleDeleteAsset,
    handleToggleLockChallenge,
    handleToggleHintChallenge,
    handleOpenEditAnswer,
    handleOpenOverrideChallenge
  } = useAdmin();

  return (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">TRANSMISSIONS</h2>
                <p className="mt-1 text-sm text-copper/80">Locks, answers, and assets for every round.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateChallengeModal(true)}
                className="inline-flex items-center gap-2 border border-accretion bg-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
              >
                <Plus className="h-4 w-4" />
                NEW LOCK
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="flex flex-col justify-between border border-accretion/20 bg-black/45 p-6 backdrop-blur-sm transition hover:border-accretion/50">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p className="font-rajdhani text-[11px] tracking-[0.28em] text-accretion">
                        ROUND {challenge.round}
                      </p>
                      <span className={`font-rajdhani text-[11px] tracking-[0.22em] ${
                        challenge.isLocked ? 'text-red-300' : 'text-accretion'
                      }`}>
                        {challenge.isLocked ? 'LOCKED' : 'OPEN'}
                      </span>
                    </div>
                    <h3 className="mb-5 font-orbitron text-lg tracking-[0.08em] text-starlight">{challenge.title}</h3>
                    
                    <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                      <div className="mb-1 font-rajdhani text-[11px] tracking-[0.22em] text-copper">ANSWER</div>
                      <div className="flex items-center justify-between gap-2 text-accretion">
                        <span className="truncate">{challenge.answer || '—'}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditAnswer(challenge)}
                          className="inline-flex shrink-0 items-center gap-1 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:text-accretion"
                        >
                          <Edit className="h-3 w-3" />
                          EDIT
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                      <div className="mb-1 font-rajdhani text-[11px] tracking-[0.22em] text-copper">TIME LIMIT</div>
                      <div className="flex items-center justify-between gap-2 text-starlight">
                        <span>{challenge.timeLimit ? `${challenge.timeLimit} min` : 'None'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChallenge(challenge);
                            setEditTimeLimitValue(challenge.timeLimit || 60);
                            setShowTimeLimitModal(true);
                          }}
                          className="inline-flex shrink-0 items-center gap-1 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:text-accretion"
                        >
                          <Edit className="h-3 w-3" />
                          SET
                        </button>
                      </div>
                    </div>

                    {/* Attached Assets */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(challenge.id);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(null);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          Array.from(e.dataTransfer.files).forEach(file => {
                            handleAddAssetToChallengeDirect(challenge.id, file);
                          });
                        }
                      }}
                      className={`mb-4 border p-3 text-sm transition ${
                        dragOverChallengeId === challenge.id
                          ? 'border-accretion bg-accretion/10'
                          : 'border-copper/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">Assets ({challenge.assets ? challenge.assets.length : 0})</span>
                        <button
                          type="button"
                          onClick={() => document.getElementById(`file-upload-${challenge.id}`).click()}
                          className="font-rajdhani text-[11px] tracking-[0.18em] text-accretion hover:text-accretion-bright"
                        >
                          + ADD
                        </button>
                        <input
                          id={`file-upload-${challenge.id}`}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              Array.from(e.target.files).forEach(file => {
                                handleAddAssetToChallengeDirect(challenge.id, file);
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        {challenge.assets && challenge.assets.length > 0 ? (
                          challenge.assets.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 border-b border-white/5 py-1.5 text-xs last:border-0">
                              <span className="flex min-w-0 items-center gap-1.5 text-starlight">
                                <File className="h-3 w-3 shrink-0 text-copper" />
                                <span className="truncate">{asset.name}</span>
                              </span>
                              <div className="flex items-center gap-2 shrink-0 font-bold">
                                <a
                                  href={asset.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-copper hover:text-accretion hover:underline"
                                >
                                  Link ↗
                                </a>
                                <button
                                  onClick={() => {
                                    setActiveAsset(asset);
                                    setActiveAssetChallengeId(challenge.id);
                                    setEditAssetName(asset.name);
                                    setEditAssetUrl(asset.url);
                                    setShowEditAssetModal(true);
                                  }}
                                  className="text-gray-400 hover:text-accretion cursor-pointer"
                                  title="Edit Asset Details (API: PUT Edit Asset)"
                                >
                                  <Edit className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(challenge.id, asset.name)}
                                  className="text-gray-500 hover:text-red-400 cursor-pointer"
                                  title="Delete Asset (API: DEL Delete Asset)"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="border border-dashed border-copper/25 px-2 py-3 text-center font-rajdhani text-[11px] tracking-[0.18em] text-copper/50">
                            Drop files here
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 border-t border-accretion/15 pt-4">
                      <div>
                        <p className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">Value</p>
                        <p className="mt-1 font-orbitron text-accretion">{challenge.points || 0}</p>
                      </div>
                      <div>
                        <p className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">Solved</p>
                        <p className="mt-1 font-orbitron text-starlight">{challenge.solvedCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-accretion/15 pt-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLockChallenge(challenge.id, challenge.isLocked)}
                        className={`flex flex-1 items-center justify-center gap-1.5 border py-2 font-rajdhani text-[11px] tracking-[0.18em] ${
                          challenge.isLocked
                            ? 'border-red-400/40 text-red-300 hover:bg-red-500/10'
                            : 'border-accretion/40 text-accretion hover:bg-accretion/10'
                        }`}
                      >
                        {challenge.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {challenge.isLocked ? 'UNLOCK' : 'LOCK'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleHintChallenge(challenge.id, challenge.hintsEnabled)}
                        className={`flex-1 border py-2 font-rajdhani text-[11px] tracking-[0.18em] ${
                          challenge.hintsEnabled
                            ? 'border-accretion/40 text-accretion'
                            : 'border-copper/25 text-copper'
                        }`}
                      >
                        {challenge.hintsEnabled ? 'HINTS ON' : 'HINTS OFF'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenOverrideChallenge(challenge)}
                        className="flex-1 border border-copper/25 py-2 font-rajdhani text-[11px] tracking-[0.16em] text-copper hover:border-accretion hover:text-accretion"
                      >
                        FORCE COMPLETE
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChallenge(challenge);
                          setSkipConfirmInput('');
                          setShowSkipConfirmModal(true);
                        }}
                        disabled={safeguardActive}
                        className={`flex-1 border py-2 font-rajdhani text-[11px] tracking-[0.16em] ${
                          safeguardActive
                            ? 'cursor-not-allowed border-copper/15 text-copper/30'
                            : 'border-copper/25 text-copper hover:border-accretion hover:text-accretion'
                        }`}
                        title={safeguardActive ? 'Safeguard Mode Active (Locked)' : 'Skip challenge for all'}
                      >
                        {safeguardActive ? 'LOCKED' : 'SKIP ALL'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChallenge(challenge);
                          setResetChallengeConfirmInput('');
                          setShowResetChallengeConfirmModal(true);
                        }}
                        disabled={safeguardActive}
                        className={`border px-3 py-2 ${
                          safeguardActive
                            ? 'cursor-not-allowed border-copper/15 text-copper/30'
                            : 'border-copper/25 text-copper hover:border-red-400 hover:text-red-300'
                        }`}
                        title={safeguardActive ? 'Safeguard Mode Active (Locked)' : 'Reset Challenge Stats'}
                      >
                        {safeguardActive ? <Lock className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
}

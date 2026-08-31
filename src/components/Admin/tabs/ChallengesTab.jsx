import React, { useState, useMemo } from 'react';
import { useAdmin } from '../AdminContext';
import {
  Lock,
  Unlock,
  RotateCcw,
  Edit,
  Plus,
  X,
  File,
  Layers,
  FolderArchive,
} from 'lucide-react';

export default function ChallengesTab() {
  const {
    challenges,
    setActiveChallenge,
    setShowCreateChallengeModal,
    setNewChallengeRound,
    setNewChallengeArchive,
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

  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  // Group challenges by Round -> Archive
  const groupedByRound = useMemo(() => {
    const groups = {};
    (challenges || []).forEach((c) => {
      const r = c.round || 1;
      if (!groups[r]) groups[r] = [];
      groups[r].push(c);
    });

    // Sort archives inside each round by archiveNumber or order_number
    Object.keys(groups).forEach((r) => {
      groups[r].sort((a, b) => (a.archiveNumber || a.order_number || 0) - (b.archiveNumber || b.order_number || 0));
    });

    return groups;
  }, [challenges]);

  const roundNumbers = useMemo(() => {
    return Object.keys(groupedByRound).map(Number).sort((a, b) => a - b);
  }, [groupedByRound]);

  const handleOpenCreateModal = (targetRound = null) => {
    if (targetRound) {
      setNewChallengeRound(targetRound);
      const archivesInRound = (groupedByRound[targetRound] || []).map((c) => c.archiveNumber || 1);
      const nextArchive = archivesInRound.length > 0 ? Math.max(0, ...archivesInRound) + 1 : 1;
      setNewChallengeArchive(nextArchive);
    } else {
      const usedRounds = new Set(challenges.map((c) => c.round));
      let nextRound = 1;
      while (usedRounds.has(nextRound)) nextRound += 1;
      setNewChallengeRound(nextRound);
      setNewChallengeArchive(1);
    }
    setShowCreateChallengeModal(true);
  };

  const displayedRoundNumbers = selectedRoundFilter === 'all'
    ? roundNumbers
    : roundNumbers.filter((r) => r === Number(selectedRoundFilter));

  return (
    <div>
      {/* Tab Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">TRANSMISSIONS</h2>
            <span className="rounded bg-accretion/20 px-2 py-0.5 font-rajdhani text-[11px] font-bold tracking-widest text-accretion">
              ROUNDS → ARCHIVE
            </span>
          </div>
          <p className="mt-1 text-sm text-copper/80">Locks, answers, and assets organized by Round and Archive.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenCreateModal()}
          className="inline-flex items-center gap-2 border border-accretion bg-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright transition-colors shadow-[0_0_12px_rgba(209,155,131,0.3)]"
        >
          <Plus className="h-4 w-4" />
          NEW LOCK
        </button>
      </div>

      {/* Round Filter & Quick Navigation Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-accretion/20 pb-4">
        <span className="mr-1 flex items-center gap-1.5 font-rajdhani text-[11px] uppercase tracking-[0.2em] text-copper">
          <Layers className="h-3.5 w-3.5 text-accretion" />
          FILTER ROUND:
        </span>
        <button
          type="button"
          onClick={() => setSelectedRoundFilter('all')}
          className={`rounded border px-3 py-1.5 font-orbitron text-[10px] tracking-wider transition-all ${
            selectedRoundFilter === 'all'
              ? 'border-accretion bg-accretion/20 text-accretion font-bold shadow-[0_0_8px_rgba(209,155,131,0.25)]'
              : 'border-copper/30 bg-black/40 text-copper hover:border-accretion/60 hover:text-accretion'
          }`}
        >
          ALL ROUNDS ({challenges.length})
        </button>

        {roundNumbers.map((roundNum) => {
          const count = (groupedByRound[roundNum] || []).length;
          const isSelected = selectedRoundFilter === String(roundNum);
          return (
            <button
              key={roundNum}
              type="button"
              onClick={() => setSelectedRoundFilter(String(roundNum))}
              className={`rounded border px-3 py-1.5 font-orbitron text-[10px] tracking-wider transition-all ${
                isSelected
                  ? 'border-accretion bg-accretion/20 text-accretion font-bold shadow-[0_0_8px_rgba(209,155,131,0.25)]'
                  : 'border-copper/30 bg-black/40 text-copper hover:border-accretion/60 hover:text-accretion'
              }`}
            >
              ROUND {roundNum} ({count} {count === 1 ? 'Archive' : 'Archives'})
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            const nextRound = roundNumbers.length > 0 ? Math.max(...roundNumbers) + 1 : 1;
            handleOpenCreateModal(nextRound);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded border border-dashed border-accretion/50 bg-black/30 px-3 py-1.5 font-orbitron text-[10px] tracking-wider text-accretion hover:bg-accretion/15 transition-colors"
        >
          <Plus className="h-3 w-3" />
          + NEW ROUND
        </button>
      </div>

      {/* Rounds & Nested Archives List */}
      {displayedRoundNumbers.length === 0 ? (
        <div className="border border-dashed border-copper/30 bg-black/30 p-12 text-center">
          <FolderArchive className="mx-auto h-8 w-8 text-copper/50 mb-3" />
          <p className="font-orbitron text-sm text-copper">NO CHALLENGES LOADED FOR THIS SECTOR</p>
          <p className="mt-1 text-xs text-copper/60">Click "NEW LOCK" to initialize an Archive in this Round.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {displayedRoundNumbers.map((roundNum) => {
            const roundChallenges = groupedByRound[roundNum] || [];
            return (
              <div key={roundNum} className="border border-accretion/25 bg-black/30 p-5 rounded-lg">
                {/* Round Group Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-accretion/20 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-accretion/20 border border-accretion/50 font-orbitron text-xs font-bold text-accretion">
                      R{roundNum}
                    </span>
                    <div>
                      <h3 className="font-orbitron text-base font-bold tracking-[0.18em] text-starlight">
                        ROUND {String(roundNum).padStart(2, '0')} SECTOR ARCHIVES
                      </h3>
                      <p className="font-rajdhani text-xs tracking-wider text-copper">
                        {roundChallenges.length} {roundChallenges.length === 1 ? 'TRANSMISSION ARCHIVE' : 'TRANSMISSION ARCHIVES'} CONFIGURED
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(roundNum)}
                    className="inline-flex items-center gap-1.5 rounded border border-accretion/40 bg-accretion/10 px-3 py-1.5 font-orbitron text-[10px] tracking-[0.16em] text-accretion hover:bg-accretion hover:text-black transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    ADD ARCHIVE TO ROUND {roundNum}
                  </button>
                </div>

                {/* Archives Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {roundChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex flex-col justify-between border border-accretion/20 bg-black/60 p-6 backdrop-blur-sm transition hover:border-accretion/50 rounded"
                    >
                      <div>
                        {/* Round + Archive Tag Header */}
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-rajdhani text-[11px] font-bold tracking-[0.24em] text-accretion bg-accretion/15 px-2 py-0.5 rounded border border-accretion/30">
                              ROUND {challenge.round} • ARCHIVE {String(challenge.archiveNumber || 1).padStart(2, '0')}
                            </span>
                          </div>
                          <span
                            className={`font-rajdhani text-[11px] font-bold tracking-[0.22em] ${
                              challenge.isLocked ? 'text-red-300' : 'text-accretion'
                            }`}
                          >
                            {challenge.isLocked ? 'LOCKED' : 'OPEN'}
                          </span>
                        </div>

                        {/* Archive / Challenge Title */}
                        <h4 className="mb-5 font-orbitron text-lg tracking-[0.08em] text-starlight">
                          {challenge.title}
                        </h4>

                        {/* Answer Key */}
                        <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                          <div className="mb-1 font-rajdhani text-[11px] tracking-[0.22em] text-copper">ANSWER KEY</div>
                          <div className="flex items-center justify-between gap-2 text-accretion">
                            <span className="truncate font-mono">{challenge.answer || '—'}</span>
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

                        {/* Time Limit */}
                        <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                          <div className="mb-1 font-rajdhani text-[11px] tracking-[0.22em] text-copper">TIME LIMIT</div>
                          <div className="flex items-center justify-between gap-2 text-starlight">
                            <span className="font-mono">
                              {challenge.timeLimit && challenge.timeLimit < 99999 ? `${challenge.timeLimit} min` : 'Unlimited'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveChallenge(challenge);
                                setEditTimeLimitValue(challenge.timeLimit && challenge.timeLimit < 99999 ? challenge.timeLimit : 0);
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
                              Array.from(e.dataTransfer.files).forEach((file) => {
                                handleAddAssetToChallengeDirect(challenge.id, file);
                              });
                            }
                          }}
                          className={`mb-4 border p-3 text-sm transition rounded ${
                            dragOverChallengeId === challenge.id
                              ? 'border-accretion bg-accretion/10'
                              : 'border-copper/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                              Assets ({challenge.assets ? challenge.assets.length : 0})
                            </span>
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
                                  Array.from(e.target.files).forEach((file) => {
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
                                      type="button"
                                      onClick={() => {
                                        setActiveAsset(asset);
                                        setActiveAssetChallengeId(challenge.id);
                                        setEditAssetName(asset.name);
                                        setEditAssetUrl(asset.url);
                                        setShowEditAssetModal(true);
                                      }}
                                      className="text-gray-400 hover:text-accretion cursor-pointer"
                                      title="Edit Asset Details"
                                    >
                                      <Edit className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAsset(challenge.id, asset.name)}
                                      className="text-gray-500 hover:text-red-400 cursor-pointer"
                                      title="Delete Asset"
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

                        {/* Value & Solved Count */}
                        <div className="mb-6 grid grid-cols-2 gap-4 border-t border-accretion/15 pt-4">
                          <div>
                            <p className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">Value</p>
                            <p className="mt-1 font-orbitron text-accretion">{challenge.points || 0}</p>
                          </div>
                          <div>
                            <p className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">Solved</p>
                            <p className="mt-1 font-orbitron text-starlight">{challenge.solvedCount || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="space-y-2 border-t border-accretion/15 pt-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLockChallenge(challenge.id, challenge.isLocked)}
                            className={`flex flex-1 items-center justify-center gap-1.5 border py-2 font-rajdhani text-[11px] tracking-[0.18em] rounded ${
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
                            className={`flex-1 border py-2 font-rajdhani text-[11px] tracking-[0.18em] rounded ${
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
                            className="flex-1 border border-copper/25 py-2 font-rajdhani text-[11px] tracking-[0.16em] text-copper hover:border-accretion hover:text-accretion rounded"
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
                            className={`flex-1 border py-2 font-rajdhani text-[11px] tracking-[0.16em] rounded ${
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
                            className={`border px-3 py-2 rounded ${
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
          })}
        </div>
      )}
    </div>
  );
}

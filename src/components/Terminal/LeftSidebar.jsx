import React, { useState, useEffect } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ChevronDown, ChevronRight, Lock, Unlock, Radar, Route as RouteIcon, Info } from 'lucide-react';

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return [
    Math.floor(safeSeconds / 3600),
    Math.floor((safeSeconds % 3600) / 60),
    safeSeconds % 60,
  ].map(pad).join(':');
}

export default function LeftSidebar({ onNavigate }) {
  const {
    unlockedRounds,
    unlockedPhases,
    currentRound,
    changeRound,
    currentPhase,
    setCurrentPhase,
    activeTab,
    setActiveTab,
    challengeData,
    completedChallenges,
    roundTimeLeft,
    roundExpired,
  } = useGameState();
    const [expandedRound, setExpandedRound] = useState(currentRound);
  const roundData = challengeData?.[currentRound] || {};
  const roundLimit = roundData.timeLimitSeconds || 0;
  const startedAtIso = roundData.startedAt;
  const bonusSeconds = roundData.bonusSeconds || 0;
  const isPaused = roundData.isPaused;
  const isCompleted = roundData.isCompleted;
  const pausedAtIso = roundData.pausedAt;
  
  const [remaining, setRemaining] = useState(roundLimit);

  useEffect(() => {
    setExpandedRound(currentRound);
  }, [currentRound]);

  useEffect(() => {
    if (!roundLimit || !startedAtIso) {
      setRemaining(roundLimit);
      return undefined;
    }

    const startedAt = new Date(startedAtIso).getTime();
    const totalAllowedSeconds = roundLimit + bonusSeconds;

    const tick = () => {
      let elapsed = 0;
      if (isPaused && pausedAtIso) {
          elapsed = Math.floor((new Date(pausedAtIso).getTime() - startedAt) / 1000);
      } else {
          elapsed = Math.floor((Date.now() - startedAt) / 1000);
      }
      
      if (totalAllowedSeconds > 0 && elapsed > totalAllowedSeconds && !window.hasReloadedForTimeout) {
          window.hasReloadedForTimeout = true;
          window.location.reload();
      }
      
      setRemaining(Math.max(0, totalAllowedSeconds - elapsed));
    };
    tick();
    
    if (isPaused) {
        return undefined;
    }
    
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentRound, roundLimit, startedAtIso, bonusSeconds, isPaused, pausedAtIso]);

  const handleRoundClick = (roundId) => {
    if (unlockedRounds.includes(roundId)) {
      setExpandedRound(expandedRound === roundId ? null : roundId);
      changeRound(roundId);
    }
  };

  const calculateRoundProgress = (roundId) => {
    const roundData = challengeData?.[roundId];
    if (!roundData || !unlockedRounds.includes(roundId)) return 0;
    // If we've unlocked a round past this one, it's 100%
    if (Math.max(...unlockedRounds) > roundId) return 100;

    const phasesList = Object.values(roundData.phases || {});
    if (phasesList.length === 0) return 0;

    const completedList = completedChallenges || [];
    const completedInThisRound = phasesList.filter((p) => completedList.includes(p.order_number)).length;

    if (completedInThisRound > 0) {
      return Math.min(100, Math.round((completedInThisRound / phasesList.length) * 100));
    }

    const currentUnlockedPhase = unlockedPhases[roundId] || 1;
    const completedArchives = Math.max(0, currentUnlockedPhase - 1);
    return Math.min(100, Math.round((completedArchives / phasesList.length) * 100));
  };

  return (
    <div className="panel flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-2.5 sm:p-4">

      {/* Timers */}
      <div className="mb-2.5 shrink-0 border border-accretion/30 bg-black/40 p-2 sm:p-3 rounded-lg">
        <div className="flex justify-between items-center gap-2">
          <p className="label-mono text-[10px] sm:text-xs uppercase tracking-wider text-accretion/80">Round Time</p>
          <p className={`font-orbitron text-sm sm:text-base tabular-nums tracking-widest ${remaining <= 0 && !isCompleted ? "text-red-400" : "text-accretion"}`}>{isCompleted ? "COMPLETED" : formatDuration(remaining)}</p>
        </div>
      </div>

      {/* Main Links */}
      <div className="mb-2.5 shrink-0 space-y-1">
        <button
          onClick={() => {
            setActiveTab('overview');
            onNavigate?.();
          }}
          className={`w-full flex items-center gap-2.5 min-h-[36px] p-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-accretion/20 text-accretion border border-accretion/40 shadow-[0_0_8px_rgba(209,155,131,0.2)]' : 'hover:bg-accretion/10 text-foreground/80 hover:text-accretion'}`}
        >
          <Radar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="font-orbitron text-[11px] sm:text-xs tracking-widest uppercase">Overview</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('guidelines');
            onNavigate?.();
          }}
          className={`w-full flex items-center gap-2.5 min-h-[36px] p-2 rounded-lg transition-colors ${activeTab === 'guidelines' ? 'bg-accretion/20 text-accretion border border-accretion/40 shadow-[0_0_8px_rgba(209,155,131,0.2)]' : 'hover:bg-accretion/10 text-foreground/80 hover:text-accretion'}`}
        >
          <RouteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="font-orbitron text-[11px] sm:text-xs tracking-widest uppercase">Guidelines</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('faq');
            onNavigate?.();
          }}
          className={`w-full flex items-center gap-2.5 min-h-[36px] p-2 rounded-lg transition-colors ${activeTab === 'faq' ? 'bg-accretion/20 text-accretion border border-accretion/40 shadow-[0_0_8px_rgba(209,155,131,0.2)]' : 'hover:bg-accretion/10 text-foreground/80 hover:text-accretion'}`}
        >
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="font-orbitron text-[11px] sm:text-xs tracking-widest uppercase">FAQ</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-0.5 space-y-2">
        {(challengeData ? Object.entries(challengeData) : []).map(([roundIdStr, roundData]) => {
          const roundId = parseInt(roundIdStr);
          const isUnlocked = unlockedRounds.includes(roundId);
          const isExpanded = expandedRound === roundId;
          const isActive = currentRound === roundId;

          return (
            <div key={roundId} className="border border-accretion/30 rounded-lg bg-black/40 overflow-hidden">
              <button
                onClick={() => handleRoundClick(roundId)}
                className={`w-full flex items-center justify-between min-h-[40px] p-2.5 transition-colors ${isUnlocked ? 'hover:bg-accretion/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                disabled={!isUnlocked}
              >
                <div className="flex items-center gap-2">
                  {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-accretion shrink-0" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  <span className={`font-orbitron tracking-widest text-xs sm:text-sm ${isActive ? 'text-accretion font-bold' : 'text-foreground/80'}`}>
                    {roundData.title.toUpperCase()}
                  </span>
                </div>
                {isUnlocked && (
                  isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-accretion shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-accretion shrink-0" />
                )}
              </button>

              {isExpanded && isUnlocked && (
                <div className="p-2.5 pt-0 space-y-1.5 border-t border-accretion/20">
                  <div className="mb-2 mt-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <p className="label-mono text-[8px] text-accretion/70">Sector Clearance</p>
                      <p className="font-mono text-[9px] text-accretion">{calculateRoundProgress(roundId)}%</p>
                    </div>
                    <div className="h-1 w-full rounded-full bg-black/60 border border-accretion/20 overflow-hidden">
                      <div className="h-full rounded-full bg-accretion shadow-[0_0_6px_#D19B83]" style={{ width: `${calculateRoundProgress(roundId)}%` }} />
                    </div>
                  </div>

                  {Object.entries(roundData.phases).map(([phaseIdStr, phaseData]) => {
                    const phaseId = parseInt(phaseIdStr);
                    const isPhaseUnlocked = isUnlocked && ((unlockedPhases[roundId] || 1) >= phaseId || !phaseData.is_locked);
                    const isPhaseActive = currentRound === roundId && currentPhase === phaseId;

                    return (
                      <button
                        key={phaseId}
                        onClick={() => {
                          if (isPhaseUnlocked) {
                            if (currentRound !== roundId) {
                              changeRound(roundId);
                            }
                            setCurrentPhase(phaseId);
                            setActiveTab('overview');
                            onNavigate?.();
                          }
                        }}
                        disabled={!isPhaseUnlocked}
                        className={`w-full text-left min-h-[36px] p-2 rounded-md flex items-center gap-2 transition-all text-xs ${isPhaseUnlocked ? 'cursor-pointer hover:bg-accretion/20' : 'opacity-40 cursor-not-allowed'} ${isPhaseActive && activeTab === 'overview' ? 'bg-accretion/25 text-accretion border border-accretion/60 font-semibold' : 'text-foreground/75'}`}
                      >
                        {isPhaseUnlocked ? <div className="w-1.5 h-1.5 rounded-full bg-accretion shrink-0 shadow-[0_0_4px_#D19B83]" /> : <Lock className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />}
                        <span className="truncate">{phaseData.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

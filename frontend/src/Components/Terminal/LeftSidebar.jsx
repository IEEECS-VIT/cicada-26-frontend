import React, { useState, useEffect } from 'react';
import { useGameState } from '../../Context/GameStateContext';
import { CHALLENGE_DATA } from './challengeData';
import { ChevronDown, ChevronRight, Lock, Unlock, Radar, Route as RouteIcon, Info } from 'lucide-react';

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function LeftSidebar() {
  const { unlockedRounds, unlockedPhases, currentRound, changeRound, currentPhase, setCurrentPhase, activeTab, setActiveTab } = useGameState();
  const [expandedRound, setExpandedRound] = useState(currentRound);

  const [remaining, setRemaining] = useState(3 * 3600 + 46 * 60 + 21); // Mock 3h 46m 21s

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hrs = pad(Math.floor(remaining / 3600));
  const mins = pad(Math.floor((remaining % 3600) / 60));
  const secs = pad(remaining % 60);

  const handleRoundClick = (roundId) => {
    if (unlockedRounds.includes(roundId)) {
      setExpandedRound(expandedRound === roundId ? null : roundId);
      changeRound(roundId);
    }
  };

  const calculateOverallProgress = () => {
    let total = Object.keys(CHALLENGE_DATA).length * 100; // rough max score
    let current = (unlockedRounds.length - 1) * 100;
    // Add current round progress
    const activeRoundData = CHALLENGE_DATA[currentRound];
    if (activeRoundData) {
      current += ((unlockedPhases[currentRound] || 1) / activeRoundData.totalPhases) * 100;
    }
    return Math.min(100, Math.round((current / total) * 100));
  };

  const calculateRoundProgress = (roundId) => {
    const roundData = CHALLENGE_DATA[roundId];
    if (!unlockedRounds.includes(roundId)) return 0;
    // if we've unlocked a round past this one, it's 100%
    if (Math.max(...unlockedRounds) > roundId) return 100;
    
    const unlocked = unlockedPhases[roundId] || 1;
    // Note: if round is completed, unlocked > totalPhases but we'll cap at 100% later if needed, but let's assume it caps at totalPhases for now.
    return Math.round((Math.min(unlocked, roundData.totalPhases) / roundData.totalPhases) * 100);
  };

  return (
    <div className="panel flex flex-col p-4 min-h-0 w-56 md:w-64 shrink-0 overflow-y-auto scrollbar-hide">
      
      {/* Timers */}
      <div className="mb-6 bg-black/40 p-3 rounded border border-[#D19B83]/30 shadow-[inset_0_0_10px_rgba(209,155,131,0.05)]">
        <div className="flex justify-between items-end">
          <p className="label-mono text-[9px] uppercase tracking-wider text-primary/70">Round Time</p>
          <p className="font-display text-base text-primary tabular-nums tracking-widest">{hrs}:{mins}:{secs}</p>
        </div>
      </div>

      {/* Main Links */}
      <div className="mb-6 space-y-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 p-2 rounded transition-colors ${activeTab === 'overview' ? 'bg-[#D19B83]/20 text-primary border border-[#D19B83]/40' : 'hover:bg-[#D19B83]/10 text-foreground/80 hover:text-primary'}`}
        >
          <Radar className="w-4 h-4 shrink-0" />
          <span className="font-display text-xs tracking-widest uppercase">Overview</span>
        </button>
        <button 
          onClick={() => setActiveTab('guidelines')}
          className={`w-full flex items-center gap-3 p-2 rounded transition-colors ${activeTab === 'guidelines' ? 'bg-[#D19B83]/20 text-primary border border-[#D19B83]/40' : 'hover:bg-[#D19B83]/10 text-foreground/80 hover:text-primary'}`}
        >
          <RouteIcon className="w-4 h-4 shrink-0" />
          <span className="font-display text-xs tracking-widest uppercase">Guidelines</span>
        </button>
        <button 
          onClick={() => setActiveTab('faq')}
          className={`w-full flex items-center gap-3 p-2 rounded transition-colors ${activeTab === 'faq' ? 'bg-[#D19B83]/20 text-primary border border-[#D19B83]/40' : 'hover:bg-[#D19B83]/10 text-foreground/80 hover:text-primary'}`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span className="font-display text-xs tracking-widest uppercase">FAQ</span>
        </button>
      </div>

      <div className="mb-6">
        <p className="label-mono text-xs">Team Progress</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${calculateOverallProgress()}%` }} />
        </div>
        <p className="text-right text-[10px] text-primary mt-1">{calculateOverallProgress()}%</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-4">
        {Object.entries(CHALLENGE_DATA).map(([roundIdStr, roundData]) => {
          const roundId = parseInt(roundIdStr);
          const isUnlocked = unlockedRounds.includes(roundId);
          const isExpanded = expandedRound === roundId;
          const isActive = currentRound === roundId;

          return (
            <div key={roundId} className="border border-[#D19B83]/30 rounded bg-black/40">
              <button 
                onClick={() => handleRoundClick(roundId)}
                className={`w-full flex items-center justify-between p-3 transition-colors ${isUnlocked ? 'hover:bg-[#D19B83]/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                disabled={!isUnlocked}
              >
                <div className="flex items-center gap-2">
                  {isUnlocked ? <Unlock className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  <span className={`font-display tracking-widest text-sm ${isActive ? 'text-primary font-bold' : 'text-foreground/80'}`}>
                    {roundData.title.toUpperCase()}
                  </span>
                </div>
                {isUnlocked && (
                  isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-primary" />
                )}
              </button>
              
              {isExpanded && isUnlocked && (
                <div className="p-3 pt-0 space-y-2 border-t border-[#D19B83]/30">
                  <div className="mb-3 mt-2">
                    <p className="label-mono text-[9px] mb-1">Round Progress</p>
                    <div className="h-1 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${calculateRoundProgress(roundId)}%` }} />
                    </div>
                  </div>
                  
                  {Object.entries(roundData.phases).map(([phaseIdStr, phaseData]) => {
                    const phaseId = parseInt(phaseIdStr);
                    const isPhaseUnlocked = (unlockedPhases[roundId] || 1) >= phaseId;
                    const isPhaseActive = currentPhase === phaseId;

                    return (
                      <button
                        key={phaseId}
                        onClick={() => { 
                          if (isPhaseUnlocked) {
                            setCurrentPhase(phaseId);
                            setActiveTab('overview');
                          }
                        }}
                        disabled={!isPhaseUnlocked}
                        className={`w-full text-left p-2 rounded flex items-center gap-2 transition-all text-xs ${isPhaseUnlocked ? 'cursor-pointer hover:bg-[#D19B83]/20' : 'opacity-40 cursor-not-allowed'} ${isPhaseActive && activeTab === 'overview' ? 'bg-[#D19B83]/20 text-primary border border-[#D19B83]/50' : 'text-foreground/70'}`}
                      >
                        {isPhaseUnlocked ? <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground shrink-0" />}
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

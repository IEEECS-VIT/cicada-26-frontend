import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Bell, AlertTriangle } from 'lucide-react';

export default function RightSidebar() {
  const { currentRound, currentPhase, hints } = useGameState();

  // Filter hints for the currently selected round, sort descending
  const currentHints = (hints || [])
    .filter(hint => hint.round === currentRound && hint.phase === currentPhase)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="panel flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-2.5 sm:p-4">
      
      <div className="mb-2.5 shrink-0 border-b border-accretion/25 pb-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Bell className="w-3.5 h-3.5 text-accretion" />
          <p className="label-mono text-[10px] text-accretion/90">Announcements</p>
        </div>
        <div className="bg-accretion/10 border border-accretion/35 rounded-lg p-2 text-xs text-accretion/90 leading-relaxed">
          <p>Welcome to Cicada 2067. Please ensure your communication channels are secured.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-accretion" />
            <p className="label-mono text-[10px] text-accretion/90">Decryption Hints</p>
          </div>
          <span className="rounded bg-accretion/20 px-1.5 py-0.5 font-mono text-[9px] text-accretion">
            Sector {currentRound}
          </span>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2 pr-0.5">
          {currentHints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-foreground/50 italic">No hints intercepted for this sector.</p>
            </div>
          ) : (
            currentHints.map(hint => (
              <div key={hint.id} className="border border-accretion/30 bg-black/40 p-2.5 rounded-lg">
                <p className="text-xs text-foreground/90 leading-relaxed">{hint.text}</p>
                <p className="text-[8px] text-accretion/60 mt-1 font-mono">{new Date(hint.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Bell, AlertTriangle } from 'lucide-react';

export default function RightSidebar() {
  const { currentRound, hints } = useGameState();

  // Filter hints for the currently selected round, sort descending
  const currentHints = hints
    .filter(hint => hint.round === currentRound)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="panel flex min-h-0 w-full flex-col overflow-y-auto p-3 scrollbar-hide sm:p-4">
      
      <div className="mb-6 border-b border-accretion/30 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-accretion" />
          <p className="label-mono text-xs">Announcements</p>
        </div>
        <div className="bg-accretion/10 border border-accretion/40 rounded p-2 text-xs text-accretion/90">
          <p>Welcome to Cicada 2067. Please ensure your communication channels are secured.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accretion" />
            <p className="label-mono text-xs">Decryption Hints</p>
          </div>
          <span className="text-[10px] text-accretion/70">Round {currentRound}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pr-1">
          {currentHints.length === 0 ? (
            <p className="text-xs text-foreground/50 italic text-center mt-4">No hints intercepted for this sector.</p>
          ) : (
            currentHints.map(hint => (
              <div key={hint.id} className="border border-accretion/30 bg-black/40 p-2.5">
                <p className="text-xs text-foreground/90">{hint.text}</p>
                <p className="text-[9px] text-accretion/60 mt-1 label-mono">{new Date(hint.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

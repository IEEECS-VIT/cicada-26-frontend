import React from 'react';
import { useGameState } from '../../Context/GameStateContext';
import { CHALLENGE_DATA } from './challengeData';

export default function ResourceViewer() {
  const { currentRound, currentPhase } = useGameState();
  const phaseData = CHALLENGE_DATA[currentRound]?.phases[currentPhase];

  if (!phaseData) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2">
      <div className="mb-4">
        <h3 className="font-display text-xl text-primary">{phaseData.title}</h3>
        <p className="text-sm text-foreground/80 mt-2">{phaseData.description}</p>
      </div>
      
      <div className="flex-1 border border-[#D19B83]/40 rounded-lg p-4 flex items-center justify-center bg-black/40 relative">
        <div className="text-center">
          <p className="label-mono mb-2">Resource Type: {phaseData.resourceType.toUpperCase()}</p>
          <a 
            href={phaseData.resourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 border border-[#D19B83] text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-display text-sm tracking-wider uppercase rounded"
          >
            Access Secure File
          </a>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D19B83]/60" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D19B83]/60" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#D19B83]/60" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#D19B83]/60" />
      </div>
    </div>
  );
}

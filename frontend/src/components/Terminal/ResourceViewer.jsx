import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export default function ResourceViewer() {
  const { challengeData, currentRound, currentPhase } = useGameState();
  const phaseData = challengeData?.[currentRound]?.phases?.[currentPhase];

  if (!phaseData) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 items-center justify-center text-center">
        <p className="text-sm text-foreground/60">Awaiting mission data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2">
      <div className="mb-4">
        <h3 className="font-display text-xl text-primary">{phaseData.title}</h3>
        <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{phaseData.description}</p>
      </div>

      <div className="flex-1 border border-[#D19B83]/40 rounded-lg p-4 flex items-center justify-center bg-black/40 relative overflow-y-auto">
        {phaseData.assets && phaseData.assets.length > 0 ? (
          <div className="w-full space-y-3">
            {phaseData.assets.map((asset, idx) => {
              if (asset.type === 'text') {
                return (
                  <div key={idx} className="border border-[#D19B83]/40 rounded p-4 bg-black/40 font-mono text-sm text-primary/90 whitespace-pre-wrap break-all">
                    {asset.content}
                  </div>
                );
              }
              return (
                <div key={idx} className="border border-[#D19B83]/40 rounded p-3">
                  <p className="label-mono mb-2 text-primary/70">RESOURCE: {String(asset.type || 'file').toUpperCase()}</p>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 border border-[#D19B83] text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-display text-sm tracking-wider uppercase rounded"
                  >
                    Access {asset.name || 'Secure File'}
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <p className="label-mono mb-2">Resource Type: {phaseData.resourceType}</p>
            {phaseData.resourceUrl && phaseData.resourceUrl !== '#' ? (
              <a
                href={phaseData.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 border border-[#D19B83] text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-display text-sm tracking-wider uppercase rounded"
              >
                Access Secure File
              </a>
            ) : (
              <p className="text-sm text-foreground/60">No additional resources.</p>
            )}
          </div>
        )}

        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D19B83]/60" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D19B83]/60" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#D19B83]/60" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#D19B83]/60" />
      </div>
    </div>
  );
}
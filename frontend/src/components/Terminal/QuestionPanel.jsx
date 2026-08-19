import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ArrowRight } from 'lucide-react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ResourceViewer from './ResourceViewer';
import GuidelinesViewer from './GuidelinesViewer';
import FaqViewer from './FaqViewer';

export default function QuestionPanel() {
  const { setIsTerminalOpen, activeTab } = useGameState();

  return (
    <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
      <LeftSidebar />
      
      <div className="panel flex-1 flex flex-col p-4 min-h-0 relative overflow-hidden">
        {activeTab === 'guidelines' ? (
          <GuidelinesViewer />
        ) : activeTab === 'faq' ? (
          <FaqViewer />
        ) : (
          <ResourceViewer />
        )}
        
        <div className="mt-4 shrink-0">
           <button
            onClick={() => setIsTerminalOpen(true)}
            className="w-full flex items-center justify-between rounded-md border border-[#D19B83] shadow-[0_0_12px_rgba(209,155,131,0.3)] px-4 py-3 font-display text-sm tracking-[0.2em] uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground group"
          >
            <span>Initialize Submission Terminal</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}

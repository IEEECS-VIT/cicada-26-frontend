import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

const FAQ_LIST = [
  {
    id: '01',
    q: 'WHAT IS CICADA 2067?',
    a: 'CICADA 2067 is a cryptic puzzle-solving competition organized by the IEEE Computer Society VIT. Teams solve interconnected cryptographic, visual, audio, and logic puzzles across deep cosmic sectors to unlock subsequent phases.'
  },
  {
    id: '02',
    q: 'HOW DO I SUBMIT ANSWERS?',
    a: 'Click "INITIALIZE SUBMISSION TERMINAL" below or enter the terminal command mode. Type `submit <answer>` (e.g. `submit PART1`) to execute verification.'
  },
  {
    id: '03',
    q: 'HOW DO HINTS AND BROADCASTS WORK?',
    a: 'Hints and sector broadcasts are streamed directly into your Decryption Hints feed on the right telemetry panel. Look out for periodic updates and sector clues.'
  },
  {
    id: '04',
    q: 'WHAT TOOLS ARE PERMITTED?',
    a: 'You may use audio spectrogram decoders, SSTV receivers, CyberChef, metadata / EXIF inspection utilities, image manipulation software, and astronomical coordinate software (e.g. Stellarium).'
  },
  {
    id: '05',
    q: 'WHAT SHOULD I DO IF MY SUBMISSION IS REJECTED?',
    a: 'Ensure there are no leading/trailing whitespaces, verify whether earlier phase outputs are prerequisites, and recheck case/format specifications. You can review past attempts with the `history` command.'
  },
  {
    id: '06',
    q: 'CAN WE SWITCH BETWEEN SECTORS AND PHASES?',
    a: 'Yes, use the Navigation Tree on the left sidebar to switch between any previously unlocked sectors and phases at any time.'
  }
];

export default function FaqViewer() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 scrollbar-hide">
      <div className="mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl text-primary tracking-wider uppercase">Frequently Asked Questions</h3>
          </div>
          <span className="label-mono text-[9px] text-primary/70">{FAQ_LIST.length} SIGNALS</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 pb-2">
        {FAQ_LIST.map((faq, index) => {
            const isOpen = openIdx === index;
            return (
              <div
                key={faq.id}
                className={`border rounded-lg transition-all duration-200 overflow-hidden bg-black/40 relative ${
                  isOpen 
                    ? 'border-[#D19B83]/70 shadow-[inset_0_0_12px_rgba(209,155,131,0.08)]' 
                    : 'border-[#D19B83]/30 hover:border-[#D19B83]/50'
                }`}
              >
                {/* Sci-fi corner accents */}
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#D19B83]/60" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-[#D19B83]/60" />
                <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-[#D19B83]/60" />
                <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-[#D19B83]/60" />

                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : index)}
                  className="w-full p-3 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="label-mono text-[9px] text-primary/60 shrink-0">{faq.id}</span>
                    <span className={`font-display text-xs sm:text-sm tracking-wider uppercase truncate ${isOpen ? 'text-primary font-semibold' : 'text-foreground/80'}`}>
                      {faq.q}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-primary shrink-0 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-primary/70 shrink-0 transition-transform" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-foreground/80 font-mono border-t border-[#D19B83]/20 mt-0.5">
                    <p className="leading-relaxed text-[#ffdb9d]/90">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

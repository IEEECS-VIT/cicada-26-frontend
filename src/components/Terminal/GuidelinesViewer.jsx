import React from 'react';
import { Terminal, Compass, Zap, FileText } from 'lucide-react';

const GUIDELINE_SECTIONS = [
  {
    id: '01',
    title: 'TRANSMISSION & SUBMISSIONS',
    icon: Terminal,
    desc: 'All decryption answers must be entered into the Secure Terminal using standard syntax.',
    points: [
      "Use command format: submit <answer> (e.g. submit PART1)",
      "Keys are alphanumeric and case-insensitive unless explicitly specified.",
      "Answers must contain no unexpected special characters or spaces."
    ]
  },
  {
    id: '02',
    title: 'PHASE & SECTOR PROGRESSION',
    icon: Zap,
    desc: 'Challenges are organized into sequential sectors and phases.',
    points: [
      "Successfully solving a phase automatically registers the checkpoint.",
      "Some later phases require decoded outputs or coordinates discovered in earlier phases.",
      "Rounds and sectors unlock sequentially as mission control broadcasts clearance."
    ]
  },
  {
    id: '03',
    title: 'TELEMETRY & HINTS',
    icon: Compass,
    desc: 'Intercepted signals and broadcasts will appear on your Right Telemetry feed.',
    points: [
      "Review the Decryption Hints list on the right sidebar for clues.",
      "Hints are tied to the active Sector and timestamped upon arrival.",
      "Keep communication logs open for global announcement updates."
    ]
  }
];

export default function GuidelinesViewer() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 scrollbar-hide">
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accretion" />
          <h3 className="font-orbitron text-xl text-accretion tracking-wider uppercase">Mission Directives & Guidelines</h3>
        </div>
        <p className="text-xs text-foreground/80 mt-1">Standard operational protocols for Cicada 2067 decryption crews.</p>
      </div>

      <div className="flex-1 space-y-3 pb-2">
        {GUIDELINE_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              className="relative border border-accretion/30 bg-black/40 p-3.5 transition-colors hover:border-accretion/60"
            >
              {/* Sci-fi corner accents */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-accretion/60" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-accretion/60" />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-accretion/60" />
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-accretion/60" />

              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-accretion/10 border border-accretion/30 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-accretion" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="label-mono text-[9px] text-accretion/70">PROTOCOL {sec.id}</span>
                    <h4 className="font-orbitron text-sm text-accretion tracking-wider uppercase">{sec.title}</h4>
                  </div>
                  <p className="text-xs text-foreground/80 mb-2">{sec.desc}</p>
                  <ul className="space-y-1">
                    {sec.points.map((pt, idx) => (
                      <li key={idx} className="text-xs text-accretion/90 flex items-start gap-2">
                        <span className="text-accretion/50 select-none mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

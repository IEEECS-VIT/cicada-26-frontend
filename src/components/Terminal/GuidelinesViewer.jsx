import React from 'react';

const GUIDELINE_SECTIONS = [
  {
    id: '01',
    title: 'TRANSMISSION & SUBMISSIONS',
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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-hide">
      <div className="mb-2.5 shrink-0 border-b border-accretion/20 pb-2">
        <h3 className="font-orbitron text-sm sm:text-lg text-accretion font-bold tracking-wider uppercase">
          Mission Directives & Guidelines
        </h3>
        <p className="text-xs text-foreground/80 mt-0.5">
          Standard operational protocols for Cicada 2067 decryption crews.
        </p>
      </div>

      <div className="relative flex-1 space-y-2.5 pb-2">
        {/* Single continuous starry cosmic background spanning seamlessly across all three boxes */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg bg-[url('/assets/starry-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-20"
          aria-hidden="true"
        />

        {GUIDELINE_SECTIONS.map((sec) => (
          <div
            key={sec.id}
            className="relative overflow-hidden border border-accretion/45 bg-[#121217]/65 backdrop-blur-md p-2.5 sm:p-3.5 transition-all hover:border-accretion/75 hover:bg-[#121217]/80 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
          >
            {/* Sci-fi corner accents */}
            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-accretion/60" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-accretion/60" />
            <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-accretion/60" />
            <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-accretion/60" />

            <div className="relative z-10 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="label-mono text-[8px] sm:text-[9px] text-accretion/70">PROTOCOL {sec.id}</span>
                <h4 className="font-orbitron text-xs sm:text-sm text-accretion font-bold tracking-wider uppercase">
                  {sec.title}
                </h4>
              </div>
              <p className="text-xs text-foreground/80 mb-2 leading-relaxed">{sec.desc}</p>
              <ul className="space-y-1">
                {sec.points.map((pt, idx) => (
                  <li key={idx} className="text-xs text-accretion/90 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-accretion/50 select-none mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

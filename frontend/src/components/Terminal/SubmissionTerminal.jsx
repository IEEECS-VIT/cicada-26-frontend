import React, { useState, useRef, useEffect } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Power } from 'lucide-react';

export default function SubmissionTerminal() {
  const { setIsTerminalOpen, terminalHistory, addTerminalCommand, clearTerminal, submitAnswer } = useGameState();
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalHistory]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    
    let response = '';

    switch (baseCmd) {
      case 'help':
        response = `Available commands:
  submit <answer>  - Submit an alphanumeric code for decryption
  guidelines       - View mission rules and submission protocol
  faq              - View frequently asked questions
  history          - View past submissions
  clear            - Clear terminal output
  help             - Show this message`;
        addTerminalCommand(cmd, response);
        break;

      case 'guidelines':
      case 'rules':
        response = `=== MISSION DIRECTIVES & GUIDELINES ===
- Use 'submit <key>' to verify decryption keys.
- Solve phases sequentially to unlock subsequent checkpoints.
- Review Right Telemetry panel for timestamped hints and announcements.
- Permitted tools: Spectrogram, SSTV, CyberChef, Image Analyzers, Stellarium.`;
        addTerminalCommand(cmd, response);
        break;

      case 'faq':
        response = `=== FREQUENTLY ASKED QUESTIONS ===
Q: How do I submit answers? -> Use 'submit <answer>' (e.g. submit PART1)
Q: What tools are allowed? -> Audio/Spectrogram, Steg, CyberChef, Stellarium, OSINT.
Q: How do hints work? -> Intercepted telemetry updates appear on the right sidebar.`;
        addTerminalCommand(cmd, response);
        break;
      
      case 'clear':
        clearTerminal();
        break;

      case 'history':
        response = terminalHistory
          .filter(h => h.command.toLowerCase().startsWith('submit'))
          .map(h => `[${new Date(h.timestamp).toLocaleTimeString()}] ${h.command} -> ${h.response}`)
          .join('\n');
        if (!response) response = "No submissions found in current session.";
        addTerminalCommand(cmd, response);
        break;

      case 'submit':
        if (parts.length < 2) {
          response = "Syntax Error: Missing answer payload. Usage: submit <answer>";
        } else {
          // Join the rest in case answer has spaces, though usually alphanumeric
          const answer = parts.slice(1).join(' ');
          // Only allow alphanumeric characters (regex test)
          if (!/^[a-zA-Z0-9_ -]+$/.test(answer)) {
             response = "Transmission Error: Invalid characters detected. Use alphanumeric only.";
          } else {
             response = submitAnswer(answer);
          }
        }
        addTerminalCommand(cmd, response);
        break;

      default:
        response = `Command not recognized: '${baseCmd}'. Type 'help' for available commands.`;
        addTerminalCommand(cmd, response);
        break;
    }

    setInput('');
  };

  return (
    <div className="panel flex-1 flex flex-col p-6 min-h-0 relative z-20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
      
      <div className="flex justify-between items-center border-b border-[#D19B83]/40 pb-4 mb-4 shrink-0">
        <div>
          <h2 className="font-display text-2xl tracking-[0.2em] text-primary">SECURE TERMINAL</h2>
          <p className="label-mono text-xs text-primary/70 mt-1">Awaiting input...</p>
        </div>
        <button
          onClick={() => setIsTerminalOpen(false)}
          className="flex items-center gap-2 px-4 py-2 border border-[#D19B83]/60 rounded text-primary hover:bg-primary/20 transition-colors"
        >
          <Power className="w-4 h-4" />
          <span className="font-display text-xs tracking-widest uppercase">Terminate Connection</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-sm sm:text-base space-y-2 pb-4 text-primary/90">
        <div className="mb-6 opacity-70">
          <p>CICADA 2067 SECURE SHELL v2.4.1</p>
          <p>Connection established. Encryption key verified.</p>
          <p>Type 'help' for a list of available commands.</p>
          <br/>
        </div>

        {terminalHistory.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex gap-2">
              <span className="text-primary/50">&gt;</span>
              <span className="text-[#D19B83] break-all">{entry.command}</span>
            </div>
            <div className="pl-4 whitespace-pre-wrap opacity-80 break-words mb-4">
              {entry.response}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleCommand} className="mt-4 shrink-0 relative flex items-center border-t border-[#D19B83]/40 pt-4">
        <span className="absolute left-0 text-primary font-mono text-xl select-none">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent border-none outline-none font-mono text-lg text-[#D19B83] pl-6 placeholder:text-primary/30"
          placeholder="Enter command..."
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
      </form>
      
    </div>
  );
}

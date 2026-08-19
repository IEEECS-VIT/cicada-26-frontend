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
             addTerminalCommand(cmd, response);
          } else {
             addTerminalCommand(cmd, "Transmitting answer for decryption...");
             submitAnswer(answer).then((res) => {
               addTerminalCommand(`submit ${answer}`, res);
             });
          }
        }
        break;

      default:
        response = `Command not recognized: '${baseCmd}'. Type 'help' for available commands.`;
        addTerminalCommand(cmd, response);
        break;
    }

    setInput('');
  };

  return (
    <div className="panel relative z-20 flex min-h-0 flex-1 flex-col p-3 sm:p-6">
      
      <div className="flex flex-col justify-between gap-3 border-b border-accretion/40 pb-3 mb-3 shrink-0 sm:mb-4 sm:flex-row sm:items-center sm:pb-4">
        <div>
          <h2 className="font-orbitron text-lg tracking-[0.16em] text-accretion sm:text-2xl sm:tracking-[0.2em]">SECURE TERMINAL</h2>
          <p className="label-mono text-[10px] text-accretion/70 mt-1 sm:text-xs">Awaiting input...</p>
        </div>
        <button
          onClick={() => setIsTerminalOpen(false)}
          className="flex min-h-11 items-center justify-center gap-2 border border-accretion/60 px-3 py-2 text-accretion transition-colors hover:bg-accretion/20 sm:px-4"
        >
          <Power className="w-4 h-4 shrink-0" />
          <span className="font-orbitron text-[10px] tracking-widest uppercase sm:text-xs">Terminate</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-sm sm:text-base space-y-2 pb-4 text-accretion/90">
        <div className="mb-6 opacity-70">
          <p>CICADA 2067 SECURE SHELL v2.4.1</p>
          <p>Connection established. Encryption key verified.</p>
          <p>Type 'help' for a list of available commands.</p>
          <br/>
        </div>

        {terminalHistory.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex gap-2">
              <span className="text-accretion/50">&gt;</span>
              <span className="text-accretion break-all">{entry.command}</span>
            </div>
            <div className="pl-4 whitespace-pre-wrap opacity-80 break-words mb-4">
              {entry.response}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleCommand} className="mt-4 shrink-0 relative flex items-center border-t border-accretion/40 pt-4">
        <span className="absolute left-0 text-accretion font-mono text-xl select-none">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent border-none outline-none font-mono text-base text-accretion pl-6 placeholder:text-accretion/30"
          placeholder="Enter command..."
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
      </form>
      
    </div>
  );
}

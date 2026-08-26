import React, { useState, useRef, useEffect } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Power, Send, Terminal as TerminalIcon } from 'lucide-react';

const QUICK_COMMANDS = [
  { label: 'submit <key>', action: 'fill', value: 'submit ' },
  { label: 'help', action: 'exec', value: 'help' },
  { label: 'guidelines', action: 'exec', value: 'guidelines' },
  { label: 'faq', action: 'exec', value: 'faq' },
  { label: 'clear', action: 'exec', value: 'clear' },
  { label: 'exit', action: 'exec', value: 'exit' },
];

export default function SubmissionTerminal() {
  const { 
    setIsTerminalOpen, 
    terminalHistory, 
    addTerminalCommand, 
    clearTerminal, 
    submitAnswer,
    challengeData,
    currentRound,
    currentPhase,
    unlockedPhases
  } = useGameState();
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalHistory]);

  const executeCommandString = (rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    
    let response = '';

    switch (baseCmd) {
      case 'help':
        response = `Available commands:
  submit <answer>  - Submit an alphanumeric code for decryption
  fragment         - View intercepted story fragment for active phase
  status           - View current mission and phase status
  guidelines       - View mission rules and submission protocol
  faq              - View frequently asked questions
  clear            - Clear terminal output
  exit             - Exit and return to main panel
  help             - Show this message`;
        addTerminalCommand(cmd, response);
        break;

      case 'fragment':
      case 'fragments':
      case 'story': {
        const activePhase = unlockedPhases[currentRound] || currentPhase || 1;
        const phase = challengeData?.[currentRound]?.phases?.[activePhase];
        if (phase?.story_fragment?.content || phase?.story_fragment?.title) {
          response = `${phase.story_fragment.title || `Archive 0${activePhase}`}: ${phase.story_fragment.content || ''}`;
        } else if (phase?.description || phase?.title) {
          response = `Archive ${String(activePhase).padStart(2, '0')}: ${phase.title}: ${phase.description}`;
        } else {
          response = `Archive ${String(activePhase).padStart(2, '0')}: No transmission intercepted yet.`;
        }
        addTerminalCommand(cmd, response);
        break;
      }

      case 'status': {
        const activePhase = unlockedPhases[currentRound] || currentPhase || 1;
        const total = challengeData?.[currentRound]?.totalPhases || 1;
        response = `MISSION STATUS: ACTIVE\nROUND: ${currentRound}\nACTIVE PHASE: ${activePhase} / ${total}\nSECURITY ENCRYPTION: AES-256`;
        addTerminalCommand(cmd, response);
        break;
      }

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

      case 'exit':
      case 'quit':
      case 'close':
      case 'terminate':
      case 'q':
      case ':q':
        addTerminalCommand(cmd, 'Terminating secure shell session...');
        setIsTerminalOpen(false);
        break;

      case 'submit':
        if (parts.length < 2) {
          response = "Syntax Error: Missing answer payload. Usage: submit <answer>";
          addTerminalCommand(cmd, response);
        } else {
          const answer = parts.slice(1).join(' ');
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

  const handleCommand = (e) => {
    e.preventDefault();
    executeCommandString(input);
  };

  const handleQuickChip = (chip) => {
    if (chip.action === 'fill') {
      setInput(chip.value);
      inputRef.current?.focus();
    } else {
      executeCommandString(chip.value);
    }
  };

  return (
    <div className="panel relative z-20 flex min-h-0 flex-1 flex-col p-2.5 sm:p-5">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-accretion/30 pb-2 mb-2 sm:mb-3 sm:pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-accretion/40 bg-accretion/15 text-accretion shrink-0">
            <TerminalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-orbitron text-xs xs:text-sm font-bold tracking-[0.14em] text-accretion sm:text-lg sm:tracking-[0.18em] truncate">
                SECURE TERMINAL
              </h2>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="label-mono text-[8px] text-accretion/70 sm:text-[9px] truncate">SHELL READY • AWAITING CIPHER</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTerminalOpen(false)}
          className="flex min-h-[34px] items-center gap-1.5 rounded-lg border border-accretion/50 bg-black/40 px-2.5 py-1 text-accretion transition-all hover:bg-accretion hover:text-black sm:min-h-[38px] sm:px-3.5"
        >
          <Power className="h-3.5 w-3.5 shrink-0" />
          <span className="font-orbitron text-[10px] tracking-wider uppercase sm:text-xs">Exit</span>
        </button>
      </div>

      {/* Output history */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 font-mono text-xs sm:text-sm text-accretion/90 scrollbar-hide">
        <div className="mb-3 opacity-60 text-[11px] sm:text-xs border-b border-accretion/20 pb-2">
          <p>CICADA 2067 SECURE SHELL v2.4.1</p>
          <p>Channel encrypted. Tap command chips below or type instructions.</p>
        </div>

        {terminalHistory.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start gap-1.5 text-accretion font-medium">
              <span className="text-accretion/60 select-none">&gt;</span>
              <span className="break-all">{entry.command}</span>
            </div>
            <div className="pl-3.5 whitespace-pre-wrap opacity-80 break-words mb-3 text-starlight text-[11px] sm:text-xs leading-relaxed">
              {entry.response}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Mobile Quick Action Chips */}
      <div className="mt-2 shrink-0 border-t border-accretion/25 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_COMMANDS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="shrink-0 rounded-md border border-accretion/35 bg-black/50 px-2 py-1 font-mono text-[10px] text-accretion/85 transition-colors hover:border-accretion hover:bg-accretion/20 hover:text-accretion active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command input form */}
      <form onSubmit={handleCommand} className="mt-1.5 shrink-0 flex items-center gap-1.5">
        <div className="relative flex-1 flex items-center rounded-lg border border-accretion/50 bg-black/60 px-2.5 py-1.5 focus-within:border-accretion focus-within:shadow-[0_0_10px_rgba(209,155,131,0.3)]">
          <span className="text-accretion font-mono text-sm sm:text-base select-none mr-2">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-mono text-sm sm:text-base text-accretion placeholder:text-accretion/30"
            placeholder="Type command (e.g. submit KEY)..."
            autoFocus
            spellCheck="false"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            enterKeyHint="send"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg border transition-all shrink-0 ${
            input.trim()
              ? 'border-accretion bg-accretion text-black shadow-[0_0_10px_rgba(209,155,131,0.4)] cursor-pointer active:scale-95'
              : 'border-accretion/30 bg-black/40 text-accretion/40 cursor-not-allowed'
          }`}
          aria-label="Send command"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHALLENGE_DATA, INITIAL_HINTS } from '../Components/Terminal/challengeData';

const GameStateContext = createContext();

export function useGameState() {
  return useContext(GameStateContext);
}

export function GameStateProvider({ children }) {
  // Load state from local storage or use defaults
  const [teamName, setTeamName] = useState(() => localStorage.getItem('cicada_teamName') || "TEAM-UNKNOWN");
  const [unlockedRounds, setUnlockedRounds] = useState(() => JSON.parse(localStorage.getItem('cicada_unlockedRounds')) || [1]);
  const [unlockedPhases, setUnlockedPhases] = useState(() => JSON.parse(localStorage.getItem('cicada_unlockedPhases')) || { 1: 1 });
  
  // Current active selections
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'guidelines' | 'faq'
  
  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState(() => JSON.parse(localStorage.getItem('cicada_terminalHistory')) || []);
  
  // Notifications
  const [hints, setHints] = useState(INITIAL_HINTS);

  // Persist state
  useEffect(() => {
    localStorage.setItem('cicada_teamName', teamName);
    localStorage.setItem('cicada_unlockedRounds', JSON.stringify(unlockedRounds));
    localStorage.setItem('cicada_unlockedPhases', JSON.stringify(unlockedPhases));
    localStorage.setItem('cicada_terminalHistory', JSON.stringify(terminalHistory));
  }, [teamName, unlockedRounds, unlockedPhases, terminalHistory]);

  const addTerminalCommand = (command, response) => {
    setTerminalHistory(prev => [...prev, { command, response, timestamp: new Date().toISOString() }]);
  };

  const clearTerminal = () => {
    setTerminalHistory([]);
  };

  const submitAnswer = (answer) => {
    if (!unlockedRounds.includes(currentRound)) {
      return "Error: Round not active.";
    }

    const roundData = CHALLENGE_DATA[currentRound];
    const activePhase = unlockedPhases[currentRound] || 1;
    const phaseData = roundData.phases[activePhase];

    // Admin overrides
    if (answer === "SUDO_UNLOCK_R2") {
      if (!unlockedRounds.includes(2)) setUnlockedRounds(prev => [...prev, 2]);
      setUnlockedPhases(prev => ({ ...prev, 2: 1 }));
      return "Admin Override: Round 2 Unlocked.";
    }
    if (answer === "SUDO_UNLOCK_R3") {
      if (!unlockedRounds.includes(3)) setUnlockedRounds(prev => [...prev, 3]);
      setUnlockedPhases(prev => ({ ...prev, 3: 1 }));
      return "Admin Override: Round 3 Unlocked.";
    }

    if (answer === phaseData.expectedAnswer) {
      if (activePhase < roundData.totalPhases) {
        // Unlock next phase
        setUnlockedPhases(prev => ({
          ...prev,
          [currentRound]: activePhase + 1
        }));
        setCurrentPhase(activePhase + 1);
        return "Correct. " + phaseData.successMessage;
      } else {
        // Completed round (no automatic round unlocking per requirements)
        return "Correct. " + phaseData.successMessage;
      }
    }

    return "Incorrect.";
  };

  const changeRound = (roundNum) => {
    if (unlockedRounds.includes(roundNum)) {
      setCurrentRound(roundNum);
      setCurrentPhase(unlockedPhases[roundNum] || 1);
      setActiveTab('overview');
    }
  };

  return (
    <GameStateContext.Provider value={{
      teamName, setTeamName,
      unlockedRounds,
      unlockedPhases,
      currentRound, changeRound,
      currentPhase, setCurrentPhase,
      activeTab, setActiveTab,
      isTerminalOpen, setIsTerminalOpen,
      terminalHistory, addTerminalCommand, clearTerminal,
      submitAnswer,
      hints
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getChallenges, getProgress, submitAnswer as apiSubmit } from "../api/challenges";

const GameStateContext = createContext(null);

export function useGameState() {
  return useContext(GameStateContext);
}

const ASSET_TYPE_LABEL = {
  image: "IMAGE",
  pdf: "PDF",
  audio: "AUDIO",
  video: "VIDEO",
  file: "FILE",
  text: "TEXT",
};

// Map the backend's flat challenge sequence into the rounds->phases shape the
// terminal UI expects (a single "Round 1" with one phase per challenge).
function buildChallengeData(challenges, progress) {
  const sorted = [...challenges].sort((a, b) => a.order_number - b.order_number);
  const phases = {};
  sorted.forEach((ch, i) => {
    const firstAsset = ch.assets?.[0];
    phases[i + 1] = {
      id: `C${ch.order_number}`,
      title: ch.name,
      description: ch.story_context || "",
      resourceType: firstAsset ? ASSET_TYPE_LABEL[firstAsset.type] || "FILE" : "TEXT",
      resourceUrl: firstAsset?.url || "#",
      assets: ch.assets || [],
      order_number: ch.order_number,
      is_locked: ch.is_locked,
      story_fragment: ch.story_fragment,
    };
  });
  return {
    1: {
      title: "Round 1",
      totalPhases: sorted.length,
      phases,
    },
  };
}

export function GameStateProvider({ children }) {
  const { teamName } = useAuth();

  const [challengeData, setChallengeData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlockedPhases, setUnlockedPhases] = useState({ 1: 1 });

  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [hints, setHints] = useState([]);

  const unlockedRounds = [1];

  const refresh = useCallback(async (silent = false) => {
    if (!teamName) return;
    if (!silent && !challengeData) setLoading(true);
    setError("");
    try {
      const [chals, prog] = await Promise.all([getChallenges(), getProgress()]);
      const data = buildChallengeData(chals.data, prog.data);
      setChallengeData(data);
      setProgress(prog.data);
      const target = Math.max(1, prog.data?.current_challenge_order || 1);
      setCurrentPhase(target);
      setUnlockedPhases({ 1: target });
      const collected = [];
      (chals.data || []).forEach((ch) => {
        (ch.hints || []).forEach((h) => {
          if (h.is_visible !== false) {
            collected.push({ id: h.id, round: 1, text: h.text, timestamp: Date.now() });
          }
        });
      });
      setHints(collected);
    } catch (err) {
      setError(err.message || "Failed to load mission data.");
    } finally {
      setLoading(false);
    }
  }, [teamName, challengeData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTerminalCommand = useCallback((command, response) => {
    setTerminalHistory((prev) => [...prev, { command, response, timestamp: new Date().toISOString() }]);
  }, []);

  const clearTerminal = useCallback(() => setTerminalHistory([]), []);

  const submitAnswer = useCallback(
    async (answer) => {
      const activePhase = unlockedPhases[currentRound] || 1;
      const phase = challengeData?.[currentRound]?.phases?.[activePhase];
      if (!phase) return "Error: No active challenge.";

      try {
        const res = await apiSubmit(phase.order_number, answer);
        if (res.success) {
          addTerminalCommand(`submit ${answer}`, `Correct. ${res.message}`);
          if (res.story_fragment) {
            addTerminalCommand(`fragment`, `${res.story_fragment.title}: ${res.story_fragment.content || ""}`);
          }
          await refresh(true);
          return "Correct. " + res.message;
        }
        return res.message || "Incorrect. Please try again.";
      } catch (err) {
        return err.message || "Transmission error. Please try again.";
      }
    },
    [challengeData, unlockedPhases, currentRound, addTerminalCommand, refresh]
  );

  const changeRound = useCallback((roundNum) => {
    if (unlockedRounds.includes(roundNum)) {
      setCurrentRound(roundNum);
      setCurrentPhase(unlockedPhases[roundNum] || 1);
      setActiveTab("overview");
    }
  }, [unlockedRounds, unlockedPhases]);

  const value = useMemo(
    () => ({
      teamName,
      challengeData,
      progress,
      loading,
      error,
      unlockedRounds,
      unlockedPhases,
      currentRound,
      changeRound,
      currentPhase,
      setCurrentPhase,
      activeTab,
      setActiveTab,
      isTerminalOpen,
      setIsTerminalOpen,
      terminalHistory,
      addTerminalCommand,
      clearTerminal,
      submitAnswer,
      hints,
      refresh,
    }),
    [teamName, challengeData, progress, loading, error, unlockedRounds, unlockedPhases, currentRound, changeRound, currentPhase, activeTab, isTerminalOpen, terminalHistory, addTerminalCommand, clearTerminal, submitAnswer, hints, refresh]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

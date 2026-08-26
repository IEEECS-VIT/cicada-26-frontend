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
  const sorted = [...(challenges || [])].sort((a, b) => a.order_number - b.order_number);
  const phases = {};
  sorted.forEach((ch, i) => {
    const firstAsset = ch.assets?.[0];
    const fragment = (ch.story_fragment && typeof ch.story_fragment === 'object') ? ch.story_fragment : {};
    const fragmentTitle = fragment.title || ch.name || `Archive 0${ch.order_number}`;
    const fragmentContent = fragment.content || ch.story_context || ch.description || "";
    const primaryContent = fragmentContent || ch.content || "";

    phases[i + 1] = {
      id: `C${ch.order_number}`,
      title: ch.name || `Archive 0${ch.order_number}`,
      description: fragmentContent || ch.story_context || ch.description || "",
      content: primaryContent,
      resourceType: firstAsset ? ASSET_TYPE_LABEL[firstAsset.type] || "FILE" : "TEXT",
      resourceUrl: firstAsset?.url || "#",
      assets: ch.assets || [],
      order_number: ch.order_number,
      is_locked: ch.is_locked,
      story_fragment: {
        title: fragmentTitle,
        content: fragmentContent,
      },
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
    if (!silent) setLoading(true);
    setError("");
    try {
      const [chals, prog] = await Promise.all([getChallenges(), getProgress()]);
      const data = buildChallengeData(chals.data, prog.data);
      setChallengeData(data);
      const target = Math.max(1, prog?.data?.current_challenge_order || 1);
      
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
      console.error("Failed to load mission data:", err);
      setError(err.message || "Failed to load mission data.");
    } finally {
      setLoading(false);
    }
  }, [teamName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTerminalCommand = useCallback((command, response) => {
    setTerminalHistory((prev) => [...prev, { command, response, timestamp: new Date().toISOString() }]);
  }, []);

  const clearTerminal = useCallback(() => setTerminalHistory([]), []);

  const submitAnswer = useCallback(
    async (answer) => {
      const activePhase = unlockedPhases[currentRound] || currentPhase || 1;
      const phase = challengeData?.[currentRound]?.phases?.[activePhase];
      if (!phase) return "Error: No active challenge.";

      try {
        const res = await apiSubmit(phase.order_number, answer);

        if (res.success) {
          const completedFragment = res.story_fragment || phase.story_fragment;
          if (completedFragment?.title || completedFragment?.content) {
            addTerminalCommand(`fragment`, `${completedFragment.title || `Archive 0${activePhase}`}: ${completedFragment.content || ''}`);
          }

          // Advance phase to next checkpoint
          const totalPhases = challengeData?.[currentRound]?.totalPhases || 99;
          const nextPhase = Math.min(activePhase + 1, totalPhases);
          const nextPhaseData = challengeData?.[currentRound]?.phases?.[nextPhase];

          if (nextPhaseData && nextPhase > activePhase) {
            const nextFrag = nextPhaseData.story_fragment;
            const nextTitle = nextFrag?.title || nextPhaseData.title || `Archive 0${nextPhase}`;
            const nextContent = nextFrag?.content || nextPhaseData.description || `Decryption channel open for Phase ${nextPhase}.`;
            addTerminalCommand(`telemetry`, `[UNLOCKED] ${nextTitle}:\n${nextContent}`);
          }

          setUnlockedPhases((prev) => ({ ...prev, [currentRound]: Math.max(prev[currentRound] || 1, nextPhase) }));
          setCurrentPhase(nextPhase);

          await refresh(true);

          setUnlockedPhases((prev) => ({ ...prev, [currentRound]: Math.max(prev[currentRound] || 1, nextPhase) }));
          setCurrentPhase(nextPhase);

          return `Correct. Cipher accepted.\nTelemetry advanced to Stage ${nextPhase}: "${nextPhaseData?.title || `Archive 0${nextPhase}`}".`;
        }

        return res.message || "Incorrect decryption key. Please try again.";
      } catch (err) {
        return err.message || "Transmission error. Please try again.";
      }
    },
    [challengeData, unlockedPhases, currentPhase, currentRound, addTerminalCommand, refresh]
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

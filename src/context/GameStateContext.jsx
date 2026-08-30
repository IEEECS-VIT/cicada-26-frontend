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

// Map the backend's challenges (each tagged with its round) into the rounds->phases
// shape the terminal UI expects. Story fragments now belong to rounds, so every
// phase in a round shares the round's fragment.
function buildChallengeData(challenges) {
  const rounds = {};
  (challenges || []).forEach((ch) => {
    const roundKey = ch.round_order || 1;
    if (!rounds[roundKey]) {
      rounds[roundKey] = {
        title: ch.round_name || `Round ${roundKey}`,
        totalPhases: 0,
        phases: {},
      };
    }
    rounds[roundKey].phases[rounds[roundKey].totalPhases + 1] = {
      id: `C${ch.order_number}`,
      title: ch.name || `Archive 0${ch.order_number}`,
      description: ch.story_context || ch.description || "",
      content: ch.story_context || ch.description || ch.content || "",
      resourceType: ch.assets?.[0] ? ASSET_TYPE_LABEL[ch.assets[0].type] || "FILE" : "TEXT",
      resourceUrl: ch.assets?.[0]?.url || "#",
      assets: ch.assets || [],
      order_number: ch.order_number,
      is_locked: ch.is_locked,
      story_fragment: (ch.story_fragment && typeof ch.story_fragment === 'object')
        ? { title: ch.story_fragment.title || ch.name, content: ch.story_fragment.content || ch.story_context || "" }
        : { title: ch.name || `Round ${roundKey}`, content: ch.story_context || "" },
    };
    rounds[roundKey].totalPhases += 1;
  });
  return rounds;
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
  const [roundTransition, setRoundTransition] = useState(null);

  const unlockedRounds = useMemo(() => {
    const currentRoundOrder = Math.max(1, progress?.current_round_order || 1);
    return Array.from({ length: currentRoundOrder }, (_, i) => i + 1);
  }, [progress]);

  // Highest unlocked phase (local index) for each entered round, derived from
  // the team's current challenge order.
  const computeUnlockedPhases = useCallback((data, prog) => {
    const unlocked = {};
    const currentOrder = Math.max(1, prog?.current_challenge_order || 1);
    Object.entries(data || {}).forEach(([roundKey, round]) => {
      const sorted = Object.values(round.phases).sort((a, b) => a.order_number - b.order_number);
      const unlockedCount = sorted.filter((p) => p.order_number <= currentOrder).length;
      unlocked[roundKey] = Math.max(1, Math.min(unlockedCount, round.totalPhases || 1));
    });
    return unlocked;
  }, []);

  const refresh = useCallback(async (silent = false) => {
    if (!teamName) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const [chals, prog] = await Promise.all([getChallenges(), getProgress()]);
      const data = buildChallengeData(chals.data);
      setChallengeData(data);
      setProgress(prog.data);
      const unlocked = computeUnlockedPhases(data, prog.data);
      setUnlockedPhases(unlocked);

      const targetRound = Math.max(1, prog?.data?.current_round_order || 1);
      if (!silent) {
        setCurrentRound(targetRound);
        setCurrentPhase(unlocked[targetRound] || 1);
      }

      const collected = [];
      (chals.data || []).forEach((ch) => {
        (ch.hints || []).forEach((h) => {
          if (h.is_visible !== false) {
            collected.push({ id: h.id, round: ch.round_order || 1, text: h.text, timestamp: Date.now() });
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
  }, [teamName, computeUnlockedPhases]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTerminalCommand = useCallback((command, response) => {
    setTerminalHistory((prev) => [...prev, { command, response, timestamp: new Date().toISOString() }]);
  }, []);

  const clearTerminal = useCallback(() => setTerminalHistory([]), []);

  const dismissRoundTransition = useCallback(() => setRoundTransition(null), []);

  // Locate a phase by its GLOBAL challenge order_number across all rounds.
  // The backend advances by order_number, not by local round phase index.
  const findPhaseData = useCallback((orderNum, data) => {
    if (!data) return null;
    for (const [roundKey, round] of Object.entries(data)) {
      const phase = Object.values(round.phases || {}).find((p) => p.order_number === orderNum);
      if (phase) return { roundKey: Number(roundKey), round, phase };
    }
    return null;
  }, []);

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

          const nextOrder = res.unlocked_next_challenge ?? phase.order_number;
          const next = findPhaseData(nextOrder, challengeData);
          const advanced = !!next && next.phase.order_number !== phase.order_number;

          let resultText = res.message || "Correct. Cipher accepted.";

          if (res.already_solved) {
            // Re-submitting a solved challenge: report the true backend message,
            // never a fake "advanced to Stage X".
            resultText = res.message || "You have already completed this challenge.";
          } else if (advanced) {
            const localIndex = Object.keys(next.round.phases).find(
              (k) => next.round.phases[k].order_number === next.phase.order_number
            );
            const nextIdx = Math.max(1, Number(localIndex) || 1);
            const crossedRound = next.roundKey !== currentRound;

            setCurrentRound(next.roundKey);
            setCurrentPhase(nextIdx);
            setUnlockedPhases((prev) => ({ ...prev, [next.roundKey]: Math.max(prev[next.roundKey] || 1, nextIdx) }));

            if (crossedRound) {
              // Round boundary crossed: close the terminal and present the
              // next round's entry fragment via the full-screen transition
              // overlay (res.story_fragment is that round's fragment).
              setRoundTransition({
                type: "round",
                nextRoundKey: next.roundKey,
                nextRoundTitle: next.round.title,
                fragment: {
                  title: res.story_fragment?.title || next.phase.story_fragment?.title || next.round.title,
                  content: res.story_fragment?.content || next.phase.story_fragment?.content || next.phase.description || "",
                },
              });
              setActiveTab("overview");
              setIsTerminalOpen(false);
            } else {
              const nextFrag = next.phase.story_fragment;
              if (nextFrag?.title || nextFrag?.content) {
                addTerminalCommand(
                  `telemetry`,
                  `[UNLOCKED] ${nextFrag.title || next.phase.title}:\n${nextFrag.content || next.phase.description || 'Decryption channel open.'}`
                );
              }
            }

            resultText = `Correct. Cipher accepted.\nTelemetry advanced to Stage ${nextIdx}: "${next.phase.title}".`;
          } else if (!next) {
            // No challenge exists beyond this one: mission complete.
            setRoundTransition({ type: "mission" });
            setActiveTab("overview");
            setIsTerminalOpen(false);
            resultText = "Correct. Cipher accepted.\n[UPLINK SECURED] All archives decrypted. Mission sequence complete.";
          }

          // Silent refresh: server truth re-syncs unlockedPhases/hints/progress
          // (round/phase stay where we just moved them).
          await refresh(true);
          return resultText;
        }

        return res.message || "Incorrect decryption key. Please try again.";
      } catch (err) {
        return err.message || "Transmission error. Please try again.";
      }
    },
    [challengeData, unlockedPhases, currentPhase, currentRound, addTerminalCommand, refresh, findPhaseData]
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
      roundTransition,
      dismissRoundTransition,
    }),
    [teamName, challengeData, progress, loading, error, unlockedRounds, unlockedPhases, currentRound, changeRound, currentPhase, activeTab, isTerminalOpen, terminalHistory, addTerminalCommand, clearTerminal, submitAnswer, hints, refresh, roundTransition, dismissRoundTransition]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getChallenges, getProgress, getRoundTimer, submitAnswer as apiSubmit } from "../api/challenges";

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

// Map backend challenges into the Rounds -> Archive (Phase) shape
function parseChallengeHierarchy(ch, index) {
  let round = ch.round || ch.round_number;
  let archive = ch.archive_number || ch.archive || ch.phase;

  // 1. If round_id matches known round IDs
  if (!round && ch.round_id) {
    if (ch.round_id === '7db4150a-3259-4ef3-b9d6-d7ccd1d4f24f') {
      round = 2;
    } else if (ch.round_id === '85d491a1-53d9-46fa-a1cb-98a7da15fd1b') {
      round = 1;
    }
  }

  // 2. Title and string parsing
  if (!round || !archive) {
    if (ch.order_number >= 100) {
      round = round || Math.floor(ch.order_number / 100);
      archive = archive || (ch.order_number % 100);
    } else {
      const str = `${ch.name || ''} ${ch.title || ''}`;
      const roundMatch = str.match(/round\s*(\d+)/i);
      if (roundMatch && !round) round = parseInt(roundMatch[1], 10);
      const archiveMatch = str.match(/archive\s*0?(\d+)/i) || str.match(/phase\s*0?(\d+)/i);
      if (archiveMatch && !archive) archive = parseInt(archiveMatch[1], 10);
    }
  }

  // 3. Fallback: Challenges 1..6 -> Round 1; Challenges 7+ -> Round 2
  if (!round) {
    if (ch.order_number) {
      if (ch.order_number <= 6) round = 1;
      else round = 2;
    } else {
      round = 1;
    }
  }

  round = parseInt(round, 10) || 1;
  archive = parseInt(archive, 10) || (ch.order_number ? ((ch.order_number - 1) % 6 + 1) : (index + 1));

  return { round, archive };
}

function buildChallengeData(challenges, progress) {
  const sorted = [...(challenges || [])].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
  const groupedByRound = {};

  sorted.forEach((ch, i) => {
    const { round, archive } = parseChallengeHierarchy(ch, i);
    if (!groupedByRound[round]) {
      groupedByRound[round] = [];
    }
    groupedByRound[round].push({ ch, originalArchive: archive });
  });

  const rounds = {};

  Object.entries(groupedByRound).forEach(([rStr, chList]) => {
    const round = parseInt(rStr, 10);
    chList.sort((a, b) => (a.ch.order_number || 0) - (b.ch.order_number || 0));

    rounds[round] = {
      title: `Round ${round}`,
      totalPhases: chList.length,
      phases: {},
    };

    chList.forEach((item, phaseIndex) => {
      const phaseNum = phaseIndex + 1;
      const ch = item.ch;
      const archive = item.originalArchive || phaseNum;

      const firstAsset = ch.assets?.[0];
      const fragment = (ch.story_fragment && typeof ch.story_fragment === 'object') ? ch.story_fragment : {};
      const fragmentTitle = fragment.title || ch.name || ch.title || `Archive ${String(archive).padStart(2, '0')}`;
      const fragmentContent = fragment.content || ch.story_context || ch.description || "";
      const primaryContent = fragmentContent || ch.content || "";

      rounds[round].phases[phaseNum] = {
        id: `R${round}A${phaseNum}`,
        title: ch.name || ch.title || `Archive ${String(archive).padStart(2, '0')}`,
        description: fragmentContent || ch.story_context || ch.description || "",
        content: primaryContent,
        resourceType: firstAsset ? ASSET_TYPE_LABEL[firstAsset.type] || "FILE" : "TEXT",
        resourceUrl: firstAsset?.url || "#",
        assets: ch.assets || [],
        order_number: ch.order_number,
        round: round,
        archiveNumber: archive,
        phaseNumber: phaseNum,
        is_locked: ch.is_locked !== undefined ? ch.is_locked : (ch.is_active === false),
        is_active: ch.is_active !== undefined ? ch.is_active : (ch.is_locked === false),
        story_fragment: {
          title: fragmentTitle,
          content: fragmentContent,
        },
      };
    });
  });

  if (Object.keys(rounds).length === 0) {
    return {
      1: {
        title: "Round 1",
        totalPhases: 0,
        phases: {},
      },
    };
  }

  return rounds;
}

export function GameStateProvider({ children }) {
  const { teamName } = useAuth();
  const navigate = useNavigate();

  const [challengeData, setChallengeData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [roundTimer, setRoundTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlockedRounds, setUnlockedRounds] = useState([1]);
  const [unlockedPhases, setUnlockedPhases] = useState({ 1: 1 });

  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const getTerminalStorageKey = useCallback((name) => {
    const clean = (name || 'guest').trim().toLowerCase();
    return `cicada_terminal_history_${clean}`;
  }, []);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cicada_terminal_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [hints, setHints] = useState([]);
  const [roundTransition, setRoundTransition] = useState(null);

  // Load team-scoped terminal history when teamName is available
  useEffect(() => {
    if (!teamName) return;
    try {
      const key = getTerminalStorageKey(teamName);
      const saved = localStorage.getItem(key);
      if (saved) {
        setTerminalHistory(JSON.parse(saved));
      } else {
        const general = localStorage.getItem('cicada_terminal_history');
        if (general) {
          const parsed = JSON.parse(general);
          if (parsed && parsed.length > 0) {
            setTerminalHistory(parsed);
            localStorage.setItem(key, general);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load terminal history:", e);
    }
  }, [teamName, getTerminalStorageKey]);

  // Persist terminalHistory whenever it updates
  useEffect(() => {
    try {
      const serialized = JSON.stringify(terminalHistory);
      localStorage.setItem('cicada_terminal_history', serialized);
      if (teamName) {
        localStorage.setItem(getTerminalStorageKey(teamName), serialized);
      }
    } catch (e) {
      console.warn("Failed to persist terminal history:", e);
    }
  }, [terminalHistory, teamName, getTerminalStorageKey]);

  const refresh = useCallback(async (silent = false) => {
    if (!teamName) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const [chals, prog] = await Promise.all([getChallenges(), getProgress()]);
      const data = buildChallengeData(chals.data, prog.data);
      setChallengeData(data);
      setProgress(prog.data);

      getRoundTimer()
        .then((rt) => { if (rt?.data) setRoundTimer(rt.data); })
        .catch(() => { /* older backend without the endpoint — keep last known */ });

      const allRounds = Object.keys(data).map(Number).sort((a, b) => a - b);
      const targetOrder = prog?.data?.current_challenge_order;

      let teamCurrentRound = prog?.data?.round || prog?.data?.current_round;
      let targetPhase = 1;

      if (targetOrder) {
        const matchingChal = (chals.data || []).find((c) => c.order_number === targetOrder);
        if (matchingChal) {
          const hierarchy = parseChallengeHierarchy(matchingChal, 0);
          teamCurrentRound = teamCurrentRound || hierarchy.round;
          targetPhase = hierarchy.archive;
        } else if (targetOrder >= 100) {
          teamCurrentRound = teamCurrentRound || Math.floor(targetOrder / 100);
          targetPhase = targetOrder % 100;
        } else {
          targetPhase = targetOrder;
        }
      }

      teamCurrentRound = teamCurrentRound || 1;

      // Determine which rounds are unlocked:
      // 1. Round 1 is always unlocked.
      // 2. Any round <= teamCurrentRound.
      // 3. Any round where at least one challenge is active/unlocked.
      const unlockedR = allRounds.filter((r) => {
        if (r === 1) return true;
        if (r <= teamCurrentRound) return true;
        const roundPhases = Object.values(data[r]?.phases || {});
        return roundPhases.some((p) => p.is_locked === false || p.is_active === true);
      });

      if (unlockedR.length === 0 && allRounds.length > 0) unlockedR.push(allRounds[0]);

      setUnlockedRounds(unlockedR);
      setCurrentRound((prev) => (unlockedR.includes(prev) ? prev : teamCurrentRound));
      setCurrentPhase(targetPhase);
      setUnlockedPhases((prev) => ({
        ...prev,
        [teamCurrentRound]: Math.max(prev[teamCurrentRound] || 1, targetPhase),
      }));

      const collected = [];
      (chals.data || []).forEach((ch) => {
        const { round } = parseChallengeHierarchy(ch, 0);
        (ch.hints || []).forEach((h) => {
          if (h.is_visible !== false) {
            collected.push({ id: h.id, round: round, text: h.text, timestamp: Date.now() });
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

  const addTerminalCommand = useCallback((command, response, extra) => {
    setTerminalHistory((prev) => [...prev, { command, response, timestamp: new Date().toISOString(), ...(extra || {}) }]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalHistory([]);
    try {
      localStorage.removeItem('cicada_terminal_history');
      if (teamName) {
        localStorage.removeItem(getTerminalStorageKey(teamName));
      }
    } catch {
      /* ignore */
    }
  }, [teamName, getTerminalStorageKey]);

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
      if (!phase) return { text: "Error: No active challenge.", reward: null };

      try {
        const res = await apiSubmit(phase.order_number, answer);

        if (res.success) {
          if (phase.order_number) {
            setProgress((prev) => ({
              ...(prev || {}),
              completed_challenges: Array.from(new Set([...(prev?.completed_challenges || prev?.data?.completed_challenges || []), phase.order_number])),
            }));
          }

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
          return { text: resultText, reward: res.success_reward || null };
        }

        return { text: res.message || "Incorrect decryption key. Please try again.", reward: null };
      } catch (err) {
        const backendMsg = err.data?.message || err.data?.error || err.data?.msg;
        if (backendMsg) {
          return { text: `${backendMsg}. Please try again.`, reward: null };
        }
        return { text: err.message || "Transmission error. Please try again.", reward: null };
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

  const completedChallenges = useMemo(() => {
    const list = progress?.completed_challenges || progress?.data?.completed_challenges || [];
    return Array.isArray(list) ? list : [];
  }, [progress]);

  const value = useMemo(
    () => ({
      teamName,
      challengeData,
      progress,
      roundTimer,
      completedChallenges,
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
    [teamName, challengeData, progress, roundTimer, completedChallenges, loading, error, unlockedRounds, unlockedPhases, currentRound, changeRound, currentPhase, activeTab, isTerminalOpen, terminalHistory, addTerminalCommand, clearTerminal, submitAnswer, hints, refresh, roundTransition, dismissRoundTransition]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
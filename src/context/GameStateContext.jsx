import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getChallenges, getProgress, getRounds, submitAnswer as apiSubmit } from "../api/challenges";

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
  let round = ch.round_order || ch.round || ch.round_number;
  if (!round && ch.order_number >= 100) round = Math.floor(ch.order_number / 100);
  if (!round) round = ch.order_number && ch.order_number <= 6 ? 1 : 2;
  let archive = ch.archive_number || ch.archive || ch.phase || index + 1;
  return { round, archive };
}

/**
 * Mirror of the backend's set-allocation logic (see
 * Cicada-26-Backend challengeService.ts: `hashTeamId`/`filterAssetsBySet`):
 * each team is deterministically bound to one asset set, and only assets of
 * that set (plus assets with no set, which all teams receive) are returned.
 */
function hashTeamId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function filterAssetsBySet(assets, assignedSet, teamIdHash) {
  if (!Array.isArray(assets) || assets.length === 0) return [];

  const uniqueSets = Array.from(
    new Set(assets.map((a) => a.asset_set).filter((s) => typeof s === "number"))
  ).sort((a, b) => a - b);

  if (uniqueSets.length === 0) return assets; // no sets defined: everyone receives all

  let targetSet;
  if (assignedSet !== null && assignedSet !== undefined && uniqueSets.includes(assignedSet)) {
    targetSet = assignedSet;
  } else {
    targetSet = uniqueSets[teamIdHash % uniqueSets.length];
  }

  return assets.filter((a) => typeof a.asset_set !== "number" || a.asset_set === targetSet);
}

function buildChallengeData(challenges, progress, roundList = [], teamName = "", assignedSet = null) {
  const roundByOrder = new Map(
    (roundList || []).map((round) => [Number(round.order_number), round])
  );
  const sorted = [...(challenges || [])].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
  const groupedByRound = {};
  const teamIdHash = hashTeamId(String(teamName || ""));

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
      // Round limits are configured in minutes by the admin panel.
      timeLimitSeconds: Math.max(0, Number(roundByOrder.get(round)?.time_limit || 0) * 60),
      phases: {},
    };

    chList.forEach((item, phaseIndex) => {
      const phaseNum = phaseIndex + 1;
      const ch = item.ch;
      const archive = item.originalArchive || phaseNum;

      // Only surface the assets allotted to this team's set (shareable
      // assets have no asset_set and are always included).
      const assets = filterAssetsBySet(ch.assets || [], assignedSet, teamIdHash)
        .filter((asset) => asset && (asset.url || asset.public_url || asset.asset_url || asset.file_url || asset.content))
        .map((asset) => ({
          ...asset,
          url: asset.url || asset.public_url || asset.asset_url || asset.file_url || "#",
          type: asset.type || asset.mime_type || "file",
        }));
      const firstAsset = assets[0];
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
        assets,
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
        timeLimitSeconds: 0,
        phases: {},
      },
    };
  }

  return rounds;
}

export function GameStateProvider({ children }) {
  const { teamName, user } = useAuth();
  const navigate = useNavigate();

  const [challengeData, setChallengeData] = useState(null);
  const [progress, setProgress] = useState(null);
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
      const [chals, prog, roundsRes] = await Promise.all([
        getChallenges(),
        getProgress(),
        getRounds().catch(() => ({ data: [] })),
      ]);
      const rawAssignedSet = user?.assigned_asset_set ?? user?.team?.assigned_asset_set;
      const assignedSet = rawAssignedSet !== null && rawAssignedSet !== undefined ? Number(rawAssignedSet) : null;
      const data = buildChallengeData(chals.data, prog.data, roundsRes?.data, teamName, assignedSet);
      setChallengeData(data);
      setProgress(prog.data);

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
        if (r <= teamCurrentRound) return true;
        // Always unlock round 1 by default, and any round the team has reached.
        // We DO NOT rely on is_active because all challenges are generally active globally.
        return r === 1;
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
  }, [teamName, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTerminalCommand = useCallback((command, response) => {
    setTerminalHistory((prev) => [...prev, { command, response, timestamp: new Date().toISOString() }]);
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
      if (!phase) return "Error: No active challenge.";

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
          return resultText;
        }

        return res.message || "Incorrect decryption key. Please try again.";
      } catch (err) {
        const backendMsg = err.data?.message || err.data?.error || err.data?.msg;
        if (backendMsg) {
          return `${backendMsg}. Please try again.`;
        }
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

  const completedChallenges = useMemo(() => {
    const list = progress?.completed_challenges || progress?.data?.completed_challenges || [];
    return Array.isArray(list) ? list : [];
  }, [progress]);

  const value = useMemo(
    () => ({
      teamName,
      challengeData,
      progress,
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
    [teamName, challengeData, progress, completedChallenges, loading, error, unlockedRounds, unlockedPhases, currentRound, changeRound, currentPhase, activeTab, isTerminalOpen, terminalHistory, addTerminalCommand, clearTerminal, submitAnswer, hints, refresh, roundTransition, dismissRoundTransition]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

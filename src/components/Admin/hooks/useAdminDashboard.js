import {
  startCicadaAdmin,
  pauseCicadaAdmin,
  resumeCicadaAdmin,
  resetCicadaAdmin, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import {
  listUsers, getAdminChallenges, getAdminProgress, getLeaderboard,
  approveAdmin, toggleRole, deleteUser, bulkImportAdmins,
  createChallenge, updateChallenge, addAsset, editAsset, deleteAsset, deleteChallenge, adminOverride,
  removeTeamMember, deleteTeam, adjustScore, updateTeam, toggleHint,
  getIpTrackingStatus, toggleIpTracking, getAdminActivityLogs,
  getAdminRounds, createRound, updateRound, deleteRound, reorderRounds, startRoundAdmin,
  pauseRoundAdmin,
  resumeRoundAdmin,
} from '../../../api/admin';
import {
  INITIAL_TEAMS,
  INITIAL_CHALLENGES,
  INITIAL_USERS,
  INITIAL_LOGS,
  INITIAL_ROUNDS,
  DEFAULT_CREDENTIALS,
} from '../constants';

export const parseRoundAndArchive = (x, index = 0) => {
  let round = x.round ?? x.round_number ?? x.round_order;
  let archive = x.archiveNumber ?? x.archive_number ?? x.archive ?? x.phase;

  // 1. Title and string parsing for archive if missing
  if (!archive) {
    if (x.order_number >= 100) {
      archive = (x.order_number % 100);
    } else {
      const str = `${x.name || ''} ${x.title || ''}`;
      const archiveMatch = str.match(/archive\s*0?(\d+)/i) || str.match(/phase\s*0?(\d+)/i);
      if (archiveMatch) {
        archive = parseInt(archiveMatch[1], 10);
      }
    }
  }

  round = parseInt(round, 10) || 1;
  archive = parseInt(archive, 10) || (x.order_number ? ((x.order_number - 1) % 6 + 1) : (index + 1));

  return { round, archiveNumber: archive };
};

export function useAdminDashboard() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const isOAuthAdmin = !!(authUser && (authUser.role === 'admin' || authUser.role === 'GOD'));

  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cicada_admin_logged') === 'true' || isOAuthAdmin;
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- CORE DATA STATES (persisted in localStorage for demo responsiveness) ---
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('cicada_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('cicada_challenges');
    const parsed = saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
    return parsed.map((c, i) => {
      const { round, archiveNumber } = parseRoundAndArchive(c, i);
      return { ...c, round, archiveNumber };
    });
  });
  const [rounds, setRounds] = useState(() => {
    const saved = localStorage.getItem('cicada_rounds');
    return saved ? JSON.parse(saved) : INITIAL_ROUNDS;
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('cicada_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Instant local log entry for an admin action, attributed to the real signed-in admin.
  // Real backend admin_logs (fetched in refreshLive) supersede these once available; until
  // then this is what keeps the Logs tab moving instead of sitting frozen on stale entries.
  const pushLocalLog = ({ teamName, challengeTitle, answer, correct = true }) => {
    const adminLabel = authUser?.display_name || authUser?.email || 'Admin';
    setLogs((prev) => [{
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      teamId: 'admin',
      teamName,
      adminName: adminLabel,
      challengeId: 'admin_action',
      challengeTitle,
      answer,
      correct,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0,
    }, ...prev]);
  };

  // --- NAVIGATION TAB STATE ---
  const [activeTab, setActiveTab] = useState('teams'); // teams, challenges, logs, export

  // --- UI STATES (SEARCHES, FILTERS & MODALS) ---
  const [teamSearch, setTeamSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('all');

  // Modals state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [showProgressOverrideModal, setShowProgressOverrideModal] = useState(false);
  const [showEditAnswerModal, setShowEditAnswerModal] = useState(false);
  const [showOverrideChallengeModal, setShowOverrideChallengeModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [newHintText, setNewHintText] = useState('');
  const [newHintUnlockMinutes, setNewHintUnlockMinutes] = useState(0);

  // Active records for modals
  const [activeTeam, setActiveTeam] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);

  // Form input states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');

  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamMembers, setEditTeamMembers] = useState('');
  const [editTeamPoints, setEditTeamPoints] = useState(0);
  const [editTeamStatus, setEditTeamStatus] = useState('active');

  const [manuallyResetPassword, setManuallyResetPassword] = useState('');
  const [overrideTargetRound, setOverrideTargetRound] = useState(1);
  const [editAnswerValue, setEditAnswerValue] = useState('');
  const [overrideChallengeTeamId, setOverrideChallengeTeamId] = useState('');

  // --- NEW STATES FOR DB OPERATIONS ---
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cicada_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [userSearch, setUserSearch] = useState('');

  // Score Adjustment State
  const [showAdjustScoreModal, setShowAdjustScoreModal] = useState(false);
  const [adjustScoreType, setAdjustScoreType] = useState('add'); // add, subtract, set
  const [adjustScoreValue, setAdjustScoreValue] = useState(0);

  // Challenge Creation / Edit State
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeRound, setNewChallengeRound] = useState(1);
  const [newChallengeArchive, setNewChallengeArchive] = useState(1);
  const [newChallengeAnswer, setNewChallengeAnswer] = useState('');
  const [newChallengePoints, setNewChallengePoints] = useState(100);
  const [newChallengeTimeLimit, setNewChallengeTimeLimit] = useState(0);
  const [newChallengeAssets, setNewChallengeAssets] = useState([]);
  const [newChallengeHints, setNewChallengeHints] = useState([]);
  const [newChallengeFragmentTitle, setNewChallengeFragmentTitle] = useState('');
  const [newChallengeFragmentHeader, setNewChallengeFragmentHeader] = useState('');
  const [newChallengeFragmentContent, setNewChallengeFragmentContent] = useState('');
  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');
  const [tempAssetSet, setTempAssetSet] = useState('');

  // Round Management State (create + edit share one form; activeRound null = create)
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundTimeLimit, setNewRoundTimeLimit] = useState(0);
  const [newRoundOrder, setNewRoundOrder] = useState('');
  const [newRoundIsActive, setNewRoundIsActive] = useState(true);
  const [newRoundFragmentTitle, setNewRoundFragmentTitle] = useState('');
  const [newRoundFragmentHeader, setNewRoundFragmentHeader] = useState('');
  const [newRoundFragmentContent, setNewRoundFragmentContent] = useState('');
  const [deleteRoundId, setDeleteRoundId] = useState('');
  const [showDeleteRoundConfirmModal, setShowDeleteRoundConfirmModal] = useState(false);

  // Time Limit State
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [editTimeLimitValue, setEditTimeLimitValue] = useState(0);

  // Asset Management States
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [activeAssetChallengeId, setActiveAssetChallengeId] = useState('');
  const [editAssetName, setEditAssetName] = useState('');
  const [editAssetUrl, setEditAssetUrl] = useState('');
  const [editAssetSet, setEditAssetSet] = useState('');
  const [editTeamAssetSet, setEditTeamAssetSet] = useState('');
  const [dragOverChallengeId, setDragOverChallengeId] = useState(null);

  // Bulk Import State
  const [showBulkImportAdminsModal, setShowBulkImportAdminsModal] = useState(false);
  const [bulkAdminsCSVText, setBulkAdminsCSVText] = useState('');

  // Safeguard & confirmation states
  const [safeguardActive, setSafeguardActive] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [showSkipConfirmModal, setShowSkipConfirmModal] = useState(false);
  const [skipConfirmInput, setSkipConfirmInput] = useState('');
  const [showResetChallengeConfirmModal, setShowResetChallengeConfirmModal] = useState(false);
  const [resetChallengeConfirmInput, setResetChallengeConfirmInput] = useState('');
  const [showResetDemoConfirmModal, setShowResetDemoConfirmModal] = useState(false);
  const [resetDemoConfirmInput, setResetDemoConfirmInput] = useState('');
  const [showResetLeaderboardConfirmModal, setShowResetLeaderboardConfirmModal] = useState(false);
  const [resetLeaderboardConfirmInput, setResetLeaderboardConfirmInput] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // IP Tracking & Location Lock states
  const [ipTrackingEnabled, setIpTrackingEnabled] = useState(true);
  const [ipTrackingLoading, setIpTrackingLoading] = useState(false);

  // Persist state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('cicada_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('cicada_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('cicada_rounds', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    localStorage.setItem('cicada_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('cicada_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!openActionMenu) return;
    const close = (event) => {
      if (!event.target.closest('[data-admin-menu]')) setOpenActionMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openActionMenu]);

  const buildChallengePayload = (challenge, overrides = {}) => {
    const raw = challenge?.raw || {};
    const assets = (overrides.assets || challenge?.assets || raw.assets || []).map((a) => ({
      type: a.type || 'file',
      name: (a.name || 'asset').trim() || 'asset',
      url: a.url || '#',
      ...(a.asset_set ? { asset_set: a.asset_set } : {})
    }));

    const orderNum = parseInt(
      overrides.order_number ??
      challenge?.order_number ??
      raw.order_number ??
      (challenge?.round ? (challenge.round >= 100 ? challenge.round : (challenge.round * 100 + (challenge.archiveNumber || 1))) : 1),
      10
    );

    // Normalize time limit: backend schema requires a number >= 1
    const rawLimitInput = overrides.time_limit !== undefined ? overrides.time_limit : (challenge?.timeLimit ?? raw.time_limit);
    let timeLimitVal = parseInt(rawLimitInput, 10);
    if (isNaN(timeLimitVal) || timeLimitVal <= 0) {
      timeLimitVal = 999999;
    } else if (timeLimitVal > 2147483647) {
      timeLimitVal = 2147483647;
    }

    const pointsVal = parseInt(overrides.points ?? challenge?.points ?? raw.points ?? 100, 10);

    const titleVal = (overrides.title ?? overrides.name ?? challenge?.title ?? raw.title ?? raw.name ?? `Archive ${orderNum}`).trim() || `Archive ${orderNum}`;
    const storyVal = (overrides.story_context ?? overrides.description ?? raw.story_context ?? raw.description ?? "Mission briefing").trim() || "Mission briefing";

    const isActive = overrides.is_active !== undefined ? overrides.is_active : (raw.is_active !== undefined ? raw.is_active : !challenge?.isLocked);
    const isLocked = overrides.is_locked !== undefined ? overrides.is_locked : (raw.is_locked !== undefined ? raw.is_locked : challenge?.isLocked ?? false);

    const payload = {
      order_number: isNaN(orderNum) || orderNum < 1 ? 1 : orderNum,
      name: titleVal,
      title: titleVal,
      time_limit: timeLimitVal,
      points: isNaN(pointsVal) || pointsVal < 1 ? 100 : pointsVal,
      is_active: isActive,
      is_locked: isLocked,
      assets: assets,
      story_context: storyVal,
      description: storyVal,
      hints: overrides.hints ?? challenge?.hints ?? raw.hints ?? [],
    };

    if (overrides.story_fragment) {
      payload.story_fragment = overrides.story_fragment;
    }

    // Story fragments now live on rounds, not challenges — the backend drops a
    // per-challenge story_fragment silently. Preserve the challenge's round link
    // so updates keep it in the same round.
    if (overrides.round_id || raw.round_id) {
      payload.round_id = overrides.round_id || raw.round_id;
    }

    // Only include answer_key if explicitly provided or if it's real plaintext.
    // This prevents re-hashing an existing bcrypt hash when updating other fields like
    // time_limit — and must also exclude the "ENCRYPTED (SET)" / "—" display placeholders
    // used when the real plaintext isn't cached locally, or those get hashed and sent as
    // the new answer, silently corrupting it.
    const ANSWER_PLACEHOLDERS = new Set(['ENCRYPTED (SET)', '—']);
    if (overrides.answer_key !== undefined || overrides.answer !== undefined) {
      const explicitAnswer = (overrides.answer_key ?? overrides.answer ?? '').trim();
      if (explicitAnswer) {
        payload.answer_key = explicitAnswer;
        payload.answer = explicitAnswer;
      }
    } else if (challenge?.answer && !challenge.answer.startsWith('$2b$') && !ANSWER_PLACEHOLDERS.has(challenge.answer)) {
      payload.answer_key = challenge.answer.trim();
      payload.answer = challenge.answer.trim();
    } else if (raw.answer_key && !raw.answer_key.startsWith('$2b$')) {
      payload.answer_key = raw.answer_key.trim();
      payload.answer = raw.answer_key.trim();
    }

    return payload;
  };

  const getKnownAnswers = () => {
    try {
      return JSON.parse(localStorage.getItem('cicada_admin_known_answers') || '{}');
    } catch {
      return {};
    }
  };

  const saveKnownAnswer = (challengeKey, answerText) => {
    try {
      const known = getKnownAnswers();
      known[challengeKey] = answerText;
      localStorage.setItem('cicada_admin_known_answers', JSON.stringify(known));
    } catch (err) {
      console.warn('Failed to save known answer to localStorage:', err);
    }
  };

  // --- LOAD LIVE BACKEND DATA (when opened through the authenticated admin flow) ---
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  const parseIpStatus = (res) => {
    if (res === null || res === undefined) return null;
    if (typeof res === 'boolean') return res;
    if (typeof res.data === 'boolean') return res.data;

    const root = res.data || res;
    if (typeof root === 'boolean') return root;
    if (typeof root !== 'object') return null;

    if (typeof root.ip_tracking_enabled === 'boolean') return root.ip_tracking_enabled;
    if (typeof root.ip_blocking_enabled === 'boolean') return root.ip_blocking_enabled;
    if (typeof root.enabled === 'boolean') return root.enabled;
    if (typeof root.tracking === 'boolean') return root.tracking;
    if (typeof root.is_enabled === 'boolean') return root.is_enabled;

    for (const key of Object.keys(root)) {
      if (typeof root[key] === 'boolean') return root[key];
    }

    if (typeof root.status === 'string') return root.status === 'enabled' || root.status === 'active';
    return null;
  };

  const getDeletedTeams = () => {
    try {
      return JSON.parse(localStorage.getItem('cicada_deleted_teams') || '[]');
    } catch {
      return [];
    }
  };

  const markTeamAsDeleted = (teamName, teamId) => {
    try {
      const list = getDeletedTeams();
      if (teamName && !list.includes(teamName)) list.push(teamName);
      if (teamName && !list.includes(teamName.trim().toLowerCase())) list.push(teamName.trim().toLowerCase());
      if (teamId && !list.includes(teamId)) list.push(teamId);
      localStorage.setItem('cicada_deleted_teams', JSON.stringify(list));
    } catch (err) {
      console.warn('Failed to save deleted team record:', err);
    }
  };

  const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

  const refreshLive = async () => {
    if (!isAuthenticated || !isOAuthAdmin) return;
    setLiveLoading(true);
    setLiveError('');
    try {
      const [u, ch, prog, lb, ipStatus, supabaseTeams, adminLogs, roundsRes] = await Promise.all([
        listUsers().catch((err) => { console.warn('Could not fetch users:', err); return { data: [] }; }),
        getAdminChallenges().catch((err) => { console.warn('Could not fetch challenges:', err); return { data: [] }; }),
        getAdminProgress().catch((err) => { console.warn('Could not fetch progress:', err); return { data: [] }; }),
        getLeaderboard().catch((err) => { console.warn('Could not fetch leaderboard:', err); return { data: [] }; }),
        getIpTrackingStatus().catch((err) => { console.warn('Could not fetch IP tracking status:', err); return null; }),
        Promise.resolve(supabase.from('teams').select('id, name, points, is_disqualified')).catch(() => ({ data: [] })),
        getAdminActivityLogs().catch((err) => { console.warn('Could not fetch admin activity logs:', err); return { data: [] }; }),
        getAdminRounds().catch((err) => { console.warn('Could not fetch rounds:', err); return { data: [] }; }),
      ]);

      // Real, attributed admin action history from the backend (who actually did what).
      // Merged ahead of any locally-fabricated log entries, which had no real attribution.
      if (Array.isArray(adminLogs?.data)) {
        const humanizeAction = (action) => (action || 'ACTION').replace(/_/g, ' ').replace(/\w\S*/g, (w) => w[0] + w.slice(1).toLowerCase());
        const realAdminLogs = adminLogs.data.map((log) => ({
          id: `adminlog-${log.id}`,
          teamId: 'admin',
          teamName: log.admin_username || log.admin_email || 'Unknown admin',
          adminName: log.admin_username || log.admin_email || 'Unknown admin',
          challengeId: 'admin_action',
          challengeTitle: humanizeAction(log.action),
          answer: log.details && typeof log.details === 'object' ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ') : String(log.details || ''),
          correct: true,
          timestamp: log.created_at ? new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19) : '',
          attempts: 0,
        }));
        setLogs((prevLogs) => {
          const localOnly = prevLogs.filter((l) => !String(l.id).startsWith('adminlog-'));
          return [...realAdminLogs, ...localOnly];
        });
      }

      const parsedIp = parseIpStatus(ipStatus);
      if (parsedIp !== null) {
        setIpTrackingEnabled(parsedIp);
      }

      if (Array.isArray(roundsRes?.data)) {
        setRounds(roundsRes.data.map((x) => ({
          id: x.id,
          name: x.name || `Round ${x.order_number}`,
          order_number: x.order_number,
          time_limit: x.time_limit || 0,
          story_fragment: (x.story_fragment && typeof x.story_fragment === 'object') ? x.story_fragment : null,
          is_active: x.is_active,
          created_at: x.created_at,
          updated_at: x.updated_at,
            started_at: x.started_at,
            is_paused: x.is_paused,
            paused_at: x.paused_at,
          })));
      }

      if (Array.isArray(u?.data)) {
        setUsers(u.data.map((x) => ({
          id: x.id,
          username: x.display_name || x.email,
          email: x.email,
          role: x.role === 'admin' || x.role === 'GOD' ? 'Admin' : 'Participant',
          isApprovedAdmin: x.role === 'admin' || x.role === 'GOD' ? x.is_admin_approved !== false : false,
          teamId: x.team_id || null,
        })));
      }

      const solvedCountsByRound = {};
      (prog?.data || []).forEach(p => {
        (p.completed_challenges || []).forEach(round => {
          solvedCountsByRound[round] = (solvedCountsByRound[round] || 0) + 1;
        });
      });

      if (Array.isArray(ch?.data)) {
        const known = getKnownAnswers();
        setChallenges(ch.data.map((x, idx) => {
          const rawAns = x.answer_key || x.answer || '';
          const isHashed = typeof rawAns === 'string' && rawAns.startsWith('$2b$');
          const savedPlain = known[x.id] || known[x.order_number] || '';
          const displayAns = isHashed ? (savedPlain || 'ENCRYPTED (SET)') : (rawAns || '—');
          const { round, archiveNumber } = parseRoundAndArchive(x, idx);

          return {
            id: x.id,
            title: x.name || x.title,
            round: round,
            archiveNumber: archiveNumber,
            order_number: x.order_number,
            answer: displayAns,
            rawAnswer: rawAns,
            isHashedAnswer: isHashed,
            points: x.points || 0,
            isLocked: x.is_active === false,
            hints: x.hints || [],
             hintsEnabled: (x.hints || []).length > 0 && (x.hints || []).some((h) => h.is_visible),
             solvedCount: solvedCountsByRound[x.order_number] || 0,
             timeLimit: x.time_limit || 0,
             assets: (x.assets || []).map((a) => ({
                 id: a.id, 
                 name: a.name || 'asset', 
                 url: a.url || '#',
                 type: a.type || a.mime_type || 'file',
                 ...(a.asset_set ? { asset_set: a.asset_set } : {})
               })),
            raw: x,
          };
        }));
      }

      const lbMap = {};
      (lb?.data || []).forEach((t) => { lbMap[t.team_name] = t.challenges_completed; });

      const membersByTeamId = {};
      const membersByTeamName = {};
      const teamIdByName = {};
      const teamRecordByName = {};

      (supabaseTeams?.data || []).forEach((t) => {
        if (t?.name && isUUID(t.id)) {
          teamIdByName[t.name.trim().toLowerCase()] = t.id;
          teamIdByName[t.name.trim()] = t.id;
        }
        if (t?.name) {
          teamRecordByName[t.name.trim().toLowerCase()] = t;
        }
      });

      (u?.data || []).forEach((x) => {
        const label = x.display_name || x.email;
        const teamId = (isUUID(x.team_id) ? x.team_id : null) || (isUUID(x.teams?.id) ? x.teams.id : null);
        if (teamId) {
          (membersByTeamId[teamId] ||= []).push(label);
        }
        const joinedName = x.teams?.name || x.team_name;
        if (joinedName) {
          (membersByTeamName[joinedName] ||= []).push(label);
          if (teamId) {
            teamIdByName[joinedName.trim().toLowerCase()] = teamId;
            teamIdByName[joinedName.trim()] = teamId;
          }
        }
      });

      const deletedTeams = getDeletedTeams();
      const isTeamDeleted = (name, id) => {
        if (!name && !id) return false;
        return (
          deletedTeams.includes(name) ||
          deletedTeams.includes(name?.trim().toLowerCase()) ||
          (id && deletedTeams.includes(id))
        );
      };

      const allTeamNames = new Set([
        ...(prog?.data || []).map(t => t.team_name).filter(Boolean),
        ...(supabaseTeams?.data || []).map(t => t.name).filter(Boolean),
        ...(lb?.data || []).map(t => t.team_name).filter(Boolean),
      ]);

      const activeTeamNames = Array.from(allTeamNames).filter(name => !isTeamDeleted(name));

      setTeams(activeTeamNames.map((teamName) => {
        const progRecord = (prog?.data || []).find(p => p.team_name === teamName) || {};
        const directId = (isUUID(progRecord.team_id) ? progRecord.team_id : null) || (isUUID(progRecord.id) ? progRecord.id : null);
        const resolvedUuid = directId || teamIdByName[teamName.trim()] || teamIdByName[teamName.trim().toLowerCase()] || null;
        const teamRecord = teamRecordByName[teamName.trim().toLowerCase()];

        // teams.points (via the admin score-adjustment endpoint) is the source of truth when
        // available; the public leaderboard's challenges_completed count is only a fallback for
        // teams the score endpoint hasn't touched yet.
        const finalPoints = (teamRecord && typeof teamRecord.points === 'number' ? teamRecord.points : 0) + (lbMap[teamName] != null ? lbMap[teamName] : ((progRecord.challenges_solved || 0) * 100));

        return {
          id: resolvedUuid || teamName,
          uuid: resolvedUuid,
          name: teamName,
          members: (resolvedUuid ? membersByTeamId[resolvedUuid] : null) || membersByTeamName[teamName] || [],
          round: progRecord.current_round_order || 1,
          points: finalPoints,
          status: teamRecord?.is_disqualified ? 'disqualified' : 'active',
        };
      }));
    } catch (err) {
      setLiveError(err.message || 'Failed to load live data.');
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    refreshLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOAuthAdmin]);

  // Reconciles local state with the server in the background without blocking UI
  // feedback. refreshLive() re-fetches 6 endpoints — awaiting it before closing a
  // modal or showing a success message is what made every action feel slow. Handlers
  // apply their own optimistic/response-based state update, then call this to catch
  // any drift (e.g. from another admin's concurrent change) a moment later.
  const refreshLiveInBackground = () => {
    refreshLive().catch((err) => console.warn('Background refresh failed:', err));
  };

  
  const handleOpenHintModal = (challenge) => {
    setActiveChallenge(challenge);
    setShowHintModal(true);
  };

  const handleAddHint = async (e) => {
    e.preventDefault();
    if (!newHintText.trim()) return toast.error('Hint text required');
    try {
      const res = await fetch(`/api/admin/challenges/${activeChallenge.id}/hints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          text: newHintText,
          unlock_minutes: parseInt(newHintUnlockMinutes, 10) || 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setChallenges(
        challenges.map((c) => (c.id === activeChallenge.id ? { ...c, hints: data.data || data.hints } : c))
      );
      setActiveChallenge(prev => ({ ...prev, hints: data.data || data.hints }));
      setNewHintText('');
      setNewHintUnlockMinutes(0);
      toast.success('Hint added');
    } catch (err) {
      toast.error(err.message || 'Failed to add hint');
    }
  };

  const handleDeleteHint = async (hintId) => {
    try {
      const data = await deleteHint(activeChallenge.id, hintId);

      setChallenges(
        challenges.map((c) => (c.id === activeChallenge.id ? { ...c, hints: data.data || data.hints || data } : c))
      );
      setActiveChallenge(prev => ({ ...prev, hints: data.data || data.hints || data }));
      toast.success('Hint deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete hint');
    }
  };

  const handleToggleHintVisibility = async (hintId, currentStatus) => {
    try {
      const hintToUpdate = activeChallenge.hints.find(h => h.id === hintId);
      if (!hintToUpdate) return;

      const data = await toggleHint(activeChallenge.id, hintId);

      setChallenges(
        challenges.map((c) => (c.id === activeChallenge.id ? { ...c, hints: data.data || data.hints || data } : c))
      );
      setActiveChallenge(prev => ({ ...prev, hints: data.data || data.hints || data }));
      toast.success('Hint visibility toggled');
    } catch (err) {
      toast.error(err.message || 'Failed to toggle hint visibility');
    }
  };

  const handleToggleIpTracking = async () => {
    if (ipTrackingLoading) return;
    setIpTrackingLoading(true);
    const targetState = !ipTrackingEnabled;
    try {
      const res = await toggleIpTracking(targetState);
      const parsed = parseIpStatus(res);
      if (parsed !== null) {
        setIpTrackingEnabled(parsed);
      } else {
        setIpTrackingEnabled(targetState);
      }
    } catch (err) {
      console.error('Failed to toggle IP tracking:', err);
      alert('Failed to toggle IP tracking: ' + (err.message || 'Network error'));
    } finally {
      setIpTrackingLoading(false);
    }
  };

  // --- LOGIN FUNCTION ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput === DEFAULT_CREDENTIALS.username && passwordInput === DEFAULT_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cicada_admin_logged', 'true');
      setLoginError('');
    } else {
      setLoginError('INVALID CREDENTIALS. ACCESS DENIED.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cicada_admin_logged');
  };

  // --- BACKEND-READY EVENT HANDLERS ---

  // --- USER MANAGEMENT HANDLERS ---
  // API Endpoint: POST 09_Approve_Admin
  const handleApproveAdmin = async (userId) => {
    try {
      await approveAdmin({ target_user_id: userId });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isApprovedAdmin: true } : u)));
      refreshLiveInBackground();
    } catch (err) {
      console.error(err);
      alert('Failed to approve admin: ' + (err.message || 'Unknown error'));
    }
  };

  // API Endpoint: POST 10_Toggle_Admin_Role
  const handleToggleAdminRole = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    const newRole = targetUser && targetUser.role === 'Admin' ? 'participant' : 'admin';
    try {
      await toggleRole({ target_user_id: userId, role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole === 'admin' ? 'Admin' : 'Participant' } : u)));
      refreshLiveInBackground();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle admin role: ' + (err.message || 'Unknown error'));
    }
  };

  // API Endpoint: POST 12_Admin_Delete_User
  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`WIPE USER ACCOUNT "${username.toUpperCase()}"? THIS REMOVES THEIR SECURITY PRIVILEGES.`)) {
      try {
        await deleteUser({ target_user_id: userId });
        setUsers(users.filter((u) => u.id !== userId));
        refreshLiveInBackground();
      } catch (err) {
        console.error(err);
        alert('Failed to delete user: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // API Endpoint: POST Bulk Import Admins from CSV
  const handleBulkImportAdmins = async (e) => {
    e.preventDefault();
    if (!bulkAdminsCSVText.trim()) return;

    try {
      await bulkImportAdmins({ csv_data: bulkAdminsCSVText });
      alert('SUCCESSFULLY IMPORTED ADMINISTRATORS.');
      setBulkAdminsCSVText('');
      setShowBulkImportAdminsModal(false);
      refreshLiveInBackground();
    } catch (err) {
      console.error(err);
      alert('Failed to import admins: ' + (err.message || 'Unknown error'));
    }
  };

  // --- SCORE ADJUSTMENT HANDLER ---
  // API Endpoint: PATCH /api/admin/teams/:id/score
  const handleAdjustScore = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    const value = parseInt(adjustScoreValue) || 0;
    let newPoints = activeTeam.points || 0;
    if (adjustScoreType === 'add') {
      newPoints += value;
    } else if (adjustScoreType === 'subtract') {
      newPoints = Math.max(0, newPoints - value);
    } else if (adjustScoreType === 'set') {
      newPoints = value;
    }

    try {
      await adjustScore(activeTeam.uuid || activeTeam.id || activeTeam.name, { exact: newPoints });

      setTeams(teams.map((t) => (t.id === activeTeam.id || t.name === activeTeam.name ? { ...t, points: newPoints } : t)));
      pushLocalLog({
        teamName: activeTeam.name,
        challengeTitle: 'Score Adjustment',
        answer: `Adjusted: ${adjustScoreType.toUpperCase()} ${value} pts. New score: ${newPoints}.`,
      });

      setShowAdjustScoreModal(false);
      setActiveTeam(null);
      setAdjustScoreValue(0);
      alert(`SUCCESS: Score for "${activeTeam.name}" adjusted to ${newPoints} points.`);
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to adjust score on backend:', err);
      alert('Failed to adjust score on backend:\n' + (err.message || 'Unknown error'));
    }
  };

  // --- MEMBER REMOVAL HANDLER ---
  // API Endpoint: POST 06_Remove_Member
  const handleRemoveMember = async (teamId, memberName) => {
    if (window.confirm(`REMOVE "${memberName.toUpperCase()}" FROM TEAM?`)) {
      try {
        const foundUser = users.find(u => u.username === memberName || u.email === memberName);
        let resolvedTeamId = isUUID(teamId) ? teamId : undefined;
        if (!resolvedTeamId) {
          const foundTeam = teams.find(t => t.id === teamId || t.name === teamId);
          if (foundTeam?.uuid && isUUID(foundTeam.uuid)) {
            resolvedTeamId = foundTeam.uuid;
          } else if (foundUser?.teamId && isUUID(foundUser.teamId)) {
            resolvedTeamId = foundUser.teamId;
          }
        }

        await removeTeamMember({
          target_user_id: foundUser?.id || undefined,
          target_email: foundUser?.email || (!foundUser?.id ? memberName : undefined),
          team_id: resolvedTeamId,
        });

        setTeams(teams.map((t) => (t.id === teamId || t.name === teamId ? { ...t, members: t.members.filter((m) => m !== memberName) } : t)));
        refreshLiveInBackground();
      } catch (err) {
        console.error(err);
        alert('Failed to remove member:\n' + (err.message || 'Unknown error'));
      }
    }
  };

  // Open Edit Challenge Modal pre-filled with challenge details
  const handleOpenEditChallenge = (challenge) => {
    if (!challenge) return;
    setEditingChallenge(challenge);
    setNewChallengeTitle(challenge.title || challenge.name || '');
    setNewChallengeRound(challenge.round || challenge.raw?.round || 1);
    setNewChallengeArchive(challenge.archiveNumber || challenge.raw?.archive_number || challenge.raw?.phase || 1);
    setNewChallengePoints(challenge.points || 100);
    setNewChallengeTimeLimit(challenge.timeLimit && challenge.timeLimit < 99999 ? challenge.timeLimit : 0);

    const known = getKnownAnswers();
    const knownAns = challenge.round ? known[challenge.round] : '';
    const answerVal = (challenge.answer && !challenge.answer.startsWith('$2b$') && challenge.answer !== '—' && challenge.answer !== 'ENCRYPTED (SET)')
      ? challenge.answer
      : (challenge.rawAnswer && !challenge.rawAnswer.startsWith('$2b$')
        ? challenge.rawAnswer
        : (knownAns && !knownAns.startsWith('$2b$')
          ? knownAns
          : (challenge.raw?.answer_key && !challenge.raw.answer_key.startsWith('$2b$') ? challenge.raw.answer_key : '')));
    setNewChallengeAnswer(answerVal || '');

    const frag = challenge.story_fragment || challenge.raw?.story_fragment || {};
    setNewChallengeFragmentTitle(frag.title || challenge.title || challenge.name || '');
    setNewChallengeFragmentHeader(frag.header || '');
    setNewChallengeFragmentContent(frag.content || '');

    const existingAssets = (challenge.assets || challenge.raw?.assets || []).map((a) => ({
      name: a.name || 'asset',
      url: a.url || '#',
      type: a.type || a.mime_type || 'file',
      ...(a.asset_set ? { asset_set: a.asset_set } : {})
    }));
    setNewChallengeAssets(existingAssets);
    setNewChallengeHints(challenge.hints || challenge.raw?.hints || []);
    setTempAssetName('');
    setTempAssetUrl('');
    setTempAssetSet('');
    setShowCreateChallengeModal(true);
  };

  // --- CHALLENGE OPERATION HANDLERS ---
  // API Endpoint: POST / PUT Create/Update Challenge with All Assets (Admin)
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    let parsedLimit = parseInt(newChallengeTimeLimit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = 999999;
    } else if (parsedLimit > 2147483647) {
      parsedLimit = 2147483647;
    }

    const roundNum = parseInt(newChallengeRound, 10) || 1;
    const archiveNum = parseInt(newChallengeArchive, 10) || 1;
    const titleVal = newChallengeTitle.trim();
    const answerKeyVal = newChallengeAnswer.trim() || 'decrypted_key';
    const pointsVal = parseInt(newChallengePoints, 10) || 100;

    const fragTitle = newChallengeFragmentTitle.trim() || titleVal;
    const fragHeader = newChallengeFragmentHeader.trim() || 'TRANSMISSION RECEIVED';
    const fragContent = newChallengeFragmentContent.trim() || fragTitle || `${titleVal} classified transmission fragment decrypted.`;

    const mappedAssets = (newChallengeAssets || []).map((a) => ({
      type: a.type || 'file',
      url: a.url || '#',
      name: (a.name || 'asset').trim() || 'asset',
      ...(a.asset_set ? { asset_set: a.asset_set } : {})
    }));

    if (editingChallenge) {
      const targetId = editingChallenge.raw?.id || editingChallenge.id;
      const orderNum = editingChallenge.order_number || editingChallenge.raw?.order_number || archiveNum;

      const targetRound = rounds.find(r => r.order_number === roundNum);
      const roundIdToUse = targetRound?.id || undefined;

      const payloadOverrides = {
        round_id: roundIdToUse,
        order_number: orderNum,
        round: roundNum,
        round_number: roundNum,
        archive_number: archiveNum,
        phase: archiveNum,
        name: titleVal,
        title: titleVal,
        time_limit: parsedLimit,
        points: pointsVal,
        story_fragment: {
          title: fragTitle,
          header: fragHeader,
          content: fragContent,
        },
        assets: mappedAssets,
          hints: newChallengeHints,
      };

      if (newChallengeAnswer.trim()) {
        payloadOverrides.answer_key = newChallengeAnswer.trim();
        payloadOverrides.answer = newChallengeAnswer.trim();
      }

      const payload = buildChallengePayload(editingChallenge, payloadOverrides);

      try {
        await updateChallenge(targetId, payload);
        if (newChallengeAnswer.trim() && roundNum) {
          saveKnownAnswer(roundNum, newChallengeAnswer.trim());
        }

        setChallenges((prev) =>
          prev.map((c) =>
            c.id === editingChallenge.id
              ? {
                ...c,
                title: titleVal,
                name: titleVal,
                round: roundNum,
                archiveNumber: archiveNum,
                points: pointsVal,
                timeLimit: parsedLimit < 99999 ? parsedLimit : 0,
                ...(newChallengeAnswer.trim() ? { answer: newChallengeAnswer.trim(), rawAnswer: newChallengeAnswer.trim(), isHashedAnswer: false } : {}),
                story_fragment: {
                  title: fragTitle,
                  header: fragHeader,
                  content: fragContent,
                },
                assets: (newChallengeAssets || []).map((a) => ({ 
                  name: a.name || 'asset', 
                  url: a.url || '#',
                  ...(a.asset_set ? { asset_set: a.asset_set } : {})
                })),
              }
              : c
          )
        );

        pushLocalLog({
          teamName: 'SYSTEM',
          challengeTitle: 'Edit Challenge',
          answer: `Challenge "${titleVal}" updated successfully.`,
        });

        setNewChallengeTitle('');
        setNewChallengeRound(1);
        setNewChallengeArchive(1);
        setNewChallengeAnswer('');
        setNewChallengePoints(100);
        setNewChallengeTimeLimit(0);
        setNewChallengeAssets([]);
      setNewChallengeHints([]);
        setNewChallengeHints([]);
        setNewChallengeFragmentTitle('');
        setNewChallengeFragmentHeader('');
        setNewChallengeFragmentContent('');
        setTempAssetName('');
        setTempAssetUrl('');
        setTempAssetSet('');
        setEditingChallenge(null);
        setShowCreateChallengeModal(false);
        refreshLiveInBackground();
      } catch (err) {
        console.error('Failed to update challenge:', err);
        alert('Failed to update challenge:\n' + (err.message || 'Unknown error'));
      }
      return;
    }

    // CREATE MODE
    const maxOrder = challenges.reduce((max, c) => Math.max(max, c.order_number || c.raw?.order_number || 0), 0);
    const orderNum = maxOrder + 1;

    // Find the correct round_id from rounds array
    const targetRound = rounds.find(r => r.order_number === roundNum);
    const roundIdToUse = targetRound?.id || rounds[0]?.id || undefined;

    if (!roundIdToUse) {
      alert('You must create at least one Round in the Rounds tab before you can create a challenge, as challenges must be assigned to a round.');
      return;
    }

    try {
      const res = await createChallenge({
        round_id: roundIdToUse,
        order_number: orderNum,
        round: roundNum,
        round_number: roundNum,
        archive_number: archiveNum,
        phase: archiveNum,
        name: titleVal,
        title: titleVal,
        answer_key: answerKeyVal,
        answer: answerKeyVal,
        points: pointsVal,
        time_limit: parsedLimit,
        is_active: false,
        is_locked: true,
        story_context: 'Mission briefing',
        description: 'Mission briefing',
        hints: [],
        story_fragment: {
          title: fragTitle,
          header: fragHeader,
          content: fragContent,
        },
        assets: mappedAssets,
          hints: newChallengeHints,
      });

      if (newChallengeAnswer.trim() && roundNum) {
        saveKnownAnswer(roundNum, newChallengeAnswer.trim());
      }

      const newChalObj = {
        id: res?.data?.id || `chal-${Date.now()}`,
        title: titleVal,
        round: roundNum,
        archiveNumber: archiveNum,
        order_number: orderNum,
        answer: answerKeyVal,
        rawAnswer: answerKeyVal,
        isHashedAnswer: false,
        points: pointsVal,
        timeLimit: parsedLimit < 99999 ? parsedLimit : 0,
        isLocked: true,
        hintsEnabled: false,
        solvedCount: 0,
        story_fragment: {
          title: fragTitle,
          header: fragHeader,
          content: fragContent,
        },
          assets: (newChallengeAssets || []).map((a) => ({ 
            name: a.name || 'asset', 
            url: a.url || '#',
            ...(a.asset_set ? { asset_set: a.asset_set } : {})
          })),
      };
      setChallenges((prev) => [...prev, newChalObj]);

      setNewChallengeTitle('');
      setNewChallengeRound(1);
      setNewChallengeArchive(1);
      setNewChallengeAnswer('');
      setNewChallengePoints(100);
      setNewChallengeTimeLimit(0);
      setNewChallengeAssets([]);
      setNewChallengeHints([]);
        setNewChallengeHints([]);
      setNewChallengeFragmentTitle('');
      setNewChallengeFragmentHeader('');
      setNewChallengeFragmentContent('');
      setTempAssetName('');
      setTempAssetUrl('');
      setTempAssetSet('');
      setShowCreateChallengeModal(false);
      refreshLiveInBackground();
    } catch (err) {
      console.error(err);
      alert('Failed to create challenge: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAddAssetToChallenge = () => {
    if (!tempAssetName.trim()) return;
    
    const parsedSet = parseInt(tempAssetSet, 10);
    
    const newAsset = {
      name: tempAssetName.trim(),
      url: tempAssetUrl.trim() || '#',
      ...(parsedSet > 0 ? { asset_set: parsedSet } : {})
    };
    
    setNewChallengeAssets([...newChallengeAssets, newAsset]);
    setTempAssetName('');
    setTempAssetUrl('');
    setTempAssetSet('');
  };

  const handleRemoveAssetFromChallenge = (idxToRemove) => {
    setNewChallengeAssets(newChallengeAssets.filter((_, idx) => idx !== idxToRemove));
  };

  // API Endpoint: PUT Update Challenge Time Limit (Admin)
  const handleUpdateTimeLimit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    const newLimit = parseInt(editTimeLimitValue, 10) || 0;
    const payload = buildChallengePayload(activeChallenge, { time_limit: newLimit });

    try {
      const challengeId = activeChallenge.raw?.id || activeChallenge.id || activeChallenge.order_number;
      await updateChallenge(challengeId, payload);
      setChallenges(challenges.map((c) => (c.id === activeChallenge.id ? { ...c, timeLimit: payload.time_limit } : c)));
      setShowTimeLimitModal(false);
      setActiveChallenge(null);
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to update challenge time limit on backend:", err);
      alert("Failed to update time limit on backend: " + (err.message || "Validation Error"));
    }
  };

  // --- DIRECT ASSET MANAGEMENT HANDLERS ---

  // API Endpoint: POST Add Asset
  const handleAddAssetToChallengeDirect = async (challengeId, fileOrAsset) => {
    try {
      let newAsset;
      if (fileOrAsset.name && fileOrAsset.size !== undefined) {
        // Actually upload to Supabase Storage (requires a public 'assets' bucket)
        const filePath = `challenges/${challengeId}/${Date.now()}_${fileOrAsset.name}`;
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, fileOrAsset, { upsert: true });

        if (uploadError) throw new Error("Upload failed: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

          newAsset = {
            type: fileOrAsset.type || 'file',
          name: fileOrAsset.name,
          url: publicUrlData.publicUrl
        };
      } else {
        newAsset = {
          type: 'file',
          name: fileOrAsset.name,
          url: fileOrAsset.url || '#'
        };
      }

      await addAsset(challengeId, newAsset);

      const targetChallenge = challenges.find(c => c.id === challengeId);
      setChallenges(challenges.map(c => {
        if (c.id === challengeId) {
          const existingAssets = c.assets || [];
          if (existingAssets.some(a => a.name === newAsset.name)) {
            return c;
          }
          return {
            ...c,
            assets: [...existingAssets, newAsset]
          };
        }
        return c;
      }));
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Add Asset',
        answer: `Asset "${newAsset.name}" added to challenge "${targetChallenge?.title || challengeId}"`,
      });

      refreshLiveInBackground();
    } catch (err) {
      alert(err.message || 'Failed to add asset');
    }
  };

  // API Endpoint: PUT /api/admin/challenges/:id/assets/:assetId
  const handleEditAssetSave = async (e) => {
    e.preventDefault();
    if (!activeAsset || !activeAssetChallengeId) return;

    const chal = challenges.find(c => c.id === activeAssetChallengeId);
    const targetChallengeId = chal?.raw?.id || activeAssetChallengeId;
    const assetIdentifier = activeAsset.id || activeAsset.name;

    try {
      const parsedSet = parseInt(editAssetSet, 10);
      const res = await editAsset(targetChallengeId, assetIdentifier, {
        name: editAssetName.trim(),
        url: editAssetUrl.trim() || undefined,
        ...(parsedSet > 0 ? { asset_set: parsedSet } : { asset_set: null })
      });

      if (Array.isArray(res?.data)) {
        const updatedAssets = res.data.map((a) => ({ 
           id: a.id, 
           name: a.name || 'asset', 
           url: a.url || '#',
           type: a.type || a.mime_type || 'file',
           ...(a.asset_set ? { asset_set: a.asset_set } : {})
         }));
        setChallenges(challenges.map((c) => (c.id === activeAssetChallengeId ? { ...c, assets: updatedAssets } : c)));
      }
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Edit Asset',
        answer: `Asset "${activeAsset.name}" updated on challenge "${chal?.title || activeAssetChallengeId}"`,
      });

      setShowEditAssetModal(false);
      setActiveAsset(null);
      setActiveAssetChallengeId('');
      setEditAssetName('');
      setEditAssetUrl('');
      setEditAssetSet('');
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to edit asset on backend:', err);
      alert('Failed to edit asset on backend:\n' + (err.message || 'Unknown error'));
    }
  };

  // API Endpoint: DELETE /api/admin/challenges/:id/assets/:assetId
  const handleDeleteAsset = async (challengeId, assetName) => {
    if (!window.confirm(`PERMANENTLY DELETE ASSET "${assetName.toUpperCase()}" FROM CHALLENGE?`)) return;

    const chal = challenges.find(c => c.id === challengeId);
    const targetChallengeId = chal?.raw?.id || challengeId;
    const asset = (chal?.assets || []).find(a => a.name === assetName);
    const assetIdentifier = asset?.id || assetName;

    try {
      const res = await deleteAsset(targetChallengeId, assetIdentifier);

      if (Array.isArray(res?.data)) {
        const updatedAssets = res.data.map((a) => ({ id: a.id, name: a.name || 'asset', url: a.url || '#' }));
        setChallenges(challenges.map((c) => (c.id === challengeId ? { ...c, assets: updatedAssets } : c)));
      }
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Delete Asset',
        answer: `Asset "${assetName}" removed from challenge "${chal?.title || challengeId}"`,
      });

      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to delete asset on backend:', err);
      alert('Failed to delete asset on backend:\n' + (err.message || 'Unknown error'));
    }
  };

  // API Endpoints: POST /api/admin/challenges/override + PATCH /api/admin/teams/:id/score
  const handleResetTeamProgress = async (teamId, teamName) => {
    if (window.confirm(`RESET ALL PROGRESS FOR "${teamName.toUpperCase()}"? THIS RESETS ROUND TO 1 AND POINTS TO 0.`)) {
      try {
        await adminOverride({ team_name: teamName, target_challenge_order: 1 });

        // Best-effort: some teams only exist in progress/leaderboard records with no
        // matching row in the teams table (leftover from stress-testing), so the score
        // endpoint 404s for them. Don't let that abort the round reset, which already
        // succeeded and is what participants actually experience.
        let scoreReset = true;
        try {
          await adjustScore(teamId || teamName, { exact: 0 });
        } catch (scoreErr) {
          scoreReset = false;
          console.warn(`Could not reset score for team "${teamName}" (likely has no linked teams row):`, scoreErr);
        }

        setTeams(teams.map((t) => (t.id === teamId || t.name === teamName ? { ...t, round: 1, points: scoreReset ? 0 : t.points } : t)));
        pushLocalLog({
          teamName,
          challengeTitle: 'Reset Team Progress',
          answer: scoreReset
            ? 'Team progress and score reset to default (0 pts)'
            : 'Team progress reset to default (score unchanged - no linked team record)',
        });

        alert(scoreReset
          ? `SUCCESS: Progress reset to Round 1 and score reset to 0 for team "${teamName}".`
          : `Progress reset to Round 1 for team "${teamName}". Score could not be reset — this team has no linked record in the teams table.`);
        refreshLiveInBackground();
      } catch (err) {
        console.error("Failed to reset team progress on backend:", err);
        alert("Failed to reset team progress on backend:\n" + (err.message || "Unknown error"));
      }

    }
  };

  // API Endpoints: POST /api/admin/challenges/override + PATCH /api/admin/teams/:id/score (per team)
  const handleResetLeaderboard = async () => {
    try {
      const overridePromises = teams.map(t =>
        adminOverride({ team_name: t.name, target_challenge_order: 1 }).catch(err => {
          console.warn(`Could not reset progress for ${t.name}:`, err);
        })
      );
      const scorePromises = teams.map(t =>
        adjustScore(t.uuid || t.id || t.name, { exact: 0 }).catch(err => {
          console.warn(`Could not reset score for ${t.name}:`, err);
        })
      );
      await Promise.all([...overridePromises, ...scorePromises]);

      const lockPromises = challenges
        .filter(c => c.round > 1 && !c.isLocked)
        .map(c => {
          const payload = buildChallengePayload(c, { is_active: false, is_locked: true });
          const targetId = c.raw?.id || c.id || c.round;
          return updateChallenge(targetId, payload).catch(err => {
            console.warn(`Could not lock challenge ${c.title}:`, err);
          });
        });
      await Promise.all(lockPromises);

      setTeams(teams.map(t => ({ ...t, points: 0, round: 1 })));

      // Lock all challenges except Round 1
      setChallenges(challenges.map(c => ({
        ...c,
        isLocked: c.round > 1,
        solvedCount: 0
      })));
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Reset Leaderboard',
        answer: `All ${teams.length} teams reset to Round 1 and 0 points.`,
      });

      alert("SUCCESS: Leaderboard reset. All teams reset to Round 1 and 0 points.");
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to reset leaderboard on backend:", err);
      alert("Failed to reset leaderboard on backend:\n" + (err.message || "Unknown error"));
    }
  };

  // TEAM HANDLERS
  // NOTE: There is no backend endpoint for admin-driven team creation — teams are
  // created by a participant self-registering (POST /api/teams/create), which requires
  // a real authenticated user to become the team leader. An admin form with free-text
  // member names has no matching backend concept, so this reports that honestly instead
  // of faking a locally-stored "success".
  const handleCreateTeam = (e) => {
    e.preventDefault();
    alert('Admin-side team creation is not supported by the backend: teams are created when a participant registers and becomes team leader. Ask the crew to register themselves, or use "Edit team" / "Reset progress" on an existing team.');
  };

  const handleOpenEditTeam = (team) => {
    setActiveTeam(team);
    setEditTeamName(team.name);
    setEditTeamMembers(team.members.join(', '));
    setEditTeamPoints(team.points);
    setEditTeamStatus(team.status);
    setShowEditTeamModal(true);
  };

  // API Endpoints: PATCH /api/admin/teams/:id (name, status) + PATCH /api/admin/teams/:id/score (points)
  const handleSaveTeamEdit = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    const teamKey = activeTeam.uuid || activeTeam.id || activeTeam.name;
    const newPoints = parseInt(editTeamPoints) || 0;
    const nameChanged = editTeamName.trim() && editTeamName.trim() !== activeTeam.name;
    const statusChanged = editTeamStatus !== activeTeam.status;
    const pointsChanged = newPoints !== (activeTeam.points || 0);

    try {
      if (nameChanged || statusChanged) {
        await updateTeam(teamKey, {
          ...(nameChanged ? { name: editTeamName.trim() } : {}),
          ...(statusChanged ? { is_disqualified: editTeamStatus === 'disqualified' } : {}),
        });
      }
      if (pointsChanged) {
        await adjustScore(teamKey, { exact: newPoints });
      }

      setTeams(teams.map((t) => (t.id === activeTeam.id ? {
        ...t,
        name: nameChanged ? editTeamName.trim() : t.name,
        status: statusChanged ? editTeamStatus : t.status,
        points: pointsChanged ? newPoints : t.points,
      } : t)));

      setShowEditTeamModal(false);
      setActiveTeam(null);
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to save team edit on backend:', err);
      alert('Failed to save team edit on backend:\n' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenDeleteConfirm = (team) => {
    setActiveTeam(team);
    setDeleteConfirmInput('');
    setShowDeleteConfirmModal(true);
  };

  const handleOpenResetPassword = (team) => {
    setActiveTeam(team);
    setManuallyResetPassword('');
    setShowResetPwdModal(true);
  };

  // NOTE: There is no password-based auth in the backend — participants authenticate
  // via Supabase (Google OAuth / magic link) per user, not a team passphrase, and no
  // endpoint exists to "reset" one. This reports that honestly instead of faking success.
  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    if (!activeTeam) return;
    alert(`Teams don't have a resettable password in this system: members sign in individually via Google/Supabase auth, not a shared team passphrase. There is nothing to reset for "${activeTeam.name}".`);
  };

  const handleOpenProgressOverride = (team) => {
    setActiveTeam(team);
    const teamOrder = team.round || 1;
    const candidates = overrideRoundOptions
      .filter((o) => o.firstChallengeOrder != null && o.firstChallengeOrder <= teamOrder)
      .sort((a, b) => a.firstChallengeOrder - b.firstChallengeOrder);
    const target = candidates.length > 0
      ? candidates[candidates.length - 1].firstChallengeOrder
      : (overrideRoundOptions[0]?.firstChallengeOrder ?? 1);
    setOverrideTargetRound(target);
    setShowProgressOverrideModal(true);
  };

  const handleSaveProgressOverride = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    const targetOrder = parseInt(overrideTargetRound, 10) || 1;
    const targetOption = overrideRoundOptions.find((o) => o.firstChallengeOrder === targetOrder);
    const roundLabel = targetOption?.roundName || `Order ${targetOrder}`;
    try {
      await adminOverride({ team_name: activeTeam.name, target_challenge_order: targetOrder });

      setTeams(teams.map(t => {
        if (t.id === activeTeam.id || t.name === activeTeam.name) {
          return {
            ...t,
            round: targetOrder
          };
        }
        return t;
      }));

      pushLocalLog({
        teamName: activeTeam.name,
        challengeTitle: 'Progress Override',
        answer: `Progress force-set to ${roundLabel}.`,
      });

      setShowProgressOverrideModal(false);
      setActiveTeam(null);
      alert(`SUCCESS: Team "${activeTeam.name}" progress updated to ${roundLabel}.`);
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to override progress on backend:", err);
      alert("Failed to override progress on backend:\n" + (err.message || "Unknown error"));
    }
  };

  const handleForceSkipChallenge = async (challenge) => {
    if (!challenge) return;
    const targetOrder = challenge.order_number || challenge.round || 1;
    const teamsInRound = teams.filter(t => t.round === targetOrder);

    try {
      const skipPromises = teamsInRound.map(t =>
        adminOverride({ team_name: t.name, target_challenge_order: targetOrder + 1 }).catch(err => {
          console.warn(`Could not skip for team ${t.name}:`, err);
        })
      );
      await Promise.all(skipPromises);

      const skippedNames = new Set(teamsInRound.map((t) => t.name));
      setTeams(teams.map((t) => (skippedNames.has(t.name) ? { ...t, round: targetOrder + 1 } : t)));

      setShowSkipConfirmModal(false);
      setActiveChallenge(null);
      setSkipConfirmInput('');
      alert(`SUCCESS: All teams on challenge ${targetOrder} advanced to challenge ${targetOrder + 1}.`);
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to skip challenge on backend:", err);
      alert("Failed to skip challenge on backend:\n" + (err.message || "Unknown error"));
    }
  };

  // CHALLENGE HANDLERS
  const handleToggleLockChallenge = async (challengeId, currentLockStatus) => {
    const chal = challenges.find((c) => c.id === challengeId);
    if (!chal) return;
    const newActiveStatus = currentLockStatus; // If true (locked), newActiveStatus is true (unlock)
    const payload = buildChallengePayload(chal, { is_active: newActiveStatus });

    try {
      const targetId = chal.raw?.id || chal.id || chal.raw?.order_number || chal.order_number;
      await updateChallenge(targetId, payload);
      setChallenges(challenges.map((c) => (c.id === challengeId ? { ...c, isLocked: !newActiveStatus } : c)));
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to toggle challenge lock status:", err);
      alert(err.message || 'Failed to toggle challenge lock status');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this challenge? This action cannot be undone.")) return;
    const chal = challenges.find((c) => c.id === challengeId);
    if (!chal) return;
    try {
      const targetId = chal.raw?.id || chal.id || chal.raw?.order_number || chal.order_number;
      await deleteChallenge(targetId);
      setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to delete challenge:", err);
      alert(err.message || 'Failed to delete challenge');
    }
  };

  // API Endpoint: PATCH /api/admin/challenges/:id/hints/:hintId/toggle (applied per-hint)
  const handleToggleHintChallenge = async (challengeId, currentHintStatus) => {
    const chal = challenges.find((c) => c.id === challengeId);
    if (!chal) return;
    const hintsList = chal.hints || [];
    if (hintsList.length === 0) {
      alert('This challenge has no hints yet — add a hint before toggling hint visibility.');
      return;
    }

    const targetVisible = !currentHintStatus;
    const targetChallengeId = chal.raw?.id || challengeId;

    try {
      const togglePromise = Promise.all(
        hintsList
          .filter((h) => Boolean(h.is_visible) !== targetVisible)
          .map((h) => toggleHint(targetChallengeId, h.id))
      );

      setChallenges(challenges.map((c) => (c.id === challengeId ? {
        ...c,
        hints: (c.hints || []).map((h) => ({ ...h, is_visible: targetVisible })),
        hintsEnabled: targetVisible,
      } : c)));

      await togglePromise;
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to toggle hints on backend:', err);
      alert('Failed to toggle hints on backend:\n' + (err.message || 'Unknown error'));
      refreshLiveInBackground();
    }
  };

  const handleOpenEditAnswer = (challenge) => {
    setActiveChallenge(challenge);
    const existingAnswer = challenge?.answer || '';
    setEditAnswerValue(existingAnswer.startsWith('$2b$') ? '' : existingAnswer);
    setShowEditAnswerModal(true);
  };

  const handleSaveEditAnswer = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    const trimmed = editAnswerValue.trim();
    if (!trimmed) {
      alert("Please enter a non-empty decryption answer key.");
      return;
    }

    const payload = buildChallengePayload(activeChallenge, { answer_key: trimmed });

    try {
      const challengeId = activeChallenge.raw?.id || activeChallenge.id || activeChallenge.order_number;
      await updateChallenge(challengeId, payload);

      saveKnownAnswer(challengeId, trimmed);
      if (activeChallenge.round) {
        saveKnownAnswer(activeChallenge.round, trimmed);
      }

      setChallenges(challenges.map((c) => (c.id === activeChallenge.id ? { ...c, answer: trimmed, rawAnswer: trimmed, isHashedAnswer: false } : c)));

      setShowEditAnswerModal(false);
      setActiveChallenge(null);
      setEditAnswerValue('');
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to update challenge answer key on backend:", err);
      alert("Failed to update answer key on backend:\n" + (err.message || "Validation Error"));
    }
  };

  const handleOpenOverrideChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setOverrideChallengeTeamId('');
    setShowOverrideChallengeModal(true);
  };

  const handleSaveOverrideChallenge = async (e) => {
    e.preventDefault();
    if (!activeChallenge || !overrideChallengeTeamId) return;

    const team = teams.find(t => t.id === overrideChallengeTeamId);
    if (!team) return;

    try {
      const targetOrder = (activeChallenge.order_number || activeChallenge.round || 1) + 1;
      await adminOverride({
        team_name: team.name,
        target_challenge_order: targetOrder,
      });
      setTeams(teams.map((t) => (t.id === team.id ? { ...t, round: targetOrder } : t)));
      setShowOverrideChallengeModal(false);
      setActiveChallenge(null);
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to override challenge:", err);
      alert("Failed to override challenge: " + (err.message || "Unknown error"));
    }
  };

  // --- ROUND MANAGEMENT HANDLERS ---
  // API Endpoints: POST/PUT /api/admin/challenges/rounds (+ reorder)
  const overrideRoundOptions = useMemo(() => {
    const sortedRounds = [...rounds].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
    return sortedRounds.map((r) => {
      const roundChallenges = challenges
        .filter((c) => c.raw?.round_id ? c.raw.round_id === r.id : (c.round || 1) === (r.order_number || 1))
        .sort((a, b) => (a.order_number || a.round || 0) - (b.order_number || b.round || 0));
      const firstOrder = roundChallenges[0]?.order_number || (roundChallenges.length > 0 ? roundChallenges[0].round : null);
      return {
        roundId: r.id,
        roundName: r.name || `Round ${r.order_number}`,
        roundOrder: r.order_number || 1,
        firstChallengeOrder: firstOrder ?? (r.order_number || 1),
      };
    });
  }, [rounds, challenges]);

  const resetRoundForm = () => {
    setActiveRound(null);
    setNewRoundName('');
    setNewRoundTimeLimit(0);
    setNewRoundOrder('');
    setNewRoundIsActive(true);
    setNewRoundFragmentTitle('');
    setNewRoundFragmentHeader('');
    setNewRoundFragmentContent('');
  };

  const handleOpenCreateRound = () => {
    resetRoundForm();
    setShowRoundModal(true);
  };

  const handleOpenEditRound = (round) => {
    setActiveRound(round);
    setNewRoundName(round.name || '');
    setNewRoundTimeLimit(round.time_limit || 0);
    setNewRoundOrder(round.order_number != null ? String(round.order_number) : '');
    setNewRoundIsActive(round.is_active !== false);
    setNewRoundFragmentTitle(round.story_fragment?.title || '');
    setNewRoundFragmentHeader(round.story_fragment?.header || '');
    setNewRoundFragmentContent(round.story_fragment?.content || '');
    setShowRoundModal(true);
  };

  const handleSaveRound = async (e) => {
    e.preventDefault();
    const nameVal = newRoundName.trim();
    if (!nameVal) {
      alert('Please enter a round name.');
      return;
    }
    const payload = {
      name: nameVal,
      time_limit: Math.max(0, Number(newRoundTimeLimit) || 0),
      ...(newRoundOrder.trim() !== '' ? { order_number: parseInt(newRoundOrder, 10) || 1 } : {}),
      is_active: newRoundIsActive,
    };
    const fragmentTitle = newRoundFragmentTitle.trim();
    const fragmentHeader = newRoundFragmentHeader.trim();
    const fragmentContent = newRoundFragmentContent.trim();
    if (fragmentTitle || fragmentHeader || fragmentContent) {
      payload.story_fragment = {
        title: fragmentTitle || nameVal,
        header: fragmentHeader || 'TRANSMISSION RECEIVED',
        content: fragmentContent || fragmentTitle || `${nameVal} classified transmission fragment decrypted.`,
      };
    }

    try {
      if (activeRound) {
        await updateRound(activeRound.id, payload);
        setRounds(rounds.map((r) => (r.id === activeRound.id ? {
           ...r,
           name: payload.name,
           time_limit: payload.time_limit,
           ...(payload.order_number !== undefined ? { order_number: payload.order_number } : {}),
          is_active: payload.is_active,
          ...(payload.story_fragment ? { story_fragment: payload.story_fragment } : {}),
        } : r)));
      } else {
        const res = await createRound(payload);
        const created = res?.data || payload;
        setRounds([...rounds, {
          id: created.id || `round-${Date.now()}`,
           name: payload.name,
           order_number: payload.order_number ?? (rounds.length + 1),
           time_limit: payload.time_limit,
           story_fragment: payload.story_fragment || null,
          is_active: payload.is_active,
        }]);
      }
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: activeRound ? 'Edit Round' : 'Create Round',
        answer: `Round "${nameVal}" ${activeRound ? 'updated' : 'created'}.`,
      });
      resetRoundForm();
      setShowRoundModal(false);
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to save round:', err);
      alert('Failed to save round: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenDeleteRound = (round) => {
    setActiveRound(round);
    setDeleteRoundId('');
    setShowDeleteRoundConfirmModal(true);
  };

  const handleDeleteRound = async () => {
    if (!activeRound) return;
    if (deleteRoundId.trim().toUpperCase() !== activeRound.name.trim().toUpperCase()) {
      alert(`Type "${activeRound.name.toUpperCase()}" to confirm deletion.`);
      return;
    }
    const challengeCount = challenges.filter((c) =>
      c.raw?.round_id ? c.raw.round_id === activeRound.id : (c.round || 1) === (activeRound.order_number || 1)
    ).length;

    try {
      if (isUUID(activeRound.id)) {
        await deleteRound(activeRound.id);
      } else if (challengeCount > 0) {
        alert(`Cannot delete round with ${challengeCount} challenge(s) assigned. Move or delete those challenges first.`);
        return;
      }
      setRounds(rounds.filter((r) => r.id !== activeRound.id));
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Delete Round',
        answer: `Round "${activeRound.name}" deleted.`,
      });
      setShowDeleteRoundConfirmModal(false);
      setActiveRound(null);
      setDeleteRoundId('');
      refreshLiveInBackground();
    } catch (err) {
      console.error('Failed to delete round:', err);
      alert('Failed to delete round:\n' + (err.message || 'Unknown error'));
      setShowDeleteRoundConfirmModal(false);
      setActiveRound(null);
      setDeleteRoundId('');
    }
  };

  
  const handlePauseRound = async (roundId) => {
    if (window.confirm("PAUSE ROUND? This will freeze the global timer for this round and stop submissions.")) {
      try {
        await pauseRoundAdmin(roundId);
        toast.success("Round paused!");
        const updated = await getAdminRounds();
        setRounds(updated);
      } catch (err) {
        toast.error(err.message || "Failed to pause round");
      }
    }
  };

  const handleResumeRound = async (roundId) => {
    if (window.confirm("RESUME ROUND? This will unfreeze the timer and shift everyone's leftover time.")) {
      try {
        await resumeRoundAdmin(roundId);
        toast.success("Round resumed!");
        const updated = await getAdminRounds();
        setRounds(updated);
      } catch (err) {
        toast.error(err.message || "Failed to resume round");
      }
    }
  };

  
  
  const isCicadaStarted = rounds.length > 0 && rounds.some(r => r.order_number === 1 && r.started_at);
  const isCicadaPaused = rounds.length > 0 && rounds.every(r => r.is_paused);

  
  const handleResetCicada = async () => {
    if (window.confirm("RESET CICADA? This will CLEAR all team progress, completed challenges, and reset all timers to zero! THIS CANNOT BE UNDONE.")) {
      try {
        await resetCicadaAdmin();
        toast.success("Cicada Event Reset!");
        refreshLiveInBackground();
      } catch (err) {
        toast.error(err.message || "Failed to reset Cicada");
      }
    }
  };

  const handlePauseCicada = async () => {
    if (window.confirm("PAUSE CICADA? This will freeze ALL timers and lock ALL rounds immediately.")) {
      try {
        await pauseCicadaAdmin();
        toast.success("Cicada Event Paused!");
        const updated = await getAdminRounds();
        setRounds(updated);
        refreshLiveInBackground();
      } catch (err) {
        toast.error(err.message || "Failed to pause Cicada");
      }
    }
  };

  const handleResumeCicada = async () => {
    if (window.confirm("RESUME CICADA? This will unfreeze ALL timers and shift everyone's leftover time.")) {
      try {
        await resumeCicadaAdmin();
        toast.success("Cicada Event Resumed!");
        const updated = await getAdminRounds();
        setRounds(updated);
        refreshLiveInBackground();
      } catch (err) {
        toast.error(err.message || "Failed to resume Cicada");
      }
    }
  };

  const handleStartCicada = async () => {
    if (window.confirm("START CICADA? This will begin the Round 1 timer for EVERY team. Do this when the event officially begins.")) {
      try {
        await startCicadaAdmin();
        toast.success("Cicada Event Started!");
        refreshLiveInBackground();
      } catch (err) {
        toast.error(err.message || "Failed to start Cicada");
      }
    }
  };

  const handleStartRound = async (roundId) => {
    if (window.confirm(`START ROUND? This will set the started_at timestamp and begin the global timer for this round.`)) {
      try {
        await startRoundAdmin(roundId);
        toast.success('Round started!');
        // Refresh rounds
        const updated = await getAdminRounds();
        setRounds(updated);
      } catch (err) {
        toast.error(err.message || 'Failed to start round');
      }
    }
  };

  const handleReorderRound = async (roundId, direction) => {
    const sorted = [...rounds].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
    const idx = sorted.findIndex((r) => r.id === roundId);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    const nextRounds = reordered.map((r, i) => ({ ...r, order_number: i + 1 }));
    setRounds(nextRounds);

    try {
      if (nextRounds.every((r) => isUUID(r.id))) {
        await reorderRounds(nextRounds.map((r) => r.id));
      } else {
        console.warn('Local-only reorder: not all round ids are UUIDs, skipping backend reorder.');
      }
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Reorder Rounds',
        answer: `Round "${nextRounds[idx + direction].name}" moved ${direction < 0 ? 'up' : 'down'}.`,
      });
    } catch (err) {
      console.error('Failed to reorder rounds on backend:', err);
      alert('Failed to reorder rounds on backend:\n' + (err.message || 'Unknown error'));
      refreshLiveInBackground();
    }
  };

  const handleDeleteTeam = async (teamId) => {
    const teamName = activeTeam?.name || (teams.find(t => t.id === teamId)?.name) || teamId;

    // Immediately persist deletion locally so it never resurrects on refresh
    markTeamAsDeleted(teamName, teamId);
    if (activeTeam?.uuid) markTeamAsDeleted(teamName, activeTeam.uuid);

    try {
      let resolvedId = teamId;
      if (!isUUID(resolvedId)) {
        if (activeTeam?.uuid && isUUID(activeTeam.uuid)) {
          resolvedId = activeTeam.uuid;
        } else {
          const foundInUsers = users.find(u =>
            (u.teamId && isUUID(u.teamId)) &&
            (u.username === teamName || u.email === teamName || u.teamName === teamName)
          );
          if (foundInUsers?.teamId) {
            resolvedId = foundInUsers.teamId;
          }
        }
      }

      if (isUUID(resolvedId)) {
        markTeamAsDeleted(teamName, resolvedId);
        try {
          await deleteTeam({ team_id: resolvedId, team_name: teamName });
        } catch (apiErr) {
          console.warn("Backend delete-team returned:", apiErr);
          if (apiErr.status !== 404 && !apiErr.message?.includes('not found')) {
            throw apiErr;
          }
        }
      } else {
        try {
          await deleteTeam({ team_name: teamName, team_id: resolvedId });
        } catch (apiErr) {
          console.warn("Backend delete-team by name returned:", apiErr);
        }
      }

      setTeams(prevTeams => {
        const updated = prevTeams.filter(t => t.id !== teamId && t.id !== resolvedId && t.name !== teamName);
        localStorage.setItem('cicada_teams', JSON.stringify(updated));
        return updated;
      });

      setLogs(prevLogs => prevLogs.filter(l => l.teamId !== teamId && l.teamName !== teamName));
      pushLocalLog({
        teamName: 'SYSTEM',
        challengeTitle: 'Delete Team',
        answer: `Team "${teamName}" permanently purged.`,
      });

      setShowDeleteConfirmModal(false);
      setActiveTeam(null);
      setDeleteConfirmInput('');
      alert(`SUCCESS: Team "${teamName}" has been permanently purged.`);
      refreshLiveInBackground();
    } catch (err) {
      console.error("Failed to delete team:", err);
      setTeams(prevTeams => {
        const updated = prevTeams.filter(t => t.id !== teamId && t.name !== teamName);
        localStorage.setItem('cicada_teams', JSON.stringify(updated));
        return updated;
      });
      setShowDeleteConfirmModal(false);
      setActiveTeam(null);
      setDeleteConfirmInput('');
      alert(`SUCCESS: Team "${teamName}" has been permanently purged.`);
    }
  };


  // --- FILTERED LOGS & TEAMS ---
  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    t.members.some(m => m.toLowerCase().includes(teamSearch.toLowerCase()))
  );

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.teamName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.challengeTitle.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.answer.toLowerCase().includes(logSearch.toLowerCase());

    if (logStatusFilter === 'correct') {
      return matchesSearch && l.correct === true;
    }
    if (logStatusFilter === 'incorrect') {
      return matchesSearch && l.correct === false;
    }
    return matchesSearch;
  });

  // --- EXPORT FUNCTIONS ---
  const getLeaderboardData = () => {
    // Sort teams by points descending, then by round descending
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.round - a.round;
    });
  };

  const exportToCSV = () => {
    const data = getLeaderboardData();
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Rank,Team ID,Team Name,Members,Current Round,Points,Status\n';

    data.forEach((team, index) => {
      const rank = index + 1;
      const membersStr = `"${team.members.join(', ')}"`;
      const row = `${rank},${team.id},"${team.name}",${membersStr},Round ${team.round},${team.points},${team.status}`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cicada_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const unlockedCount = challenges.filter((c) => !c.isLocked).length;
  const highScore = teams.length > 0 ? Math.max(...teams.map((t) => t.points)) : 0;

  return {
    handleStartCicada,
    handlePauseCicada,
    handleResumeCicada,
    isCicadaStarted,
    isCicadaPaused,
    logout,
    authUser,
    isAuthenticated,
    setIsAuthenticated,
    usernameInput,
    setUsernameInput,
    passwordInput,
    setPasswordInput,
    loginError,
    setLoginError,
    teams,
    setTeams,
    challenges,
    setChallenges,
    rounds,
    setRounds,
    overrideRoundOptions,
    showRoundModal,
    setShowRoundModal,
    activeRound,
    setActiveRound,
    newRoundName,
    setNewRoundName,
      newRoundTimeLimit,
      setNewRoundTimeLimit,
      newRoundOrder,
    setNewRoundOrder,
    newRoundIsActive,
    setNewRoundIsActive,
    newRoundFragmentTitle,
    setNewRoundFragmentTitle,
    newRoundFragmentHeader,
    setNewRoundFragmentHeader,
    newRoundFragmentContent,
    setNewRoundFragmentContent,
    deleteRoundId,
    setDeleteRoundId,
    showDeleteRoundConfirmModal,
    setShowDeleteRoundConfirmModal,
    handleOpenCreateRound,
    handleOpenEditRound,
    handleSaveRound,
    handleOpenDeleteRound,
    handleDeleteRound,
    handleReorderRound,
    logs,
    setLogs,
    activeTab,
    setActiveTab,
    teamSearch,
    setTeamSearch,
    logSearch,
    setLogSearch,
    logStatusFilter,
    setLogStatusFilter,
    showCreateTeamModal,
    setShowCreateTeamModal,
    showEditTeamModal,
    setShowEditTeamModal,
    showResetPwdModal,
    setShowResetPwdModal,
    showProgressOverrideModal,
    setShowProgressOverrideModal,
    showEditAnswerModal,
    setShowEditAnswerModal,
    showOverrideChallengeModal,
    setShowOverrideChallengeModal,
    activeTeam,
    setActiveTeam,
    activeChallenge,
    setActiveChallenge,
    newTeamName,
    setNewTeamName,
    newTeamMembers,
    setNewTeamMembers,
    newTeamPassword,
    setNewTeamPassword,
    editTeamName,
    setEditTeamName,
    editTeamMembers,
    setEditTeamMembers,
    editTeamPoints,
    setEditTeamPoints,
    editTeamStatus,
    setEditTeamStatus,
    manuallyResetPassword,
    setManuallyResetPassword,
    overrideTargetRound,
    setOverrideTargetRound,
    editAnswerValue,
    setEditAnswerValue,
    overrideChallengeTeamId,
    setOverrideChallengeTeamId,
    users,
    setUsers,
    userSearch,
    setUserSearch,
    showAdjustScoreModal,
    setShowAdjustScoreModal,
    adjustScoreType,
    setAdjustScoreType,
    adjustScoreValue,
    setAdjustScoreValue,
    showCreateChallengeModal,
    setShowCreateChallengeModal,
    editingChallenge,
    setEditingChallenge,
    handleOpenEditChallenge,
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeRound,
    setNewChallengeRound,
    newChallengeArchive,
    setNewChallengeArchive,
    newChallengeAnswer,
    setNewChallengeAnswer,
    newChallengePoints,
    setNewChallengePoints,
    newChallengeTimeLimit,
    setNewChallengeTimeLimit,
    newChallengeAssets,
    setNewChallengeAssets,
      newChallengeHints,
      setNewChallengeHints,
    newChallengeFragmentTitle,
    setNewChallengeFragmentTitle,
    newChallengeFragmentHeader,
    setNewChallengeFragmentHeader,
    newChallengeFragmentContent,
    setNewChallengeFragmentContent,
    tempAssetName,
    setTempAssetName,
    tempAssetUrl,
    setTempAssetUrl,
    tempAssetSet,
    setTempAssetSet,
    showTimeLimitModal,
    setShowTimeLimitModal,
    editTimeLimitValue,
    setEditTimeLimitValue,
    showEditAssetModal,
    setShowEditAssetModal,
    activeAsset,
    setActiveAsset,
    activeAssetChallengeId,
    setActiveAssetChallengeId,
    editAssetName,
    setEditAssetName,
    editAssetUrl,
    setEditAssetUrl,
    editAssetSet,
    setEditAssetSet,
    editTeamAssetSet,
    setEditTeamAssetSet,
    dragOverChallengeId,
    setDragOverChallengeId,
    showBulkImportAdminsModal,
    setShowBulkImportAdminsModal,
    bulkAdminsCSVText,
    setBulkAdminsCSVText,
    safeguardActive,
    setSafeguardActive,
    ipTrackingEnabled,
    setIpTrackingEnabled,
    ipTrackingLoading,
    handleToggleIpTracking,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    deleteConfirmInput,
    setDeleteConfirmInput,
    showSkipConfirmModal,
    setShowSkipConfirmModal,
    skipConfirmInput,
    setSkipConfirmInput,
    showResetChallengeConfirmModal,
    setShowResetChallengeConfirmModal,
    resetChallengeConfirmInput,
    setResetChallengeConfirmInput,
    showResetDemoConfirmModal,
    setShowResetDemoConfirmModal,
    resetDemoConfirmInput,
    setResetDemoConfirmInput,
    showResetLeaderboardConfirmModal,
    setShowResetLeaderboardConfirmModal,
    resetLeaderboardConfirmInput,
    setResetLeaderboardConfirmInput,
    openActionMenu,
    setOpenActionMenu,
    liveLoading,
    setLiveLoading,
    liveError,
    setLiveError,
    navigate,
    isOAuthAdmin,
    handleLogin,
    handleLogout,
    handleApproveAdmin,
    handleToggleAdminRole,
    handleDeleteUser,
    handleBulkImportAdmins,
    handleAdjustScore,
    handleRemoveMember,
    handleCreateChallenge,
    handleAddAssetToChallenge,
    handleRemoveAssetFromChallenge,
    handleUpdateTimeLimit,
    handleAddAssetToChallengeDirect,
    handleEditAssetSave,
    handleDeleteAsset,
    handleResetTeamProgress,
    handleResetLeaderboard,
    handleCreateTeam,
    handleOpenEditTeam,
    handleSaveTeamEdit,
    handleOpenDeleteConfirm,
    handleOpenResetPassword,
    handleSaveResetPassword,
    handleOpenProgressOverride,
    handleSaveProgressOverride,
    handleToggleLockChallenge,
    handleDeleteChallenge,
    handleToggleHintChallenge,
    handleOpenEditAnswer,
    handleSaveEditAnswer,
    handleOpenOverrideChallenge,
    handleSaveOverrideChallenge,
    handleForceSkipChallenge,
    handleDeleteTeam,
    refreshLive,
    filteredTeams,
    filteredLogs,
    getLeaderboardData,
    exportToCSV,
    handlePrint,
    unlockedCount,
    highScore,
    showHintModal, setShowHintModal,
    newHintText, setNewHintText,
    newHintUnlockMinutes, setNewHintUnlockMinutes,
    handleOpenHintModal, handleAddHint, handleDeleteHint, handleToggleHintVisibility
  };
}


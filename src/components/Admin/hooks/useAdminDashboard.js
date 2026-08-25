import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import {
  listUsers, getAdminChallenges, getAdminProgress, getLeaderboard,
  approveAdmin, toggleRole, deleteUser, bulkImportAdmins,
  createChallenge, updateChallenge, addAsset, deleteChallenge, adminOverride,
  removeTeamMember, deleteTeam,
  getIpTrackingStatus, toggleIpTracking,
} from '../../../api/admin';
import {
  INITIAL_TEAMS,
  INITIAL_CHALLENGES,
  INITIAL_USERS,
  INITIAL_LOGS,
  DEFAULT_CREDENTIALS,
} from '../constants';

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
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('cicada_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

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

  // Challenge Creation State
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeRound, setNewChallengeRound] = useState(1);
  const [newChallengeAnswer, setNewChallengeAnswer] = useState('');
  const [newChallengePoints, setNewChallengePoints] = useState(100);
  const [newChallengeTimeLimit, setNewChallengeTimeLimit] = useState(0);
  const [newChallengeAssets, setNewChallengeAssets] = useState([]);
  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');

  // Time Limit State
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [editTimeLimitValue, setEditTimeLimitValue] = useState(0);

  // Asset Management States
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [activeAssetChallengeId, setActiveAssetChallengeId] = useState('');
  const [editAssetName, setEditAssetName] = useState('');
  const [editAssetUrl, setEditAssetUrl] = useState('');
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

  // --- LOAD LIVE BACKEND DATA (when opened through the authenticated admin flow) ---
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  const parseIpStatus = (res) => {
    if (!res) return null;
    const root = res.data || res;
    if (typeof root.ip_tracking_enabled === 'boolean') return root.ip_tracking_enabled;
    if (typeof root.ip_blocking_enabled === 'boolean') return root.ip_blocking_enabled;
    if (typeof root.enabled === 'boolean') return root.enabled;
    if (typeof root.tracking === 'boolean') return root.tracking;
    if (typeof root.is_enabled === 'boolean') return root.is_enabled;
    if (typeof root.status === 'string') return root.status === 'enabled' || root.status === 'active';
    return null;
  };

  const refreshLive = async () => {
    if (!isAuthenticated || !isOAuthAdmin) return;
    setLiveLoading(true);
    setLiveError('');
    try {
      const [u, ch, prog, lb, ipStatus] = await Promise.all([
        listUsers().catch((err) => { console.warn('Could not fetch users:', err); return { data: [] }; }),
        getAdminChallenges().catch((err) => { console.warn('Could not fetch challenges:', err); return { data: [] }; }),
        getAdminProgress().catch((err) => { console.warn('Could not fetch progress:', err); return { data: [] }; }),
        getLeaderboard().catch((err) => { console.warn('Could not fetch leaderboard:', err); return { data: [] }; }),
        getIpTrackingStatus().catch((err) => { console.warn('Could not fetch IP tracking status:', err); return null; }),
      ]);

      const parsedIp = parseIpStatus(ipStatus);
      if (parsedIp !== null) {
        setIpTrackingEnabled(parsedIp);
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

      if (Array.isArray(ch?.data) && ch.data.length > 0) {
        setChallenges(ch.data.map((x) => ({
          id: x.id,
          title: x.name,
          round: x.order_number,
          answer: x.answer_key || '',
          points: x.points || 0,
          isLocked: x.is_active === false,
          hintsEnabled: true,
          solvedCount: solvedCountsByRound[x.order_number] || 0,
          timeLimit: x.time_limit || 0,
          assets: (x.assets || []).map((a) => ({ name: a.name || 'asset', url: a.url || '#' })),
        })));
      }

      const lbMap = {};
      (lb?.data || []).forEach((t) => { lbMap[t.team_name] = t.challenges_completed; });
      const membersByTeamId = {};
      const membersByTeamName = {};
      const teamIdByName = {};
      (u?.data || []).forEach((x) => {
        const label = x.display_name || x.email;
        if (x.team_id) {
          (membersByTeamId[x.team_id] ||= []).push(label);
        }
        const joinedName = x.teams?.name || x.team_name;
        if (joinedName) {
          (membersByTeamName[joinedName] ||= []).push(label);
          teamIdByName[joinedName] = x.teams?.id || x.team_id || joinedName;
        }
      });

      if (Array.isArray(prog?.data) && prog.data.length > 0) {
        setTeams(prog.data.map((t) => {
          const teamKey = t.team_id || teamIdByName[t.team_name] || t.team_name;
          return {
            id: teamKey,
            name: t.team_name,
            members: membersByTeamId[t.team_id] || membersByTeamName[t.team_name] || [],
            round: t.current_challenge_order || 1,
            points: lbMap[t.team_name] != null ? lbMap[t.team_name] : (t.challenges_solved || 0),
            status: 'active',
          };
        }));
      }
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
      await refreshLive();
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
      await refreshLive();
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
        await refreshLive();
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
      await refreshLive();
      alert('SUCCESSFULLY IMPORTED ADMINISTRATORS.');
      setBulkAdminsCSVText('');
      setShowBulkImportAdminsModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to import admins: ' + (err.message || 'Unknown error'));
    }
  };

  // --- SCORE ADJUSTMENT HANDLER ---
  const handleAdjustScore = (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    const value = parseInt(adjustScoreValue) || 0;
    setTeams(teams.map(t => {
      if (t.id === activeTeam.id) {
        let newPoints = t.points;
        if (adjustScoreType === 'add') {
          newPoints += value;
        } else if (adjustScoreType === 'subtract') {
          newPoints = Math.max(0, newPoints - value);
        } else if (adjustScoreType === 'set') {
          newPoints = value;
        }
        return { ...t, points: newPoints };
      }
      return t;
    }));

    const newLog = {
      id: `log-${Date.now()}`,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      challengeId: 'score_adjust',
      challengeTitle: 'Score Adjustment',
      answer: `Adjusted: ${adjustScoreType.toUpperCase()} ${value} pts.`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setShowAdjustScoreModal(false);
    setActiveTeam(null);
    setAdjustScoreValue(0);
  };

  // --- MEMBER REMOVAL HANDLER ---
  // API Endpoint: POST 06_Remove_Member
  const handleRemoveMember = async (teamId, memberName) => {
    if (window.confirm(`REMOVE "${memberName.toUpperCase()}" FROM TEAM?`)) {
      try {
        const foundUser = users.find(u => u.username === memberName || u.email === memberName);
        await removeTeamMember({
          target_user_id: foundUser?.id || undefined,
          target_email: foundUser?.email || (!foundUser?.id ? memberName : undefined),
          team_id: teamId,
        });
        await refreshLive();
      } catch (err) {
        console.error(err);
        alert('Failed to remove member: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // --- CHALLENGE OPERATION HANDLERS ---
  // API Endpoint: POST Create Challenge with All Assets (Admin)
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    const parsedLimit = parseInt(newChallengeTimeLimit) || 0;
    try {
      await createChallenge({
        order_number: parseInt(newChallengeRound) || 1,
        name: newChallengeTitle.trim(),
        answer_key: newChallengeAnswer.trim() || 'decrypted_key',
        time_limit: parsedLimit,
        is_active: false,
        assets: (newChallengeAssets || []).map((a) => ({ type: 'file', url: a.url || '#', name: a.name || 'asset' })),
      });
      await refreshLive();
      setNewChallengeTitle('');
      setNewChallengeAnswer('');
      setNewChallengePoints(100);
      setNewChallengeTimeLimit(0);
      setNewChallengeAssets([]);
      setTempAssetName('');
      setTempAssetUrl('');
      setShowCreateChallengeModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create challenge: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAddAssetToChallenge = () => {
    if (!tempAssetName.trim()) return;
    const newAsset = {
      name: tempAssetName.trim(),
      url: tempAssetUrl.trim() || '#'
    };
    setNewChallengeAssets([...newChallengeAssets, newAsset]);
    setTempAssetName('');
    setTempAssetUrl('');
  };

  const handleRemoveAssetFromChallenge = (idxToRemove) => {
    setNewChallengeAssets(newChallengeAssets.filter((_, idx) => idx !== idxToRemove));
  };

  // API Endpoint: PUT Update Challenge Time Limit (Admin)
  const handleUpdateTimeLimit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    const newLimit = parseInt(editTimeLimitValue) || 0;
    try {
      await updateChallenge(activeChallenge.id, { time_limit: newLimit });
      await refreshLive();
      setShowTimeLimitModal(false);
      setActiveChallenge(null);
    } catch (err) {
      console.error("Failed to update challenge time limit on backend:", err);
      alert("Failed to update time limit on backend: " + (err.message || "Unknown error"));
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
          type: 'file',
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

      const chal = challenges.find(c => c.id === challengeId);
      const newLog = {
        id: `log-${Date.now()}`,
        teamId: 'system',
        teamName: 'SYSTEM',
        challengeId: challengeId,
        challengeTitle: 'Add Asset',
        answer: `Asset "${newAsset.name}" added to challenge "${chal ? chal.title : challengeId}"`,
        correct: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
    } catch (err) {
      alert(err.message || 'Failed to add asset');
    }
  };

  // API Endpoint: PUT Edit Asset
  const handleEditAssetSave = (e) => {
    e.preventDefault();
    if (!activeAsset || !activeAssetChallengeId) return;

    setChallenges(challenges.map(c => {
      if (c.id === activeAssetChallengeId) {
        return {
          ...c,
          assets: (c.assets || []).map(a => {
            if (a.name === activeAsset.name) {
              return { name: editAssetName.trim(), url: editAssetUrl.trim() || '#' };
            }
            return a;
          })
        };
      }
      return c;
    }));

    const chal = challenges.find(c => c.id === activeAssetChallengeId);
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: 'system',
      teamName: 'SYSTEM',
      challengeId: activeAssetChallengeId,
      challengeTitle: 'Edit Asset',
      answer: `Asset "${activeAsset.name}" renamed to "${editAssetName}" in challenge "${chal ? chal.title : activeAssetChallengeId}"`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setShowEditAssetModal(false);
    setActiveAsset(null);
    setActiveAssetChallengeId('');
    setEditAssetName('');
    setEditAssetUrl('');
  };

  // API Endpoint: DEL Delete Asset
  const handleDeleteAsset = (challengeId, assetName) => {
    if (window.confirm(`PERMANENTLY DELETE ASSET "${assetName.toUpperCase()}" FROM CHALLENGE?`)) {
      setChallenges(challenges.map(c => {
        if (c.id === challengeId) {
          return {
            ...c,
            assets: (c.assets || []).filter(a => a.name !== assetName)
          };
        }
        return c;
      }));

      const chal = challenges.find(c => c.id === challengeId);
      const newLog = {
        id: `log-${Date.now()}`,
        teamId: challengeId,
        teamName: 'SYSTEM',
        challengeId: challengeId,
        challengeTitle: 'Delete Asset',
        answer: `Asset "${assetName}" deleted from challenge "${chal ? chal.title : challengeId}"`,
        correct: false,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
    }
  };

  // API Endpoint: POST Reset Team Progress (Admin)
  const handleResetTeamProgress = (teamId, teamName) => {
    if (window.confirm(`RESET ALL PROGRESS FOR "${teamName.toUpperCase()}"? THIS RESETS ROUND TO 1 AND POINTS TO 0.`)) {
      setTeams(teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            round: 1,
            points: 0
          };
        }
        return t;
      }));

      const newLog = {
        id: `log-${Date.now()}`,
        teamId: teamId,
        teamName: teamName,
        challengeId: 'system',
        challengeTitle: 'Reset Team Progress',
        answer: 'Team progress and score reset to default',
        correct: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
    }
  };

  // API Endpoint: POST Reset Leaderboard
  const handleResetLeaderboard = () => {
    setTeams(teams.map(t => ({ ...t, points: 0, round: 1 })));
    
    // Lock all challenges except Round 1
    setChallenges(challenges.map(c => ({
      ...c,
      isLocked: c.round > 1,
      solvedCount: 0
    })));

    const newLog = {
      id: `log-${Date.now()}`,
      teamId: 'system',
      teamName: 'SYSTEM',
      challengeId: 'reset_leaderboard',
      challengeTitle: 'Reset Leaderboard',
      answer: 'Leaderboard score reset: All scores set to 0. Challenges locked.',
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog]);
  };

  // TEAM HANDLERS
  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      members: newTeamMembers.split(',').map(m => m.trim()).filter(Boolean),
      round: 1,
      points: 0,
      status: 'active'
    };

    setTeams([...teams, newTeam]);
    
    // Add a submission log entry for team creation
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: newTeam.id,
      teamName: newTeam.name,
      challengeId: 'system',
      challengeTitle: 'System Registration',
      answer: `Registered with password: ${newTeamPassword || 'auto-generated'}`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    // Reset inputs
    setNewTeamName('');
    setNewTeamMembers('');
    setNewTeamPassword('');
    setShowCreateTeamModal(false);
  };

  const handleOpenEditTeam = (team) => {
    setActiveTeam(team);
    setEditTeamName(team.name);
    setEditTeamMembers(team.members.join(', '));
    setEditTeamPoints(team.points);
    setEditTeamStatus(team.status);
    setShowEditTeamModal(true);
  };

  const handleSaveTeamEdit = (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    setTeams(teams.map(t => {
      if (t.id === activeTeam.id) {
        return {
          ...t,
          name: editTeamName,
          members: editTeamMembers.split(',').map(m => m.trim()).filter(Boolean),
          points: parseInt(editTeamPoints) || 0,
          status: editTeamStatus
        };
      }
      return t;
    }));

    setShowEditTeamModal(false);
    setActiveTeam(null);
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

  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    // In a real backend, this updates the authentication DB
    alert(`PASSWORD RESET INITIATED FOR ${activeTeam.name.toUpperCase()}.\nNEW PASSWORD: ${manuallyResetPassword || 'Auto-generated-secret-pwd'}`);
    
    // Log password reset
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      challengeId: 'system',
      challengeTitle: 'Password Reset',
      answer: `Password updated ${manuallyResetPassword ? 'manually' : 'automatically'}`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setShowResetPwdModal(false);
    setActiveTeam(null);
  };

  const handleOpenProgressOverride = (team) => {
    setActiveTeam(team);
    setOverrideTargetRound(team.round);
    setShowProgressOverrideModal(true);
  };

  const handleSaveProgressOverride = (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    adminOverride({ team_name: activeTeam.name, target_challenge_order: parseInt(overrideTargetRound) || 1 })
      .catch((err) => console.error(err));

    setTeams(teams.map(t => {
      if (t.id === activeTeam.id) {
        return {
          ...t,
          round: parseInt(overrideTargetRound)
        };
      }
      return t;
    }));

    // Log progress override
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      challengeId: 'system',
      challengeTitle: 'Progress Override',
      answer: `Advanced to Round ${overrideTargetRound} manually`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setShowProgressOverrideModal(false);
    setActiveTeam(null);
  };

  // CHALLENGE HANDLERS
  const handleToggleLockChallenge = async (challengeId, currentLockStatus) => {
    try {
      const newActiveStatus = currentLockStatus; // If true (locked), we unlock (active: true)
      await updateChallenge(challengeId, { is_active: newActiveStatus });
      setChallenges(challenges.map(c => {
        if (c.id === challengeId) {
          return { ...c, isLocked: !currentLockStatus };
        }
        return c;
      }));
    } catch (err) {
      alert(err.message || 'Failed to toggle challenge lock status');
    }
  };

  const handleToggleHintChallenge = (challengeId, currentHintStatus) => {
    setChallenges(challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, hintsEnabled: !currentHintStatus };
      }
      return c;
    }));
  };


  const handleOpenEditAnswer = (challenge) => {
    setActiveChallenge(challenge);
    setEditAnswerValue(challenge.answer);
    setShowEditAnswerModal(true);
  };

  const handleSaveEditAnswer = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    try {
      await updateChallenge(activeChallenge.id, { answer_key: editAnswerValue.trim() });
      await refreshLive();
      setShowEditAnswerModal(false);
      setActiveChallenge(null);
    } catch (err) {
      console.error("Failed to update challenge answer key on backend:", err);
      alert("Failed to update answer key on backend: " + (err.message || "Unknown error"));
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
      await adminOverride({
        team_name: team.name,
        target_challenge_order: (activeChallenge.round || 1) + 1,
      });
      await refreshLive();
      setShowOverrideChallengeModal(false);
      setActiveChallenge(null);
    } catch (err) {
      console.error("Failed to override challenge:", err);
      alert("Failed to override challenge: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId);
      await refreshLive();
      setShowDeleteConfirmModal(false);
      setActiveTeam(null);
      setDeleteConfirmInput('');
    } catch (err) {
      console.error("Failed to delete team:", err);
      alert("Failed to delete team on backend: " + (err.message || "Unknown error"));
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
    link.setAttribute('download', `cicada_leaderboard_${new Date().toISOString().slice(0,10)}.csv`);
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
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeRound,
    setNewChallengeRound,
    newChallengeAnswer,
    setNewChallengeAnswer,
    newChallengePoints,
    setNewChallengePoints,
    newChallengeTimeLimit,
    setNewChallengeTimeLimit,
    newChallengeAssets,
    setNewChallengeAssets,
    tempAssetName,
    setTempAssetName,
    tempAssetUrl,
    setTempAssetUrl,
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
    handleToggleHintChallenge,
    handleOpenEditAnswer,
    handleSaveEditAnswer,
    handleOpenOverrideChallenge,
    handleSaveOverrideChallenge,
    handleDeleteTeam,
    refreshLive,
    filteredTeams,
    filteredLogs,
    getLeaderboardData,
    exportToCSV,
    handlePrint,
    unlockedCount,
    highScore
  };
}

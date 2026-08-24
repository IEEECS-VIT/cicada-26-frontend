import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  listUsers, getAdminChallenges, getAdminProgress, getLeaderboard,
  approveAdmin, toggleRole, deleteUser, bulkImportAdmins,
  createChallenge, updateChallenge, adminOverride,
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
  const [newChallengeTimeLimit, setNewChallengeTimeLimit] = useState(60);
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

  useEffect(() => {
    if (!isAuthenticated || !isOAuthAdmin) return;
    let cancelled = false;
    setLiveLoading(true);
    setLiveError('');
    (async () => {
      try {
        const [u, ch, prog, lb] = await Promise.all([
          listUsers(), getAdminChallenges(), getAdminProgress(), getLeaderboard(),
        ]);
        if (cancelled) return;
        setUsers((u.data || []).map((x) => ({
          id: x.id,
          username: x.display_name || x.email,
          email: x.email,
          role: x.role === 'admin' || x.role === 'GOD' ? 'Admin' : 'Participant',
          isApprovedAdmin: x.role === 'admin' || x.role === 'GOD' ? x.is_admin_approved !== false : false,
          teamId: x.team_id || null,
        })));
        setChallenges((ch.data || []).map((x) => ({
          id: x.id,
          title: x.name,
          round: x.order_number,
          answer: x.answer_key || '',
          points: x.points || 0,
          isLocked: x.is_active === false,
          hintsEnabled: true,
          solvedCount: 0,
          timeLimit: x.time_limit || 0,
          assets: (x.assets || []).map((a) => ({ name: a.name || 'asset', url: a.url || '#' })),
        })));
        const lbMap = {};
        (lb.data || []).forEach((t) => { lbMap[t.team_name] = t.challenges_completed; });
        const membersByTeamId = {};
        const membersByTeamName = {};
        const teamIdByName = {};
        (u.data || []).forEach((x) => {
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
        setTeams((prog.data || []).map((t) => {
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
      } catch (err) {
        if (!cancelled) setLiveError(err.message || 'Failed to load live data.');
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOAuthAdmin]);

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
  const handleApproveAdmin = (userId) => {
    approveAdmin({ target_user_id: userId }).catch((err) => console.error(err));
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, isApprovedAdmin: true };
      }
      return u;
    }));
    
    const targetUser = users.find(u => u.id === userId);
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: 'system',
      teamName: 'SYSTEM',
      challengeId: 'admin_security',
      challengeTitle: 'Approve Admin',
      answer: `Admin Approved: ${targetUser ? targetUser.username : userId}`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);
  };

  // API Endpoint: POST 10_Toggle_Admin_Role
  const handleToggleAdminRole = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    const newRole = targetUser && targetUser.role === 'Admin' ? 'participant' : 'admin';
    toggleRole({ target_user_id: userId, role: newRole }).catch((err) => console.error(err));
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newRoleUI = u.role === 'Admin' ? 'Participant' : 'Admin';
        return { 
          ...u, 
          role: newRole,
          isApprovedAdmin: newRole === 'Admin' ? u.isApprovedAdmin : false
        };
      }
      return u;
    }));
  };

  // API Endpoint: POST 12_Admin_Delete_User
  const handleDeleteUser = (userId, username) => {
    if (window.confirm(`WIPE USER ACCOUNT "${username.toUpperCase()}"? THIS REMOVES THEIR SECURITY PRIVILEGES.`)) {
      deleteUser({ target_user_id: userId }).catch((err) => console.error(err));
      setUsers(users.filter(u => u.id !== userId));
      
      const newLog = {
        id: `log-${Date.now()}`,
        teamId: 'system',
        teamName: 'SYSTEM',
        challengeId: 'admin_security',
        challengeTitle: 'Delete User Account',
        answer: `Account Purged: ${username}`,
        correct: false,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
    }
  };

  // API Endpoint: POST Bulk Import Admins from CSV
  const handleBulkImportAdmins = (e) => {
    e.preventDefault();
    if (!bulkAdminsCSVText.trim()) return;

    bulkImportAdmins({ csv_data: bulkAdminsCSVText }).catch((err) => console.error(err));

    const lines = bulkAdminsCSVText.split('\n');
    const importedUsers = [];
    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        importedUsers.push({
          id: `user-import-${Date.now()}-${idx}`,
          username: parts[0].trim(),
          email: parts[1].trim(),
          role: 'Admin',
          isApprovedAdmin: true
        });
      }
    });

    if (importedUsers.length > 0) {
      setUsers([...users, ...importedUsers]);
      alert(`SUCCESSFULLY IMPORTED ${importedUsers.length} ADMINISTRATORS.`);
      
      const newLog = {
        id: `log-${Date.now()}`,
        teamId: 'system',
        teamName: 'SYSTEM',
        challengeId: 'admin_security',
        challengeTitle: 'Bulk Import Admins',
        answer: `Imported ${importedUsers.length} administrators from CSV`,
        correct: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
    } else {
      alert('NO VALID DATA DETECTED. CHECK FORMAT (username,email).');
    }

    setBulkAdminsCSVText('');
    setShowBulkImportAdminsModal(false);
  };

  // --- SCORE ADJUSTMENT HANDLER ---
  // API Endpoint: PATCH Adjust Score Delta (Add or Subtract)
  // API Endpoint: POST Set Any Score (by Team Name)
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
      answer: `Adjusted: ${adjustScoreType.toUpperCase()} ${value} pts. Result: ${
        adjustScoreType === 'add' ? '+' : adjustScoreType === 'subtract' ? '-' : '='
      }${value}`,
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
  const handleRemoveMember = (teamId, memberName) => {
    if (window.confirm(`REMOVE "${memberName.toUpperCase()}" FROM TEAM?`)) {
      setTeams(teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            members: t.members.filter(m => m !== memberName)
          };
        }
        return t;
      }));

      const team = teams.find(t => t.id === teamId);
      const newLog = {
        id: `log-${Date.now()}`,
        teamId: teamId,
        teamName: team ? team.name : 'Unknown',
        challengeId: 'team_roster',
        challengeTitle: 'Remove Member',
        answer: `Removed member: ${memberName}`,
        correct: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        attempts: 0
      };
      setLogs([newLog, ...logs]);
      
      if (activeTeam && activeTeam.id === teamId) {
        const updatedMembers = activeTeam.members.filter(m => m !== memberName);
        setEditTeamMembers(updatedMembers.join(', '));
        setActiveTeam({ ...activeTeam, members: updatedMembers });
      }
    }
  };

  // --- CHALLENGE OPERATION HANDLERS ---
  // API Endpoint: POST Create Challenge with All Assets (Admin)
  const handleCreateChallenge = (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    createChallenge({
      order_number: parseInt(newChallengeRound) || 1,
      name: newChallengeTitle,
      answer_key: newChallengeAnswer || 'decrypted_key',
      time_limit: parseInt(newChallengeTimeLimit) || 60,
      is_active: false,
      assets: (newChallengeAssets || []).map((a) => ({ type: 'file', url: a.url || '#', name: a.name || 'asset' })),
    }).catch((err) => console.error(err));

    const newChal = {
      id: `chal-${Date.now()}`,
      title: newChallengeTitle,
      round: parseInt(newChallengeRound),
      answer: newChallengeAnswer || 'decrypted_key',
      points: parseInt(newChallengePoints) || 100,
      timeLimit: parseInt(newChallengeTimeLimit) || 60,
      isLocked: true,
      hintsEnabled: false,
      solvedCount: 0,
      assets: newChallengeAssets
    };

    setChallenges([...challenges, newChal]);

    const newLog = {
      id: `log-${Date.now()}`,
      teamId: 'system',
      teamName: 'SYSTEM',
      challengeId: newChal.id,
      challengeTitle: 'Create Challenge',
      answer: `Created: "${newChal.title}" in Round ${newChal.round} (${newChal.points} pts) with ${newChallengeAssets.length} assets`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setNewChallengeTitle('');
    setNewChallengeAnswer('');
    setNewChallengePoints(100);
    setNewChallengeTimeLimit(60);
    setNewChallengeAssets([]);
    setTempAssetName('');
    setTempAssetUrl('');
    setShowCreateChallengeModal(false);
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
  const handleUpdateTimeLimit = (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    setChallenges(challenges.map(c => {
      if (c.id === activeChallenge.id) {
        return { ...c, timeLimit: parseInt(editTimeLimitValue) || 0 };
      }
      return c;
    }));

    const newLog = {
      id: `log-${Date.now()}`,
      teamId: 'system',
      teamName: 'SYSTEM',
      challengeId: activeChallenge.id,
      challengeTitle: 'Update Challenge Time Limit',
      answer: `Time limit set to ${editTimeLimitValue} mins for "${activeChallenge.title}"`,
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 0
    };
    setLogs([newLog, ...logs]);

    setShowTimeLimitModal(false);
    setActiveChallenge(null);
  };

  // --- DIRECT ASSET MANAGEMENT HANDLERS ---
  
  // API Endpoint: POST Add Asset
  const handleAddAssetToChallengeDirect = (challengeId, fileOrAsset) => {
    let newAsset;
    if (fileOrAsset.name && fileOrAsset.size !== undefined) {
      newAsset = {
        name: fileOrAsset.name,
        url: `https://assets.cicada.org/uploads/${encodeURIComponent(fileOrAsset.name)}`
      };
    } else {
      newAsset = {
        name: fileOrAsset.name,
        url: fileOrAsset.url || '#'
      };
    }

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

  const handleSaveEditAnswer = (e) => {
    e.preventDefault();
    if (!activeChallenge) return;

    setChallenges(challenges.map(c => {
      if (c.id === activeChallenge.id) {
        return { ...c, answer: editAnswerValue };
      }
      return c;
    }));

    setShowEditAnswerModal(false);
    setActiveChallenge(null);
  };

  const handleOpenOverrideChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setOverrideChallengeTeamId('');
    setShowOverrideChallengeModal(true);
  };

  const handleSaveOverrideChallenge = (e) => {
    e.preventDefault();
    if (!activeChallenge || !overrideChallengeTeamId) return;

    const team = teams.find(t => t.id === overrideChallengeTeamId);
    if (!team) return;

    // Simulate direct correct submission
    const newLog = {
      id: `log-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      challengeId: activeChallenge.id,
      challengeTitle: activeChallenge.title,
      answer: '[ADMIN_OVERRIDE_COMPLETION]',
      correct: true,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      attempts: 1
    };
    setLogs([newLog, ...logs]);

    // Increase points for that team
    setTeams(teams.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          points: t.points + activeChallenge.points
        };
      }
      return t;
    }));

    // Update challenge solved count
    setChallenges(challenges.map(c => {
      if (c.id === activeChallenge.id) {
        return { ...c, solvedCount: c.solvedCount + 1 };
      }
      return c;
    }));

    setShowOverrideChallengeModal(false);
    setActiveChallenge(null);
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
    filteredTeams,
    filteredLogs,
    getLeaderboardData,
    exportToCSV,
    handlePrint,
    unlockedCount,
    highScore
  };
}

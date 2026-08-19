import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  listUsers, getAdminChallenges, getAdminProgress, getLeaderboard,
  approveAdmin, toggleRole, deleteUser, bulkImportAdmins,
  createChallenge, updateChallenge, deleteChallenge, adminOverride,
  removeTeamMember, deleteTeam,
} from '../../api/admin';
import {
  Lock,
  Unlock,
  Play,
  RotateCcw,
  CheckCircle,
  Edit,
  Trash2,
  Key,
  Plus,
  Search,
  Download,
  LogOut,
  RefreshCw,
  Sliders,
  Users,
  Terminal,
  FileText,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Award,
  BookOpen,
  ShieldAlert,
  Upload,
  File
} from 'lucide-react';

// --- MOCK INITIAL DATA ---
const INITIAL_TEAMS = [
  { id: 'team-1', name: 'Enigma Hunters', members: ['Alice Smith', 'Bob Johnson'], round: 1, points: 150, status: 'active' },
  { id: 'team-2', name: 'Null Pointers', members: ['Charlie Brown', 'Dave Miller'], round: 2, points: 300, status: 'active' },
  { id: 'team-3', name: 'Cyber Shells', members: ['Eve Online', 'Frank Castle'], round: 3, points: 550, status: 'active' },
  { id: 'team-4', name: 'Root Kit', members: ['Grace Hopper', 'Heisenberg'], round: 1, points: 80, status: 'active' },
  { id: 'team-5', name: 'Shadow Brokers', members: ['Ivan Stark', 'Judy Hops'], round: 2, points: 220, status: 'active' }
];

const INITIAL_CHALLENGES = [
  { id: 'chal-101', title: 'Decryption Protocol', round: 1, answer: 'c1c4d4_2067', points: 100, isLocked: false, hintsEnabled: true, solvedCount: 5, timeLimit: 60, assets: [{ name: 'cipher.txt', url: 'https://assets.cicada.org/cipher.txt' }] },
  { id: 'chal-102', title: 'The Whispering Port', round: 1, answer: 'p0rt_w0rd', points: 150, isLocked: false, hintsEnabled: false, solvedCount: 3, timeLimit: 90, assets: [] },
  { id: 'chal-201', title: 'Quantum Key Distribution', round: 2, answer: 'qu4ntum_5h1ft', points: 200, isLocked: false, hintsEnabled: true, solvedCount: 2, timeLimit: 120, assets: [{ name: 'quantum_key.bin', url: 'https://assets.cicada.org/quantum_key.bin' }] },
  { id: 'chal-202', title: 'TARS Terminal Access', round: 2, answer: '3v3nt_h0r1z0n', points: 250, isLocked: true, hintsEnabled: false, solvedCount: 0, timeLimit: 180, assets: [] },
  { id: 'chal-301', title: 'Cicada Lattice', round: 3, answer: 'c1c4d4_pr1m3', points: 400, isLocked: true, hintsEnabled: false, solvedCount: 0, timeLimit: 240, assets: [{ name: 'lattice_schema.png', url: 'https://assets.cicada.org/lattice_schema.png' }] }
];

const INITIAL_USERS = [
  { id: 'user-1', username: 'john_doe', email: 'john@gmail.com', role: 'Participant', isApprovedAdmin: false },
  { id: 'user-2', username: 'jane_smith', email: 'jane@gmail.com', role: 'Admin', isApprovedAdmin: true },
  { id: 'user-3', username: 'alex_mercer', email: 'alex@blackwatch.org', role: 'Admin', isApprovedAdmin: false },
  { id: 'user-4', username: 'sara_connor', email: 'sara@skynet.net', role: 'Participant', isApprovedAdmin: false },
  { id: 'user-5', username: 'neo_matrix', email: 'neo@zion.org', role: 'Participant', isApprovedAdmin: false }
];

const INITIAL_LOGS = [
  { id: 'log-1', teamId: 'team-1', teamName: 'Enigma Hunters', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'wrong_ans_1', correct: false, timestamp: '2026-07-24 17:15:30', attempts: 1 },
  { id: 'log-2', teamId: 'team-1', teamName: 'Enigma Hunters', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'c1c4d4_2067', correct: true, timestamp: '2026-07-24 17:17:12', attempts: 2 },
  { id: 'log-3', teamId: 'team-2', teamName: 'Null Pointers', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'c1c4d4_2067', correct: true, timestamp: '2026-07-24 16:02:44', attempts: 1 },
  { id: 'log-4', teamId: 'team-2', teamName: 'Null Pointers', challengeId: 'chal-102', challengeTitle: 'The Whispering Port', answer: 'p0rt_w0rd', correct: true, timestamp: '2026-07-24 16:55:00', attempts: 1 },
  { id: 'log-5', teamId: 'team-3', teamName: 'Cyber Shells', challengeId: 'chal-201', challengeTitle: 'Quantum Key Distribution', answer: 'wrong_key', correct: false, timestamp: '2026-07-24 15:40:02', attempts: 3 }
];

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
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
        })));
        setChallenges((ch.data || []).map((x) => ({
          id: x.id,
          title: x.name,
          round: x.order_number,
          answer: x.answer_key || '',
          isLocked: x.is_active === false,
          hintsEnabled: true,
          solvedCount: 0,
          timeLimit: x.time_limit || 0,
          assets: (x.assets || []).map((a) => ({ name: a.name || 'asset', url: a.url || '#' })),
        })));
        const lbMap = {};
        (lb.data || []).forEach((t) => { lbMap[t.team_name] = t.challenges_completed; });
        setTeams((prog.data || []).map((t) => ({
          id: t.team_name,
          name: t.team_name,
          members: [],
          round: t.current_challenge_order || 1,
          points: lbMap[t.team_name] != null ? lbMap[t.team_name] : (t.challenges_solved || 0),
          status: 'active',
        })));
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
  const handleToggleLockChallenge = (challengeId, currentLockStatus) => {
    setChallenges(challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, isLocked: !currentLockStatus };
      }
      return c;
    }));
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

  // --- LOGIN PAGE RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#131313] text-[#e5e2e1] font-mono flex items-center justify-center p-4 relative overflow-hidden">
        {/* CRT Scanline Overlay */}
        <div className="fixed inset-0 scanline w-full h-full pointer-events-none z-50 opacity-20"></div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(53,53,52,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(53,53,52,0.07)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

        <div className="w-full max-w-lg bg-[#1c1b1b] border border-[#51443e] p-10 rounded shadow-[0_0_35px_rgba(248,184,152,0.07)] relative z-10">
          <div className="text-center mb-10">
            <div className="w-14 h-14 border border-[#f8b898] rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse shadow-[0_0_12px_rgba(248,184,152,0.25)]">
              <Terminal className="text-[#f8b898] w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-[#ffdb9d] uppercase">CICADA 2067</h1>
            <p className="text-xs text-[#9e8d85] tracking-widest uppercase mt-2">// SECURE_ADMINISTRATIVE_GATEWAY</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] text-[#ffb4ab] text-xs p-3 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#ffdb9d] mb-2 font-semibold">IDENTIFICATION_ID</label>
              <input
                type="text"
                className="w-full bg-[#131313] border border-[#51443e] p-4 text-base text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898] transition-colors"
                placeholder="e.g. admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#ffdb9d] mb-2 font-semibold">ACCESS_PASSPHRASE</label>
              <input
                type="password"
                className="w-full bg-[#131313] border border-[#51443e] p-4 text-base text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898] transition-colors"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#f8b898] text-[#131313] font-bold text-sm uppercase tracking-widest rounded hover:bg-[#ffdb9d] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(248,184,152,0.15)]"
            >
              INITIALIZE_CONNECTION
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link to="/" className="text-xs text-[#9e8d85] hover:text-[#f8b898] uppercase tracking-wider transition-colors">
              ← RETURN TO CIVILIAN WEB INTERFACE
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD PANEL RENDER ---
  return (
    <div className="w-full min-h-screen bg-[#131313] text-[#e5e2e1] font-mono pb-16 relative">
      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 scanline w-full h-full pointer-events-none z-50 opacity-15"></div>

      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#f8b898] via-[#feb700] to-[#9ad0d5]"></div>

      {/* Dashboard Header */}
      <header className="border-b border-[#51443e] bg-[#1c1b1b] py-4 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f8b898]/10 border border-[#f8b898]/30 rounded flex items-center justify-center text-[#f8b898] shadow-[0_0_8px_rgba(248,184,152,0.1)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#ffdb9d] font-bold text-sm tracking-wider">CICADA ADMIN PANEL</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#9ad0d5]/10 text-[#9ad0d5] border border-[#9ad0d5]/20 rounded">LIVE_CON_SECURE</span>
            </div>
            <p className="text-[10px] text-[#9e8d85] uppercase tracking-wider mt-0.5">// BACKEND_READY_FRONTEND_INTERFACE</p>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <nav className="flex items-center flex-wrap gap-2">
          {isOAuthAdmin && (
            <div className="w-full mb-2 text-[10px] uppercase tracking-wider text-[#9ad0d5]">
              {liveLoading ? (
                <span>// SYNCHRONIZING LIVE TELEMETRY...</span>
              ) : liveError ? (
                <span className="text-[#ffb4ab]">// LIVE SYNC ERROR: {liveError}</span>
              ) : (
                <span>// LIVE TELEMETRY LINKED TO BACKEND</span>
              )}
            </div>
          )}
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-[#f8b898] text-[#131313] border-[#f8b898] font-bold shadow-[0_0_10px_rgba(248,184,152,0.2)]'
                : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30 hover:border-[#9e8d85]'
            }`}
          >
            Team Management
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-[#f8b898] text-[#131313] border-[#f8b898] font-bold shadow-[0_0_10px_rgba(248,184,152,0.2)]'
                : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30 hover:border-[#9e8d85]'
            }`}
          >
            Challenge Control
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#f8b898] text-[#131313] border-[#f8b898] font-bold shadow-[0_0_10px_rgba(248,184,152,0.2)]'
                : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30 hover:border-[#9e8d85]'
            }`}
          >
            Submission Logs
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#f8b898] text-[#131313] border-[#f8b898] font-bold shadow-[0_0_10px_rgba(248,184,152,0.2)]'
                : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30 hover:border-[#9e8d85]'
            }`}
          >
            Leaderboard & Export
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#f8b898] text-[#131313] border-[#f8b898] font-bold shadow-[0_0_10px_rgba(248,184,152,0.2)]'
                : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30 hover:border-[#9e8d85]'
            }`}
          >
            Users & Admins
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Safeguard Switch */}
          <button
            onClick={() => setSafeguardActive(!safeguardActive)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded text-xs uppercase tracking-wider transition-all cursor-pointer font-bold ${
              safeguardActive
                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/25 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.15)]'
            }`}
            title={safeguardActive ? "Safeguard Mode is Active. Destructive actions are locked." : "Safeguard Mode is Inactive. Destructive actions are unlocked!"}
          >
            {safeguardActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{safeguardActive ? 'Safeguard ON' : 'Safeguard OFF'}</span>
          </button>

          <button
            onClick={() => {
              setResetDemoConfirmInput('');
              setShowResetDemoConfirmModal(true);
            }}
            disabled={safeguardActive}
            title={safeguardActive ? "Reset system state (Safeguard Locked)" : "Reset system state"}
            className={`p-2 border rounded transition-all ${
              safeguardActive
                ? 'border-[#51443e] text-[#9e8d85]/30 cursor-not-allowed opacity-40'
                : 'border-[#51443e] hover:bg-red-500/10 hover:border-red-500/40 text-[#9e8d85] hover:text-red-400 cursor-pointer'
            }`}
          >
            {safeguardActive ? <Lock className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 border border-[#51443e] rounded text-xs uppercase text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>DISCONNECT</span>
          </button>
        </div>
        </div>
      </header>

      {/* Center Wrapper Container */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12">
        {/* Overview Stats Bar */}
        <section className="py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] border border-[#353534] p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9e8d85] uppercase tracking-wider">TOTAL_TEAMS</div>
            <div className="text-xl md:text-2xl font-bold text-[#ffdb9d] mt-1">{teams.length}</div>
          </div>
          <Users className="text-[#f8b898]/40 w-8 h-8" />
        </div>
        <div className="bg-[#1c1b1b] border border-[#353534] p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9e8d85] uppercase tracking-wider">UNLOCKED_CHALLENGES</div>
            <div className="text-xl md:text-2xl font-bold text-[#ffdb9d] mt-1">
              {challenges.filter(c => !c.isLocked).length} / {challenges.length}
            </div>
          </div>
          <BookOpen className="text-[#f8b898]/40 w-8 h-8" />
        </div>
        <div className="bg-[#1c1b1b] border border-[#353534] p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9e8d85] uppercase tracking-wider">SUBMISSIONS_LOGGED</div>
            <div className="text-xl md:text-2xl font-bold text-[#ffdb9d] mt-1">{logs.length}</div>
          </div>
          <FileText className="text-[#f8b898]/40 w-8 h-8" />
        </div>
        <div className="bg-[#1c1b1b] border border-[#353534] p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9e8d85] uppercase tracking-wider">MAX_SCORE</div>
            <div className="text-xl md:text-2xl font-bold text-[#ffdb9d] mt-1">
              {teams.length > 0 ? Math.max(...teams.map(t => t.points)) : 0}
            </div>
          </div>
          <Award className="text-[#f8b898]/40 w-8 h-8" />
        </div>
      </section>

      {/* Main Workspace Panels */}
      <main className="w-full">
        
        {/* --- TAB: TEAMS --- */}
        {activeTab === 'teams' && (
          <div className="bg-[#1c1b1b] border border-[#51443e] rounded p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-base font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f8b898]" />
                <span>Team Database</span>
              </h2>

              <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#9e8d85]">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-[#131313] border border-[#353534] pl-9 pr-3 py-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    placeholder="Search by name, member..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Team</span>
                </button>
              </div>
            </div>

            {/* Teams Table */}
            <div className="overflow-x-auto border border-[#353534] rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#353534] text-[10px] text-[#9e8d85] uppercase tracking-wider">
                    <th className="p-4 font-normal">Team Details</th>
                    <th className="p-4 font-normal">Registered Members</th>
                    <th className="p-4 font-normal text-center">Score (Points)</th>
                    <th className="p-4 font-normal text-center">Current Round</th>
                    <th className="p-4 font-normal text-center">Status</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#353534]/50 text-xs">
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-[#201f1f]/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#e5e2e1] tracking-wider">{team.name}</div>
                          <div className="text-[9px] text-[#9e8d85] mt-0.5 uppercase tracking-wide">ID: {team.id}</div>
                        </td>
                        <td className="p-4 text-[#d6c3ba]">
                          {team.members.length > 0 ? team.members.join(', ') : 'None'}
                        </td>
                        <td className="p-4 text-center font-bold text-[#ffdb9d]">{team.points} pts</td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 bg-[#feb700]/10 text-[#feb700] border border-[#feb700]/25 rounded-full font-bold text-[10px]">
                            Round {team.round}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            team.status === 'active' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setActiveTeam(team);
                                setAdjustScoreType('add');
                                setAdjustScoreValue(0);
                                setShowAdjustScoreModal(true);
                              }}
                              title="Adjust Score Delta / Set Score"
                              className="px-2 py-1.5 border border-[#353534] hover:border-[#f8b898]/60 text-[#9e8d85] hover:text-[#f8b898] rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold"
                            >
                              <span>Score</span>
                            </button>
                            <button
                              onClick={() => handleOpenProgressOverride(team)}
                              title="Override Progress (Round)"
                              className="px-2 py-1.5 border border-[#353534] hover:border-[#feb700]/60 text-[#9e8d85] hover:text-[#feb700] rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Override</span>
                            </button>
                            <button
                              onClick={() => handleOpenResetPassword(team)}
                              title="Reset Password"
                              className="p-1.5 border border-[#353534] hover:border-[#f8b898]/60 text-[#9e8d85] hover:text-[#f8b898] rounded transition-all cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditTeam(team)}
                              title="Edit Team Details"
                              className="p-1.5 border border-[#353534] hover:border-[#9ad0d5]/60 text-[#9e8d85] hover:text-[#9ad0d5] rounded transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetTeamProgress(team.id, team.name)}
                              title="Reset Team Progress (API: POST Reset Team Progress)"
                              className="p-1.5 border border-[#353534] hover:border-red-500/40 text-[#9e8d85] hover:text-red-400 rounded transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(team)}
                              disabled={safeguardActive}
                              title={safeguardActive ? "Safeguard Mode Active (Locked)" : "Delete Team"}
                              className={`p-1.5 border rounded transition-all ${
                                safeguardActive
                                  ? 'border-[#353534]/50 text-[#9e8d85]/30 cursor-not-allowed opacity-40'
                                  : 'border-[#353534] hover:border-red-500/55 text-[#9e8d85] hover:text-red-400 cursor-pointer'
                              }`}
                            >
                              {safeguardActive ? <Lock className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#9e8d85] uppercase tracking-wider">
                        NO TEAMS REGISTERED OR MATCHING SEARCH PARAMETERS
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB: CHALLENGES --- */}
        {activeTab === 'challenges' && (
          <div className="bg-[#1c1b1b] border border-[#51443e] rounded p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#f8b898]" />
                <span>Challenge Control Desk</span>
              </h2>
              <button
                onClick={() => setShowCreateChallengeModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Challenge</span>
              </button>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="border border-[#353534] bg-[#131313] p-5 rounded relative flex flex-col justify-between hover:border-[#51443e] transition-colors">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#f8b898]/10 text-[#f8b898] border border-[#f8b898]/20 rounded-full font-bold">
                          ROUND {challenge.round}
                        </span>
                        <span className="text-[10px] text-[#9e8d85] ml-2 font-mono uppercase">ID: {challenge.id}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-bold border rounded ${
                        challenge.isLocked 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {challenge.isLocked ? 'LOCKED' : 'ACTIVE'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-[#e5e2e1] uppercase tracking-wider mb-2">{challenge.title}</h3>
                    
                    {/* Answer Key */}
                    <div className="bg-[#1c1b1b] border border-[#353534]/50 rounded p-2.5 mb-4 text-xs font-mono">
                      <div className="text-[9px] text-[#9e8d85] uppercase tracking-wider mb-0.5">Correct Answer Key</div>
                      <div className="text-[#f8b898] flex items-center justify-between font-bold">
                        <span>{challenge.answer}</span>
                        <button
                          onClick={() => handleOpenEditAnswer(challenge)}
                          className="text-[#9ad0d5] hover:text-[#ffdb9d] text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Time Limit (API: PUT Update Challenge Time Limit) */}
                    <div className="bg-[#1c1b1b] border border-[#353534]/50 rounded p-2.5 mb-4 text-xs font-mono">
                      <div className="text-[9px] text-[#9e8d85] uppercase tracking-wider mb-0.5">Time Limit</div>
                      <div className="text-[#feb700] flex items-center justify-between font-bold">
                        <span>{challenge.timeLimit ? `${challenge.timeLimit} minutes` : 'No Limit'}</span>
                        <button
                          onClick={() => {
                            setActiveChallenge(challenge);
                            setEditTimeLimitValue(challenge.timeLimit || 60);
                            setShowTimeLimitModal(true);
                          }}
                          className="text-[#9ad0d5] hover:text-[#ffdb9d] text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Set Limit</span>
                        </button>
                      </div>
                    </div>

                    {/* Attached Assets */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(challenge.id);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverChallengeId(null);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          Array.from(e.dataTransfer.files).forEach(file => {
                            handleAddAssetToChallengeDirect(challenge.id, file);
                          });
                        }
                      }}
                      className={`bg-[#1c1b1b] border rounded p-2.5 mb-4 text-xs font-mono transition-all ${
                        dragOverChallengeId === challenge.id
                          ? 'border-[#f8b898] bg-[#f8b898]/5 scale-[1.01] shadow-[0_0_15px_rgba(248,184,152,0.1)]'
                          : 'border-[#353534]/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-[#9e8d85] uppercase tracking-wider">Attached Assets ({challenge.assets ? challenge.assets.length : 0})</span>
                        <button
                          onClick={() => document.getElementById(`file-upload-${challenge.id}`).click()}
                          className="text-[#f8b898] hover:text-[#ffdb9d] text-[8px] uppercase tracking-wider font-bold cursor-pointer"
                        >
                          + Add File
                        </button>
                        <input
                          id={`file-upload-${challenge.id}`}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              Array.from(e.target.files).forEach(file => {
                                handleAddAssetToChallengeDirect(challenge.id, file);
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        {challenge.assets && challenge.assets.length > 0 ? (
                          challenge.assets.map((asset, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] bg-[#131313] px-2 py-1 rounded border border-[#353534]/30 hover:border-[#51443e] transition-colors">
                              <span className="text-[#e5e2e1] font-semibold truncate max-w-[100px] flex items-center gap-1">
                                <File className="w-2.5 h-2.5 text-gray-500 shrink-0" />
                                <span className="truncate">{asset.name}</span>
                              </span>
                              <div className="flex items-center gap-2 shrink-0 font-bold">
                                <a
                                  href={asset.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#9ad0d5] hover:text-[#f8b898] hover:underline text-[9px] truncate"
                                >
                                  Link ↗
                                </a>
                                <button
                                  onClick={() => {
                                    setActiveAsset(asset);
                                    setActiveAssetChallengeId(challenge.id);
                                    setEditAssetName(asset.name);
                                    setEditAssetUrl(asset.url);
                                    setShowEditAssetModal(true);
                                  }}
                                  className="text-gray-400 hover:text-[#f8b898] cursor-pointer"
                                  title="Edit Asset Details (API: PUT Edit Asset)"
                                >
                                  <Edit className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(challenge.id, asset.name)}
                                  className="text-gray-500 hover:text-red-400 cursor-pointer"
                                  title="Delete Asset (API: DEL Delete Asset)"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[9px] text-gray-600 uppercase border border-dashed border-[#353534]/30 p-2 text-center rounded">
                            Drag files here to upload
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[#9e8d85] uppercase tracking-wider mb-6">
                      <div className="bg-[#1c1b1b]/50 p-2 rounded">
                        <div>Value</div>
                        <div className="font-bold text-[#ffdb9d] text-xs mt-0.5">{challenge.points} pts</div>
                      </div>
                      <div className="bg-[#1c1b1b]/50 p-2 rounded">
                        <div>Solved By</div>
                        <div className="font-bold text-[#ffdb9d] text-xs mt-0.5">{challenge.solvedCount} teams</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Overrides */}
                  <div className="border-t border-[#353534]/50 pt-4 space-y-3">
                    {/* Core locks */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleLockChallenge(challenge.id, challenge.isLocked)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border text-[10px] uppercase tracking-wider rounded font-bold cursor-pointer transition-all ${
                          challenge.isLocked 
                            ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab] hover:bg-[#ffb4ab]/25' 
                            : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {challenge.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{challenge.isLocked ? 'Unlock Challenge' : 'Lock Challenge'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleHintChallenge(challenge.id, challenge.hintsEnabled)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border text-[10px] uppercase tracking-wider rounded font-bold cursor-pointer transition-all ${
                          challenge.hintsEnabled 
                            ? 'bg-[#feb700]/10 border-[#feb700]/30 text-[#feb700] hover:bg-[#feb700]/25' 
                            : 'border-[#353534] text-[#9e8d85] hover:bg-[#353534]/30'
                        }`}
                      >
                        <span>{challenge.hintsEnabled ? 'Hints Enabled' : 'Hints Disabled'}</span>
                      </button>
                    </div>

                    {/* Operational Commands */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenOverrideChallenge(challenge)}
                        className="flex-1 py-1.5 bg-[#9ad0d5]/10 border border-[#9ad0d5]/30 text-[#9ad0d5] hover:bg-[#9ad0d5]/20 text-[9px] uppercase tracking-wider rounded font-bold transition-all cursor-pointer"
                      >
                        Force Complete
                      </button>
                      <button
                        onClick={() => {
                          setActiveChallenge(challenge);
                          setSkipConfirmInput('');
                          setShowSkipConfirmModal(true);
                        }}
                        disabled={safeguardActive}
                        className={`flex-1 py-1.5 border text-[9px] uppercase tracking-wider rounded font-bold transition-all ${
                          safeguardActive
                            ? 'border-[#353534]/50 text-[#9e8d85]/30 cursor-not-allowed opacity-40'
                            : 'border-[#353534] hover:border-[#feb700]/50 text-[#9e8d85] hover:text-[#feb700] cursor-pointer'
                        }`}
                        title={safeguardActive ? "Safeguard Mode Active (Locked)" : "Skip challenge for all"}
                      >
                        {safeguardActive ? 'Locked' : 'Skip for All'}
                      </button>
                      <button
                        onClick={() => {
                          setActiveChallenge(challenge);
                          setResetChallengeConfirmInput('');
                          setShowResetChallengeConfirmModal(true);
                        }}
                        disabled={safeguardActive}
                        className={`py-1.5 px-2 border rounded transition-all ${
                          safeguardActive
                            ? 'border-[#353534]/50 text-[#9e8d85]/30 cursor-not-allowed opacity-40'
                            : 'border-[#353534] hover:border-red-500/40 text-[#9e8d85] hover:text-red-400 cursor-pointer'
                        }`}
                        title={safeguardActive ? "Safeguard Mode Active (Locked)" : "Reset Challenge Stats"}
                      >
                        {safeguardActive ? <Lock className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: SUBMISSION LOGS --- */}
        {activeTab === 'logs' && (
          <div className="bg-[#1c1b1b] border border-[#51443e] rounded p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-base font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#f8b898]" />
                <span>Decryption Log Terminal</span>
              </h2>

              <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#9e8d85]">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-[#131313] border border-[#353534] pl-9 pr-3 py-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    placeholder="Search logs by team, challenge..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                {/* Filter Selector */}
                <select
                  className="bg-[#131313] border border-[#353534] text-xs text-[#e5e2e1] font-mono p-2 rounded focus:outline-none focus:border-[#f8b898] cursor-pointer"
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                >
                  <option value="all">Status: All Submissions</option>
                  <option value="correct">Status: Correct Only</option>
                  <option value="incorrect">Status: Incorrect Only</option>
                </select>
              </div>
            </div>

            {/* Submission Log Table */}
            <div className="overflow-x-auto border border-[#353534] rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#353534] text-[10px] text-[#9e8d85] uppercase tracking-wider">
                    <th className="p-4 font-normal">Timestamp</th>
                    <th className="p-4 font-normal">Team</th>
                    <th className="p-4 font-normal">Challenge</th>
                    <th className="p-4 font-normal">Submitted Value</th>
                    <th className="p-4 font-normal text-center">Result</th>
                    <th className="p-4 font-normal text-center">Attempt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#353534]/50 text-xs font-mono">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#201f1f]/30 transition-colors">
                        <td className="p-4 text-[#9e8d85] text-[11px]">{log.timestamp}</td>
                        <td className="p-4 font-bold text-[#e5e2e1] tracking-wide">{log.teamName}</td>
                        <td className="p-4 text-[#d6c3ba]">{log.challengeTitle}</td>
                        <td className="p-4 text-[#ffdb9d] break-all">{log.answer}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-flex items-center gap-1 ${
                            log.correct 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {log.correct ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                            <span>{log.correct ? 'CORRECT' : 'INCORRECT'}</span>
                          </span>
                        </td>
                        <td className="p-4 text-center text-[#ffdb9d]">#{log.attempts}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#9e8d85] uppercase tracking-wider">
                        NO LOGS STORED OR MATCHING CURRENT SEARCH CRITERIA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB: EXPORT & LEADERBOARD --- */}
        {activeTab === 'export' && (
          <div className="bg-[#1c1b1b] border border-[#51443e] rounded p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-base font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#f8b898]" />
                  <span>Leaderboard Export & Standing</span>
                </h2>
                <p className="text-[10px] text-[#9e8d85] uppercase mt-1">// STAGE_SCOREBOARD_REPORTING</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#f8b898] text-[#f8b898] hover:bg-[#f8b898]/10 font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={exportToCSV} // Excel reads standard CSV, labeled for UI
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#feb700] text-[#feb700] hover:bg-[#feb700]/10 font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9ad0d5] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#cbf7fc] cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Print Standing (PDF)</span>
                </button>
                <button
                  disabled={safeguardActive}
                  onClick={() => {
                    setResetLeaderboardConfirmInput('');
                    setShowResetLeaderboardConfirmModal(true);
                  }}
                  title={safeguardActive ? "Reset Leaderboard (Safeguard Locked)" : "Reset Leaderboard (API: POST Reset Leaderboard)"}
                  className={`flex items-center gap-1.5 px-4 py-2 border font-bold text-xs uppercase tracking-wider rounded transition-colors ${
                    safeguardActive
                      ? 'border-[#353534]/50 text-[#9e8d85]/35 cursor-not-allowed opacity-40'
                      : 'border-red-500/45 text-red-400 hover:bg-red-500/10 cursor-pointer'
                  }`}
                >
                  {safeguardActive ? <Lock className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Reset Leaderboard</span>
                </button>
              </div>
            </div>

            {/* Print Header (Visible only when printing) */}
            <div className="hidden print:block mb-8 text-center text-[#131313]">
              <h1 className="text-2xl font-bold tracking-widest">CICADA 2067 - EVENT LEADERBOARD</h1>
              <p className="text-xs font-bold uppercase mt-1">Generated: {new Date().toLocaleString()}</p>
              <hr className="my-4 border-[#131313]" />
            </div>

            {/* Standings List */}
            <div className="overflow-x-auto border border-[#353534] rounded print:border-collapse print:text-black">
              <table className="w-full text-left border-collapse print:text-black">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#353534] text-[10px] text-[#9e8d85] uppercase tracking-wider print:bg-gray-200 print:text-black">
                    <th className="p-4 font-normal text-center w-16">Rank</th>
                    <th className="p-4 font-normal">Team details</th>
                    <th className="p-4 font-normal">Team members</th>
                    <th className="p-4 font-normal text-center">Progress</th>
                    <th className="p-4 font-normal text-center">Total Points</th>
                    <th className="p-4 font-normal text-center">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#353534]/50 text-xs print:divide-gray-300">
                  {getLeaderboardData().map((team, idx) => (
                    <tr key={team.id} className="hover:bg-[#201f1f]/30 transition-colors print:hover:bg-transparent">
                      <td className="p-4 text-center font-bold text-base text-[#feb700] print:text-black">
                        #{idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#e5e2e1] tracking-wider print:text-black">{team.name}</div>
                        <div className="text-[9px] text-[#9e8d85] mt-0.5 uppercase tracking-wide print:text-gray-500">ID: {team.id}</div>
                      </td>
                      <td className="p-4 text-[#d6c3ba] print:text-black">
                        {team.members.join(', ')}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-[#feb700]/10 text-[#feb700] border border-[#feb700]/25 rounded font-bold text-[10px] print:text-black print:border-gray-400">
                          Round {team.round}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-sm text-[#ffdb9d] print:text-black">
                        {team.points} pts
                      </td>
                      <td className="p-4 text-center uppercase text-[#d6c3ba] print:text-black">
                        {team.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB: USERS & ADMINS --- */}
        {activeTab === 'users' && (
          <div className="bg-[#1c1b1b] border border-[#51443e] rounded p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#f8b898]" />
                  <span>User & Administrator Registry</span>
                </h2>
                <p className="text-[10px] text-[#9e8d85] uppercase mt-1">// SECURE_USER_ACCESS_LEVELS</p>
              </div>

              <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#9e8d85]">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-[#131313] border border-[#353534] pl-9 pr-4 py-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowBulkImportAdminsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bulk Import CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-[#353534] rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#353534] text-[10px] text-[#9e8d85] uppercase tracking-wider">
                    <th className="p-4 font-normal">Username</th>
                    <th className="p-4 font-normal">Email Address</th>
                    <th className="p-4 font-normal text-center">Assigned Role</th>
                    <th className="p-4 font-normal text-center">Admin Approval Status</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#353534]/50 text-xs font-mono">
                  {users.filter(user => 
                    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearch.toLowerCase())
                  ).map((user) => (
                    <tr key={user.id} className="hover:bg-[#201f1f]/30 transition-colors">
                      <td className="p-4 font-bold text-[#e5e2e1]">{user.username}</td>
                      <td className="p-4 text-[#d6c3ba]">{user.email}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                          user.role === 'Admin' 
                            ? 'bg-[#f8b898]/10 text-[#f8b898] border-[#f8b898]/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {user.role === 'Admin' ? (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            user.isApprovedAdmin
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-[#feb700]/10 text-[#feb700] border-[#feb700]/20 animate-pulse'
                          }`}>
                            {user.isApprovedAdmin ? 'APPROVED' : 'PENDING APPROVAL'}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === 'Admin' && !user.isApprovedAdmin && (
                            <button
                              onClick={() => handleApproveAdmin(user.id)}
                              title="Approve Administrator Role (API: POST 09_Approve_Admin)"
                              className="px-2 py-1 border border-[#353534] hover:border-green-500/50 text-green-400 hover:bg-green-500/5 rounded transition-all cursor-pointer text-[10px] uppercase font-bold"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleAdminRole(user.id)}
                            title="Toggle Admin/Participant Role (API: POST 10_Toggle_Admin_Role)"
                            className="px-2 py-1 border border-[#353534] hover:border-[#feb700]/50 text-[#9e8d85] hover:text-[#feb700] rounded transition-all cursor-pointer text-[10px] uppercase"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title="Delete User Account (API: POST 12_Admin_Delete_User)"
                            className="p-1 border border-[#353534] hover:border-red-500/40 text-[#9e8d85] hover:text-red-400 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[#9e8d85] uppercase tracking-wider">
                        NO USER ACCOUNTS REGISTERED IN DATABASE
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* --- ALL MODALS --- */}

      {/* 1. Modal: Register/Create Team */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#f8b898]" />
                <span>Register New Team</span>
              </h3>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">TEAM_NAME</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  placeholder="e.g. Shadow Guild"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">REGISTERED_MEMBERS (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  placeholder="e.g. Jane Doe, John Smith"
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">INITIAL_SECRET_PASSPHRASE</label>
                <input
                  type="text"
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  placeholder="Leave empty for auto-generated passphrase"
                  value={newTeamPassword}
                  onChange={(e) => setNewTeamPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Team Details */}
      {showEditTeamModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#9ad0d5]" />
                <span>Edit Team Settings</span>
              </h3>
              <button
                onClick={() => setShowEditTeamModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">TEAM_NAME</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">REGISTERED_MEMBERS (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editTeamMembers}
                  onChange={(e) => setEditTeamMembers(e.target.value)}
                />
              </div>

              {activeTeam.members && activeTeam.members.length > 0 && (
                <div className="border border-[#353534] bg-[#131313] p-3 rounded text-xs font-mono">
                  <div className="text-[10px] text-[#9e8d85] uppercase tracking-wider mb-2">Current Members (API: POST 06_Remove_Member)</div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {activeTeam.members.map((member) => (
                      <div key={member} className="flex justify-between items-center bg-[#1c1b1b] px-2.5 py-1 rounded border border-[#353534]/50">
                        <span className="text-[#e5e2e1]">{member}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(activeTeam.id, member)}
                          className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">SCORE (Points)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    value={editTeamPoints}
                    onChange={(e) => setEditTeamPoints(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">ACCOUNT_STATUS</label>
                  <select
                    className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    value={editTeamStatus}
                    onChange={(e) => setEditTeamStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditTeamModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Reset Team Password */}
      {showResetPwdModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#f8b898]" />
                <span>Reset Team Credentials</span>
              </h3>
              <button
                onClick={() => setShowResetPwdModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4">
              <div className="bg-[#131313] border border-[#353534] p-3 text-xs text-[#9e8d85] rounded">
                YOU ARE UPDATING CREDENTIALS FOR:
                <div className="font-bold text-[#ffdb9d] mt-1 text-sm">{activeTeam.name.toUpperCase()}</div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">NEW_ACCESS_PASSPHRASE</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  placeholder="Enter custom new passphrase"
                  value={manuallyResetPassword}
                  onChange={(e) => setManuallyResetPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetPwdModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/35 text-red-400 font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
                >
                  Force Reset Pwd
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Progress Override (Manually Advance Round) */}
      {showProgressOverrideModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-[#feb700]" />
                <span>Manual Progress Override</span>
              </h3>
              <button
                onClick={() => setShowProgressOverrideModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgressOverride} className="space-y-4">
              <div className="bg-[#131313] border border-[#353534] p-3 text-xs text-[#9e8d85] rounded">
                OVERRIDING LOCATION FOR TEAM:
                <div className="font-bold text-[#feb700] mt-1 text-sm">{activeTeam.name.toUpperCase()}</div>
                <div className="mt-2 text-[10px] text-orange-400/80 uppercase">
                  Important: Manual advancement moves the team directly to the target round without requiring completion of earlier round challenges.
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">TARGET_QUALIFIED_ROUND</label>
                <select
                  className="w-full bg-[#131313] border border-[#353534] p-2.5 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898] cursor-pointer"
                  value={overrideTargetRound}
                  onChange={(e) => setOverrideTargetRound(e.target.value)}
                >
                  <option value={1}>Round 1 (Initial Stage)</option>
                  <option value={2}>Round 2 (Qualified Stage)</option>
                  <option value={3}>Round 3 (Final Decryption Stage)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressOverrideModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#feb700] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-yellow-400 cursor-pointer"
                >
                  Advance Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Edit Challenge Answer Key */}
      {showEditAnswerModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#9ad0d5]" />
                <span>Modify Challenge Key</span>
              </h3>
              <button
                onClick={() => setShowEditAnswerModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAnswer} className="space-y-4">
              <div className="bg-[#131313] border border-[#353534] p-3 text-xs text-[#9e8d85] rounded">
                CHALLENGE:
                <div className="font-bold text-[#e5e2e1] mt-1 text-sm">{activeChallenge.title.toUpperCase()}</div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">CORRECT_DECRYPTION_ANSWER</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editAnswerValue}
                  onChange={(e) => setEditAnswerValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditAnswerModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Update Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Force Complete Challenge (Override Completion) */}
      {showOverrideChallengeModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#9ad0d5]" />
                <span>Force Challenge Completion</span>
              </h3>
              <button
                onClick={() => setShowOverrideChallengeModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideChallenge} className="space-y-4">
              <div className="bg-[#131313] border border-[#353534] p-3 text-xs text-[#9e8d85] rounded">
                TARGET CHALLENGE:
                <div className="font-bold text-[#9ad0d5] mt-1 text-sm">{activeChallenge.title.toUpperCase()}</div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">SELECT_TEAM_TO_GRANT_CREDIT</label>
                <select
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2.5 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898] cursor-pointer"
                  value={overrideChallengeTeamId}
                  onChange={(e) => setOverrideChallengeTeamId(e.target.value)}
                >
                  <option value="">-- Choose Team --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Round {t.round})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOverrideChallengeModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#9ad0d5] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#cbf7fc] cursor-pointer"
                >
                  Override Solved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Purge/Delete Team Confirmation */}
      {showDeleteConfirmModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-red-500/50 p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>PURGE_TEAM_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setActiveTeam(null);
                  setDeleteConfirmInput('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] border border-red-500/20 p-4 text-xs text-[#9e8d85] rounded mb-4">
              WARNING: You are about to permanently purge team <span className="text-red-400 font-bold font-mono">"{activeTeam.name}"</span> and all of their scoring logs and credentials. This action cannot be reversed.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  TYPE THE TEAM NAME <span className="text-red-400 font-bold font-mono">"{activeTeam.name}"</span> TO CONFIRM:
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-red-500"
                  placeholder="Type team name exactly"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setActiveTeam(null);
                    setDeleteConfirmInput('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmInput !== activeTeam.name}
                  onClick={() => {
                    setTeams(teams.filter(t => t.id !== activeTeam.id));
                    const newLog = {
                      id: `log-${Date.now()}`,
                      teamId: activeTeam.id,
                      teamName: activeTeam.name,
                      challengeId: 'system',
                      challengeTitle: 'Team Deletion',
                      answer: 'Team account purged by admin',
                      correct: false,
                      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      attempts: 0
                    };
                    setLogs([newLog, ...logs]);
                    setShowDeleteConfirmModal(false);
                    setActiveTeam(null);
                    setDeleteConfirmInput('');
                  }}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  PURGE TEAM DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Skip Challenge Confirmation */}
      {showSkipConfirmModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#feb700]/50 p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#feb700] uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>SKIP_CHALLENGE_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowSkipConfirmModal(false);
                  setActiveChallenge(null);
                  setSkipConfirmInput('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] border border-[#feb700]/25 p-4 text-xs text-[#9e8d85] rounded mb-4">
              WARNING: You are forcing a skip of challenge <span className="text-[#feb700] font-bold font-mono">"{activeChallenge.title}"</span>. This will automatically advance ALL teams currently in Round {activeChallenge.round} to the next round.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  TYPE <span className="text-[#feb700] font-bold">"SKIP"</span> TO CONFIRM THIS ACTION:
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#feb700]"
                  placeholder="Type SKIP"
                  value={skipConfirmInput}
                  onChange={(e) => setSkipConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSkipConfirmModal(false);
                    setActiveChallenge(null);
                    setSkipConfirmInput('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={skipConfirmInput !== 'SKIP'}
                  onClick={() => {
                    const targetRound = activeChallenge.round;
                    setTeams(teams.map(t => {
                      if (t.round === targetRound) {
                        return { ...t, round: targetRound + 1 };
                      }
                      return t;
                    }));

                    const newLog = {
                      id: `log-${Date.now()}`,
                      teamId: 'all',
                      teamName: 'ALL TEAMS',
                      challengeId: activeChallenge.id,
                      challengeTitle: activeChallenge.title,
                      answer: 'SKIPPED BY ADMIN ACTION',
                      correct: true,
                      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      attempts: 0
                    };
                    setLogs([newLog, ...logs]);

                    setShowSkipConfirmModal(false);
                    setActiveChallenge(null);
                    setSkipConfirmInput('');
                  }}
                  className="flex-1 py-2 bg-[#feb700] text-[#131313] font-bold text-xs uppercase tracking-wider rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(254,183,0,0.2)]"
                >
                  FORCE SKIP ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Reset Challenge Stats Confirmation */}
      {showResetChallengeConfirmModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-red-500/50 p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>RESET_CHALLENGE_STATS_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetChallengeConfirmModal(false);
                  setActiveChallenge(null);
                  setResetChallengeConfirmInput('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] border border-red-500/20 p-4 text-xs text-[#9e8d85] rounded mb-4">
              WARNING: You are about to clear all scoreboard points, submissions, and logs for challenge <span className="text-red-400 font-bold font-mono">"{activeChallenge.title}"</span>. This will revert all solved marks for all teams.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  TYPE <span className="text-red-400 font-bold">"RESET"</span> TO CONFIRM THIS ACTION:
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-red-500"
                  placeholder="Type RESET"
                  value={resetChallengeConfirmInput}
                  onChange={(e) => setResetChallengeConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetChallengeConfirmModal(false);
                    setActiveChallenge(null);
                    setResetChallengeConfirmInput('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetChallengeConfirmInput !== 'RESET'}
                  onClick={() => {
                    setLogs(logs.filter(l => l.challengeId !== activeChallenge.id));
                    setChallenges(challenges.map(c => {
                      if (c.id === activeChallenge.id) {
                        return { ...c, solvedCount: 0 };
                      }
                      return c;
                    }));

                    setShowResetChallengeConfirmModal(false);
                    setActiveChallenge(null);
                    setResetChallengeConfirmInput('');
                  }}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  CLEAR ALL DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Reset System Demo Confirmation */}
      {showResetDemoConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-red-500/50 p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>PURGE_DATABASE_DEMO_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetDemoConfirmModal(false);
                  setResetDemoConfirmInput('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] border border-red-500/20 p-4 text-xs text-[#9e8d85] rounded mb-4">
              WARNING: This will completely wipe all local changes, team creations, submissions, and resets, and restore the default dataset configuration.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  TYPE <span className="text-red-400 font-bold">"RESTORE"</span> TO WIPE ALL ACTIVE DATA:
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-red-500"
                  placeholder="Type RESTORE"
                  value={resetDemoConfirmInput}
                  onChange={(e) => setResetDemoConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetDemoConfirmModal(false);
                    setResetDemoConfirmInput('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetDemoConfirmInput !== 'RESTORE'}
                  onClick={() => {
                    localStorage.removeItem('cicada_teams');
                    localStorage.removeItem('cicada_challenges');
                    localStorage.removeItem('cicada_logs');
                    localStorage.removeItem('cicada_users');
                    setTeams(INITIAL_TEAMS);
                    setChallenges(INITIAL_CHALLENGES);
                    setLogs(INITIAL_LOGS);
                    setUsers(INITIAL_USERS);
                    setShowResetDemoConfirmModal(false);
                    setResetDemoConfirmInput('');
                  }}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  RESTORE DEFAULTS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Modal: Adjust Score */}
      {showAdjustScoreModal && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#f8b898]" />
                <span>Adjust Score: {activeTeam.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAdjustScoreModal(false);
                  setActiveTeam(null);
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustScore} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('add')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'add'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30'
                    }`}
                  >
                    Add (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('subtract')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'subtract'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30'
                    }`}
                  >
                    Subtract (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustScoreType('set')}
                    className={`py-2 text-xs uppercase tracking-wider rounded border font-bold cursor-pointer transition-colors ${
                      adjustScoreType === 'set'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'border-[#353534] text-[#d6c3ba] hover:bg-[#353534]/30'
                    }`}
                  >
                    Set Exact (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  {adjustScoreType === 'add' && 'Points to Add (API: PATCH Adjust Score Delta)'}
                  {adjustScoreType === 'subtract' && 'Points to Subtract (API: PATCH Adjust Score Delta)'}
                  {adjustScoreType === 'set' && 'New Score Value (API: POST Set Any Score)'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={adjustScoreValue}
                  onChange={(e) => setAdjustScoreValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustScoreModal(false);
                    setActiveTeam(null);
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. Modal: Create Challenge */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#f8b898]" />
                <span>Create New Challenge</span>
              </h3>
              <button
                onClick={() => setShowCreateChallengeModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Buffer Overflow"
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={newChallengeTitle}
                  onChange={(e) => setNewChallengeTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Round Level</label>
                  <select
                    className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    value={newChallengeRound}
                    onChange={(e) => setNewChallengeRound(e.target.value)}
                  >
                    <option value="1">Round 1</option>
                    <option value="2">Round 2</option>
                    <option value="3">Round 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Point Value</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                    value={newChallengePoints}
                    onChange={(e) => setNewChallengePoints(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Flag / Solution Key</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. c1c4d4_fl4g_value"
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={newChallengeAnswer}
                  onChange={(e) => setNewChallengeAnswer(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={newChallengeTimeLimit}
                  onChange={(e) => setNewChallengeTimeLimit(e.target.value)}
                />
              </div>

              {/* Assets Section */}
              <div className="border border-[#353534]/60 p-3 rounded bg-[#131313]/60 space-y-2">
                <label className="block text-[10px] uppercase text-[#ffdb9d] font-bold">Challenge Assets (files, payloads, URLs)</label>
                
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const files = Array.from(e.dataTransfer.files);
                      const newAssets = files.map(file => ({
                        name: file.name,
                        url: `https://assets.cicada.org/uploads/${encodeURIComponent(file.name)}`
                      }));
                      setNewChallengeAssets([...newChallengeAssets, ...newAssets]);
                    }
                  }}
                  onClick={() => document.getElementById('modal-file-upload').click()}
                  className="border border-dashed border-[#51443e] hover:border-[#f8b898] bg-[#131313] p-4 text-center rounded text-xs text-[#9e8d85] flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#f8b898]/50 animate-pulse" />
                  <span>DRAG & DROP LOCAL FILES HERE OR CLICK TO SELECT</span>
                  <input
                    id="modal-file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        const newAssets = files.map(file => ({
                          name: file.name,
                          url: `https://assets.cicada.org/uploads/${encodeURIComponent(file.name)}`
                        }));
                        setNewChallengeAssets([...newChallengeAssets, ...newAssets]);
                      }
                    }}
                  />
                </div>

                {/* Current Assets list */}
                {newChallengeAssets.length > 0 && (
                  <div className="space-y-1 mb-2 max-h-24 overflow-y-auto font-mono">
                    {newChallengeAssets.map((asset, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#1c1b1b] border border-[#353534]/40 px-2 py-1 rounded text-[10px]">
                        <span className="truncate max-w-[150px] text-[#e5e2e1] font-semibold">{asset.name}</span>
                        <span className="truncate max-w-[120px] text-gray-500 text-[9px]">{asset.url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssetFromChallenge(idx)}
                          className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Asset Name (e.g. file.zip)"
                      className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                      value={tempAssetName}
                      onChange={(e) => setTempAssetName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="URL (optional)"
                      className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                      value={tempAssetUrl}
                      onChange={(e) => setTempAssetUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAssetToChallenge}
                    className="w-full py-2 bg-[#f8b898]/10 hover:bg-[#f8b898]/20 border border-[#f8b898]/40 text-[#f8b898] text-[10px] uppercase tracking-widest rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Asset to List</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChallengeModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. Modal: Update Time Limit */}
      {showTimeLimitModal && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#f8b898]" />
                <span>Set Time Limit: {activeChallenge.title}</span>
              </h3>
              <button
                onClick={() => {
                  setShowTimeLimitModal(false);
                  setActiveChallenge(null);
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTimeLimit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Time Limit (Minutes, 0 for unlimited)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editTimeLimitValue}
                  onChange={(e) => setEditTimeLimitValue(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeLimitModal(false);
                    setActiveChallenge(null);
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Save Time Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. Modal: Bulk Import Admins */}
      {showBulkImportAdminsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#f8b898]" />
                <span>Bulk Import Administrators</span>
              </h3>
              <button
                onClick={() => setShowBulkImportAdminsModal(false)}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImportAdmins} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Admins CSV (Format: username,email - one per line)</label>
                <textarea
                  required
                  rows="6"
                  placeholder="cyber_operator_1,ops1@cicada.org&#10;netsec_auditor,auditor@cicada.org"
                  className="w-full bg-[#131313] border border-[#353534] p-3 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={bulkAdminsCSVText}
                  onChange={(e) => setBulkAdminsCSVText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImportAdminsModal(false)}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Import Admins
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 15. Modal: Reset Leaderboard Confirmation */}
      {showResetLeaderboardConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-red-500/50 p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>RESET_LEADERBOARD_CONFIRMATION</span>
              </h3>
              <button
                onClick={() => {
                  setShowResetLeaderboardConfirmModal(false);
                  setResetLeaderboardConfirmInput('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] border border-red-500/20 p-4 text-xs text-[#9e8d85] rounded mb-4">
              WARNING: This will completely wipe all leaderboard points and progress metrics, locking all challenges.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">
                  TYPE <span className="text-red-400 font-bold">"RESET"</span> TO CONFIRM RESET LEADERBOARD:
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-red-500"
                  placeholder="Type RESET"
                  value={resetLeaderboardConfirmInput}
                  onChange={(e) => setResetLeaderboardConfirmInput(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetLeaderboardConfirmModal(false);
                    setResetLeaderboardConfirmInput('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetLeaderboardConfirmInput !== 'RESET'}
                  onClick={() => {
                    handleResetLeaderboard();
                    setShowResetLeaderboardConfirmModal(false);
                    setResetLeaderboardConfirmInput('');
                  }}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  RESET LEADERBOARD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. Modal: Edit Asset Details */}
      {showEditAssetModal && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#51443e] p-6 rounded shadow-xl font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-[#ffdb9d] uppercase tracking-widest flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#f8b898]" />
                <span>Edit Asset: {activeAsset.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditAssetModal(false);
                  setActiveAsset(null);
                  setActiveAssetChallengeId('');
                }}
                className="text-[#9e8d85] hover:text-[#e5e2e1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAssetSave} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editAssetName}
                  onChange={(e) => setEditAssetName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#ffdb9d] mb-1">Download URL / Path</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#131313] border border-[#353534] p-2 text-xs text-[#e5e2e1] font-mono rounded focus:outline-none focus:border-[#f8b898]"
                  value={editAssetUrl}
                  onChange={(e) => setEditAssetUrl(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAssetModal(false);
                    setActiveAsset(null);
                    setActiveAssetChallengeId('');
                  }}
                  className="flex-1 py-2 border border-[#353534] hover:bg-[#353534]/30 text-xs text-[#e5e2e1] uppercase tracking-wider rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f8b898] text-[#131313] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#ffdb9d] cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const INITIAL_TEAMS = [
  { id: 'team-1', name: 'Enigma Hunters', members: ['Alice Smith', 'Bob Johnson'], round: 1, points: 150, status: 'active' },
  { id: 'team-2', name: 'Null Pointers', members: ['Charlie Brown', 'Dave Miller'], round: 2, points: 300, status: 'active' },
  { id: 'team-3', name: 'Cyber Shells', members: ['Eve Online', 'Frank Castle'], round: 3, points: 550, status: 'active' },
  { id: 'team-4', name: 'Root Kit', members: ['Grace Hopper', 'Heisenberg'], round: 1, points: 80, status: 'active' },
  { id: 'team-5', name: 'Shadow Brokers', members: ['Ivan Stark', 'Judy Hops'], round: 2, points: 220, status: 'active' }
];

export const INITIAL_CHALLENGES = [
  { id: 'chal-101', title: 'Decryption Protocol', round: 1, answer: 'c1c4d4_2067', points: 100, isLocked: false, hintsEnabled: true, solvedCount: 5, timeLimit: 60, assets: [{ name: 'cipher.txt', url: 'https://assets.cicada.org/cipher.txt' }] },
  { id: 'chal-102', title: 'The Whispering Port', round: 1, answer: 'p0rt_w0rd', points: 150, isLocked: false, hintsEnabled: false, solvedCount: 3, timeLimit: 90, assets: [] },
  { id: 'chal-201', title: 'Quantum Key Distribution', round: 2, answer: 'qu4ntum_5h1ft', points: 200, isLocked: false, hintsEnabled: true, solvedCount: 2, timeLimit: 120, assets: [{ name: 'quantum_key.bin', url: 'https://assets.cicada.org/quantum_key.bin' }] },
  { id: 'chal-202', title: 'TARS Terminal Access', round: 2, answer: '3v3nt_h0r1z0n', points: 250, isLocked: true, hintsEnabled: false, solvedCount: 0, timeLimit: 180, assets: [] },
  { id: 'chal-301', title: 'Cicada Lattice', round: 3, answer: 'c1c4d4_pr1m3', points: 400, isLocked: true, hintsEnabled: false, solvedCount: 0, timeLimit: 240, assets: [{ name: 'lattice_schema.png', url: 'https://assets.cicada.org/lattice_schema.png' }] }
];

export const INITIAL_USERS = [
  { id: 'user-1', username: 'john_doe', email: 'john@gmail.com', role: 'Participant', isApprovedAdmin: false },
  { id: 'user-2', username: 'jane_smith', email: 'jane@gmail.com', role: 'Admin', isApprovedAdmin: true },
  { id: 'user-3', username: 'alex_mercer', email: 'alex@blackwatch.org', role: 'Admin', isApprovedAdmin: false },
  { id: 'user-4', username: 'sara_connor', email: 'sara@skynet.net', role: 'Participant', isApprovedAdmin: false },
  { id: 'user-5', username: 'neo_matrix', email: 'neo@zion.org', role: 'Participant', isApprovedAdmin: false }
];

export const INITIAL_LOGS = [
  { id: 'log-1', teamId: 'team-1', teamName: 'Enigma Hunters', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'wrong_ans_1', correct: false, timestamp: '2026-07-24 17:15:30', attempts: 1 },
  { id: 'log-2', teamId: 'team-1', teamName: 'Enigma Hunters', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'c1c4d4_2067', correct: true, timestamp: '2026-07-24 17:17:12', attempts: 2 },
  { id: 'log-3', teamId: 'team-2', teamName: 'Null Pointers', challengeId: 'chal-101', challengeTitle: 'Decryption Protocol', answer: 'c1c4d4_2067', correct: true, timestamp: '2026-07-24 16:02:44', attempts: 1 },
  { id: 'log-4', teamId: 'team-2', teamName: 'Null Pointers', challengeId: 'chal-102', challengeTitle: 'The Whispering Port', answer: 'p0rt_w0rd', correct: true, timestamp: '2026-07-24 16:55:00', attempts: 1 },
  { id: 'log-5', teamId: 'team-3', teamName: 'Cyber Shells', challengeId: 'chal-201', challengeTitle: 'Quantum Key Distribution', answer: 'wrong_key', correct: false, timestamp: '2026-07-24 15:40:02', attempts: 3 }
];

export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

export const COMMAND_TABS = [
  { id: 'teams', label: 'Teams' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'logs', label: 'Logs' },
  { id: 'export', label: 'Leaderboard' },
  { id: 'users', label: 'Users' },
];


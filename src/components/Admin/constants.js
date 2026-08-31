export const INITIAL_TEAMS = [
  { id: 'team-1', name: 'Enigma Hunters', members: ['Alice Smith', 'Bob Johnson'], round: 1, points: 150, status: 'active' },
  { id: 'team-2', name: 'Null Pointers', members: ['Charlie Brown', 'Dave Miller'], round: 2, points: 300, status: 'active' },
  { id: 'team-3', name: 'Cyber Shells', members: ['Eve Online', 'Frank Castle'], round: 3, points: 550, status: 'active' },
  { id: 'team-4', name: 'Root Kit', members: ['Grace Hopper', 'Heisenberg'], round: 1, points: 80, status: 'active' },
  { id: 'team-5', name: 'Shadow Brokers', members: ['Ivan Stark', 'Judy Hops'], round: 2, points: 220, status: 'active' }
];

export const INITIAL_CHALLENGES = [
  // Round 1
  { id: 'chal-101', title: 'Archive 01: Signal Intrusion', round: 1, archiveNumber: 1, order_number: 101, answer: 'CICADA2026_START', points: 100, isLocked: false, hintsEnabled: true, solvedCount: 5, timeLimit: 0, assets: [{ name: 'relay_handshake.txt', url: 'https://assets.cicada.org/relay_handshake.txt' }, { name: 'Beacon Spectrum', url: 'https://assets.cicada.org/beacon_spectrum.png' }] },
  { id: 'chal-102', title: 'Archive 02: Boot Sequence', round: 1, archiveNumber: 2, order_number: 102, answer: 'SECTOR7_OVERRIDE', points: 150, isLocked: false, hintsEnabled: true, solvedCount: 4, timeLimit: 2400, assets: [{ name: 'Core Service Manual', url: 'https://assets.cicada.org/manual.pdf' }, { name: 'boot_cfg.ini', url: 'https://assets.cicada.org/boot_cfg.ini' }] },
  { id: 'chal-103', title: 'Archive 03: Sector Telemetry', round: 1, archiveNumber: 3, order_number: 103, answer: '7-4-1', points: 200, isLocked: false, hintsEnabled: false, solvedCount: 3, timeLimit: 1800, assets: [{ name: 'Sector / Nav Map', url: 'https://assets.cicada.org/nav_map.png' }, { name: 'Research Audio Tape #3', url: 'https://assets.cicada.org/tape3.mp3' }] },
  { id: 'chal-104', title: 'Archive 04: Decrypted Transcript', round: 1, archiveNumber: 4, order_number: 104, answer: 'CREW_RESEARCH_ALPHA', points: 250, isLocked: false, hintsEnabled: false, solvedCount: 2, timeLimit: 0, assets: [] },
  // Round 2
  { id: 'chal-201', title: 'Archive 05: Core Payload Access', round: 2, archiveNumber: 1, order_number: 201, answer: 'ORBITAL_CORE_PAYLOAD', points: 300, isLocked: false, hintsEnabled: true, solvedCount: 1, timeLimit: 0, assets: [{ name: 'quantum_key.bin', url: 'https://assets.cicada.org/quantum_key.bin' }] },
  { id: 'chal-202', title: 'Archive 06: Final Override', round: 2, archiveNumber: 2, order_number: 202, answer: 'CICADA26_PURGE', points: 350, isLocked: false, hintsEnabled: false, solvedCount: 1, timeLimit: 0, assets: [] },
  // Round 3
  { id: 'chal-301', title: 'Archive 07: Quantum Lattice', round: 3, archiveNumber: 1, order_number: 301, answer: 'c1c4d4_pr1m3', points: 400, isLocked: true, hintsEnabled: false, solvedCount: 0, timeLimit: 240, assets: [{ name: 'lattice_schema.png', url: 'https://assets.cicada.org/lattice_schema.png' }] }
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

export const INITIAL_ROUNDS = [
  { id: 'round-1', name: 'Round 1', order_number: 1, story_fragment: { title: 'Signal Acquisition', header: 'FIRST CONTACT', content: 'A faint carrier wave was detected at 2067 Hz. Decrypt the initial transmission to establish the link.' }, is_active: true },
  { id: 'round-2', name: 'Round 2', order_number: 2, story_fragment: { title: 'Deep Resonance', header: 'SIGNAL STRENGTH INCREASING', content: 'The signal resolves into structured data. Follow the resonance deeper into the archive.' }, is_active: true },
  { id: 'round-3', name: 'Round 3', order_number: 3, story_fragment: { title: 'The Final Transmission', header: 'FINAL STAGE', content: 'The end of the transmission is near. Assemble every fragment to reveal the full message.' }, is_active: true }
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


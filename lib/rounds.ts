/*
 * rounds.ts — the six rounds, as data
 * ─────────────────────────────────────────────────────────────────
 * Split out of lib/tunnel.ts so pages can read the round content
 * without importing three.js. tunnel.ts does `import * as THREE`
 * at module scope, so anything importing ROUNDS from there risks
 * pulling ~600KB of WebGL into a route that only renders text —
 * and `transpilePackages: ["three"]` in next.config.js makes that
 * a bad thing to leave to tree-shaking.
 *
 * tunnel.ts re-exports everything here, so its existing importers
 * (components/TimelineSection.tsx) are unaffected.
 * ─────────────────────────────────────────────────────────────────
 */

export type RoundStatus = "COMPLETE" | "ACTIVE" | "LOCKED";

export interface Round {
  code: string;
  title: string;
  date: string;
  status: RoundStatus;
  summary: string;
  briefing: string;
  objectives: [string, string][];
}

export const ROUNDS: Round[] = [
  { code: 'ROUND 01', title: 'FIRST CONTACT', date: '14 MAR 2067', status: 'COMPLETE',
    summary: 'Initial transmission decoded. Entry accepted.',
    briefing: 'A single burst signal repeated for six days before it was caught. Once isolated, the payload resolved into an invitation, not a threat.',
    objectives: [['ISOLATE SIGNAL', 'COMPLETE'], ['DECODE PAYLOAD', 'COMPLETE'], ['CONFIRM ENTRY', 'COMPLETE']] },
  { code: 'ROUND 02', title: 'CIPHER PROTOCOL', date: '02 APR 2067', status: 'ACTIVE',
    summary: 'Decode the transmission. Uncover the next coordinate.',
    briefing: 'A looping numeric transmission repeats every eleven seconds. Isolate the pattern, invert it, and the next coordinate resolves.',
    objectives: [['DECODE PAYLOAD', 'IN PROGRESS'], ['VERIFY CHECKSUM', 'PENDING'], ['SUBMIT COORDINATE', 'LOCKED']] },
  { code: 'ROUND 03', title: 'DEEP FIELD SCAN', date: '21 APR 2067', status: 'LOCKED',
    summary: 'Coordinates unlock at close of Round 02.',
    briefing: 'Long range scan protocols are staged and waiting on authorization from the prior round.',
    objectives: [['SCAN ARRAY', 'LOCKED'], ['TRIANGULATE', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 04', title: 'SIGNAL TRIANGULATION', date: '09 MAY 2067', status: 'LOCKED',
    summary: 'Three signals converge on a single origin.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['CROSS REFERENCE', 'LOCKED'], ['PLOT VECTOR', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 05', title: 'THE LONG SILENCE', date: '28 MAY 2067', status: 'LOCKED',
    summary: 'No transmission is still a transmission.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['MONITOR FREQUENCY', 'LOCKED'], ['INTERPRET SILENCE', 'LOCKED'], ['LOG COORDINATE', 'LOCKED']] },
  { code: 'ROUND 06', title: 'FINAL DESCENT', date: '16 JUN 2067', status: 'LOCKED',
    summary: 'Last coordinate. No return signal past this point.',
    briefing: 'Details classified until the prior round clears.',
    objectives: [['CONFIRM DESCENT', 'LOCKED'], ['BRACE', 'LOCKED'], ['ARRIVE', 'LOCKED']] },
];

export const statusClass = (status: RoundStatus) =>
  status === "ACTIVE" ? "active" : status === "COMPLETE" ? "complete" : "locked";

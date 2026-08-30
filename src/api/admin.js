import { api } from "./client";

export async function listUsers() {
  return api("/api/admin/auth/users", { admin: true });
}

export async function getAdminActivityLogs(limit = 200) {
  return api(`/api/admin/auth/logs?limit=${limit}`, { admin: true });
}

export async function toggleRole({ target_user_id, target_email, role }) {
  return api("/api/admin/auth/toggle-role", { method: "POST", admin: true, body: { target_user_id, target_email, role } });
}

export async function approveAdmin({ target_user_id, target_email }) {
  return api("/api/admin/auth/approve-admin", { method: "POST", admin: true, body: { target_user_id, target_email } });
}

export async function deleteUser({ target_user_id, target_email }) {
  return api("/api/admin/auth/delete-user", { method: "POST", admin: true, body: { target_user_id, target_email } });
}

export async function bulkImportAdmins(payload) {
  return api("/api/admin/auth/bulk-import-admins", { method: "POST", admin: true, body: payload });
}

export async function getAdminChallenges() {
  return api("/api/admin/challenges/all", { admin: true });
}

export async function getAdminRounds() {
  return api("/api/admin/challenges/rounds", { admin: true });
}

export async function createRound(payload) {
  return api("/api/admin/challenges/rounds", { method: "POST", admin: true, body: payload });
}

export async function updateRound(id, payload) {
  return api(`/api/admin/challenges/rounds/${id}`, { method: "PUT", admin: true, body: payload });
}

export async function deleteRound(id) {
  return api(`/api/admin/challenges/rounds/${id}`, { method: "DELETE", admin: true });
}

export async function reorderRounds(ordered_ids) {
  return api("/api/admin/challenges/rounds/reorder", { method: "POST", admin: true, body: { ordered_ids } });
}

export async function getAdminProgress() {
  return api("/api/admin/challenges/progress", { admin: true });
}

export async function getLeaderboard() {
  return api("/api/leaderboard");
}

export async function createChallenge(payload) {
  return api("/api/admin/challenges", { method: "POST", admin: true, body: payload });
}

export async function updateChallenge(id, payload) {
  return api(`/api/admin/challenges/${id}`, { method: "PUT", admin: true, body: payload });
}

export async function addAsset(challengeId, payload) {
  return api(`/api/admin/challenges/${challengeId}/assets`, { method: "POST", admin: true, body: payload });
}

export async function deleteChallenge(id) {
  return api(`/api/admin/challenges/${id}`, { method: "DELETE", admin: true });
}

export async function editAsset(challengeId, assetIdentifier, payload) {
  return api(`/api/admin/challenges/${challengeId}/assets/${encodeURIComponent(assetIdentifier)}`, { method: "PUT", admin: true, body: payload });
}

export async function deleteAsset(challengeId, assetIdentifier) {
  return api(`/api/admin/challenges/${challengeId}/assets/${encodeURIComponent(assetIdentifier)}`, { method: "DELETE", admin: true });
}

export async function toggleHint(challengeId, hintId) {
  return api(`/api/admin/challenges/${challengeId}/hints/${encodeURIComponent(hintId)}/toggle`, { method: "PATCH", admin: true });
}

export async function adminOverride({ team_name, target_challenge_order, completed_challenges, reset_completed }) {
  const body = {
    team_name,
    target_challenge_order,
    completed_challenges: completed_challenges !== undefined ? completed_challenges : (target_challenge_order === 1 ? [] : undefined),
    reset_completed: reset_completed !== undefined ? reset_completed : (target_challenge_order === 1),
  };
  return api("/api/admin/challenges/override", { method: "POST", admin: true, body });
}

export async function removeTeamMember({ target_user_id, team_id }) {
  return api("/api/admin/teams/remove-member", { method: "POST", admin: true, body: { target_user_id, team_id } });
}

export async function adjustScore(teamIdOrName, payload) {
  return api(`/api/admin/teams/${encodeURIComponent(teamIdOrName)}/score`, { method: "PATCH", admin: true, body: payload });
}

export async function updateTeam(teamIdOrName, payload) {
  return api(`/api/admin/teams/${encodeURIComponent(teamIdOrName)}`, { method: "PATCH", admin: true, body: payload });
}

export async function deleteTeam(teamIdOrPayload) {
  const body = typeof teamIdOrPayload === "object" ? teamIdOrPayload : { team_id: teamIdOrPayload };
  return api("/api/admin/teams/delete-team", { method: "POST", admin: true, body });
}

export async function getIpTrackingStatus() {
  return api("/api/admin/challenges/ip-tracking", { admin: true });
}

export async function toggleIpTracking(enabled) {
  return api("/api/admin/challenges/ip-tracking/toggle", {
    method: "POST",
    admin: true,
    body: enabled !== undefined ? { enabled } : undefined,
  });
}

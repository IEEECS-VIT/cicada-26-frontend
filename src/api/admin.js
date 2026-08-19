import { api } from "./client";

export async function listUsers() {
  return api("/api/admin/auth/users", { admin: true });
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

export async function deleteChallenge(id) {
  return api(`/api/admin/challenges/${id}`, { method: "DELETE", admin: true });
}

export async function adminOverride({ team_name, target_challenge_order }) {
  return api("/api/admin/challenges/override", { method: "POST", admin: true, body: { team_name, target_challenge_order } });
}

export async function removeTeamMember({ target_user_id, team_id }) {
  return api("/api/admin/teams/remove-member", { method: "POST", admin: true, body: { target_user_id, team_id } });
}

export async function deleteTeam(team_id) {
  return api("/api/admin/teams/delete-team", { method: "POST", admin: true, body: { team_id } });
}

import { api } from "./client";

export async function fetchMyTeam() {
  return api("/api/teams/me/members");
}

export async function createTeam(team_name) {
  return api("/api/teams/create", { method: "POST", body: { team_name } });
}

export async function joinTeam(invite_code) {
  return api("/api/teams/join", { method: "POST", body: { invite_code } });
}

export async function updateTeamName(new_team_name) {
  return api("/api/teams/update-name", { method: "POST", body: { new_team_name } });
}

export async function leaveTeam() {
  return api("/api/teams/leave", { method: "POST" });
}

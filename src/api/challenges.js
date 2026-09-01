import { api, API_URL, getValidToken } from "./client";

/**
 * Fetch a challenge asset through the authenticated API. The backend masks
 * asset URLs as `/api/challenges/assets/masked?...`, which requires the auth
 * header that a plain <img>/<video>/<a> tag cannot send.
 */
export async function fetchMaskedAssetFile(maskedPath) {
  const token = await getValidToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${maskedPath}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch asset [HTTP ${res.status}]`);
  }
  return res.blob();
}

/**
 * True when the URL is a backend-masked proxy path rather than a direct URL.
 */
export function isMaskedAssetUrl(url = "") {
  return url.startsWith("/api/") || url.includes("/api/challenges/assets/");
}

export async function getChallenges() {
  return api("/api/challenges");
}

export async function getChallenge(identifier) {
  return api(`/api/challenges/${identifier}`);
}

export async function getProgress() {
  return api("/api/challenges/progress");
}

export async function getStoryFragments() {
  return api("/api/challenges/story-fragments");
}

export async function getRounds() {
  return api("/api/challenges/rounds");
}

export async function submitAnswer(challenge_identifier, answer) {
  return api("/api/challenges/submit", {
    method: "POST",
    body: { challenge_identifier, answer },
  });
}

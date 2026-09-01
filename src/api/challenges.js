import { api } from "./client";

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

export async function getRoundTimer() {
  return api("/api/challenges/round-timer");
}

export async function submitAnswer(challenge_identifier, answer) {
  return api("/api/challenges/submit", {
    method: "POST",
    body: { challenge_identifier, answer },
  });
}

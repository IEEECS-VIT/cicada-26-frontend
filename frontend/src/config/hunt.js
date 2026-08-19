/**
 * Terminal lock — participants cannot enter /terminal until HUNT_START_AT.
 *
 * The lock is OFF while you test. Flip HUNT_LOCK_ENABLED to true when the
 * hunt should wait on the countdown.
 */
export const HUNT_LOCK_ENABLED = false;

/** ISO 8601. IST is +05:30. */
export const HUNT_START_AT = "2026-09-20T10:00:00+05:30";

export function huntStartDate() {
  return new Date(HUNT_START_AT);
}

export function isHuntOpen(now = new Date()) {
  return now.getTime() >= huntStartDate().getTime();
}

export function msUntilHunt(now = new Date()) {
  return Math.max(0, huntStartDate().getTime() - now.getTime());
}

export function splitCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function pad(n) {
  return String(n).padStart(2, "0");
}

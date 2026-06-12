/**
 * @module state
 * @description Centralised application state. 
 * Completely syncs with SQLite backend. No localStorage dependencies.
 */

export const ECO_LEVELS = [
  { emoji: '🌱', name: 'Seedling',       minScore: 0,    maxScore: 99 },
  { emoji: '🌿', name: 'Sapling',        minScore: 100,  maxScore: 249 },
  { emoji: '🌳', name: 'Tree',           minScore: 250,  maxScore: 499 },
  { emoji: '🌲', name: 'Old Growth',     minScore: 500,  maxScore: 999 },
  { emoji: '🌍', name: 'Forest Guardian',minScore: 1000, maxScore: Infinity },
];

export let state = {
  logs: [],
  ecoScore: 0,
  streak: 0,
  lastLogDate: null,
  goal: 200,
  completedChallenges: [],
  unlockedAchievements: [],
  tipIndex: 0,
  currentPage: 'dashboard',
  analyticsPeriod: 'month',
};

/** Get the CSRF token from the document cookie for API requests. */
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;) ?csrfToken=([^;]*)(?:;|$)/);
  return match ? match[1] : '';
}

/** Push state to backend SQLite. */
export async function saveState() {
  try {
    await fetch('/api/me/state', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': getCsrfToken()
      },
      body: JSON.stringify(state)
    });
  } catch (err) {
    console.error('Failed to sync state:', err);
  }
}

/** Load state from backend SQLite, merging with defaults. */
export async function loadState() {
  try {
    const res = await fetch('/api/me/state');
    if (res.ok) {
      const remoteState = await res.json();
      state = { ...state, ...remoteState };
    }
  } catch (err) {
    console.error('Failed to load remote state:', err);
  }
}

/**
 * Merge a partial update into state and persist.
 * @param {Partial<typeof state>} patch
 */
export async function patchState(patch) {
  state = { ...state, ...patch };
  await saveState();
}

/**
 * Get the current Eco Level object for a given score.
 * @param {number} score
 */
export function getLevel(score) {
  return ECO_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore) || ECO_LEVELS[0];
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Debounce utility
 * @param {Function} fn
 * @param {number} wait
 */
export function debounce(fn, wait = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

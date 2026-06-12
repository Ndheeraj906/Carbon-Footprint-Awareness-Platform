/**
 * @module state
 * @description Centralised application state and persistence for EcoTrack.
 * Using localStorage intentionally for this client-side demo; a production
 * system would replace this with a secure server-side session store.
 */

export const ECO_LEVELS = [
  { emoji: '🌱', name: 'Seedling',       minScore: 0,    maxScore: 99 },
  { emoji: '🌿', name: 'Sapling',        minScore: 100,  maxScore: 249 },
  { emoji: '🌳', name: 'Tree',           minScore: 250,  maxScore: 499 },
  { emoji: '🌲', name: 'Old Growth',     minScore: 500,  maxScore: 999 },
  { emoji: '🌍', name: 'Forest Guardian',minScore: 1000, maxScore: Infinity },
];

/** @type {{ logs: Array, ecoScore: number, streak: number, lastLogDate: string|null, goal: number, completedChallenges: string[], unlockedAchievements: string[], tipIndex: number, currentPage: string, analyticsPeriod: string }} */
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

const STORAGE_KEY = 'ecotrack_v2';

/** Persist state to localStorage. */
export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Load state from localStorage, merging with defaults. */
export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = { ...state, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('EcoTrack: State parse error — starting fresh.', e);
    }
  }
}

/**
 * Merge a partial update into state and persist.
 * @param {Partial<typeof state>} patch
 */
export function patchState(patch) {
  state = { ...state, ...patch };
  saveState();
}

/**
 * Get the current Eco Level object for a given score.
 * @param {number} score
 * @returns {{ emoji: string, name: string, minScore: number, maxScore: number }}
 */
export function getLevel(score) {
  return ECO_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore) || ECO_LEVELS[0];
}

/**
 * Returns a YYYY-MM key for the given date (defaults to today).
 * @param {Date} [date]
 * @returns {string}
 */
export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format a date string to human-readable format.
 * @param {string|Date} d
 * @returns {string}
 */
export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Debounce utility — returns a function that delays invoking `fn`
 * until after `wait` ms have elapsed since the last call.
 * @param {Function} fn
 * @param {number} wait - milliseconds (default 150)
 * @returns {Function}
 */
export function debounce(fn, wait = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

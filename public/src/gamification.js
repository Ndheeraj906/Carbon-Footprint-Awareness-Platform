import DOMPurify from 'dompurify';
/**
 * @module gamification
 * @description Gamification engine for EcoTrack — achievements, challenges,
 * eco-levels, and streaks. Pure logic, no DOM side effects except toast calls.
 */

import { state, saveState, getLevel } from './state.js';

// ─── Constants ────────────────────────────────────────────────────────────────

export const CHALLENGES = [
  { id: 'c1', emoji: '🚶', name: 'Walk This Week',    desc: 'Replace at least 3 car trips with walking or cycling this week.',            points: 50 },
  { id: 'c2', emoji: '🥦', name: 'Meatless Monday',   desc: 'Skip meat every Monday for a month — plant-based all day.',                   points: 40 },
  { id: 'c3', emoji: '💡', name: 'Lights Out',         desc: 'Turn off all lights and unplug devices when leaving a room for 7 days.',     points: 30 },
  { id: 'c4', emoji: '🛍️', name: 'Zero New Clothes',   desc: 'Go one month without buying new clothing — thrift or borrow instead.',       points: 60 },
  { id: 'c5', emoji: '🚿', name: 'Short Showers',      desc: 'Keep all showers under 5 minutes for 2 weeks.',                              points: 25 },
  { id: 'c6', emoji: '🌱', name: 'Plant Something',    desc: 'Plant a tree, herb garden, or contribute to a reforestation project.',       points: 70 },
];

export const ACHIEVEMENTS = [
  { id: 'a1', emoji: '🌱', name: 'First Log',        desc: 'Log your first activity',             condition: (d) => d.logs.length >= 1 },
  { id: 'a2', emoji: '🏆', name: 'Week Warrior',     desc: 'Log activity 7 days in a row',        condition: (d) => d.streak >= 7 },
  { id: 'a3', emoji: '🌍', name: 'Below Global Avg', desc: 'Monthly CO₂ below 400 kg',            condition: (d) => d.lastMonthCO2 < 400 && d.lastMonthCO2 > 0 },
  { id: 'a4', emoji: '⚡', name: 'Energy Saver',     desc: 'Log energy data 3 times',             condition: (d) => d.logs.filter((l) => l.energy > 0).length >= 3 },
  { id: 'a5', emoji: '🚴', name: 'Cyclist',          desc: 'Log 100+ km cycling/walking',         condition: (d) => d.logs.reduce((s, l) => s + (l.cycleKm || 0), 0) >= 100 },
  { id: 'a6', emoji: '🥗', name: 'Plant Powered',    desc: 'Log 3 months with food CO₂ under 60 kg', condition: (d) => d.logs.filter((l) => l.food < 60).length >= 3 },
  { id: 'a7', emoji: '🎯', name: 'Goal Setter',      desc: 'Set your first reduction goal',       condition: (d) => d.goal > 0 },
  { id: 'a8', emoji: '🌳', name: 'Forest Guardian',  desc: 'Earn 500+ eco points',                condition: (d) => d.ecoScore >= 500 },
];

// ─── Streak Logic ─────────────────────────────────────────────────────────────

/**
 * Update the streak counter after a new activity log.
 * @param {Date} now
 */
export function updateStreak(now) {
  const today = now.toDateString();
  if (state.lastLogDate !== today) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    state.streak = state.lastLogDate === yesterday.toDateString() ? state.streak + 1 : 1;
    state.lastLogDate = today;
  }
}

/**
 * Calculate eco points earned for a given CO₂ total.
 * @param {number} total - Total CO₂ in kg
 * @returns {number} Points earned
 */
export function calcPoints(total) {
  const base = 20;
  const bonus = total < 200 ? 30 : total < 400 ? 15 : 0;
  return base + bonus;
}

// ─── Achievement Checking ──────────────────────────────────────────────────────

/**
 * Check all achievements against current state.
 * Unlocks any newly qualifying achievements and schedules toast notifications.
 * @param {Function} showToast - Toast display function
 */
export function checkAchievements(showToast) {
  const data = {
    logs: state.logs,
    streak: state.streak,
    lastMonthCO2: state.logs.slice(-1)[0]?.total || 0,
    ecoScore: state.ecoScore,
    goal: state.goal,
  };
  let newUnlocks = 0;
  ACHIEVEMENTS.forEach((a) => {
    if (!state.unlockedAchievements.includes(a.id) && a.condition(data)) {
      state.unlockedAchievements.push(a.id);
      newUnlocks++;
      setTimeout(() => showToast(`🏆 Achievement unlocked: ${a.name}!`), 500 * newUnlocks);
    }
  });
}

// ─── Challenge Completion ─────────────────────────────────────────────────────

/**
 * Mark a challenge as complete.
 * @param {string} id - Challenge ID
 * @param {number} points - Points to award
 * @param {Function} showToast
 * @param {Function} onComplete - Callback after state update
 */
export function completeChallenge(id, points, showToast, onComplete) {
  if (state.completedChallenges.includes(id)) return;
  state.completedChallenges.push(id);
  state.ecoScore += points;
  checkAchievements(showToast);
  saveState();
  showToast(`🎉 Challenge complete! +${points} eco points`);
  if (onComplete) onComplete();
}

// ─── Rendering ────────────────────────────────────────────────────────────────

/**
 * Render challenges grid into a container element.
 * @param {HTMLElement} el
 * @param {Function} completeChallengeHandler - window-exposed handler
 */
export function renderChallenges(el) {
  el.innerHTML = DOMPurify.sanitize(CHALLENGES.map((c) => {
    const done = state.completedChallenges.includes(c.id);
    return `<div class="challenge-card ${done ? 'completed' : ''}">
      <div class="challenge-emoji">${c.emoji}</div>
      <div class="challenge-name">${c.name}</div>
      <div class="challenge-desc">${c.desc}</div>
      <div class="challenge-points">+${c.points} eco points</div>
      <button class="challenge-complete-btn ${done ? 'done' : ''}"
        onclick="${done ? '' : `completeChallenge('${c.id}', ${c.points})`}"
        ${done ? 'disabled' : ''}
        aria-label="${done ? 'Challenge completed' : `Complete challenge: ${c.name}`}">
        ${done ? '✅ Completed!' : '✓ Mark Complete'}
      </button>
    </div>`;
  }).join(''));
}

/**
 * Render achievements grid.
 * @param {HTMLElement} el
 * @param {HTMLElement} countEl
 */
export function renderAchievements(el, countEl) {
  el.innerHTML = DOMPurify.sanitize(ACHIEVEMENTS.map((a) => {
    const unlocked = state.unlockedAchievements.includes(a.id);
    return `<div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}" role="listitem" aria-label="${a.name}: ${unlocked ? 'Unlocked' : 'Locked'}">
      <div class="achievement-icon">${a.emoji}</div>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.desc}</div>
    </div>`;
  }).join(''));
  const count = state.unlockedAchievements.length;
  countEl.textContent = `${count} / ${ACHIEVEMENTS.length} unlocked`;
}

/**
 * Render levels list.
 * @param {HTMLElement} el
 * @param {Array} ecoLevels
 */
export function renderLevels(el, ecoLevels) {
  const currentLevel = getLevel(state.ecoScore);
  el.innerHTML = DOMPurify.sanitize(ecoLevels.map((l) => `
    <div class="level-item ${l.name === currentLevel.name ? 'current' : ''}">
      <div class="level-emoji">${l.emoji}</div>
      <div class="level-info">
        <div class="level-name">${l.name}</div>
        <div class="level-req">${l.minScore === 0 ? 'Starting level' : `${l.minScore}+ eco points`}</div>
      </div>
      ${l.name === currentLevel.name ? '<span class="level-badge active-badge">Current Level</span>' : ''}
    </div>
  `).join(''));
}

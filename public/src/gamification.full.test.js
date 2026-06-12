/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import {
  updateStreak,
  calcPoints,
  checkAchievements,
  completeChallenge,
  renderChallenges,
  renderAchievements,
  renderLevels,
  CHALLENGES,
  ACHIEVEMENTS
} from './gamification.js';
import { state } from './state.js';

describe('Gamification Module — Full Coverage', () => {
  beforeEach(() => {
    state.streak = 0;
    state.lastLogDate = null;
    state.logs = [];
    state.ecoScore = 0;
    state.goal = 0;
    state.completedChallenges = [];
    state.unlockedAchievements = [];
    document.body.innerHTML = '';
    // Mock fetch globally so saveState doesn't throw
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    // Mock document.cookie for getCsrfToken
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrfToken=mock-token',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  // ─── CHALLENGES constant ───────────────────────────────────────────────────────
  describe('CHALLENGES constant', () => {
    it('should export 6 challenges', () => {
      expect(CHALLENGES.length).toBe(6);
    });
    it('each challenge should have id, name, desc, points, emoji', () => {
      CHALLENGES.forEach(c => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('desc');
        expect(c).toHaveProperty('points');
        expect(c).toHaveProperty('emoji');
      });
    });
  });

  // ─── ACHIEVEMENTS constant ─────────────────────────────────────────────────────
  describe('ACHIEVEMENTS constant', () => {
    it('should export 8 achievements', () => {
      expect(ACHIEVEMENTS.length).toBe(8);
    });
    it('each achievement should have id, name, desc, emoji, condition', () => {
      ACHIEVEMENTS.forEach(a => {
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('name');
        expect(a).toHaveProperty('desc');
        expect(a).toHaveProperty('emoji');
        expect(typeof a.condition).toBe('function');
      });
    });
  });

  // ─── Achievement conditions ────────────────────────────────────────────────────
  describe('Achievement condition functions', () => {
    it('a1 (First Log): triggers after 1+ logs', () => {
      const a1 = ACHIEVEMENTS.find(a => a.id === 'a1');
      expect(a1.condition({ logs: [{}] })).toBeTruthy();
      expect(a1.condition({ logs: [] })).toBeFalsy();
    });
    it('a2 (Week Warrior): triggers at streak >= 7', () => {
      const a2 = ACHIEVEMENTS.find(a => a.id === 'a2');
      expect(a2.condition({ streak: 7 })).toBeTruthy();
      expect(a2.condition({ streak: 6 })).toBeFalsy();
    });
    it('a3 (Below Global Avg): triggers when lastMonthCO2 is 0 < x < 400', () => {
      const a3 = ACHIEVEMENTS.find(a => a.id === 'a3');
      expect(a3.condition({ lastMonthCO2: 300 })).toBeTruthy();
      expect(a3.condition({ lastMonthCO2: 0 })).toBeFalsy();
      expect(a3.condition({ lastMonthCO2: 500 })).toBeFalsy();
    });
    it('a4 (Energy Saver): triggers when 3+ energy logs', () => {
      const a4 = ACHIEVEMENTS.find(a => a.id === 'a4');
      expect(a4.condition({ logs: [{energy:1},{energy:1},{energy:1}] })).toBeTruthy();
      expect(a4.condition({ logs: [{energy:1}] })).toBeFalsy();
    });
    it('a5 (Cyclist): triggers at 100+ km cycling total', () => {
      const a5 = ACHIEVEMENTS.find(a => a.id === 'a5');
      expect(a5.condition({ logs: [{cycleKm:100}] })).toBeTruthy();
      expect(a5.condition({ logs: [{cycleKm:50}] })).toBeFalsy();
    });
    it('a6 (Plant Powered): triggers at 3+ months with food < 60', () => {
      const a6 = ACHIEVEMENTS.find(a => a.id === 'a6');
      expect(a6.condition({ logs: [{food:50},{food:40},{food:30}] })).toBeTruthy();
      expect(a6.condition({ logs: [{food:50}] })).toBeFalsy();
    });
    it('a7 (Goal Setter): triggers when goal > 0', () => {
      const a7 = ACHIEVEMENTS.find(a => a.id === 'a7');
      expect(a7.condition({ goal: 100 })).toBeTruthy();
      expect(a7.condition({ goal: 0 })).toBeFalsy();
    });
    it('a8 (Forest Guardian): triggers at 500+ eco score', () => {
      const a8 = ACHIEVEMENTS.find(a => a.id === 'a8');
      expect(a8.condition({ ecoScore: 500 })).toBeTruthy();
      expect(a8.condition({ ecoScore: 499 })).toBeFalsy();
    });
  });

  // ─── checkAchievements ─────────────────────────────────────────────────────────
  describe('checkAchievements()', () => {
    it('should unlock achievements when conditions are met', () => {
      jest.useFakeTimers();
      state.logs = [{ energy: 5, total: 100 }];
      state.streak = 0;
      state.ecoScore = 0;
      state.goal = 0;

      const showToast = jest.fn();
      checkAchievements(showToast);
      jest.runAllTimers();
      jest.useRealTimers();

      expect(state.unlockedAchievements).toContain('a1');
    });

    it('should not re-unlock already unlocked achievements', () => {
      state.unlockedAchievements = ['a1'];
      state.logs = [{ energy: 5, total: 100 }];
      const showToast = jest.fn();
      checkAchievements(showToast);
      const a1Count = state.unlockedAchievements.filter(id => id === 'a1').length;
      expect(a1Count).toBe(1);
    });

    it('should call showToast for each newly unlocked achievement', () => {
      jest.useFakeTimers();
      state.logs = [{ energy: 5, total: 100 }];
      state.ecoScore = 600;
      state.goal = 200;
      const showToast = jest.fn();
      checkAchievements(showToast);
      jest.runAllTimers();
      jest.useRealTimers();
      expect(showToast.mock.calls.length).toBeGreaterThan(0);
    });
  });

  // ─── completeChallenge ─────────────────────────────────────────────────────────
  describe('completeChallenge()', () => {
    it('should mark challenge as complete and award points', () => {
      const showToast = jest.fn();
      const onComplete = jest.fn();
      completeChallenge('c1', 50, showToast, onComplete);
      expect(state.completedChallenges).toContain('c1');
      expect(state.ecoScore).toBe(50);
      expect(showToast).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should not complete a challenge already completed', () => {
      state.completedChallenges = ['c1'];
      state.ecoScore = 100;
      const showToast = jest.fn();
      completeChallenge('c1', 50, showToast);
      expect(state.ecoScore).toBe(100); // unchanged
    });

    it('should work without onComplete callback', () => {
      const showToast = jest.fn();
      expect(() => completeChallenge('c2', 40, showToast)).not.toThrow();
    });
  });

  // ─── renderChallenges ──────────────────────────────────────────────────────────
  describe('renderChallenges()', () => {
    it('should render all 6 challenge cards', () => {
      const el = document.createElement('div');
      renderChallenges(el);
      expect(el.querySelectorAll('.challenge-card').length).toBe(6);
    });

    it('should show "completed" class for done challenges', () => {
      state.completedChallenges = ['c1', 'c2'];
      const el = document.createElement('div');
      renderChallenges(el);
      const completed = el.querySelectorAll('.challenge-card.completed');
      expect(completed.length).toBe(2);
    });
  });

  // ─── renderAchievements ────────────────────────────────────────────────────────
  describe('renderAchievements()', () => {
    it('should render all 8 achievement items', () => {
      const el = document.createElement('div');
      const countEl = document.createElement('div');
      renderAchievements(el, countEl);
      expect(el.querySelectorAll('.achievement-item').length).toBe(8);
    });

    it('should show unlocked class for unlocked achievements', () => {
      state.unlockedAchievements = ['a1', 'a2'];
      const el = document.createElement('div');
      const countEl = document.createElement('div');
      renderAchievements(el, countEl);
      expect(el.querySelectorAll('.unlocked').length).toBe(2);
      expect(countEl.textContent).toContain('2 / 8');
    });
  });

  // ─── renderLevels ─────────────────────────────────────────────────────────────
  describe('renderLevels()', () => {
    it('should render all provided eco levels', () => {
      const el = document.createElement('div');
      const levels = [
        { name: 'Seedling', minScore: 0, emoji: '🌱', color: '#22c55e' },
        { name: 'Sapling', minScore: 100, emoji: '🌿', color: '#0ea5e9' }
      ];
      state.ecoScore = 0;
      renderLevels(el, levels);
      expect(el.querySelectorAll('.level-item').length).toBe(2);
    });

    it('should mark the current level with active-badge', () => {
      const el = document.createElement('div');
      const levels = [
        { name: 'Seedling', minScore: 0, emoji: '🌱', color: '#22c55e' },
        { name: 'Sapling', minScore: 100, emoji: '🌿', color: '#0ea5e9' }
      ];
      state.ecoScore = 0;
      renderLevels(el, levels);
      expect(el.innerHTML).toContain('active-badge');
    });
  });
});

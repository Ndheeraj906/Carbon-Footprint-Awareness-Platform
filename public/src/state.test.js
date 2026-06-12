/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import {
  state,
  saveState,
  loadState,
  patchState,
  getLevel,
  getMonthKey,
  formatDate,
  debounce,
  ECO_LEVELS
} from './state.js';

describe('State Module', () => {
  beforeEach(() => {
    // Reset state to defaults
    state.logs = [];
    state.ecoScore = 0;
    state.streak = 0;
    state.lastLogDate = null;
    state.goal = 200;
    state.completedChallenges = [];
    state.unlockedAchievements = [];
    state.tipIndex = 0;
    state.currentPage = 'dashboard';
    state.analyticsPeriod = 'month';
    // Mock document.cookie for getCsrfToken
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrfToken=test-csrf-token',
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getLevel()', () => {
    it('should return Seedling at 0 eco points', () => {
      expect(getLevel(0).name).toBe('Seedling');
    });

    it('should return Sapling at 100 eco points', () => {
      expect(getLevel(100).name).toBe('Sapling');
    });

    it('should return Tree at 250 eco points', () => {
      expect(getLevel(250).name).toBe('Tree');
    });

    it('should return Old Growth at 500 eco points', () => {
      expect(getLevel(500).name).toBe('Old Growth');
    });

    it('should return Forest Guardian at 1000 eco points', () => {
      expect(getLevel(1000).name).toBe('Forest Guardian');
    });

    it('should fallback to Seedling for invalid scores', () => {
      expect(getLevel(-100).name).toBe('Seedling');
    });
  });

  describe('getMonthKey()', () => {
    it('should return a YYYY-MM formatted key for the current date', () => {
      const key = getMonthKey(new Date('2026-06-15'));
      expect(key).toBe('2026-06');
    });

    it('should pad single-digit months', () => {
      expect(getMonthKey(new Date('2026-01-01'))).toBe('2026-01');
    });

    it('should use the current date if none provided', () => {
      const key = getMonthKey();
      expect(key).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('formatDate()', () => {
    it('should format a date string into a readable format', () => {
      const result = formatDate('2026-06-12');
      expect(result).toContain('2026');
      expect(result).toContain('Jun');
    });
  });

  describe('debounce()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not call function immediately', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function after the wait period', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced('hello', 42);
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('hello', 42);
    });
  });

  describe('saveState()', () => {
    it('should POST state to /api/me/state with CSRF token', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      await saveState();
      expect(global.fetch).toHaveBeenCalledWith('/api/me/state', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-csrf-token': 'test-csrf-token' })
      }));
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      // Should not throw
      await expect(saveState()).resolves.toBeUndefined();
    });
  });

  describe('loadState()', () => {
    it('should fetch state from /api/me/state and merge with defaults', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ecoScore: 500, streak: 10 })
      });
      await loadState();
      expect(state.ecoScore).toBe(500);
      expect(state.streak).toBe(10);
    });

    it('should handle non-ok response gracefully', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      await loadState();
      expect(state.ecoScore).toBe(0); // unchanged from default
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(loadState()).resolves.toBeUndefined();
    });
  });

  describe('patchState()', () => {
    it('should merge patch into state and save', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });
      await patchState({ ecoScore: 250, streak: 3 });
      expect(state.ecoScore).toBe(250);
      expect(state.streak).toBe(3);
    });
  });

  describe('ECO_LEVELS', () => {
    it('should have 5 levels defined', () => {
      expect(ECO_LEVELS.length).toBe(5);
    });

    it('should start from 0 and end at Infinity', () => {
      expect(ECO_LEVELS[0].minScore).toBe(0);
      expect(ECO_LEVELS[4].maxScore).toBe(Infinity);
    });
  });
});

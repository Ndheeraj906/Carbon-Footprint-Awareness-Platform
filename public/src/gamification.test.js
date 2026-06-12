import { updateStreak, calcPoints } from './gamification.js';
import { state } from './state.js';

describe('Gamification Engine', () => {
  beforeEach(() => {
    state.streak = 0;
    state.lastLogDate = null;
  });

  it('should start streak at 1 on first log', () => {
    const d = new Date('2026-06-12T12:00:00Z');
    updateStreak(d);
    expect(state.streak).toBe(1);
    expect(state.lastLogDate).toBe(d.toDateString());
  });

  it('should maintain streak if logging on the same day', () => {
    const d1 = new Date('2026-06-12T10:00:00Z');
    const d2 = new Date('2026-06-12T15:00:00Z');
    updateStreak(d1);
    expect(state.streak).toBe(1);
    
    updateStreak(d2);
    expect(state.streak).toBe(1); // doesn't increment on same day
  });

  it('should increment streak if logging on consecutive days', () => {
    const d1 = new Date('2026-06-12T10:00:00Z');
    const d2 = new Date('2026-06-13T10:00:00Z');
    
    updateStreak(d1);
    updateStreak(d2);
    expect(state.streak).toBe(2);
  });

  it('should reset streak if a day is missed', () => {
    const d1 = new Date('2026-06-12T10:00:00Z');
    const d2 = new Date('2026-06-14T10:00:00Z'); // missed the 13th
    
    updateStreak(d1);
    state.streak = 5; // artificially set streak
    
    updateStreak(d2);
    expect(state.streak).toBe(1);
  });

  describe('calcPoints', () => {
    it('should award 50 points for low emissions (< 200kg)', () => {
      expect(calcPoints(49)).toBe(50);
      expect(calcPoints(100)).toBe(50);
    });

    it('should award 35 points for moderate emissions (< 400kg)', () => {
      expect(calcPoints(300)).toBe(35);
    });

    it('should award 20 points for high emissions (>= 400kg)', () => {
      expect(calcPoints(600)).toBe(20);
    });
  });
});

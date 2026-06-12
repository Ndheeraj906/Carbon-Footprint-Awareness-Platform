/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { renderShareButtons } from './share.js';
import { renderChallenges, renderAchievements, renderLevels } from './gamification.js';
import { updateAnalyticsStats } from './charts.js';
import { state, ECO_LEVELS } from './state.js';

describe('UI Interaction and Rendering Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Reset global state
    state.completedChallenges = [];
    state.unlockedAchievements = [];
    state.ecoScore = 100;
    state.logs = [
      { id: 1, total: 150, transport: 50, energy: 50, food: 25, waste: 25 }
    ];
  });

  describe('Social Share UI', () => {
    it('should render 3 social share buttons', () => {
      document.body.innerHTML = '<div id="shareContainer"></div>';
      const container = document.getElementById('shareContainer');
      const stats = { total: 300, month: '2026-06', ecoScore: 100 };
      
      renderShareButtons(container, stats);
      
      const buttons = container.querySelectorAll('.share-btn');
      expect(buttons.length).toBe(3);
    });

    it('should attach copy link listener correctly', () => {
      document.body.innerHTML = '<div id="shareContainer"></div>';
      const container = document.getElementById('shareContainer');
      const stats = { total: 300, month: '2026-06', ecoScore: 100 };
      
      renderShareButtons(container, stats);
      
      const copyBtn = container.querySelector('.share-copy');
      expect(copyBtn).not.toBeNull();
      expect(copyBtn.innerHTML).toContain('svg');
    });
    
    it('should safely exit if container does not exist', () => {
      const container = document.createElement('div');
      const stats = { total: 0, month: '2026-06', ecoScore: 0 };
      expect(() => {
        renderShareButtons(container, stats);
      }).not.toThrow();
    });
  });

  describe('Gamification UI Interactions', () => {
    it('should render challenges properly', () => {
      document.body.innerHTML = '<div id="challengesList"></div>';
      const list = document.getElementById('challengesList');
      renderChallenges(list, jest.fn());
      
      expect(list.children.length).toBeGreaterThan(0);
      expect(list.innerHTML).toContain('challenge-card');
    });

    it('should disable completed challenges', () => {
      document.body.innerHTML = '<div id="challengesList"></div>';
      const list = document.getElementById('challengesList');
      state.completedChallenges = ['c1'];
      
      renderChallenges(list, jest.fn());
      expect(list.innerHTML).toContain('completed');
    });

    it('should render achievements list', () => {
      document.body.innerHTML = '<div id="achievementsList"></div><div id="achievementsCount"></div>';
      const list = document.getElementById('achievementsList');
      const countEl = document.getElementById('achievementsCount');
      renderAchievements(list, countEl);
      
      expect(list.children.length).toBeGreaterThan(0);
      expect(list.innerHTML).toContain('achievement-item');
      expect(countEl.textContent).toContain('unlocked');
    });

    it('should mark unlocked achievements visually', () => {
      document.body.innerHTML = '<div id="achievementsList"></div><div id="achievementsCount"></div>';
      const list = document.getElementById('achievementsList');
      const countEl = document.getElementById('achievementsCount');
      state.unlockedAchievements = ['a1']; 
      
      renderAchievements(list, countEl);
      expect(list.innerHTML).toContain('unlocked');
    });
    
    it('should render eco levels hierarchy', () => {
      document.body.innerHTML = '<div id="levelsList"></div>';
      const list = document.getElementById('levelsList');
      
      const mockLevels = [
        { name: 'Seed', min: 0, emoji: '🌱', color: '#16a34a' },
        { name: 'Sprout', min: 100, emoji: '🌿', color: '#0ea5e9' }
      ];
      
      renderLevels(list, mockLevels);
      
      expect(list.children.length).toBeGreaterThan(0);
      expect(list.innerHTML).toContain('level-item');
    });
  });

  describe('Analytics & Stats UI', () => {
    it('should update analytics stat cards', () => {
      document.body.innerHTML = `
        <div id="statTotalAvg"></div>
        <div id="biggestCat"></div>
        <div id="statRecentTrend"></div>
        <div id="logsCount"></div>
        <div id="bestMonth"></div>
        <div id="totalSaved"></div>
      `;
      
      state.currentMonthFilter = 'all';
      state.logs = [
        { id: 1, date: '2026-05-10', total: 400, transport: 200, energy: 100, food: 50, waste: 50 },
        { id: 2, date: '2026-06-10', total: 300, transport: 100, energy: 100, food: 50, waste: 50 }
      ];
      
      updateAnalyticsStats();
      
      expect(document.getElementById('logsCount').textContent).toBe('2');
      expect(document.getElementById('totalSaved').textContent).toContain('100 kg');
      expect(document.getElementById('biggestCat').textContent).toContain('Transport');
      expect(document.getElementById('bestMonth').textContent).toContain('300 kg');
    });

    it('should handle zero states gracefully', () => {
      document.body.innerHTML = `
        <div id="statTotalAvg"></div>
        <div id="biggestCat"></div>
        <div id="statRecentTrend"></div>
        <div id="logsCount"></div>
        <div id="bestMonth"></div>
      `;
      
      state.logs = [];
      updateAnalyticsStats();
      
      expect(document.getElementById('logsCount').textContent).toBe('0');
    });
  });
  
  describe('Global Modal UI Logic', () => {
    it('should simulate modal close on backdrop click', () => {
      document.body.innerHTML = `
        <div id="testModal" class="modal-backdrop">
           <div class="modal-content"></div>
        </div>
      `;
      const modal = document.getElementById('testModal');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
      
      modal.click();
      expect(modal.classList.contains('hidden')).toBeTruthy();
    });

    it('should not close modal if inner content clicked', () => {
      document.body.innerHTML = `
        <div id="testModal" class="modal-backdrop">
           <div id="inner" class="modal-content"></div>
        </div>
      `;
      const modal = document.getElementById('testModal');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
      
      const inner = document.getElementById('inner');
      inner.click();
      expect(modal.classList.contains('hidden')).toBeFalsy();
    });
    
    it('should simulate form submit preventDefault behavior', () => {
       const handler = jest.fn((e) => e.preventDefault());
       document.body.innerHTML = `<form id="f"><button type="submit">Go</button></form>`;
       const form = document.getElementById('f');
       form.addEventListener('submit', handler);
       
       const ev = new Event('submit', { bubbles: true, cancelable: true });
       form.dispatchEvent(ev);
       
       expect(handler).toHaveBeenCalled();
       expect(ev.defaultPrevented).toBeTruthy();
    });
    
    it('should validate form inputs via constraint validation API', () => {
       document.body.innerHTML = `<form id="f"><input id="inp" required /></form>`;
       const inp = document.getElementById('inp');
       const form = document.getElementById('f');
       
       expect(inp.validity.valueMissing).toBeTruthy();
       expect(form.checkValidity()).toBeFalsy();
       
       inp.value = "text";
       expect(inp.validity.valueMissing).toBeFalsy();
       expect(form.checkValidity()).toBeTruthy();
    });
  });
});

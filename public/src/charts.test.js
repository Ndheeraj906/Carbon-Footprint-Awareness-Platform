/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { state } from './state.js';

// Mock Chart.js as a global (it's loaded via CDN in the browser)
globalThis.Chart = class MockChart {
  constructor() {
    this.data = {};
    this.options = {};
  }
  destroy() {}
  update() {}
};

import {
  updateCategoryDonut,
  renderTrendChart,
  renderCategoryBarChart,
  renderBreakdownChart,
  updateAnalyticsStats,
  charts
} from './charts.js';

// Helper: create a minimal DOM structure for chart rendering
function setupChartDom() {
  document.body.innerHTML = `
    <canvas id="categoryChart"></canvas>
    <div id="chartCenterVal"></div>
    <div id="donutLegend"></div>
    <canvas id="trendChart"></canvas>
    <div id="trendIndicator"></div>
    <canvas id="categoryBarChart"></canvas>
    <canvas id="breakdownChart"></canvas>
    <div id="logsCount"></div>
    <div id="biggestCat"></div>
    <div id="statRecentTrend"></div>
    <div id="statTotalAvg"></div>
    <div id="bestMonth"></div>
    <div id="totalSaved"></div>
  `;
  // Polyfill getContext for jsdom
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    fillText: jest.fn(),
  }));
}

describe('Charts Module', () => {
  beforeEach(() => {
    setupChartDom();
    state.logs = [];
    state.analyticsPeriod = 'all';
    // Clear chart registry
    Object.keys(charts).forEach(k => delete charts[k]);
  });

  describe('updateCategoryDonut()', () => {
    it('should render donut with empty logs showing zero total', () => {
      updateCategoryDonut([]);
      expect(document.getElementById('chartCenterVal').textContent).toBe('0');
    });

    it('should render donut with log data', () => {
      const logs = [{ transport: 100, energy: 80, food: 60, waste: 40 }];
      updateCategoryDonut(logs);
      expect(document.getElementById('chartCenterVal').textContent).toBe('280');
      expect(document.getElementById('donutLegend').innerHTML).toContain('Transport');
    });

    it('should destroy previous chart instance if it exists', () => {
      const mockDestroy = jest.fn();
      charts.categoryChart = { destroy: mockDestroy };
      updateCategoryDonut([]);
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('renderTrendChart()', () => {
    it('should render trend chart with no data', () => {
      state.logs = [];
      renderTrendChart();
      expect(document.getElementById('trendChart')).not.toBeNull();
    });

    it('should render trend chart with data and update trend indicator', () => {
      state.analyticsPeriod = 'all';
      const now = new Date();
      state.logs = [
        { date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(), total: 400 },
        { date: now.toISOString(), total: 300 },
      ];
      renderTrendChart();
      const indicator = document.getElementById('trendIndicator');
      expect(indicator.textContent).toContain('reduced');
    });

    it('should show "increased" when latest emissions are higher', () => {
      state.analyticsPeriod = 'all';
      const now = new Date();
      state.logs = [
        { date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(), total: 200 },
        { date: now.toISOString(), total: 500 },
      ];
      renderTrendChart();
      expect(document.getElementById('trendIndicator').textContent).toContain('increased');
    });

    it('should destroy previous chart instance', () => {
      const mockDestroy = jest.fn();
      charts.trendChart = { destroy: mockDestroy };
      state.logs = [];
      renderTrendChart();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('renderCategoryBarChart()', () => {
    it('should render category bar chart', () => {
      state.logs = [{ transport: 100, energy: 50, food: 75, waste: 25, date: new Date().toISOString(), total: 250 }];
      state.analyticsPeriod = 'all';
      renderCategoryBarChart();
      expect(document.getElementById('categoryBarChart')).not.toBeNull();
    });

    it('should destroy previous chart instance', () => {
      const mockDestroy = jest.fn();
      charts.categoryBarChart = { destroy: mockDestroy };
      state.logs = [];
      renderCategoryBarChart();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('renderBreakdownChart()', () => {
    it('should render breakdown chart with no data (shows placeholder)', () => {
      state.logs = [];
      renderBreakdownChart();
      expect(document.getElementById('breakdownChart')).not.toBeNull();
    });

    it('should render breakdown chart with actual data', () => {
      state.logs = [{ transport: 100, energy: 50, food: 75, waste: 25, date: new Date().toISOString(), total: 250 }];
      state.analyticsPeriod = 'all';
      renderBreakdownChart();
      expect(document.getElementById('breakdownChart')).not.toBeNull();
    });

    it('should destroy previous chart instance', () => {
      const mockDestroy = jest.fn();
      charts.breakdownChart = { destroy: mockDestroy };
      state.logs = [];
      renderBreakdownChart();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('updateAnalyticsStats()', () => {
    it('should show "above avg" when emissions exceed global average', () => {
      state.analyticsPeriod = 'all';
      state.logs = [
        { date: new Date().toISOString(), total: 800, transport: 400, energy: 200, food: 150, waste: 50 }
      ];
      updateAnalyticsStats();
      expect(document.getElementById('totalSaved').textContent).toContain('above avg');
    });

    it('should show "below avg" when emissions are low', () => {
      state.analyticsPeriod = 'all';
      state.logs = [
        { date: new Date().toISOString(), total: 100, transport: 50, energy: 25, food: 15, waste: 10 }
      ];
      updateAnalyticsStats();
      expect(document.getElementById('totalSaved').textContent).toContain('below avg');
    });

    it('should handle month filter', () => {
      state.analyticsPeriod = 'month';
      state.logs = [
        { date: new Date().toISOString(), total: 300, transport: 100, energy: 100, food: 50, waste: 50 }
      ];
      updateAnalyticsStats();
      expect(document.getElementById('logsCount').textContent).toBe('1');
    });

    it('should handle quarter filter', () => {
      state.analyticsPeriod = 'quarter';
      state.logs = [
        { date: new Date().toISOString(), total: 250, transport: 80, energy: 70, food: 60, waste: 40 }
      ];
      updateAnalyticsStats();
      expect(document.getElementById('logsCount').textContent).toBe('1');
    });
  });
});

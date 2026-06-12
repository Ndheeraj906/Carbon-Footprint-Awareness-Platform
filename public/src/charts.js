import DOMPurify from 'dompurify';
/**
 * @module charts
 * @description Chart rendering functions for EcoTrack Analytics.
 * Manages all Chart.js instances and aria-accessible canvas wrappers.
 */

import { state, formatDate } from './state.js';

/** Shared chart instance registry — destroyed and recreated on each render. */
export const charts = {};

// ─── ARIA Helpers ──────────────────────────────────────────────────────────────

/**
 * Apply ARIA attributes to a canvas for screen reader accessibility.
 * @param {HTMLCanvasElement} canvas
 * @param {string} label - Descriptive label
 */
function setCanvasAria(canvas, label) {
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', label);
}

// ─── Dashboard Donut ──────────────────────────────────────────────────────────

/**
 * Render the category donut chart on the dashboard.
 * @param {Array} logs - Activity log entries for the current month
 */
export function updateCategoryDonut(logs) {
  const totals = { transport: 0, energy: 0, food: 0, waste: 0 };
  logs.forEach((l) => {
    totals.transport += l.transport || 0;
    totals.energy += l.energy || 0;
    totals.food += l.food || 0;
    totals.waste += l.waste || 0;
  });
  const total = Object.values(totals).reduce((s, v) => s + v, 0);

  document.getElementById('chartCenterVal').textContent = total.toFixed(0);

  const canvas = document.getElementById('categoryChart');
  setCanvasAria(canvas, `Donut chart showing CO₂ breakdown: Transport ${totals.transport.toFixed(0)}kg, Energy ${totals.energy.toFixed(0)}kg, Food ${totals.food.toFixed(0)}kg, Waste ${totals.waste.toFixed(0)}kg`);

  const ctx = canvas.getContext('2d');
  const data = [totals.transport, totals.energy, totals.food, totals.waste];
  const colors = ['#3b82f6', '#eab308', '#f97316', '#a855f7'];
  const labels = ['Transport', 'Energy', 'Food', 'Waste'];

  if (charts.categoryChart) charts.categoryChart.destroy();
  charts.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: total === 0 ? [1, 1, 1, 1] : data,
        backgroundColor: total === 0
          ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']
          : colors,
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '72%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { enabled: total > 0 } },
      animation: { duration: 800, easing: 'easeInOutQuart' },
    },
  });

  // Legend
  const legendEl = document.getElementById('donutLegend');
  legendEl.innerHTML = DOMPurify.sanitize(labels
    .map((l, i) => `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div><span>${l}</span></div>`)
    .join(''));
}

// ─── Analytics Charts ──────────────────────────────────────────────────────────

/**
 * Get logs filtered to the current analytics period.
 * @returns {Array}
 */
function getFilteredLogs() {
  const now = new Date();
  let cutoff = new Date(now);
  if (state.analyticsPeriod === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
  else if (state.analyticsPeriod === 'quarter') cutoff.setMonth(cutoff.getMonth() - 3);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  return state.logs.filter((l) => new Date(l.date) >= cutoff);
}

/** Render the trend line chart. */
export function renderTrendChart() {
  const logs = getFilteredLogs();
  const labels = logs.map((l) => formatDate(l.date));
  const data = logs.map((l) => l.total);

  const canvas = document.getElementById('trendChart');
  setCanvasAria(canvas, `Line chart showing monthly CO₂ emissions trend over time`);
  const ctx = canvas.getContext('2d');
  if (charts.trendChart) charts.trendChart.destroy();

  charts.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        label: 'Monthly CO₂ (kg)',
        data: data.length ? data : [0],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#050b10',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(1)} kg CO₂e` } },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#737373', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#737373', font: { size: 11 }, callback: (v) => `${v} kg` }, beginAtZero: true },
      },
    },
  });

  if (data.length >= 2) {
    const pct = (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1);
    const el = document.getElementById('trendIndicator');
    el.textContent = pct <= 0 ? `▼ ${Math.abs(pct)}% reduced` : `▲ ${pct}% increased`;
    el.style.background = pct <= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    el.style.color = pct <= 0 ? '#4ade80' : '#ef4444';
  }
}

/** Render the category bar chart. */
export function renderCategoryBarChart() {
  const logs = getFilteredLogs();
  const totals = { Transport: 0, Energy: 0, Food: 0, Waste: 0 };
  logs.forEach((l) => {
    totals.Transport += l.transport || 0;
    totals.Energy += l.energy || 0;
    totals.Food += l.food || 0;
    totals.Waste += l.waste || 0;
  });

  const canvas = document.getElementById('categoryBarChart');
  setCanvasAria(canvas, `Bar chart comparing CO₂ emissions by category: Transport, Energy, Food, Waste`);
  const ctx = canvas.getContext('2d');
  if (charts.categoryBarChart) charts.categoryBarChart.destroy();

  charts.categoryBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(234,179,8,0.7)', 'rgba(249,115,22,0.7)', 'rgba(168,85,247,0.7)'],
        borderColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7'],
        borderWidth: 1.5,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#737373', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#737373', font: { size: 11 }, callback: (v) => `${v} kg` }, beginAtZero: true },
      },
    },
  });
}

/** Render the polar area breakdown chart. */
export function renderBreakdownChart() {
  const logs = getFilteredLogs();
  const totals = [0, 0, 0, 0];
  logs.forEach((l) => {
    totals[0] += l.transport || 0;
    totals[1] += l.energy || 0;
    totals[2] += l.food || 0;
    totals[3] += l.waste || 0;
  });
  const total = totals.reduce((s, v) => s + v, 0);

  const canvas = document.getElementById('breakdownChart');
  setCanvasAria(canvas, `Polar area chart showing CO₂ breakdown: Transport, Energy, Food, Waste`);
  const ctx = canvas.getContext('2d');
  if (charts.breakdownChart) charts.breakdownChart.destroy();

  charts.breakdownChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Transport', 'Energy', 'Food', 'Waste'],
      datasets: [{
        data: total > 0 ? totals : [1, 1, 1, 1],
        backgroundColor: ['rgba(59,130,246,0.5)', 'rgba(234,179,8,0.5)', 'rgba(249,115,22,0.5)', 'rgba(168,85,247,0.5)'],
        borderColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7'],
        borderWidth: 1.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#737373', font: { size: 11 }, boxWidth: 12 } } },
      scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } },
    },
  });
}

/** Update analytics stats panel. */
export function updateAnalyticsStats() {
  const logs = getFilteredLogs();
  document.getElementById('logsCount').textContent = state.logs.length;
  if (logs.length === 0) return;

  const best = [...logs].sort((a, b) => a.total - b.total)[0];
  document.getElementById('bestMonth').textContent = `${best.total.toFixed(0)} kg (${formatDate(best.date)})`;

  const catTotals = { Transport: 0, Energy: 0, Food: 0, Waste: 0 };
  logs.forEach((l) => {
    catTotals.Transport += l.transport || 0;
    catTotals.Energy += l.energy || 0;
    catTotals.Food += l.food || 0;
    catTotals.Waste += l.waste || 0;
  });
  const bigCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('biggestCat').textContent = `${bigCat[0]} (${bigCat[1].toFixed(0)} kg)`;

  const totalActual = logs.reduce((s, l) => s + l.total, 0);
  const totalAvg = 400 * logs.length;
  const saved = totalAvg - totalActual;
  document.getElementById('totalSaved').textContent =
    saved > 0 ? `${saved.toFixed(0)} kg below avg 🎉` : `${Math.abs(saved).toFixed(0)} kg above avg`;
}

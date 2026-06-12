import { navigate, loadLucide } from './src/router.js';
import './src/events.js';
import DOMPurify from 'dompurify';
import {
  calculateTransportCO2,
  calculateEnergyCO2,
  calculateFoodCO2,
  calculateWasteCO2,
} from './src/calculator.js';
import {
  state, saveState, loadState, getLevel, getMonthKey, formatDate, debounce, ECO_LEVELS,
} from './src/state.js';
import {
  updateCategoryDonut, renderTrendChart, renderCategoryBarChart, renderBreakdownChart, updateAnalyticsStats,
} from './src/charts.js';
import {
  checkAchievements as _checkAchievements,
  completeChallenge as _completeChallenge, renderChallenges as _renderChallenges,
  renderAchievements as _renderAchievements, renderLevels as _renderLevels,
  updateStreak, calcPoints,
} from './src/gamification.js';
import { renderShareButtons, copyShareLink } from './src/share.js';
import { login, logout, getCurrentUser, signup } from './src/auth.js';

/* =====================================================
   EcoTrack — app.js
   Core Application Logic (orchestration layer)
   Modules: src/state.js | src/charts.js | src/gamification.js | src/share.js | src/calculator.js
   ===================================================== */

'use strict';

// ─── Emission Factors (kg CO₂e per unit) ─────────────────────────────────────

// ─── Daily Eco Tips ───────────────────────────────────────────────────────────
const ECO_TIPS = [
  {
    category: 'Transport',
    text: 'Switch one short car trip per week to cycling or walking — saves about 2–5 kg CO₂ weekly.',
    impact: '🌍 Saves up to 260 kg CO₂/year',
  },
  {
    category: 'Food',
    text: 'Try one plant-based meal per day. Replacing beef with legumes can cut food emissions by 50%.',
    impact: '🥦 Saves up to 500 kg CO₂/year',
  },
  {
    category: 'Energy',
    text: 'Lower your thermostat by 1°C in winter — reduces heating energy consumption by ~5%.',
    impact: '⚡ Saves ~100 kg CO₂/year',
  },
  {
    category: 'Transport',
    text: 'Use public transport instead of driving once a week to dramatically lower emissions.',
    impact: '🚌 Saves up to 4.6 tonnes CO₂/year',
  },
  {
    category: 'Waste',
    text: 'Bring a reusable bag and coffee cup — single-use plastic has a hidden carbon cost.',
    impact: '♻️ Saves ~50 kg CO₂/year',
  },
  {
    category: 'Food',
    text: 'Reduce food waste: 1/3 of all food produced is wasted, generating 8% of global emissions.',
    impact: '🍽️ Saves 300+ kg CO₂/year',
  },
  {
    category: 'Energy',
    text: 'Unplug electronics when not in use — "vampire power" can account for 10% of your electricity bill.',
    impact: '🔌 Saves ~50 kg CO₂/year',
  },
  {
    category: 'Transport',
    text: "For trips under 3 km, walk or cycle — it's often faster than driving in urban areas.",
    impact: '🚶 Saves 200 kg CO₂/year',
  },
  {
    category: 'Energy',
    text: 'Switch to LED bulbs — they use 80% less energy than incandescent lights.',
    impact: '💡 Saves ~40 kg CO₂/year per bulb',
  },
  {
    category: 'Food',
    text: 'Buy local and seasonal produce — out-of-season imports have 5× the carbon footprint.',
    impact: '🌱 Saves 100+ kg CO₂/year',
  },
];

// ─── Eco Challenges and Achievements are imported from gamification.js ───

// ─── Learn Content ────────────────────────────────────────────────────────────
const LEARN_CARDS = [
  {
    emoji: '🚗',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.15)',
    title: 'Transport',
    subtitle: 'Biggest personal impact lever',
    body: 'Transportation accounts for around 29% of global greenhouse gas emissions. Personal vehicles are the largest single contributor to individual carbon footprints in developed countries.',
    stat: '4.6t',
    statLabel: 'CO₂ saved by going car-free for 1 year',
    tips: [
      'Take public transit instead of driving',
      'Combine errands into one trip',
      'Work from home when possible',
      'Choose direct flights over connecting routes',
    ],
  },
  {
    emoji: '⚡',
    color: '#eab308',
    bgColor: 'rgba(234,179,8,0.15)',
    title: 'Home Energy',
    subtitle: 'Smart choices matter',
    body: 'Residential energy use accounts for ~17% of global emissions. Heating, cooling, and appliances are the key drivers. Switching to renewables is the single biggest home improvement.',
    stat: '1.5t',
    statLabel: 'CO₂ saved by switching to green electricity',
    tips: [
      'Use a smart thermostat',
      'Switch to LED bulbs',
      'Install solar panels if possible',
      'Improve home insulation',
    ],
  },
  {
    emoji: '🥩',
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.15)',
    title: 'Food & Diet',
    subtitle: 'What you eat shapes the planet',
    body: 'Food systems account for ~26% of global CO₂ emissions. Beef production alone uses 20× more land and emits 20× more GHGs than plant protein. Shifting to plant-rich diets is powerful.',
    stat: '0.5t',
    statLabel: 'CO₂ saved by going vegan vs meat-heavy diet',
    tips: [
      'Eat less red meat',
      'Buy local & seasonal',
      'Reduce food waste',
      'Choose plant-based proteins',
    ],
  },
  {
    emoji: '♻️',
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.15)',
    title: 'Waste & Shopping',
    subtitle: 'Consume less, waste less',
    body: 'Consumer goods and waste account for ~16% of individual footprints. The fashion industry produces 10% of global CO₂. Every new item manufactured has an embedded carbon cost.',
    stat: '12kg',
    statLabel: 'CO₂ emitted per new clothing item',
    tips: [
      'Buy second-hand clothing',
      'Repair instead of replace',
      'Recycle properly',
      'Avoid single-use plastics',
    ],
  },
];

const QUICK_WINS = [
  { emoji: '🔌', title: 'Unplug devices when not in use', saving: 'Saves ~50 kg CO₂/yr' },
  { emoji: '🚿', title: 'Shorten showers to 5 minutes', saving: 'Saves ~40 kg CO₂/yr' },
  { emoji: '🧺', title: 'Wash clothes in cold water', saving: 'Saves ~30 kg CO₂/yr' },
  { emoji: '🌡️', title: 'Lower heating by 1°C', saving: 'Saves ~100 kg CO₂/yr' },
  { emoji: '🥩', title: 'Skip meat one day per week', saving: 'Saves ~130 kg CO₂/yr' },
  { emoji: '🚗', title: 'Carpool one day per week', saving: 'Saves ~250 kg CO₂/yr' },
  { emoji: '💡', title: 'Switch all bulbs to LED', saving: 'Saves ~40 kg CO₂/yr per bulb' },
  { emoji: '🛍️', title: 'Bring a reusable bag every time', saving: 'Saves ~5 kg CO₂/yr' },
];

// ─── ECO_LEVELS, state, charts, saveState, loadState ────────────────────────
// Imported from src/state.js and src/charts.js above.
// This file is the orchestration layer only.

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}



function animateNumber(el, target, decimals = 1, duration = 700) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target.toFixed(decimals);
    return;
  }
  const start = parseFloat(el.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now - startTime) / duration, 1);
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    el.textContent = (start + diff * ease).toFixed(decimals);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}



// ─── Navigation ───────────────────────────────────────────────────────────────


function toggleMobileNav() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function updateDashboard() {
  const today = getMonthKey();
  const thisMonthLogs = state.logs.filter((l) => l.monthKey === today);
  const monthTotal = thisMonthLogs.reduce((s, l) => s + l.total, 0);
  const todayTotal = monthTotal; // simplification: today shows current month's tracked value

  // Stats
  animateNumber(document.getElementById('todayCO2'), todayTotal, 1);
  animateNumber(document.getElementById('monthCO2'), monthTotal, 1);
  const yearProjection = (monthTotal * 12) / 1000; // convert to tonnes
  animateNumber(document.getElementById('yearCO2'), yearProjection, 2);
  animateNumber(document.getElementById('ecoScoreStat'), state.ecoScore, 0);

  // Trends
  const prev = state.logs.filter((l) => l.monthKey !== today);
  if (prev.length > 0) {
    const prevTotal = prev.slice(-1)[0].total;
    const diff = monthTotal - prevTotal;
    const trendEl = document.getElementById('todayTrend');
    trendEl.textContent =
      diff === 0
        ? '— same'
        : diff > 0
          ? `▲ ${diff.toFixed(1)} kg`
          : `▼ ${Math.abs(diff).toFixed(1)} kg`;
    trendEl.className = `stat-trend ${diff > 0 ? 'negative' : 'positive'}`;
  }

  // Vs global average (4800 kg/yr)
  const globalAvgMonthly = 400;
  const vsAvgEl = document.getElementById('yearVsAvg');
  if (monthTotal > 0) {
    const diff = monthTotal - globalAvgMonthly;
    vsAvgEl.textContent = diff <= 0 ? `▼ below avg` : `▲ above avg`;
    vsAvgEl.className = `stat-trend ${diff <= 0 ? 'positive' : 'negative'}`;
  }

  // Level
  const level = getLevel(state.ecoScore);
  document.getElementById('ecoScoreLevel').textContent = level.name;

  // Streak
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('sidebarScore').textContent = state.ecoScore;
  document.getElementById('mobileScore').textContent = state.ecoScore;
  document.getElementById('ecoLevelText').textContent = level.name;

  // Donut chart
  updateCategoryDonut(thisMonthLogs);

  // Comparison bar
  const yourPct = Math.min((yearProjection / 14.5) * 95, 95);
  const yourBarEl = document.getElementById('yourBarFill');
  yourBarEl.style.width = yearProjection > 0 ? `${Math.max(yourPct, 5)}%` : '0%';
  yourBarEl.textContent = yearProjection > 0 ? `${yearProjection.toFixed(1)}t` : '0t';

  // Recent activity
  renderRecentActivity();

  // Share panel
  const shareContainer = document.getElementById('shareContainer');
  if (shareContainer) {
    renderShareButtons(shareContainer, {
      total: monthTotal,
      month: today,
      ecoScore: state.ecoScore,
    });
  }

  // Tip
  renderTip();
}

function renderRecentActivity() {
  const el = document.getElementById('recentActivity');
  if (state.logs.length === 0) {
    el.innerHTML = DOMPurify.sanitize(`<div class="empty-state">
      <i data-lucide="leaf"></i>
      <p>No activity logged yet. Start tracking!</p>
      <button class="btn-primary" onclick="navigate('calculator')">Log First Activity</button>
    </div>`);
    lucide.createIcons();
    return;
  }
  const recent = [...state.logs].reverse().slice(0, 5);
  const catMeta = {
    transport: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: 'car' },
    energy: { color: '#eab308', bg: 'rgba(234,179,8,0.15)', icon: 'zap' },
    food: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: 'utensils' },
    waste: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: 'trash-2' },
  };
  const biggest = (log) => {
    const cats = ['transport', 'energy', 'food', 'waste'];
    return cats.reduce((a, b) => ((log[a] || 0) > (log[b] || 0) ? a : b));
  };
  el.innerHTML = DOMPurify.sanitize(recent
    .map((log) => {
      const cat = biggest(log);
      const meta = catMeta[cat];
      return `<div class="activity-item">
      <div class="activity-cat-icon" style="background:${meta.bg}; color:${meta.color}">
        <i data-lucide="${meta.icon}"></i>
      </div>
      <div class="activity-info">
        <div class="activity-title">Monthly Footprint Log</div>
        <div class="activity-date">${formatDate(log.date)}</div>
      </div>
      <div class="activity-co2">${log.total.toFixed(1)} kg</div>
    </div>`;
    })
    .join(''));
  lucide.createIcons();
}

// ─── Tips ─────────────────────────────────────────────────────────────────────
function renderTip() {
  let tipsToUse = ECO_TIPS;
  
  if (state.logs.length > 0) {
    const latestLog = state.logs[state.logs.length - 1];
    const biggestCat = ['transport', 'energy', 'food', 'waste'].reduce((a, b) => 
      ((latestLog[a] || 0) > (latestLog[b] || 0) ? a : b)
    );
    const tailored = ECO_TIPS.filter(t => t.category.toLowerCase() === biggestCat);
    if (tailored.length > 0) tipsToUse = tailored;
  }
  
  const tip = tipsToUse[state.tipIndex % tipsToUse.length];
  document.getElementById('tipCategory').textContent = tip.category;
  document.getElementById('tipText').textContent = tip.text;
  document.getElementById('tipImpact').textContent = tip.impact;

  const dotsEl = document.getElementById('tipDots');
  dotsEl.innerHTML = DOMPurify.sanitize('');
  tipsToUse.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = `tip-dot ${i === state.tipIndex % tipsToUse.length ? 'active' : ''}`;
    dotsEl.appendChild(d);
  });
}

function nextTip() {
  state.tipIndex = (state.tipIndex + 1) % ECO_TIPS.length;
  renderTip();
}

// ─── Calculator ───────────────────────────────────────────────────────────────
let calcValues = { transport: 0, energy: 0, food: 0, waste: 0 };

function switchCategory(cat) {
  document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.calc-panel').forEach((p) => p.classList.add('hidden'));
  document.getElementById(`tab-${cat}`).classList.add('active');
  document.getElementById(`panel-${cat}`).classList.remove('hidden');
}

/** Raw (non-debounced) recalculation — reads all DOM inputs and updates live UI. */
function _recalcRaw() {
  // ── Transport
  const carKm = parseFloat(document.getElementById('carKm').value) || 0;
  const carType = document.getElementById('carType').value;
  const shortFlights = parseFloat(document.getElementById('shortFlights').value) || 0;
  const longFlights = parseFloat(document.getElementById('longFlights').value) || 0;
  const transitKm = parseFloat(document.getElementById('transitKm').value) || 0;

  const transportCO2 = calculateTransportCO2(carKm, carType, shortFlights, longFlights, transitKm);

  // ── Energy
  const electricKwh = parseFloat(document.getElementById('electricKwh').value) || 0;
  const energySource = document.getElementById('energySource').value;
  const gasM3 = parseFloat(document.getElementById('gasM3').value) || 0;
  const heatingOil = parseFloat(document.getElementById('heatingOil').value) || 0;
  const homeSize = parseFloat(document.getElementById('homeSize').value) || 1;

  const energyCO2 = calculateEnergyCO2(electricKwh, energySource, gasM3, heatingOil, homeSize);

  // ── Food
  const beefKg = parseFloat(document.getElementById('beefKg').value) || 0;
  const poultryKg = parseFloat(document.getElementById('poultryKg').value) || 0;
  const fishKg = parseFloat(document.getElementById('fishKg').value) || 0;
  const dairyKg = parseFloat(document.getElementById('dairyKg').value) || 0;
  const veggieKg = parseFloat(document.getElementById('veggieKg').value) || 0;
  const dietStyle = parseFloat(document.getElementById('dietStyle').value) || 1;

  const foodCO2 = calculateFoodCO2(beefKg, poultryKg, fishKg, dairyKg, veggieKg, dietStyle);

  // ── Waste
  const wasteKg = parseFloat(document.getElementById('wasteKg').value) || 0;
  const recyclingRate = Math.min(
    parseFloat(document.getElementById('recyclingRate').value) || 0,
    100
  );
  const clothingItems = parseFloat(document.getElementById('clothingItems').value) || 0;
  const onlineShopping = parseFloat(document.getElementById('onlineShopping').value) || 0;

  const wasteCO2 = calculateWasteCO2(wasteKg, recyclingRate, clothingItems, onlineShopping);

  calcValues = { transport: transportCO2, energy: energyCO2, food: foodCO2, waste: wasteCO2 };
  const total = transportCO2 + energyCO2 + foodCO2 + wasteCO2;

  // Update UI
  document.getElementById('transportCO2').textContent = `${transportCO2.toFixed(1)} kg`;
  document.getElementById('energyCO2').textContent = `${energyCO2.toFixed(1)} kg`;
  document.getElementById('foodCO2').textContent = `${foodCO2.toFixed(1)} kg`;
  document.getElementById('wasteCO2').textContent = `${wasteCO2.toFixed(1)} kg`;
  document.getElementById('liveCalcCO2').textContent = total.toFixed(1);
  document.getElementById('totalCO2Big').textContent = total.toFixed(1);
  document.getElementById('sum-transport').textContent = transportCO2.toFixed(1);
  document.getElementById('sum-energy').textContent = energyCO2.toFixed(1);
  document.getElementById('sum-food').textContent = foodCO2.toFixed(1);
  document.getElementById('sum-waste').textContent = wasteCO2.toFixed(1);
}

/**
 * Debounced recalc — fires at most once every 150 ms to prevent jank on slow devices.
 * All HTML oninput/onchange handlers should call this instead of _recalcRaw.
 */
const recalc = debounce(_recalcRaw, 150);

function logActivity() {
  const total = Object.values(calcValues).reduce((s, v) => s + v, 0);
  if (total === 0) {
    showToast('Please enter at least one activity value.', 'error');
    return;
  }

  const now = new Date();
  const log = {
    date: now.toISOString(),
    monthKey: getMonthKey(now),
    ...calcValues,
    total,
    cycleKm: parseFloat(document.getElementById('cycleKm').value) || 0,
  };

  state.logs.push(log);

  // Update streak via gamification module
  updateStreak(now);

  // Eco score via gamification module
  const points = calcPoints(total);
  state.ecoScore += points;

  // Check achievements
  checkAchievements();
  saveState();

  showToast(`✅ Logged! +${points} eco points earned`);
  navigate('dashboard');
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function initAnalyticsPage() {
  renderTrendChart();
  renderCategoryBarChart();
  renderBreakdownChart();
  updateAnalyticsStats();
}

function setAnalyticsPeriod(period, btn) {
  state.analyticsPeriod = period;
  document.querySelectorAll('.filter-tab').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  initAnalyticsPage();
}

// ─── Goals ────────────────────────────────────────────────────────────────────
function initGoalsPage() {
  document.getElementById('goalSlider').value = state.goal;
  document.getElementById('goalDisplay').textContent = state.goal;
  updateGoalProgress();
  renderChallenges();
  renderAchievements();
  renderLevels();
}

function updateGoalSlider() {
  const val = document.getElementById('goalSlider').value;
  document.getElementById('goalDisplay').textContent = val;
}

function saveGoal() {
  state.goal = parseInt(document.getElementById('goalSlider').value);
  state.ecoScore += 10;
  checkAchievements();
  saveState();
  showToast(`🎯 Goal set to ${state.goal} kg/month! +10 points`);
  updateGoalProgress();
}

function updateGoalProgress() {
  const today = getMonthKey();
  const thisMonthLogs = state.logs.filter((l) => l.monthKey === today);
  const monthTotal = thisMonthLogs.reduce((s, l) => s + l.total, 0);
  const pct = state.goal > 0 ? Math.min((monthTotal / state.goal) * 100, 100) : 0;
  document.getElementById('goalProgressBar').style.width = `${pct}%`;
  document.getElementById('goalProgressText').textContent =
    `${monthTotal.toFixed(0)} / ${state.goal} kg (${pct.toFixed(0)}%)`;
}

// ─── Gamification wrappers ────────────────────────────────────────────────────
// These thin wrappers delegate to src/gamification.js and pass app-level helpers.

function renderChallenges() {
  _renderChallenges(document.getElementById('challengesGrid'));
}

function completeChallenge(id, points) {
  _completeChallenge(id, points, showToast, () => {
    renderChallenges();
    renderAchievements();
    updateSidebarScore();
  });
}

function renderAchievements() {
  _renderAchievements(
    document.getElementById('achievementsGrid'),
    document.getElementById('achievementCount')
  );
}

function checkAchievements() {
  _checkAchievements(showToast);
}

function renderLevels() {
  _renderLevels(document.getElementById('levelsList'), ECO_LEVELS);
}

// ─── Learn ────────────────────────────────────────────────────────────────────
function initLearnPage() {
  renderFactsMarquee();
  renderLearnCards();
  renderQuickWins();
}

function renderFactsMarquee() {
  const facts = [
    { label: '1 kg of beef', val: '= 27 kg CO₂e emitted' },
    { label: 'Going car-free', val: 'saves 4.6t CO₂/year' },
    { label: 'LED bulbs use', val: '80% less energy than incandescent' },
    { label: 'Food waste accounts for', val: '8% of global emissions' },
    { label: 'A return flight London–NYC', val: 'emits ~1.8t CO₂e per passenger' },
    { label: 'Plant-based diet', val: 'cuts food emissions by up to 73%' },
    { label: 'Global average footprint', val: '4.8 tonnes CO₂e per person/year' },
    { label: '1.5°C climate target requires', val: 'under 2.3t CO₂e per person/year' },
  ];
  // Double the facts for seamless marquee loop
  const doubled = [...facts, ...facts];
  const el = document.getElementById('factsMarquee');
  el.innerHTML = DOMPurify.sanitize(doubled
    .map(
      (f) => `
    <div class="fact-item">
      📊 ${f.label}: <span>${f.val}</span>
    </div>
  `
    )
    .join(''));
}

function renderLearnCards() {
  const el = document.getElementById('learnGrid');
  el.innerHTML = DOMPurify.sanitize(LEARN_CARDS.map(
    (c) => `
    <div class="learn-card">
      <div class="learn-card-header">
        <div class="learn-cat-icon" style="background:${c.bgColor}">${c.emoji}</div>
        <div>
          <div class="learn-card-title">${c.title}</div>
          <div class="learn-card-subtitle">${c.subtitle}</div>
        </div>
      </div>
      <div class="learn-card-body">${c.body}</div>
      <div class="learn-stat">
        <div>
          <div class="learn-stat-val" style="color:${c.color}">${c.stat}</div>
          <div class="learn-stat-label">${c.statLabel}</div>
        </div>
      </div>
      <div class="learn-tips-list">
        ${c.tips.map((t) => `<div class="learn-tip-item">${t}</div>`).join('')}
      </div>
    </div>
  `
  ).join(''));
}

function renderQuickWins() {
  const el = document.getElementById('quickWinsList');
  el.innerHTML = DOMPurify.sanitize(QUICK_WINS.map(
    (w) => `
    <div class="quick-win-item">
      <div class="quick-win-emoji">${w.emoji}</div>
      <div class="quick-win-info">
        <div class="quick-win-title">${w.title}</div>
      </div>
      <div class="quick-win-saving">${w.saving}</div>
    </div>
  `
  ).join(''));
}

// ─── Sidebar Score Update ──────────────────────────────────────────────────────
function updateSidebarScore() {
  document.getElementById('sidebarScore').textContent = state.ecoScore;
  document.getElementById('mobileScore').textContent = state.ecoScore;
  const level = getLevel(state.ecoScore);
  document.getElementById('ecoLevelText').textContent = level.name;
}

// ─── Onboarding ────────────────────────────────────────────────────────────────
function closeOnboarding() {
  document.getElementById('onboardingModal').classList.add('hidden');
  localStorage.setItem('ecotrack_onboarded', '1');
}

// ─── Background Particles ──────────────────────────────────────────────────────
function spawnParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.getElementById('bgParticles');
  const colors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316'];
  setInterval(() => {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${80 + Math.random() * 20}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 3}s;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 18000);
  }, 800);
}

// ─── Demo Data (for first-time users to see populated UI) ────────────────────
function seedDemoData() { /* Silent demo seeding disabled for production trust */ }

// ─── Auth Logic ───────────────────────────────────────────────────────────────

function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  // Clear errors
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('signupError').classList.remove('show');
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
  el.closest('.auth-form')
    .querySelectorAll('input')
    .forEach((i) => i.classList.remove('error'));
}

function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.querySelector('i').setAttribute('data-lucide', isText ? 'eye' : 'eye-off');
  lucide.createIcons();
}

function checkPasswordStrength(val) {
  const bar = document.getElementById('pwdBar');
  const label = document.getElementById('pwdLabel');
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w: '20%', color: '#ef4444', text: 'Weak' },
    { w: '40%', color: '#f97316', text: 'Fair' },
    { w: '60%', color: '#eab308', text: 'Good' },
    { w: '80%', color: '#22c55e', text: 'Strong' },
    { w: '100%', color: '#16a34a', text: 'Excellent' },
  ];
  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  bar.style.setProperty('--pwd-width', val.length > 0 ? lvl.w : '0%');
  bar.style.setProperty('--pwd-color', lvl.color);
  label.textContent = val.length > 0 ? lvl.text : '';
  label.style.color = lvl.color;
}


async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  document.getElementById('loginError').classList.remove('show');
  setButtonLoading('loginBtn', true);

  try {
    const user = await login(email, password);
    setButtonLoading('loginBtn', false);
    
    loginSuccess(user);
  } catch (err) {
    setButtonLoading('loginBtn', false);
    showAuthError('loginError', `⚠️ ${err.message}`);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const first = document.getElementById('signupFirst').value.trim();
  const last = document.getElementById('signupLast').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const country = document.getElementById('signupCountry').value;

  document.getElementById('signupError').classList.remove('show');

  if (!first) {
    showAuthError('signupError', '⚠️ Please enter your first name.');
    return;
  }
  if (!email) {
    showAuthError('signupError', '⚠️ Please enter your email.');
    return;
  }
  if (password.length < 6) {
    showAuthError('signupError', '⚠️ Password must be at least 6 characters.');
    return;
  }

  setButtonLoading('signupBtn', true);

  try {
    const user = await signup(first, last, email, password, country);
    setButtonLoading('signupBtn', false);
    
    loginSuccess(user);
  } catch (err) {
    setButtonLoading('signupBtn', false);
    showAuthError('signupError', `⚠️ ${err.message}`);
  }
}



function handleForgot() {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    showAuthError('loginError', 'ℹ️ Enter your email above, then click Forgot password.');
    return;
  }
  showToast(`📧 Password reset instructions sent to ${email}`);
}

function loginSuccess(user) {
  document.getElementById('authOverlay').classList.add('hidden');
  updateSidebarUser(user.name, user.email);
  localStorage.setItem('ecotrack_onboarded', '1');
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('hidden');
  showToast(`👋 Welcome back, ${user.name.split(' ')[0]}!`);
}

function updateSidebarUser(name, email) {
  document.getElementById('sidebarUsername').textContent = name || 'Eco User';
  document.getElementById('sidebarEmailDisplay').textContent = email || '';
  const initials = (name || 'E')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
}

async function handleLogout() {
  try {
    await logout();
  } catch (err) {
    console.error('Logout error:', err);
  }
  
  document.getElementById('authOverlay').classList.remove('hidden');
  switchAuthTab('login');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  showToast('👋 Signed out. See you soon!');
}

async function init() {
  loadState();
  lucide.createIcons();

  try {
    const session = await getCurrentUser();
    if (session) {
      document.getElementById('authOverlay').classList.add('hidden');
      updateSidebarUser(session.name, session.email);
    } else {
      document.getElementById('authOverlay').classList.remove('hidden');
    }
  } catch {
    document.getElementById('authOverlay').classList.remove('hidden');
  }

  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('hidden');

  seedDemoData();
  spawnParticles();
  updateDashboard();

  setInterval(() => {
    if (state.currentPage === 'dashboard') {
      state.tipIndex = (state.tipIndex + 1) % ECO_TIPS.length;
      renderTip();
    }
  }, 8000);

  const hash = window.location.hash.replace('#', '');
  if (['dashboard', 'calculator', 'analytics', 'goals', 'learn'].includes(hash)) {
    navigate(hash);
  }
}

function autoFillDemo() {
  showToast('ℹ️ Sign up to create a personalized secure account!');
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
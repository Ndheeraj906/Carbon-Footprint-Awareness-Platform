/* =====================================================
   EcoTrack — app.js
   Core Application Logic
   ===================================================== */

'use strict';

// ─── Emission Factors (kg CO₂e per unit) ─────────────────────────────────────
const EF = {
  // Transport (kg CO₂e per km)
  car: { petrol: 0.21, diesel: 0.17, hybrid: 0.12, electric: 0.05 },
  transit: 0.089, // per km (bus avg)
  shortFlight: 255, // per flight (economy, radiative forcing included)
  longFlight: 1100, // per flight
  // Energy (per unit/month)
  electricGrid: 0.233, // per kWh (world avg grid)
  electricRenewable: 0.02,
  electricPartial: 0.13,
  naturalGas: 2.04, // per m³
  heatingOil: 2.68, // per liter
  // Food (kg CO₂e per kg food)
  beef: 27,
  poultry: 6.9,
  fish: 6.1,
  dairy: 3.2,
  veggies: 0.9,
  // Waste (per kg)
  wasteGeneral: 0.57,
  clothing: 12, // per item
  onlinePackage: 0.5, // per package
};

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

// ─── Eco Challenges ───────────────────────────────────────────────────────────
const CHALLENGES = [
  {
    id: 'c1',
    emoji: '🚶',
    name: 'Walk This Week',
    desc: 'Replace at least 3 car trips with walking or cycling this week.',
    points: 50,
  },
  {
    id: 'c2',
    emoji: '🥦',
    name: 'Meatless Monday',
    desc: 'Skip meat every Monday for a month — plant-based all day.',
    points: 40,
  },
  {
    id: 'c3',
    emoji: '💡',
    name: 'Lights Out',
    desc: 'Turn off all lights and unplug devices when leaving a room for 7 days.',
    points: 30,
  },
  {
    id: 'c4',
    emoji: '🛍️',
    name: 'Zero New Clothes',
    desc: 'Go one month without buying new clothing — thrift or borrow instead.',
    points: 60,
  },
  {
    id: 'c5',
    emoji: '🚿',
    name: 'Short Showers',
    desc: 'Keep all showers under 5 minutes for 2 weeks.',
    points: 25,
  },
  {
    id: 'c6',
    emoji: '🌱',
    name: 'Plant Something',
    desc: 'Plant a tree, herb garden, or contribute to a reforestation project.',
    points: 70,
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'a1',
    emoji: '🌱',
    name: 'First Log',
    desc: 'Log your first activity',
    condition: (d) => d.logs.length >= 1,
  },
  {
    id: 'a2',
    emoji: '🏆',
    name: 'Week Warrior',
    desc: 'Log activity 7 days in a row',
    condition: (d) => d.streak >= 7,
  },
  {
    id: 'a3',
    emoji: '🌍',
    name: 'Below Global Avg',
    desc: 'Monthly CO₂ below 400 kg',
    condition: (d) => d.lastMonthCO2 < 400 && d.lastMonthCO2 > 0,
  },
  {
    id: 'a4',
    emoji: '⚡',
    name: 'Energy Saver',
    desc: 'Log energy data 3 times',
    condition: (d) => d.logs.filter((l) => l.energy > 0).length >= 3,
  },
  {
    id: 'a5',
    emoji: '🚴',
    name: 'Cyclist',
    desc: 'Log 100+ km cycling/walking',
    condition: (d) => d.logs.reduce((s, l) => s + (l.cycleKm || 0), 0) >= 100,
  },
  {
    id: 'a6',
    emoji: '🥗',
    name: 'Plant Powered',
    desc: 'Log 3 months with food CO₂ under 60 kg',
    condition: (d) => d.logs.filter((l) => l.food < 60).length >= 3,
  },
  {
    id: 'a7',
    emoji: '🎯',
    name: 'Goal Setter',
    desc: 'Set your first reduction goal',
    condition: (d) => d.goal > 0,
  },
  {
    id: 'a8',
    emoji: '🌳',
    name: 'Forest Guardian',
    desc: 'Earn 500+ eco points',
    condition: (d) => d.ecoScore >= 500,
  },
];

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

const ECO_LEVELS = [
  { emoji: '🌱', name: 'Seedling', minScore: 0, maxScore: 99 },
  { emoji: '🌿', name: 'Sapling', minScore: 100, maxScore: 249 },
  { emoji: '🌳', name: 'Tree', minScore: 250, maxScore: 499 },
  { emoji: '🌲', name: 'Old Growth', minScore: 500, maxScore: 999 },
  { emoji: '🌍', name: 'Forest Guardian', minScore: 1000, maxScore: Infinity },
];

// ─── App State ────────────────────────────────────────────────────────────────
let state = {
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

// ─── Chart Instances ──────────────────────────────────────────────────────────
let charts = {};

// ─── Utilities ────────────────────────────────────────────────────────────────
function saveState() {
  localStorage.setItem('ecotrack_v2', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('ecotrack_v2');
  if (raw) {
    try {
      state = { ...state, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('State parse error, fresh start');
    }
  }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function animateNumber(el, target, decimals = 1, duration = 700) {
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

function getLevel(score) {
  return ECO_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore) || ECO_LEVELS[0];
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  const navEl = document.getElementById(`nav-${page}`);
  if (target) target.classList.remove('hidden');
  if (navEl) navEl.classList.add('active');
  state.currentPage = page;
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  // Page-specific init
  if (page === 'analytics') initAnalyticsPage();
  if (page === 'goals') initGoalsPage();
  if (page === 'learn') initLearnPage();
  if (page === 'dashboard') updateDashboard();
  return false;
}

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

  // Tip
  renderTip();
}

function updateCategoryDonut(logs) {
  const totals = { transport: 0, energy: 0, food: 0, waste: 0 };
  logs.forEach((l) => {
    totals.transport += l.transport || 0;
    totals.energy += l.energy || 0;
    totals.food += l.food || 0;
    totals.waste += l.waste || 0;
  });
  const total = Object.values(totals).reduce((s, v) => s + v, 0);

  document.getElementById('chartCenterVal').textContent = total.toFixed(0);

  const ctx = document.getElementById('categoryChart').getContext('2d');
  const data = [totals.transport, totals.energy, totals.food, totals.waste];
  const colors = ['#3b82f6', '#eab308', '#f97316', '#a855f7'];
  const labels = ['Transport', 'Energy', 'Food', 'Waste'];

  if (charts.categoryChart) charts.categoryChart.destroy();
  charts.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: total === 0 ? [1, 1, 1, 1] : data,
          backgroundColor:
            total === 0
              ? [
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.05)',
                ]
              : colors,
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
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
  legendEl.innerHTML = labels
    .map(
      (l, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]}"></div>
      <span>${l}</span>
    </div>
  `
    )
    .join('');
}

function renderRecentActivity() {
  const el = document.getElementById('recentActivity');
  if (state.logs.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <i data-lucide="leaf"></i>
      <p>No activity logged yet. Start tracking!</p>
      <button class="btn-primary" onclick="navigate('calculator')">Log First Activity</button>
    </div>`;
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
  el.innerHTML = recent
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
    .join('');
  lucide.createIcons();
}

// ─── Tips ─────────────────────────────────────────────────────────────────────
function renderTip() {
  const tip = ECO_TIPS[state.tipIndex % ECO_TIPS.length];
  document.getElementById('tipCategory').textContent = tip.category;
  document.getElementById('tipText').textContent = tip.text;
  document.getElementById('tipImpact').textContent = tip.impact;

  const dotsEl = document.getElementById('tipDots');
  dotsEl.innerHTML = ECO_TIPS.map(
    (_, i) =>
      `<div class="tip-dot ${i === state.tipIndex % ECO_TIPS.length ? 'active' : ''}"></div>`
  ).join('');
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

function recalc() {
  // ── Transport
  const carKm = parseFloat(document.getElementById('carKm').value) || 0;
  const carType = document.getElementById('carType').value;
  const shortFlights = parseFloat(document.getElementById('shortFlights').value) || 0;
  const longFlights = parseFloat(document.getElementById('longFlights').value) || 0;
  const transitKm = parseFloat(document.getElementById('transitKm').value) || 0;
  const cycleKm = parseFloat(document.getElementById('cycleKm').value) || 0;

  const transportCO2 =
    carKm * EF.car[carType] +
    shortFlights * EF.shortFlight +
    longFlights * EF.longFlight +
    transitKm * EF.transit;

  // ── Energy
  const electricKwh = parseFloat(document.getElementById('electricKwh').value) || 0;
  const energySource = document.getElementById('energySource').value;
  const gasM3 = parseFloat(document.getElementById('gasM3').value) || 0;
  const heatingOil = parseFloat(document.getElementById('heatingOil').value) || 0;
  const homeSize = parseFloat(document.getElementById('homeSize').value) || 1;

  const electricEF =
    energySource === 'grid'
      ? EF.electricGrid
      : energySource === 'partial'
        ? EF.electricPartial
        : EF.electricRenewable;
  const energyCO2 =
    (electricKwh * electricEF + gasM3 * EF.naturalGas + heatingOil * EF.heatingOil) * homeSize;

  // ── Food
  const beefKg = parseFloat(document.getElementById('beefKg').value) || 0;
  const poultryKg = parseFloat(document.getElementById('poultryKg').value) || 0;
  const fishKg = parseFloat(document.getElementById('fishKg').value) || 0;
  const dairyKg = parseFloat(document.getElementById('dairyKg').value) || 0;
  const veggieKg = parseFloat(document.getElementById('veggieKg').value) || 0;
  const dietStyle = parseFloat(document.getElementById('dietStyle').value) || 1;

  const foodCO2 =
    (beefKg * EF.beef +
      poultryKg * EF.poultry +
      fishKg * EF.fish +
      dairyKg * EF.dairy +
      veggieKg * EF.veggies) *
    dietStyle;

  // ── Waste
  const wasteKg = parseFloat(document.getElementById('wasteKg').value) || 0;
  const recyclingRate = Math.min(
    parseFloat(document.getElementById('recyclingRate').value) || 0,
    100
  );
  const clothingItems = parseFloat(document.getElementById('clothingItems').value) || 0;
  const onlineShopping = parseFloat(document.getElementById('onlineShopping').value) || 0;

  const wasteCO2 =
    wasteKg * 4.33 * EF.wasteGeneral * (1 - recyclingRate / 100) +
    clothingItems * EF.clothing +
    onlineShopping * EF.onlinePackage;

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

  // Streak
  const today = now.toDateString();
  if (state.lastLogDate !== today) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (state.lastLogDate === yesterday.toDateString()) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastLogDate = today;
  }

  // Eco score
  const basePoints = 20;
  const bonusLow = total < 200 ? 30 : total < 400 ? 15 : 0;
  const points = basePoints + bonusLow;
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

function getFilteredLogs() {
  const now = new Date();
  let cutoff = new Date(now);
  if (state.analyticsPeriod === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
  else if (state.analyticsPeriod === 'quarter') cutoff.setMonth(cutoff.getMonth() - 3);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  return state.logs.filter((l) => new Date(l.date) >= cutoff);
}

function renderTrendChart() {
  const logs = getFilteredLogs();
  const labels = logs.map((l) => formatDate(l.date));
  const data = logs.map((l) => l.total);

  const ctx = document.getElementById('trendChart').getContext('2d');
  if (charts.trendChart) charts.trendChart.destroy();

  charts.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [
        {
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
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(1)} kg CO₂e` } },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#737373', font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#737373', font: { size: 11 }, callback: (v) => `${v} kg` },
          beginAtZero: true,
        },
      },
    },
  });

  // Trend indicator
  if (data.length >= 2) {
    const pct = (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1);
    const el = document.getElementById('trendIndicator');
    el.textContent = pct <= 0 ? `▼ ${Math.abs(pct)}% reduced` : `▲ ${pct}% increased`;
    el.style.background = pct <= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    el.style.color = pct <= 0 ? '#4ade80' : '#ef4444';
  }
}

function renderCategoryBarChart() {
  const logs = getFilteredLogs();
  const totals = { Transport: 0, Energy: 0, Food: 0, Waste: 0 };
  logs.forEach((l) => {
    totals.Transport += l.transport || 0;
    totals.Energy += l.energy || 0;
    totals.Food += l.food || 0;
    totals.Waste += l.waste || 0;
  });

  const ctx = document.getElementById('categoryBarChart').getContext('2d');
  if (charts.categoryBarChart) charts.categoryBarChart.destroy();

  charts.categoryBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: [
            'rgba(59,130,246,0.7)',
            'rgba(234,179,8,0.7)',
            'rgba(249,115,22,0.7)',
            'rgba(168,85,247,0.7)',
          ],
          borderColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7'],
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#737373', font: { size: 11 } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#737373', font: { size: 11 }, callback: (v) => `${v} kg` },
          beginAtZero: true,
        },
      },
    },
  });
}

function renderBreakdownChart() {
  const logs = getFilteredLogs();
  const totals = [0, 0, 0, 0];
  logs.forEach((l) => {
    totals[0] += l.transport || 0;
    totals[1] += l.energy || 0;
    totals[2] += l.food || 0;
    totals[3] += l.waste || 0;
  });
  const total = totals.reduce((s, v) => s + v, 0);
  const ctx = document.getElementById('breakdownChart').getContext('2d');
  if (charts.breakdownChart) charts.breakdownChart.destroy();

  charts.breakdownChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Transport', 'Energy', 'Food', 'Waste'],
      datasets: [
        {
          data: total > 0 ? totals : [1, 1, 1, 1],
          backgroundColor: [
            'rgba(59,130,246,0.5)',
            'rgba(234,179,8,0.5)',
            'rgba(249,115,22,0.5)',
            'rgba(168,85,247,0.5)',
          ],
          borderColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7'],
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#737373', font: { size: 11 }, boxWidth: 12 },
        },
      },
      scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } },
    },
  });
}

function updateAnalyticsStats() {
  const logs = getFilteredLogs();
  document.getElementById('logsCount').textContent = state.logs.length;

  if (logs.length === 0) return;

  const best = [...logs].sort((a, b) => a.total - b.total)[0];
  document.getElementById('bestMonth').textContent =
    `${best.total.toFixed(0)} kg (${formatDate(best.date)})`;

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
    saved > 0
      ? `${saved.toFixed(0)} kg below avg 🎉`
      : `${Math.abs(saved).toFixed(0)} kg above avg`;
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

function renderChallenges() {
  const el = document.getElementById('challengesGrid');
  el.innerHTML = CHALLENGES.map((c) => {
    const done = state.completedChallenges.includes(c.id);
    return `<div class="challenge-card ${done ? 'completed' : ''}">
      <div class="challenge-emoji">${c.emoji}</div>
      <div class="challenge-name">${c.name}</div>
      <div class="challenge-desc">${c.desc}</div>
      <div class="challenge-points">+${c.points} eco points</div>
      <button class="challenge-complete-btn ${done ? 'done' : ''}" onclick="${done ? '' : `completeChallenge('${c.id}', ${c.points})`}" ${done ? 'disabled' : ''}>
        ${done ? '✅ Completed!' : '✓ Mark Complete'}
      </button>
    </div>`;
  }).join('');
}

function completeChallenge(id, points) {
  if (state.completedChallenges.includes(id)) return;
  state.completedChallenges.push(id);
  state.ecoScore += points;
  checkAchievements();
  saveState();
  showToast(`🎉 Challenge complete! +${points} eco points`);
  renderChallenges();
  renderAchievements();
  updateSidebarScore();
}

function renderAchievements() {
  const el = document.getElementById('achievementsGrid');
  el.innerHTML = ACHIEVEMENTS.map((a) => {
    const unlocked = state.unlockedAchievements.includes(a.id);
    return `<div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${a.emoji}</div>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.desc}</div>
    </div>`;
  }).join('');
  const count = state.unlockedAchievements.length;
  document.getElementById('achievementCount').textContent =
    `${count} / ${ACHIEVEMENTS.length} unlocked`;
}

function checkAchievements() {
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

function renderLevels() {
  const el = document.getElementById('levelsList');
  const currentLevel = getLevel(state.ecoScore);
  el.innerHTML = ECO_LEVELS.map(
    (l) => `
    <div class="level-item ${l.name === currentLevel.name ? 'current' : ''}">
      <div class="level-emoji">${l.emoji}</div>
      <div class="level-info">
        <div class="level-name">${l.name}</div>
        <div class="level-req">${l.minScore === 0 ? 'Starting level' : `${l.minScore}+ eco points`}</div>
      </div>
      ${l.name === currentLevel.name ? '<span class="level-badge active-badge">Current Level</span>' : ''}
    </div>
  `
  ).join('');
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
  el.innerHTML = doubled
    .map(
      (f) => `
    <div class="fact-item">
      📊 ${f.label}: <span>${f.val}</span>
    </div>
  `
    )
    .join('');
}

function renderLearnCards() {
  const el = document.getElementById('learnGrid');
  el.innerHTML = LEARN_CARDS.map(
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
  ).join('');
}

function renderQuickWins() {
  const el = document.getElementById('quickWinsList');
  el.innerHTML = QUICK_WINS.map(
    (w) => `
    <div class="quick-win-item">
      <div class="quick-win-emoji">${w.emoji}</div>
      <div class="quick-win-info">
        <div class="quick-win-title">${w.title}</div>
      </div>
      <div class="quick-win-saving">${w.saving}</div>
    </div>
  `
  ).join('');
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
function seedDemoData() {
  if (state.logs.length > 0) return; // already has data
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    months.push({
      date: d.toISOString(),
      monthKey: getMonthKey(d),
      transport: 90 + Math.random() * 60,
      energy: 50 + Math.random() * 40,
      food: 80 + Math.random() * 50,
      waste: 20 + Math.random() * 20,
      total: 0,
      cycleKm: Math.random() * 30,
    });
  }
  months.forEach((m) => {
    m.total = m.transport + m.energy + m.food + m.waste;
  });
  state.logs = months;
  state.ecoScore = 120;
  state.streak = 3;
  state.goal = 250;
  state.lastLogDate = new Date().toDateString();
  checkAchievements();
  saveState();
}

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

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag
  );
}

async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) btn.classList.add('loading');
  else btn.classList.remove('loading');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  document.getElementById('loginError').classList.remove('show');
  setButtonLoading('loginBtn', true);

  const hashedPassword = await hashPassword(password);

  // Simulate async auth (localStorage-based)
  setTimeout(() => {
    setButtonLoading('loginBtn', false);
    const users = JSON.parse(localStorage.getItem('ecotrack_users') || '[]');
    const user = users.find((u) => u.email === email);

    if (!user) {
      showAuthError('loginError', '⚠️ No account found with this email. Please sign up.');
      return;
    }
    const matches = user.password === hashedPassword || user.password === btoa(password);
    if (!matches) {
      showAuthError('loginError', '⚠️ Incorrect password. Please try again.');
      return;
    }

    if (user.password === btoa(password)) {
      user.password = hashedPassword;
      localStorage.setItem('ecotrack_users', JSON.stringify(users));
    }

    localStorage.setItem(
      'ecotrack_session',
      JSON.stringify({ email: user.email, name: user.name })
    );
    loginSuccess(user);
  }, 900);
}

async function handleSignup(e) {
  e.preventDefault();
  const first = document.getElementById('signupFirst').value.trim();
  const last = document.getElementById('signupLast').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

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

  const hashedPassword = await hashPassword(password);

  setTimeout(() => {
    setButtonLoading('signupBtn', false);
    const users = JSON.parse(localStorage.getItem('ecotrack_users') || '[]');

    if (users.find((u) => u.email === email)) {
      showAuthError('signupError', '⚠️ An account with this email already exists. Please sign in.');
      return;
    }

    const newUser = {
      email: escapeHtml(email),
      name: last ? `${escapeHtml(first)} ${escapeHtml(last)}` : escapeHtml(first),
      password: hashedPassword,
      country: document.getElementById('signupCountry').value,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('ecotrack_users', JSON.stringify(users));
    localStorage.setItem(
      'ecotrack_session',
      JSON.stringify({ email: newUser.email, name: newUser.name })
    );

    loginSuccess(newUser);
  }, 900);
}

function handleSocialLogin(provider) {
  // Demo: create a guest account for social login
  const name = `${provider} User`;
  const email = `${provider.toLowerCase()}@ecotrack.demo`;
  const session = { email, name };
  localStorage.setItem('ecotrack_session', JSON.stringify(session));
  showToast(`✅ Signed in with ${provider}!`);
  loginSuccess({ email, name });
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
  // Hide auth overlay
  document.getElementById('authOverlay').classList.add('hidden');

  // Update sidebar user display
  updateSidebarUser(user.name, user.email);

  // Mark onboarding done
  localStorage.setItem('ecotrack_onboarded', '1');

  // Remove old onboarding modal (not needed with new auth)
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

function handleLogout() {
  localStorage.removeItem('ecotrack_session');
  // Show auth overlay
  document.getElementById('authOverlay').classList.remove('hidden');
  // Switch to login tab
  switchAuthTab('login');
  // Clear login form
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  showToast('👋 Signed out. See you soon!');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  loadState();

  // Seed default demo user in localStorage if not exists
  const users = JSON.parse(localStorage.getItem('ecotrack_users') || '[]');
  const adminUser = users.find((u) => u.email === 'admin@ecotrack.com');
  if (!adminUser) {
    users.push({
      email: 'admin@ecotrack.com',
      name: 'Eco Admin',
      password: '240a8e0f98e6c4664fb9fc56cf3a9435b801a93b2a265691c9444cf81896898a', // SHA-256 of admin123
      country: 'US',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('ecotrack_users', JSON.stringify(users));
  } else if (adminUser.password === btoa('admin123')) {
    adminUser.password = '240a8e0f98e6c4664fb9fc56cf3a9435b801a93b2a265691c9444cf81896898a';
    localStorage.setItem('ecotrack_users', JSON.stringify(users));
  }

  // Init lucide icons
  lucide.createIcons();

  // Check auth session
  const session = JSON.parse(localStorage.getItem('ecotrack_session') || 'null');
  if (session) {
    // Already logged in — hide auth screen
    document.getElementById('authOverlay').classList.add('hidden');
    updateSidebarUser(session.name, session.email);
  } else {
    // Show auth screen
    document.getElementById('authOverlay').classList.remove('hidden');
  }

  // Hide old onboarding modal always (replaced by auth)
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('hidden');

  // Seed demo data for fresh installs
  seedDemoData();

  // Particles
  spawnParticles();

  // Load dashboard
  updateDashboard();

  // Auto-rotate tips
  setInterval(() => {
    if (state.currentPage === 'dashboard') {
      state.tipIndex = (state.tipIndex + 1) % ECO_TIPS.length;
      renderTip();
    }
  }, 8000);

  // Navigate based on hash
  const hash = window.location.hash.replace('#', '');
  if (['dashboard', 'calculator', 'analytics', 'goals', 'learn'].includes(hash)) {
    navigate(hash);
  }
}

function autoFillDemo() {
  document.getElementById('loginEmail').value = 'admin@ecotrack.com';
  document.getElementById('loginPassword').value = 'admin123';
  showToast('⚡ Demo credentials filled!');
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

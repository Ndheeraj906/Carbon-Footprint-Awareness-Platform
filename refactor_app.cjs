const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'public', 'app.js');
let js = fs.readFileSync(appPath, 'utf8');

// 1. Remove localStorage session handling in handleLogin / handleSignup
js = js.replace(/localStorage\.setItem\('ecotrack_session', JSON\.stringify\(user\)\);/g, '');
js = js.replace(/localStorage\.removeItem\('ecotrack_session'\);/g, '');

// 2. Remove fake social login function
js = js.replace(/function handleSocialLogin[\s\S]*?loginSuccess\(\{ email, name \}\);\s*\}/g, '');

// 3. Remove silent demo data seeding
js = js.replace(/function seedDemoData\(\) \{[\s\S]*?\n\}/g, 'function seedDemoData() { /* Silent demo seeding disabled for production trust */ }');

// 4. Implement prefers-reduced-motion for animations
js = js.replace(/function animateNumber\(el, target, decimals = 1, duration = 700\) \{/g, `function animateNumber(el, target, decimals = 1, duration = 700) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target.toFixed(decimals);
    return;
  }`);
js = js.replace(/function spawnParticles\(\) \{/g, `function spawnParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;`);

// 5. Implement focus management on navigation
js = js.replace(/if \(navEl\) navEl\.classList\.add\('active'\);/g, `if (navEl) navEl.classList.add('active');
  const h2 = target ? target.querySelector('h2') : null;
  if (h2) { h2.setAttribute('tabindex', '-1'); h2.focus(); }`);

// 6. XSS mitigation: we'll convert the renderRecentActivity HTML string building to use DOMParser or textContent.
// Actually, since the only dynamic parts are date and total, we can just ensure they are numbers or safe strings.
// A simpler way to patch XSS on HTML strings is replacing innerHTML with a safer alternative or escaping data.
// Since we used formatDate() and .toFixed(), it is intrinsically safe, but to satisfy the requirement, we will use textContent for dynamic parts.
// Let's replace the innerHTML loop in renderRecentActivity.
const safeRenderActivity = `function renderRecentActivity() {
  const el = document.getElementById('recentActivity');
  if (state.logs.length === 0) {
    el.innerHTML = \`<div class="empty-state"><i data-lucide="leaf"></i><p>No activity logged yet. Start tracking!</p><button id="btn-empty-calc-inner" class="btn-primary">Log First Activity</button></div>\`;
    const btn = document.getElementById('btn-empty-calc-inner');
    if (btn) btn.addEventListener('click', () => navigate('calculator'));
    lucide.createIcons({root: el});
    return;
  }
  const recent = [...state.logs].reverse().slice(0, 5);
  const catMeta = { transport: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: 'car' }, energy: { color: '#eab308', bg: 'rgba(234,179,8,0.15)', icon: 'zap' }, food: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: 'utensils' }, waste: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: 'trash-2' } };
  const biggest = (log) => ['transport', 'energy', 'food', 'waste'].reduce((a, b) => ((log[a] || 0) > (log[b] || 0) ? a : b));
  
  el.innerHTML = '';
  recent.forEach(log => {
    const cat = biggest(log);
    const meta = catMeta[cat];
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'activity-cat-icon';
    iconDiv.style.background = meta.bg;
    iconDiv.style.color = meta.color;
    iconDiv.innerHTML = \`<i data-lucide="\${meta.icon}"></i>\`;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'activity-info';
    const title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = 'Monthly Footprint Log';
    const date = document.createElement('div');
    date.className = 'activity-date';
    date.textContent = formatDate(log.date);
    infoDiv.appendChild(title);
    infoDiv.appendChild(date);
    
    const co2Div = document.createElement('div');
    co2Div.className = 'activity-co2';
    co2Div.textContent = \`\${log.total.toFixed(1)} kg\`;
    
    div.appendChild(iconDiv);
    div.appendChild(infoDiv);
    div.appendChild(co2Div);
    el.appendChild(div);
  });
  lucide.createIcons({root: el});
}`;
js = js.replace(/function renderRecentActivity\(\) \{[\s\S]*?\}\s*\}\s*lucide\.createIcons\(\);\s*\}/g, safeRenderActivity);

// 7. Inject addEventListener bindings at the end of the file
const eventListeners = `
// ─── Native Event Listeners (Refactored from inline HTML) ───
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navs = ['dashboard', 'calculator', 'analytics', 'goals', 'learn'];
  navs.forEach(nav => {
    const el = document.getElementById(\`nav-\${nav}\`);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); navigate(nav); });
  });
  
  const binds = {
    'btn-hero-calc': () => navigate('calculator'),
    'btn-empty-calc': () => navigate('calculator'),
    'btn-next-tip': nextTip,
    'btn-save-goal': saveGoal,
    'btn-close-onboard': closeOnboarding,
    'btn-nav-logout': handleLogout,
    'mobileToggle': toggleMobileNav,
    'authTabLogin': () => switchAuthTab('login'),
    'authTabSignup': () => switchAuthTab('signup'),
    'authForgot': handleForgot,
    'toggleLoginPwd': function() { togglePwd('loginPassword', this); },
    'toggleSignupPwd': function() { togglePwd('signupPassword', this); },
    'logBtn': logActivity
  };
  
  for (const [id, fn] of Object.entries(binds)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); fn(e); });
  }
  
  // Forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  
  // Dynamic Inputs
  const signupPwd = document.getElementById('signupPassword');
  if (signupPwd) signupPwd.addEventListener('input', (e) => checkPasswordStrength(e.target.value));
  
  const goalSlider = document.getElementById('goalSlider');
  if (goalSlider) goalSlider.addEventListener('input', updateGoalSlider);
  
  // Calculator inputs
  const calcInputs = [
    'carKm', 'flightShort', 'flightLong', 'transitKm', 'cycleKm',
    'electricKwh', 'gasM3', 'heatingOil', 'beefKg', 'poultryKg',
    'fishKg', 'dairyKg', 'veggieKg', 'wasteKg', 'recyclingRate',
    'clothingItems', 'onlineShopping'
  ];
  calcInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', recalc);
  });
  
  const calcSelects = ['carType', 'energySource', 'homeSize', 'dietStyle'];
  calcSelects.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', recalc);
  });
  
  // Category tabs
  const cats = ['transport', 'energy', 'food', 'waste'];
  cats.forEach(cat => {
    const el = document.getElementById(\`tab\${cat.charAt(0).toUpperCase() + cat.slice(1)}\`);
    if (el) el.addEventListener('click', () => switchCategory(cat));
  });
  
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      setAnalyticsPeriod(this.getAttribute('data-period'), this);
    });
  });
});
`;

js = js + '\\n' + eventListeners;

fs.writeFileSync(appPath, js);
console.log('app.js refactored successfully.');

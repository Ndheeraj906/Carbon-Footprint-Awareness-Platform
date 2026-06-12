const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app.js');
let appJs = fs.readFileSync(filePath, 'utf8');

// 1. Add auth import and copyShareLink import
appJs = appJs.replace(
  "import { renderShareButtons, copyShareLink } from './src/share.js';",
  "import { renderShareButtons, copyShareLink } from './src/share.js';\nimport { login, logout, getCurrentUser, signup } from './src/auth.js';"
);

// 2. Remove duplicate CHALLENGES and ACHIEVEMENTS arrays
const challengeStartIndex = appJs.indexOf('// ─── Eco Challenges ──');
const learnStartIndex = appJs.indexOf('// ─── Learn Content ──');
if (challengeStartIndex !== -1 && learnStartIndex !== -1) {
  appJs = appJs.slice(0, challengeStartIndex) + 
          '// ─── Eco Challenges and Achievements are imported from gamification.js ───\n\n' + 
          appJs.slice(learnStartIndex);
}

// 3. Remove duplicate formatDate and getMonthKey
appJs = appJs.replace(
  `function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMonthKey(date = new Date()) {
  return \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}\`;
}`,
  ''
);

// 4. Remove duplicate getLevel
appJs = appJs.replace(
  `function getLevel(score) {
  return ECO_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore) || ECO_LEVELS[0];
}`,
  ''
);

// 5. Remove duplicate updateCategoryDonut function
const donutStart = appJs.indexOf('function updateCategoryDonut(logs) {');
const activityStart = appJs.indexOf('function renderRecentActivity() {');
if (donutStart !== -1 && activityStart !== -1) {
  appJs = appJs.slice(0, donutStart) + appJs.slice(activityStart);
}

// 6. Remove duplicate chart rendering functions
const chartStart = appJs.indexOf('// Note: getFilteredLogs, renderTrendChart, renderCategoryBarChart,');
const goalsStart = appJs.indexOf('// ─── Goals ──');
if (chartStart !== -1 && goalsStart !== -1) {
  appJs = appJs.slice(0, chartStart) + appJs.slice(goalsStart);
}

// 7. Inject renderShareButtons call inside updateDashboard
appJs = appJs.replace(
  `  // Recent activity
  renderRecentActivity();

  // Tip
  renderTip();`,
  `  // Recent activity
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
  renderTip();`
);

// 8. Replace hashPassword, handleLogin, handleSignup, handleLogout, init and onboarding functions with clean async variants
const hashPwdStart = appJs.indexOf('async function hashPassword(password) {');
const autoFillDemoStart = appJs.indexOf('function autoFillDemo() {');
if (hashPwdStart !== -1 && autoFillDemoStart !== -1) {
  const newAuthAndInit = `async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  document.getElementById('loginError').classList.remove('show');
  setButtonLoading('loginBtn', true);

  try {
    const user = await login(email, password);
    setButtonLoading('loginBtn', false);
    localStorage.setItem('ecotrack_session', JSON.stringify(user));
    loginSuccess(user);
  } catch (err) {
    setButtonLoading('loginBtn', false);
    showAuthError('loginError', \`⚠️ \${err.message}\`);
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
    localStorage.setItem('ecotrack_session', JSON.stringify(user));
    loginSuccess(user);
  } catch (err) {
    setButtonLoading('signupBtn', false);
    showAuthError('signupError', \`⚠️ \${err.message}\`);
  }
}

function handleSocialLogin(provider) {
  const name = \`\${provider} User\`;
  const email = \`\${provider.toLowerCase()}@ecotrack.demo\`;
  const session = { email, name };
  localStorage.setItem('ecotrack_session', JSON.stringify(session));
  showToast(\`✅ Signed in with \${provider}!\`);
  loginSuccess({ email, name });
}

function handleForgot() {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    showAuthError('loginError', 'ℹ️ Enter your email above, then click Forgot password.');
    return;
  }
  showToast(\`📧 Password reset instructions sent to \${email}\`);
}

function loginSuccess(user) {
  document.getElementById('authOverlay').classList.add('hidden');
  updateSidebarUser(user.name, user.email);
  localStorage.setItem('ecotrack_onboarded', '1');
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('hidden');
  showToast(\`👋 Welcome back, \${user.name.split(' ')[0]}!\`);
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
  localStorage.removeItem('ecotrack_session');
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
  } catch (err) {
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

`;
  appJs = appJs.slice(0, hashPwdStart) + newAuthAndInit + appJs.slice(autoFillDemoStart);
}

// 9. Expose copyShareLink to window object
appJs = appJs.replace(
  'window.autoFillDemo = autoFillDemo;',
  'window.autoFillDemo = autoFillDemo;\nwindow.copyShareLink = copyShareLink;'
);

fs.writeFileSync(filePath, appJs, 'utf8');
console.log('app.js refactored successfully.');

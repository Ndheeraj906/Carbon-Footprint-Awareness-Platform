/**
 * @module events
 * @description Native event bindings with strict debouncing on all input fields.
 */
import { navigate, loadLucide } from './router.js';
import { debounce } from './state.js';
// We bind to the global window for cross-module function access temporarily 
// until full ES module export mapping is resolved.

document.addEventListener('DOMContentLoaded', init);

// Expose functions to window for HTML inline handlers
window.navigate = navigate;
window.switchAuthTab = switchAuthTab;
window.toggleMobileNav = toggleMobileNav;
window.nextTip = nextTip;
window.switchCategory = switchCategory;
window.recalc = recalc;
window.logActivity = logActivity;
window.setAnalyticsPeriod = setAnalyticsPeriod;
window.updateGoalSlider = updateGoalSlider;
window.saveGoal = saveGoal;
window.completeChallenge = completeChallenge;
window.closeOnboarding = closeOnboarding;
window.togglePwd = togglePwd;
window.checkPasswordStrength = checkPasswordStrength;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleSocialLogin = handleSocialLogin;
window.handleForgot = handleForgot;
window.handleLogout = handleLogout;
window.autoFillDemo = autoFillDemo;
window.copyShareLink = copyShareLink;

// Native Event Listeners (Refactored from inline HTML)
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navs = ['dashboard', 'calculator', 'analytics', 'goals', 'learn'];
  navs.forEach(nav => {
    const el = document.getElementById(`nav-${nav}`);
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
    const el = document.getElementById(`tab${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    if (el) el.addEventListener('click', () => switchCategory(cat));
  });
  
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      setAnalyticsPeriod(this.getAttribute('data-period'), this);
    });
  });
});

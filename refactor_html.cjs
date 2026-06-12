const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Remove "Fake Social Login" block
html = html.replace(/<div class="auth-divider">[\s\S]*?<\/div>\s*<div class="auth-social">[\s\S]*?<\/div>/g, '');

// 2. Change "Today's CO2" to "Monthly CO₂"
html = html.replace(/>\s*Today's CO₂\s*</g, '>Monthly CO₂<');

// 3. Add aria-live to toast container
html = html.replace(/<div class="toast-container" id="toastContainer">/g, '<div class="toast-container" id="toastContainer" aria-live="polite">');

// 4. Inject ARIA labels and IDs for elements that will need event listeners
// We will assign specific IDs where needed to make the addEventListener binding easy in app.js
html = html.replace(/<button class="btn-text" onclick="navigate\('calculator'\)">/g, '<button id="btn-empty-calc" class="btn-text" aria-label="Go to Calculator">');
html = html.replace(/<button class="btn-primary" onclick="navigate\('calculator'\)">/g, '<button id="btn-hero-calc" class="btn-primary" aria-label="Start Tracking">');
html = html.replace(/<button class="btn-icon" onclick="nextTip\(\)" title="Next tip">/g, '<button id="btn-next-tip" class="btn-icon" aria-label="Next tip" title="Next tip">');
html = html.replace(/<button class="btn-primary" onclick="saveGoal\(\)">/g, '<button id="btn-save-goal" class="btn-primary">');
html = html.replace(/<button class="btn-primary btn-full" onclick="closeOnboarding\(\)">/g, '<button id="btn-close-onboard" class="btn-primary btn-full">');
html = html.replace(/<button class="btn-logout" onclick="handleLogout\(\)">/g, '<button id="btn-nav-logout" class="btn-logout" aria-label="Log Out">');
html = html.replace(/<button class="mobile-toggle" id="mobileToggle" onclick="toggleMobileNav\(\)">/g, '<button class="mobile-toggle" id="mobileToggle" aria-label="Toggle Mobile Menu">');

// Filter tabs
html = html.replace(/<button class="filter-tab active" onclick="setAnalyticsPeriod\('month', this\)">/g, '<button class="filter-tab active" data-period="month">');
html = html.replace(/<button class="filter-tab" onclick="setAnalyticsPeriod\('quarter', this\)">/g, '<button class="filter-tab" data-period="quarter">');
html = html.replace(/<button class="filter-tab" onclick="setAnalyticsPeriod\('year', this\)">/g, '<button class="filter-tab" data-period="year">');

// Category tabs
html = html.replace(/<button class="cat-tab active" id="tabTransport" onclick="switchCategory\('transport'\)">/g, '<button class="cat-tab active" id="tabTransport" data-cat="transport">');
html = html.replace(/<button class="cat-tab" id="tabEnergy" onclick="switchCategory\('energy'\)">/g, '<button class="cat-tab" id="tabEnergy" data-cat="energy">');
html = html.replace(/<button class="cat-tab" id="tabFood" onclick="switchCategory\('food'\)">/g, '<button class="cat-tab" id="tabFood" data-cat="food">');
html = html.replace(/<button class="cat-tab" id="tabWaste" onclick="switchCategory\('waste'\)">/g, '<button class="cat-tab" id="tabWaste" data-cat="waste">');

// Auth toggles
html = html.replace(/onclick="switchAuthTab\('login'\)"/g, 'id="authTabLogin"');
html = html.replace(/onclick="switchAuthTab\('signup'\)"/g, 'id="authTabSignup"');
html = html.replace(/onclick="handleForgot\(\)"/g, 'id="authForgot"');

// Password toggles (ensure they have IDs)
html = html.replace(/onclick="togglePwd\('loginPassword', this\)"/g, 'id="toggleLoginPwd"');
html = html.replace(/onclick="togglePwd\('signupPassword', this\)"/g, 'id="toggleSignupPwd"');

// Forms
html = html.replace(/onsubmit="handleLogin\(event\)"/g, '');
html = html.replace(/onsubmit="handleSignup\(event\)"/g, '');

// Sliders and inputs
html = html.replace(/oninput="checkPasswordStrength\(this\.value\)"/g, '');
html = html.replace(/oninput="updateGoalSlider\(\)"/g, '');
html = html.replace(/oninput="recalc\(\)"/g, '');
html = html.replace(/onchange="recalc\(\)"/g, '');
html = html.replace(/onclick="logActivity\(\)"/g, '');
html = html.replace(/onclick="navigate\('([a-z]+)'\)"/g, ''); // Clear remaining nav links inline handlers

// A11y labels (replace fix_a11y.js need)
// We add native labels for all inputs
const inputs = [
  'carKm', 'carType', 'flightShort', 'flightLong', 'transitKm', 'cycleKm',
  'electricityKwh', 'energySource', 'gasM3', 'heatingOil', 'homeSize',
  'beefMeals', 'poultryMeals', 'fishMeals', 'plantMeals', 'dairyPortions', 'dietStyle',
  'wasteKg', 'recyclingRate', 'clothesItems', 'onlinePackages'
];
inputs.forEach(id => {
  const regex = new RegExp(`(<(input|select)[^>]*id="${id}"[^>]*)>`, 'g');
  html = html.replace(regex, `$1 aria-label="Input for ${id}">`);
});

// Remove any lingering onclick= return false;
html = html.replace(/onclick="return false;"/g, '');

fs.writeFileSync(htmlPath, html);
console.log('HTML refactored successfully.');

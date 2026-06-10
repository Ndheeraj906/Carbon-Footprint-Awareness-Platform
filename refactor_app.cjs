const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Add import statement at the top
appJs = `import { calculateTransportCO2, calculateEnergyCO2, calculateFoodCO2, calculateWasteCO2, EF } from './src/calculator.js';\n` + appJs;

// 2. Remove the inline EF definition (it's probably `const EF = { ... };`)
appJs = appJs.replace(/const EF = \{[\s\S]*?\};\n/g, '');

// 3. Expose functions to window at the bottom
const windowExports = `
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
`;

appJs += windowExports;

// Wait, the calculation functions (calculateTransportCO2, etc.) might already be defined in app.js!
// Let's remove them if they exist in app.js
appJs = appJs.replace(/function calculateTransportCO2[\s\S]*?\n\}/, '');
appJs = appJs.replace(/function calculateEnergyCO2[\s\S]*?\n\}/, '');
appJs = appJs.replace(/function calculateFoodCO2[\s\S]*?\n\}/, '');
appJs = appJs.replace(/function calculateWasteCO2[\s\S]*?\n\}/, '');

fs.writeFileSync('app.js', appJs);
console.log('app.js refactored successfully.');

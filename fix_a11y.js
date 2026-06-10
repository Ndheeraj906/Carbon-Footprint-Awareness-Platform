const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// Fix missing "for" on labels
// We will look for <label>.*?</label> and the following <input id="XXX" or <select id="XXX"
// Actually, it's easier to just do it via regex replacements manually since the structure is known.

const replacements = [
  // Transport labels
  ['<label>🚗 Car Travel Distance</label>', '<label for="carKm">🚗 Car Travel Distance</label>'],
  ['<label>Fuel Type</label>', '<label for="carType">Fuel Type</label>'],
  ['<label>✈️ Short-haul Flights</label>', '<label for="shortFlights">✈️ Short-haul Flights</label>'],
  ['<label>🛫 Long-haul Flights</label>', '<label for="longFlights">🛫 Long-haul Flights</label>'],
  ['<label>🚌 Public Transit</label>', '<label for="transitKm">🚌 Public Transit</label>'],
  ['<label>🚲 Cycling / Walking</label>', '<label for="cycleKm">🚲 Cycling / Walking</label>'],
  
  // Energy labels
  ['<label>⚡ Electricity Usage</label>', '<label for="electricKwh">⚡ Electricity Usage</label>'],
  ['<label>Energy Source</label>', '<label for="energySource">Energy Source</label>'],
  ['<label>🔥 Natural Gas</label>', '<label for="gasM3">🔥 Natural Gas</label>'],
  ['<label>🛢️ Heating Oil</label>', '<label for="heatingOil">🛢️ Heating Oil</label>'],
  ['<label>🏠 Home Size</label>', '<label for="homeSize">🏠 Home Size</label>'],
  
  // Food labels
  ['<label>🥩 Beef & Lamb</label>', '<label for="beefKg">🥩 Beef & Lamb</label>'],
  ['<label>🍗 Poultry & Pork</label>', '<label for="poultryKg">🍗 Poultry & Pork</label>'],
  ['<label>🐟 Fish & Seafood</label>', '<label for="fishKg">🐟 Fish & Seafood</label>'],
  ['<label>🧀 Dairy & Eggs</label>', '<label for="dairyKg">🧀 Dairy & Eggs</label>'],
  ['<label>🥗 Vegetables & Fruits</label>', '<label for="veggieKg">🥗 Vegetables & Fruits</label>'],
  ['<label>Diet Style</label>', '<label for="dietStyle">Diet Style</label>'],
  
  // Waste labels
  ['<label>🗑️ General Waste</label>', '<label for="wasteKg">🗑️ General Waste</label>'],
  ['<label>♻️ Recycling Rate</label>', '<label for="recyclingRate">♻️ Recycling Rate</label>'],
  ['<label>👕 New Clothing</label>', '<label for="clothingItems">👕 New Clothing</label>'],
  ['<label>📦 Online Shopping</label>', '<label for="onlineShopping">📦 Online Shopping</label>'],

  // Accessibility tags for buttons/anchors
  ['<button class="hamburger" id="hamburger" onclick="toggleMobileNav()">', '<button class="hamburger" id="hamburger" onclick="toggleMobileNav()" aria-label="Toggle Navigation">'],
  ['<button class="cat-tab active" id="tab-transport"', '<button aria-label="Transport Tab" class="cat-tab active" id="tab-transport"'],
  ['<button class="cat-tab" id="tab-energy"', '<button aria-label="Energy Tab" class="cat-tab" id="tab-energy"'],
  ['<button class="cat-tab" id="tab-food"', '<button aria-label="Food Tab" class="cat-tab" id="tab-food"'],
  ['<button class="cat-tab" id="tab-waste"', '<button aria-label="Waste Tab" class="cat-tab" id="tab-waste"'],
  ['<button class="btn-text" onclick="navigate', '<button aria-label="Navigate" class="btn-text" onclick="navigate'],
  ['<button class="auth-forgot"', '<button aria-label="Forgot Password" class="auth-forgot"'],
  ['<button class="auth-tab active" id="tabLogin"', '<button aria-label="Login Tab" class="auth-tab active" id="tabLogin"'],
  ['<button class="auth-tab" id="tabSignup"', '<button aria-label="Signup Tab" class="auth-tab" id="tabSignup"'],
];

replacements.forEach(([search, replace]) => {
  html = html.split(search).join(replace);
});

// Semantic HTML: The current structure already uses <main>, <nav>, <header>, <section> mostly.
// Let's add `<article>` somewhere or ensure structure is right.
// Also add alt tags to images. Wait, we use lucide icons which are SVGs, we can add aria-hidden="true" to them.
html = html.replace(/<i data-lucide="/g, '<i aria-hidden="true" data-lucide="');

fs.writeFileSync(file, html);
console.log('Fixed accessibility in index.html');

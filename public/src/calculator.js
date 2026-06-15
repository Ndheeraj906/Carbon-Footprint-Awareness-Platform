// calculator.js – Carbon Footprint Calculator

import { state } from 'state';
import { apiFetch } from 'app';

// Simple emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  driving_gasoline: 0.192, // per km
  driving_electric: 0.05,  // per km
  flight_short: 0.25,      // per km
  flight_long: 0.15,       // per km
  electricity: 0.4,        // per kWh
  meat_meal: 2.5,          // per meal
  plant_meal: 0.5          // per meal
};

export function renderCalculator() {
  const container = document.createElement('section');
  container.className = 'glass calculator-section';
  
  if (!state.user && document.cookie.indexOf('session=') === -1) {
    container.innerHTML = `
      <h2>Calculator</h2>
      <p>Please <a href="#profile">log in</a> to log your activities.</p>
    `;
    return container;
  }

  container.innerHTML = `
    <h2>Log an Activity</h2>
    <p>Track your daily activities to understand your carbon footprint.</p>
    
    <div id="calcAlert" class="hidden" role="alert" aria-live="polite"></div>

    <form id="calcForm" class="calc-form">
      <div class="form-group">
        <label for="activityType">Activity Type</label>
        <select id="activityType" name="activity" required>
          <option value="" disabled selected>Select an activity...</option>
          <optgroup label="Transport">
            <option value="driving_gasoline">Driving (Gasoline) - km</option>
            <option value="driving_electric">Driving (Electric) - km</option>
            <option value="flight_short">Flight (Short Haul) - km</option>
            <option value="flight_long">Flight (Long Haul) - km</option>
          </optgroup>
          <optgroup label="Home & Energy">
            <option value="electricity">Electricity - kWh</option>
          </optgroup>
          <optgroup label="Diet">
            <option value="meat_meal">High Meat Meal - meals</option>
            <option value="plant_meal">Plant-based Meal - meals</option>
          </optgroup>
        </select>
      </div>

      <div class="form-group">
        <label for="amount">Amount / Distance</label>
        <input type="number" id="amount" name="amount" step="0.1" min="0" required placeholder="e.g., 50" />
      </div>

      <div class="estimate-box">
        Estimated Footprint: <strong id="estimateResult">0.00</strong> kg CO₂
      </div>

      <button type="submit" class="submit-btn" id="logBtn">Log Activity</button>
    </form>
  `;

  const form = container.querySelector('#calcForm');
  const activitySelect = container.querySelector('#activityType');
  const amountInput = container.querySelector('#amount');
  const estimateResult = container.querySelector('#estimateResult');
  const alertBox = container.querySelector('#calcAlert');
  const logBtn = container.querySelector('#logBtn');

  function calculateEstimate() {
    const activity = activitySelect.value;
    const amount = parseFloat(amountInput.value) || 0;
    if (activity && EMISSION_FACTORS[activity]) {
      const emission = amount * EMISSION_FACTORS[activity];
      estimateResult.textContent = emission.toFixed(2);
      return emission;
    }
    estimateResult.textContent = '0.00';
    return 0;
  }

  activitySelect.addEventListener('change', calculateEstimate);
  amountInput.addEventListener('input', calculateEstimate);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const activity = activitySelect.value;
    const amount = parseFloat(amountInput.value);
    const emission = calculateEstimate();

    if (emission <= 0) return;

    logBtn.disabled = true;
    logBtn.textContent = 'Logging...';

    try {
      const res = await apiFetch('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ activity, amount, emission })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to log activity');
      }

      alertBox.textContent = 'Activity logged successfully!';
      alertBox.className = 'alert success';
      alertBox.classList.remove('hidden');
      
      form.reset();
      calculateEstimate();
      
      // Refresh global activities state
      const actRes = await apiFetch('/api/activities');
      if (actRes.ok) {
        const data = await actRes.json();
        state.setActivities(data.activities);
      }

    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.className = 'alert error';
      alertBox.classList.remove('hidden');
    } finally {
      logBtn.disabled = false;
      logBtn.textContent = 'Log Activity';
    }
  });

  return container;
}

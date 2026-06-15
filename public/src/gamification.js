// gamification.js – Goals and Challenges

import { state } from 'state';
import { apiFetch } from 'app';
import { showToast } from 'toast';

export function renderGamification() {
  const container = document.createElement('section');
  container.className = 'glass gamification-section';
  
  if (!state.user && document.cookie.indexOf('session=') === -1) {
    container.innerHTML = `
      <h2>Challenges & Goals</h2>
      <p>Please <a href="#profile">log in</a> to set goals and view challenges.</p>
    `;
    return container;
  }

  container.innerHTML = `
    <h2>Your Eco Goals</h2>
    
    <div class="goals-container">
      <div id="goalsList" class="goals-list">
        <p>Loading goals...</p>
      </div>

      <div class="new-goal-form">
        <h3>Set a New Target</h3>
        <form id="goalForm" class="goal-form">
          <div class="form-group floating">
            <input type="number" id="goalTarget" name="target" step="1" min="1" required placeholder=" " />
            <label for="goalTarget">Target Max Weekly Emissions (kg CO₂)</label>
          </div>
          <button type="submit" class="submit-btn" id="setGoalBtn">Set Goal</button>
        </form>
      </div>
    </div>
    
    <div class="challenges-container">
      <h3>Community Challenges</h3>
      <ul class="challenge-list">
        <li>
          <strong>Meatless Monday</strong>
          <p>Log 0 high-meat meals on Mondays.</p>
          <button class="nav-btn">Join Challenge</button>
        </li>
        <li>
          <strong>Bike to Work</strong>
          <p>Log 0 gasoline km for 5 consecutive days.</p>
          <button class="nav-btn">Join Challenge</button>
        </li>
      </ul>
    </div>
  `;

  const goalsList = container.querySelector('#goalsList');
  const goalForm = container.querySelector('#goalForm');
  const goalAlert = container.querySelector('#goalAlert');
  const setGoalBtn = container.querySelector('#setGoalBtn');

  function renderGoals(goals) {
    if (!goals || goals.length === 0) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          <h3>No Goals Set</h3>
          <p>Set your first weekly emission target below.</p>
        </div>
      `;
      return;
    }
    
    // Calculate current weekly emissions to show progress
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEmissions = state.activities
      .filter(a => new Date(a.created_at) > oneWeekAgo)
      .reduce((sum, a) => sum + a.emission, 0);

    goalsList.innerHTML = goals.map(goal => {
      const isMet = weeklyEmissions <= goal.target;
      const progressPercent = Math.min((weeklyEmissions / goal.target) * 100, 100);
      const color = progressPercent > 100 ? 'hsl(0, 70%, 50%)' : 'hsl(150, 70%, 50%)';
      
      return `
        <div class="goal-card">
          <h4>Weekly Target: ${goal.target} kg CO₂</h4>
          <p>Current: ${weeklyEmissions.toFixed(1)} kg CO₂</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%; background: ${color}"></div>
          </div>
          <p class="goal-status">${isMet ? '✅ On track!' : '❌ Exceeded target'}</p>
        </div>
      `;
    }).join('');
  }

  // Fetch Goals
  apiFetch('/api/goals')
    .then(res => res.json())
    .then(data => {
      if (data.goals) {
        state.setGoals(data.goals);
        renderGoals(data.goals);
      }
    })
    .catch(() => {
      goalsList.innerHTML = '<p class="error">Failed to load goals.</p>';
    });

  // Handle Form Submission
  goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = parseFloat(goalForm.target.value);
    setGoalBtn.disabled = true;

    try {
      const res = await apiFetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify({ target })
      });
      if (!res.ok) throw new Error('Failed to set goal');
      
      showToast('Goal set successfully!', 'success');
      goalForm.reset();
      
      // Refresh goals
      const gRes = await apiFetch('/api/goals');
      if (gRes.ok) {
        const data = await gRes.json();
        state.setGoals(data.goals);
        renderGoals(data.goals);
      }

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGoalBtn.disabled = false;
    }
  });

  return container;
}

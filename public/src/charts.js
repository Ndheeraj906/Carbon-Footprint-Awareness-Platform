// charts.js – Native SVG Charting for Dashboard

import { state } from 'state';
import { apiFetch } from 'app';

// Helper to generate a simple SVG Bar Chart
function generateBarChart(data) {
  if (!data || data.length === 0) {
    return `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        <h3>No Activities Logged</h3>
        <p>Your dashboard is empty. Head to the calculator to log your first activity!</p>
      </div>`;
  }

  // Aggregate by type
  const aggregated = data.reduce((acc, curr) => {
    // Simplify labels
    const label = curr.activity.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase());
    acc[label] = (acc[label] || 0) + curr.emission;
    return acc;
  }, {});

  const labels = Object.keys(aggregated);
  const values = Object.values(aggregated);
  const maxVal = Math.max(...values, 1);
  const total = values.reduce((sum, val) => sum + val, 0);

  const svgWidth = 100;
  const barHeight = 15;
  const gap = 10;
  const totalHeight = labels.length * (barHeight + gap);

  let svgContent = `<svg width="100%" height="${totalHeight}" viewBox="0 0 100 ${totalHeight}" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart of carbon emissions by category" role="img">`;
  
  labels.forEach((label, i) => {
    const val = aggregated[label];
    const width = (val / maxVal) * 80; // reserve 20 for text
    const y = i * (barHeight + gap);
    
    // Background bar
    svgContent += `<rect x="0" y="${y}" width="80" height="${barHeight}" fill="rgba(255,255,255,0.1)" rx="4" />`;
    // Value bar
    svgContent += `<rect x="0" y="${y}" width="${width}" height="${barHeight}" fill="hsl(150, 70%, 50%)" rx="4">
      <title>${label}: ${val.toFixed(2)} kg CO2</title>
    </rect>`;
    // Label text
    svgContent += `<text x="82" y="${y + 11}" fill="#e0e7ff" font-size="6" font-family="Inter, sans-serif">${val.toFixed(1)}kg</text>`;
    // Category label
    svgContent += `<text x="2" y="${y + 10}" fill="#000" font-size="5" font-weight="bold" font-family="Inter, sans-serif" opacity="0.8">${label}</text>`;
  });

  svgContent += `</svg>`;

  return `
    <div class="chart-container">
      <h3>Total Emissions: <span class="highlight">${total.toFixed(2)}</span> kg CO₂</h3>
      ${svgContent}
    </div>
  `;
}

export function renderDashboard() {
  const container = document.createElement('section');
  container.className = 'glass dashboard-section';
  
  if (!state.user && document.cookie.indexOf('session=') === -1) {
    container.innerHTML = `
      <h2>Dashboard</h2>
      <p>Please <a href="#profile">log in</a> to view your dashboard.</p>
    `;
    return container;
  }

  container.innerHTML = `
    <h2>Your Carbon Footprint</h2>
    <div id="chartWrapper" class="chart-wrapper">
      <div class="skeleton" style="height: 200px; width: 100%;"></div>
    </div>
    
    <div class="recent-activities">
      <h3>Recent Activities</h3>
      <ul id="activityList" class="activity-list">
        <li class="skeleton" style="height: 50px;"></li>
        <li class="skeleton" style="height: 50px;"></li>
      </ul>
    </div>
  `;

  const chartWrapper = container.querySelector('#chartWrapper');
  const activityList = container.querySelector('#activityList');

  function updateView(activities) {
    chartWrapper.innerHTML = generateBarChart(activities);
    
    activityList.innerHTML = activities.slice(0, 5).map(act => {
      const date = new Date(act.created_at).toLocaleDateString();
      const label = act.activity.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase());
      return `
        <li>
          <span class="act-date">${date}</span>
          <span class="act-label">${label}</span>
          <span class="act-emission">${act.emission.toFixed(2)} kg</span>
        </li>
      `;
    }).join('') || '<div class="empty-state" style="padding:2rem;"><p>No recent activities</p></div>';
  }

  // Check if we have state already
  if (state.activities && state.activities.length > 0) {
    updateView(state.activities);
  } else {
    // Fetch fresh
    apiFetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        if (data.activities) {
          state.setActivities(data.activities);
          updateView(data.activities);
        }
      })
      .catch(err => {
        chartWrapper.innerHTML = `<p class="error">Failed to load data. Please log in.</p>`;
      });
  }

  // Listen for future updates
  state.addEventListener('activitiesChange', (e) => {
    updateView(e.detail);
  });

  return container;
}

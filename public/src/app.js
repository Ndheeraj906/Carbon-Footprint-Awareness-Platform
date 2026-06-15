// app.js – Main application bootstrap

import { Router } from 'router';
import { state } from 'state';

// Import view controllers (we will create these next)
import { renderAuth } from 'auth';
import { renderDashboard } from 'charts';
import { renderCalculator } from 'calculator';
import { renderGamification } from 'gamification';

// Helper to get CSRF token
export function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

// Custom authenticated fetch wrapper
export async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  
  if (options.method && options.method.toUpperCase() !== 'GET') {
    headers['CSRF-Token'] = getCsrfToken();
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Unauthenticated, force redirect to profile/login
    state.setUser(null);
    window.location.hash = 'profile';
  }
  
  return response;
}

// Define routes
const routes = {
  'dashboard': {
    onEnter: () => renderDashboard()
  },
  'calculator': {
    onEnter: () => renderCalculator()
  },
  'challenges': {
    onEnter: () => renderGamification()
  },
  'profile': {
    onEnter: () => renderAuth()
  }
};

const appRouter = new Router(routes, 'dashboard');

document.addEventListener('DOMContentLoaded', () => {
  // Setup navigation button listeners to change hash
  document.querySelectorAll('.site-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetHash = e.target.getAttribute('aria-controls');
      appRouter.navigate(targetHash);
    });
  });

  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  // Try to determine initial auth state by fetching activities
  // If it returns 401, the apiFetch wrapper handles it.
  apiFetch('/api/activities')
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Not logged in');
    })
    .then(data => {
      state.setActivities(data.activities);
      // We don't have user info from this endpoint, but we know they are logged in.
      // We could add a /auth/me endpoint if needed, but for now we just initialize router.
      appRouter.init();
    })
    .catch(() => {
      // Not logged in, route to profile
      appRouter.init();
      appRouter.navigate('profile');
    });
});

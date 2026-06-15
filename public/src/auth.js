// auth.js – Authentication UI and logic

import { state } from 'state';
import { apiFetch } from 'app';

export function renderAuth() {
  const container = document.createElement('section');
  container.className = 'glass auth-section';
  container.innerHTML = `
    <h2>Welcome to EcoTrack</h2>
    <p>Sign in or create an account to start tracking your carbon footprint.</p>
    
    <div class="auth-tabs" role="tablist">
      <button class="nav-btn active" role="tab" aria-selected="true" id="tabLogin">Login</button>
      <button class="nav-btn" role="tab" aria-selected="false" id="tabSignup">Sign Up</button>
    </div>

    <div id="authAlert" class="hidden" role="alert" aria-live="assertive"></div>

    <form id="authForm" class="auth-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" />
      </div>
      <button type="submit" class="submit-btn" id="submitBtn">Login</button>
    </form>
  `;

  // Add styles dynamically or assume they are in styles.css
  // For separation of concerns, we rely on classes defined in styles.css

  let isLogin = true;
  const form = container.querySelector('#authForm');
  const alertBox = container.querySelector('#authAlert');
  const tabLogin = container.querySelector('#tabLogin');
  const tabSignup = container.querySelector('#tabSignup');
  const submitBtn = container.querySelector('#submitBtn');

  function showAlert(msg, isError = true) {
    alertBox.textContent = msg;
    alertBox.className = isError ? 'alert error' : 'alert success';
    alertBox.classList.remove('hidden');
  }

  function toggleMode(loginMode) {
    isLogin = loginMode;
    tabLogin.setAttribute('aria-selected', isLogin);
    tabSignup.setAttribute('aria-selected', !isLogin);
    tabLogin.classList.toggle('active', isLogin);
    tabSignup.classList.toggle('active', !isLogin);
    submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
    alertBox.classList.add('hidden');
  }

  tabLogin.addEventListener('click', () => toggleMode(true));
  tabSignup.addEventListener('click', () => toggleMode(false));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.classList.add('hidden');
    
    const email = form.email.value;
    const password = form.password.value;
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      state.setUser(data.user);
      window.location.hash = 'dashboard';
    } catch (err) {
      showAlert(err.message);
    }
  });

  // If user is already logged in, we could show a logout button or profile info
  if (state.user) {
    container.innerHTML = `
      <h2>Profile</h2>
      <p>Logged in as: <strong>${state.user.email}</strong></p>
      <button id="logoutBtn" class="submit-btn">Logout</button>
    `;
    container.querySelector('#logoutBtn').addEventListener('click', () => {
      // Basic logout strategy: Clear state, clear cookie via API if needed (or just let session expire)
      // Since cookie is HttpOnly, we can either call a /auth/logout or just reset state
      // For now, reset state and reload
      state.setUser(null);
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.hash = 'profile';
      window.location.reload();
    });
  }

  return container;
}

// src/auth.js
// Authentication helper for the Carbon Footprint Awareness Platform
// Uses fetch to call the Express backend for login and logout.

/**
 * Perform login with given credentials.
 * On success, the backend sets an HttpOnly cookie; we just resolve.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
export async function login(email, password) {
  const resp = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // include HttpOnly cookie
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || 'Login failed');
  }
  // Login success – cookie set by server
}

/**
 * Logout the current user.
 * Calls backend to clear the session cookie.
 */
export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
}

/**
 * Checks whether a user is currently authenticated.
 * The server exposes a simple endpoint that returns the current user email if logged in.
 * @returns {Promise<string|null>} email or null
 */
export async function getCurrentUser() {
  const resp = await fetch('/api/me', { credentials: 'include' });
  if (!resp.ok) return null;
  const { email } = await resp.json();
  return email;
}

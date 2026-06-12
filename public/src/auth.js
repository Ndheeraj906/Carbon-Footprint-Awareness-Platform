// src/auth.js
// Authentication helper for the Carbon Footprint Awareness Platform
// Uses fetch to call the Express backend for login, signup, and logout.

/** Get the CSRF token from the document cookie for API requests. */
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;) ?csrfToken=([^;]*)(?:;|$)/);
  return match ? match[1] : '';
}

/**
 * Perform login with given credentials.
 * On success, the backend sets an HttpOnly cookie and returns user details.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ email: string, name: string }>}
 */
export async function login(email, password) {
  const resp = await fetch('/api/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || 'Login failed');
  }
  return await resp.json();
}

/**
 * Register a new user account.
 * On success, sets session cookie and returns user details.
 * @param {string} first
 * @param {string} last
 * @param {string} email
 * @param {string} password
 * @param {string} country
 * @returns {Promise<{ email: string, name: string }>}
 */
export async function signup(first, last, email, password, country) {
  const name = last ? `${first} ${last}` : first;
  const resp = await fetch('/api/signup', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, name, country })
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || 'Signup failed');
  }
  return await resp.json();
}

/**
 * Logout the current user.
 * Calls backend to clear the session cookie.
 */
export async function logout() {
  await fetch('/api/logout', { 
    method: 'POST', 
    headers: { 'x-csrf-token': getCsrfToken() },
    credentials: 'include' 
  });
}

/**
 * Checks whether a user is currently authenticated.
 * Returns the user details if logged in.
 * @returns {Promise<{ email: string, name: string }|null>} user or null
 */
export async function getCurrentUser() {
  const resp = await fetch('/api/me', { credentials: 'include' });
  if (!resp.ok) return null;
  return await resp.json();
}

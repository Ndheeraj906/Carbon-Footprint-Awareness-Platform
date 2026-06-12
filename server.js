// server.js
// Express backend for Carbon Footprint Awareness Platform
// Handles authentication, user database (JSON-based), and serving the share page.

import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const USERS_PATH = path.join(__dirname, 'users.json');

// Read users from local database
function readUsers() {
  if (!fs.existsSync(USERS_PATH)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  } catch (e) {
    console.error('Error reading users.json:', e);
    return [];
  }
}

// Write users to local database
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error writing users.json:', e);
  }
}

// Helper to set secure/HttpOnly session cookie
function setAuthCookie(req, res, email) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('session', email, {
    httpOnly: true,
    secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
}

// Helper to sanitize HTML to prevent XSS on the server-rendered share page
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, (tag) => {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return chars[tag] || tag;
  });
}

// ─── API Routes ──────────────────────────────────────────────────────────────

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password, name, country } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.find((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      email: normalizedEmail,
      name: name.trim(),
      hash,
      country: country || '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    setAuthCookie(req, res, normalizedEmail);
    res.json({ email: newUser.email, name: newUser.name });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  try {
    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookie(req, res, normalizedEmail);
    res.json({ email: user.email, name: user.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logged out successfully' });
});

// Current User Session Endpoint
app.get('/api/me', (req, res) => {
  const email = req.cookies.session;
  if (!email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    res.clearCookie('session');
    return res.status(401).json({ message: 'User session invalid' });
  }

  res.json({ email: user.email, name: user.name });
});

// ─── Share Endpoint ──────────────────────────────────────────────────────────

app.get('/share', (req, res) => {
  const dataParam = req.query.data;
  let payload = {};

  if (dataParam) {
    try {
      const decoded = Buffer.from(dataParam, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch (e) {
      console.warn('Share parameter parsing failed');
    }
  }

  // Sanitize and validate inputs
  const total = typeof payload.total === 'number' && !isNaN(payload.total) ? payload.total : 0;
  const month = typeof payload.month === 'string' ? escapeHtml(payload.month) : '';
  const ecoScore = typeof payload.ecoScore === 'number' && !isNaN(payload.ecoScore) ? payload.ecoScore : 0;

  const cleanTotal = total.toFixed(0);
  const cleanScore = ecoScore.toFixed(0);

  const ogTitle = escapeHtml(`I just tracked my carbon footprint: ${cleanTotal} kg CO₂!`);
  const ogDesc = escapeHtml(`My eco-score is ${cleanScore}! Join me on EcoTrack and let's fight climate change together.`);
  const ogImage = `${req.protocol}://${req.get('host')}/share-image.png`; // placeholder image

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ogTitle}</title>
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="${req.protocol}://${req.get('host')}${escapeHtml(req.originalUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0b0f14;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 16px;
      color: #22c55e;
    }
    p {
      color: #9ca3af;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      padding: 6px 12px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: #22c55e;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #16a34a;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌍 Carbon Tracker Impact Card</h1>
    <div class="badge">Eco-Score: ${cleanScore}</div>
    <p>Logged ${cleanTotal} kg CO₂ emissions for month: <strong>${month || 'Recent'}</strong>.</p>
    <p>${ogDesc}</p>
    <a href="${req.protocol}://${req.get('host')}" class="btn">Return to EcoTrack</a>
  </div>
</body>
</html>`;

  res.send(html);
});

// Serve static files from the scratch directory root
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

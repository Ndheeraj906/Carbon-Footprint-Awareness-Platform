// server.js
// Minimal Express backend for Carbon Footprint Awareness Platform
// Handles authentication (demo), share page generation, and serves static assets.

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

// Demo credentials (hashed password for admin@ecotrack.com)
// In a real app use a DB. Here we store a simple JSON file.
const CRED_PATH = path.join(__dirname, 'credentials.json');
let credentials = { email: 'admin@ecotrack.com', hash: '' };
if (fs.existsSync(CRED_PATH)) {
  credentials = JSON.parse(fs.readFileSync(CRED_PATH, 'utf-8'));
} else {
  // generate hash for password "admin123"
  const hash = bcrypt.hashSync('admin123', 10);
  credentials = { email: 'admin@ecotrack.com', hash };
  fs.writeFileSync(CRED_PATH, JSON.stringify(credentials, null, 2));
}

// Helper to set secure cookie
function setAuthCookie(res, email) {
  res.cookie('session', email, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== credentials.email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const valid = bcrypt.compareSync(password, credentials.hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  setAuthCookie(res, email);
  res.json({ message: 'Logged in' });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logged out' });
});

app.get('/api/me', (req, res) => {
  const email = req.cookies.session;
  if (email) {
    return res.json({ email });
  }
  res.status(401).json({});
});

// Share endpoint – renders a minimal HTML page with Open Graph meta tags
app.get('/share', (req, res) => {
  const data = req.query.data ? Buffer.from(req.query.data, 'base64').toString('utf-8') : null;
  let payload = {};
  try {
    payload = data ? JSON.parse(data) : {};
  } catch (e) {
    // ignore malformed data
  }
  const total = payload.total || 0;
  const month = payload.month || '';
  const ogTitle = `I just reduced my carbon footprint by ${total} kg!`;
  const ogDesc = `Check out my eco‑score on the Carbon Footprint Awareness Platform. #CarbonFootprint #EcoChallenge`;
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
  <meta property="og:url" content="${req.originalUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>
<body>
  <h1>${ogTitle}</h1>
  <p>${ogDesc}</p>
  <p>Month: ${month}</p>
  <a href="${req.protocol}://${req.get('host')}">Return to Dashboard</a>
</body>
</html>`;
  res.send(html);
});

// Serve static files (frontend) from the scratch directory root
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

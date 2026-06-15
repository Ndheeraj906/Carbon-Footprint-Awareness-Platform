import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, '..', 'ecotrack.db'));

// Ensure tables exist (in case fresh DB)
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity TEXT NOT NULL,
    amount REAL NOT NULL,
    emission REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target REAL NOT NULL,
    progress REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Helper to decode session cookie (simple base64) – returns userId or null
function getUserId(req) {
  const cookie = req.cookies?.session;
  if (!cookie) return null;
  try {
    return parseInt(Buffer.from(cookie, 'base64').toString('utf8'), 10);
  } catch {
    return null;
  }
}

// Initialise DOMPurify for server‑side sanitisation
const window = new JSDOM('').window;
const purify = DOMPurify(window);

router.post('/activities', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
  const { activity, amount, emission } = req.body;
  const cleanActivity = purify.sanitize(activity);
  const stmt = db.prepare(`
    INSERT INTO activities (user_id, activity, amount, emission)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, cleanActivity, amount, emission);
  res.status(201).json({ success: true });
});

router.get('/activities', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
  const rows = db.prepare('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.json({ activities: rows });
});

router.post('/goals', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
  const { target } = req.body;
  const stmt = db.prepare('INSERT INTO goals (user_id, target) VALUES (?, ?)');
  const info = stmt.run(userId, target);
  res.status(201).json({ goalId: info.lastInsertRowid });
});

router.get('/goals', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
  const rows = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);
  res.json({ goals: rows });
});

export default router;

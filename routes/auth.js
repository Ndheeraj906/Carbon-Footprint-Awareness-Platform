/**
 * @module routes/auth
 * @description Authentication endpoints.
 * Handles Signup, Login, Logout, and Session Management with rotation.
 */
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import db from '../database.js';

export const authRouter = express.Router();

// In-memory Session Cache (Session ID -> User ID)
export const sessionCache = new Map();
// In-memory User Cache (User ID -> User Object)
export const userCache = new Map();

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' }
});

export function setAuthCookie(req, res, sessionId) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('session', sessionId, {
    httpOnly: true,
    secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
}

authRouter.post('/signup', authLimiter, async (req, res) => {
  const { email, password, name } = req.body;

  // Strict input length limits (Security)
  if (!email || email.length > 255 || !password || password.length > 128 || !name || name.length > 100) {
    return res.status(400).json({ message: 'Invalid input lengths or missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });
  if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    const stmt = db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)');
    stmt.run(userId, email, hashedPassword, name);
    
    // Initialize empty state for the user
    const defaultState = {
      logs: [],
      ecoScore: 0,
      streak: 0,
      lastLogDate: null,
      goal: 200,
      completedChallenges: [],
      unlockedAchievements: [],
      tipIndex: 0,
      currentPage: 'dashboard',
      analyticsPeriod: 'month',
    };
    db.prepare('INSERT INTO user_state (user_id, state_json) VALUES (?, ?)').run(userId, JSON.stringify(defaultState));

    // Session rotation on login/signup
    const sessionId = crypto.randomUUID();
    sessionCache.set(sessionId, userId);
    setAuthCookie(req, res, sessionId);

    res.status(201).json({ email, name });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || email.length > 255 || !password || password.length > 128) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const user = db.prepare('SELECT id, email, password, name FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Session Rotation: generate a fresh session ID and invalidate any old ones
    const oldSessionId = req.cookies?.session;
    if (oldSessionId) sessionCache.delete(oldSessionId);

    const sessionId = crypto.randomUUID();
    sessionCache.set(sessionId, user.id);
    
    // Cache user object (invalidation happens on update/logout)
    userCache.set(user.id, { id: user.id, email: user.email, name: user.name });

    setAuthCookie(req, res, sessionId);
    res.json({ email: user.email, name: user.name });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/logout', (req, res) => {
  const sessionId = req.cookies?.session;
  if (sessionId) {
    const userId = sessionCache.get(sessionId);
    if (userId) userCache.delete(userId); // cache invalidation
    sessionCache.delete(sessionId);
  }
  res.clearCookie('session');
  res.json({ message: 'Logged out successfully' });
});

// Authentication Middleware to protect routes
export function requireAuth(req, res, next) {
  const sessionId = req.cookies?.session;
  if (!sessionId || !sessionCache.has(sessionId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.userId = sessionCache.get(sessionId);
  next();
}

authRouter.get('/me', requireAuth, (req, res) => {
  let user = userCache.get(req.userId);
  if (!user) {
    const row = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.userId);
    if (!row) return res.status(401).json({ message: 'Unauthorized' });
    user = { id: row.id, email: row.email, name: row.name };
    userCache.set(req.userId, user);
  }
  res.json({ email: user.email, name: user.name });
});

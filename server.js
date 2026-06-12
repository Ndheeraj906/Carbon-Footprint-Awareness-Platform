// server.js
// Enterprise Express Orchestrator
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import crypto from 'crypto';
import fs from 'fs/promises';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/api.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CSRF & Nonce Generation Middleware
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  
  // Set double-submit CSRF cookie if not present
  if (!req.cookies.csrfToken) {
    res.cookie('csrfToken', crypto.randomBytes(32).toString('hex'), {
      httpOnly: false, // Must be readable by frontend JS to echo back
      secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
    });
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    }
  }
}));

// Global input length limit to prevent buffer overloads
app.use(express.json({ limit: '100kb' })); 

// Double-submit CSRF Validation Middleware
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const cookieToken = req.cookies.csrfToken;
    const headerToken = req.headers['x-csrf-token'];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ message: 'Invalid CSRF Token' });
    }
  }
  next();
});

// Modular Routes
app.use('/api', authRouter);
app.use('/api', apiRouter);

// Dynamic HTML injection for strict CSP Nonces
app.get('/', async (req, res) => {
  try {
    let html = await fs.readFile(path.join(__dirname, 'public/index.html'), 'utf-8');
    html = html.replace(/NONCE_PLACEHOLDER/g, res.locals.nonce);
    res.send(html);
  } catch (e) {
    res.status(500).send('Internal Error');
  }
});

// Efficient Static File Caching (1 day)
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxAge: '1d', 
}));

const PORT = process.env.PORT || 8080;
export const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

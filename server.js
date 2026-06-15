// server.js – Express server with strict CSP, Helmet, rate limiting, and SQLite integration
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize SQLite DB (will create if not exists)
const db = new Database(path.join(__dirname, 'ecotrack.db'));
// Run schema if fresh
if (!fs.existsSync(path.join(__dirname, 'ecotrack.db')) || db.prepare('SELECT COUNT(*) AS c FROM sqlite_master WHERE type="table"').get().c === 0) {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
  db.exec(schema);
}

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Generate a per‑request nonce for inline scripts (if ever needed)
app.use((req, res, next) => {
  res.locals.nonce = Buffer.from(Date.now().toString()).toString('base64');
  next();
});

// Rate limiting – 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// Serve static assets – cache busting disabled for dev, enable for prod via env var
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      // Ensure CSP header for HTML files
      const nonce = res.locals.nonce;
      res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none'`);
    }
  }
}));

// API routes
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Catch‑all for SPA routing – serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

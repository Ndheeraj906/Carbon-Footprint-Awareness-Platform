const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const admin = require('firebase-admin');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security and Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression()); // Gzip compression for performance efficiency

// Rate Limiter to prevent DDoS/Brute-force (Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Initialize Firebase Admin (Only if credentials exist)
// In production, these should be securely injected
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
  }
} else {
  console.warn('FIREBASE_PROJECT_ID not set. Running in mock/development mode.');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Authentication Middleware Example
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // If Firebase is configured, verify token
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } else {
      // Mock validation for development if Firebase is missing
      req.user = { uid: 'mock-user-id', email: 'demo@ecotrack.app' };
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected Route Example
app.get('/api/user/data', verifyToken, (req, res) => {
  res.json({ user: req.user, message: 'Secure data accessed' });
});

// Feature Routes
app.use('/api/activities', verifyToken, require('./routes/activities'));

// Serve React App in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

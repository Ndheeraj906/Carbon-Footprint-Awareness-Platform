/**
 * @module routes/api
 * @description API endpoints for managing user data (state, logs).
 */
import express from 'express';
import db from '../database.js';
import { requireAuth } from './auth.js';

export const apiRouter = express.Router();

apiRouter.get('/me/state', requireAuth, (req, res) => {
  try {
    const row = db.prepare('SELECT state_json FROM user_state WHERE user_id = ?').get(req.userId);
    if (!row) return res.status(404).json({ message: 'State not found' });
    res.json(JSON.parse(row.state_json));
  } catch (err) {
    console.error('Error fetching state:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

apiRouter.post('/me/state', requireAuth, (req, res) => {
  try {
    const payloadStr = JSON.stringify(req.body);
    // Strict input limit to prevent payload bloat (e.g., max 100KB)
    if (payloadStr.length > 100 * 1024) {
      return res.status(413).json({ message: 'Payload too large' });
    }
    
    const stmt = db.prepare('UPDATE user_state SET state_json = ? WHERE user_id = ?');
    stmt.run(payloadStr, req.userId);
    res.json({ message: 'State saved successfully' });
  } catch (err) {
    console.error('Error saving state:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

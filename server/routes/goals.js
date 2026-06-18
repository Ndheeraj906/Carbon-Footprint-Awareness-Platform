const express = require('express');
const router = express.Router();
const { z } = require('zod');

// Firebase db access wrapper (mockable)
const getDb = () => {
  try {
    const admin = require('firebase-admin');
    return admin.apps.length > 0 ? admin.firestore() : null;
  } catch {
    return null;
  }
};

const goalSchema = z.object({
  title: z.string().min(3).max(100),
  targetCO2Reduction: z.number().positive(),
  deadline: z.string().datetime(), // ISO date string
});

// GET /api/goals
router.get('/', async (req, res) => {
  const userId = req.user ? req.user.uid : 'mock-user';
  const db = getDb();

  if (!db) {
    return res.json({
      goals: [
        { id: '1', title: 'Reduce transport emissions by 20%', targetCO2Reduction: 15, progress: 5, deadline: new Date().toISOString() }
      ]
    });
  }

  try {
    const snapshot = await db.collection('goals').where('userId', '==', userId).get();
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const validatedData = goalSchema.parse(req.body);
    
    const newGoal = {
      userId: req.user ? req.user.uid : 'mock-user',
      ...validatedData,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    const db = getDb();
    if (!db) {
      return res.status(201).json({ goal: { id: 'mock-goal-id', ...newGoal } });
    }

    const docRef = await db.collection('goals').add(newGoal);
    res.status(201).json({ goal: { id: docRef.id, ...newGoal } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save goal' });
  }
});

module.exports = router;

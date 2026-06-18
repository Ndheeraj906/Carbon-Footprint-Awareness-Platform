const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const getDb = () => {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }
  return null;
};

// GET /api/activities
router.get('/', async (req, res) => {
  const db = getDb();
  if (!db) {
    // Mock response
    return res.json({
      activities: [
        { id: '1', type: 'transport', amount: 20, co2: 5.4, date: new Date().toISOString() },
        { id: '2', type: 'diet', amount: 1, co2: 3.2, date: new Date().toISOString() }
      ]
    });
  }

  try {
    const snapshot = await db.collection('activities')
                             .where('userId', '==', req.user.uid)
                             .orderBy('date', 'desc')
                             .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /api/activities
const { z } = require('zod');

const activitySchema = z.object({
  type: z.enum(['transport', 'energy', 'diet']),
  amount: z.number().positive(),
});

router.post('/', async (req, res) => {
  try {
    const validatedData = activitySchema.parse(req.body);
    const { type, amount } = validatedData;

    // Calculate CO2 strictly
    const emissionFactors = { transport: 0.27, energy: 0.45, diet: 3.2 };
    const co2 = Number((amount * (emissionFactors[type] || 0)).toFixed(2));

    const newActivity = {
      userId: req.user ? req.user.uid : 'mock-user',
      type,
      amount,
      co2,
      date: new Date().toISOString()
    };

    const db = getDb();
    if (!db) {
      return res.status(201).json({ activity: { id: 'mock-id', ...newActivity } });
    }

    const docRef = await db.collection('activities').add(newActivity);
    res.status(201).json({ activity: { id: docRef.id, ...newActivity } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save activity' });
  }
});

module.exports = router;

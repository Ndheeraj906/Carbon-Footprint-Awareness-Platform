const request = require('supertest');
const express = require('express');
const goalsRouter = require('./goals');

const app = express();
app.use(express.json());

// Mock auth middleware for tests
app.use((req, res, next) => {
  if (req.headers.authorization === 'Bearer valid-token') {
    req.user = { uid: 'test-user' };
    next();
  } else if (req.headers.authorization === 'Bearer no-user') {
    next(); // simulate no req.user
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.use('/api/goals', goalsRouter);

describe('Goals API', () => {
  it('GET /api/goals should return mock goals when no DB is available', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', 'Bearer valid-token');
      
    expect(res.status).toBe(200);
    expect(res.body.goals).toBeDefined();
    expect(res.body.goals[0].id).toBe('1');
  });

  it('POST /api/goals should fail with 401 if unauthorized', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({ title: 'Test Goal', targetCO2Reduction: 10, deadline: new Date().toISOString() });
      
    expect(res.status).toBe(401);
  });

  it('POST /api/goals should fail validation if targetCO2Reduction is negative', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Goal', targetCO2Reduction: -10, deadline: new Date().toISOString() });
      
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid input');
  });

  it('POST /api/goals should create a mock goal on valid input when DB is mock', async () => {
    const deadline = new Date().toISOString();
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Valid Goal', targetCO2Reduction: 20, deadline });
      
    expect(res.status).toBe(201);
    expect(res.body.goal.title).toBe('Valid Goal');
    expect(res.body.goal.userId).toBe('test-user');
  });

  it('POST /api/goals should fallback to mock-user if req.user is undefined', async () => {
    const deadline = new Date().toISOString();
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', 'Bearer no-user')
      .send({ title: 'Valid Goal', targetCO2Reduction: 20, deadline });
      
    expect(res.status).toBe(201);
    expect(res.body.goal.userId).toBe('mock-user');
  });
});

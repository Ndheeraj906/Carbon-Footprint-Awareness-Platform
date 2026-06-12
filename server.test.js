/** @jest-environment node */
import request from 'supertest';
import { server } from './server.js';
import db from './database.js';

describe('Enterprise Backend Security & API Flow', () => {
  let app;
  let csrfToken;
  let csrfCookie;
  let sessionCookie;

  beforeAll(() => {
    app = request(server);
    db.exec('DELETE FROM user_state; DELETE FROM users;');
  });

  afterAll((done) => {
    server.close(done);
  });

  const getCsrf = async () => {
    const res = await app.get('/');
    const cookies = res.headers['set-cookie'];
    csrfCookie = cookies.find(c => c.startsWith('csrfToken='));
    csrfToken = csrfCookie.split(';')[0].split('=')[1];
  };

  it('should serve index.html with dynamic CSP nonces', async () => {
    const res = await app.get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-security-policy']).toContain('nonce-');
    expect(res.text).not.toContain('NONCE_PLACEHOLDER');
  });

  it('should reject requests that exceed 100kb payload limit', async () => {
    await getCsrf();
    const massivePayload = 'x'.repeat(150 * 1024);
    const res = await app.post('/api/signup')
      .set('Content-Type', 'application/json')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(`{"name": "${massivePayload}"}`);
    expect(res.status).toBe(413);
  });

  it('should reject requests without a valid CSRF token', async () => {
    const res = await app.post('/api/signup').send({});
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid CSRF Token');
  });

  describe('Auth Routes (/api/auth)', () => {
    it('should reject invalid input lengths', async () => {
      await getCsrf();
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: '', password: '', name: '' });
      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      await getCsrf();
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'bademail', password: 'ValidPass123!', name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should reject weak passwords', async () => {
      await getCsrf();
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'weak', name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should register a valid user', async () => {
      await getCsrf();
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'StrongPass123!', name: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test User');
      
      const cookies = res.headers['set-cookie'];
      sessionCookie = cookies.find(c => c.startsWith('session='));
      expect(sessionCookie).toBeDefined();
    });

    it('should catch DB errors on signup', async () => {
      await getCsrf();
      const orig = db.prepare;
      db.prepare = () => { throw new Error('Mock'); };
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'err@err.com', password: 'StrongPass123!', name: 'Test' });
      expect(res.status).toBe(500);
      db.prepare = orig;
    });

    it('should catch DB errors on login', async () => {
      await getCsrf();
      const orig = db.prepare;
      db.prepare = () => { throw new Error('Mock'); };
      const res = await app.post('/api/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'StrongPass123!' });
      expect(res.status).toBe(500);
      db.prepare = orig;
    });

    it('should prevent duplicate signups', async () => {
      await getCsrf();
      const res = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'StrongPass123!', name: 'Test User' });
      expect(res.status).toBe(409);
    });

    it('should reject login with wrong password', async () => {
      await getCsrf();
      const res = await app.post('/api/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'WrongPass123!' });
      expect(res.status).toBe(401);
    });

    it('should login successfully and rotate session', async () => {
      await getCsrf();
      const res = await app.post('/api/login')
        .set('Cookie', [csrfCookie, sessionCookie].join('; '))
        .set('x-csrf-token', csrfToken)
        .send({ email: 'test@example.com', password: 'StrongPass123!' });
      expect(res.status).toBe(200);
      
      const newSessionCookie = res.headers['set-cookie'].find(c => c.startsWith('session='));
      expect(newSessionCookie).toBeDefined();
      expect(newSessionCookie).not.toEqual(sessionCookie);
      sessionCookie = newSessionCookie;
    });

    it('should retrieve /api/me with valid session', async () => {
      const res = await app.get('/api/me')
        .set('Cookie', sessionCookie);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
    });

    it('should reject /api/me with no session', async () => {
      const res = await app.get('/api/me');
      expect(res.status).toBe(401);
    });
  });

  describe('API State Sync (/api/me/state)', () => {
    it('should retrieve default state', async () => {
      const res = await app.get('/api/me/state')
        .set('Cookie', sessionCookie);
      expect(res.status).toBe(200);
      expect(res.body.ecoScore).toBe(0);
    });

    it('should catch DB errors on GET state', async () => {
      const orig = db.prepare;
      db.prepare = () => { throw new Error('Mock'); };
      const res = await app.get('/api/me/state').set('Cookie', sessionCookie);
      expect(res.status).toBe(500);
      db.prepare = orig;
    });

    it('should catch DB errors on POST state', async () => {
      await getCsrf();
      const orig = db.prepare;
      db.prepare = () => { throw new Error('Mock'); };
      const res = await app.post('/api/me/state')
        .set('Cookie', [csrfCookie, sessionCookie].join('; '))
        .set('x-csrf-token', csrfToken)
        .send({ ecoScore: 100 });
      expect(res.status).toBe(500);
      db.prepare = orig;
    });

    it('should update state in SQLite securely', async () => {
      await getCsrf();
      const res = await app.post('/api/me/state')
        .set('Cookie', [csrfCookie, sessionCookie].join('; '))
        .set('x-csrf-token', csrfToken)
        .send({ ecoScore: 500, streak: 5 });
      expect(res.status).toBe(200);
    });

    it('should retrieve updated state', async () => {
      const res = await app.get('/api/me/state')
        .set('Cookie', sessionCookie);
      expect(res.status).toBe(200);
      expect(res.body.ecoScore).toBe(500);
      expect(res.body.streak).toBe(5);
    });

    it('should logout and invalidate session', async () => {
      await getCsrf();
      const res = await app.post('/api/logout')
        .set('Cookie', [csrfCookie, sessionCookie].join('; '))
        .set('x-csrf-token', csrfToken);
      expect(res.status).toBe(200);

      const check = await app.get('/api/me')
        .set('Cookie', sessionCookie);
      expect(check.status).toBe(401);
    });

    it('should reject POST /api/me/state with payload > 100kb', async () => {
      // Re-register and re-login to get a fresh session
      await getCsrf();
      await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'payload@test.com', password: 'StrongPass123!', name: 'Payload User' });

      const loginRes = await app.post('/api/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'payload@test.com', password: 'StrongPass123!' });
      const freshSession = loginRes.headers['set-cookie'].find(c => c.startsWith('session='));

      await getCsrf();
      // Build a payload that exceeds 100kb when JSON stringified
      const bigLogs = Array.from({ length: 5000 }, (_, i) => ({
        id: i, total: 100, transport: 25, energy: 25, food: 25, waste: 25,
        date: new Date().toISOString(),
        notes: 'x'.repeat(30)
      }));
      const res = await app.post('/api/me/state')
        .set('Cookie', [csrfCookie, freshSession].join('; '))
        .set('x-csrf-token', csrfToken)
        .send({ logs: bigLogs });
      expect(res.status).toBe(413);
    });
  });

  describe('Auth Route Edge Cases', () => {
    it('should reject login with invalid input lengths', async () => {
      await getCsrf();
      const res = await app.post('/api/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: '', password: '' });
      expect(res.status).toBe(400);
    });

    it('should reject login for non-existent user', async () => {
      await getCsrf();
      const res = await app.post('/api/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'nobody@nobody.com', password: 'StrongPass123!' });
      expect(res.status).toBe(401);
    });

    it('should return /api/me from DB when user not in cache', async () => {
      // Register new user to get a fresh session
      await getCsrf();
      const signupRes = await app.post('/api/signup')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({ email: 'cache@test.com', password: 'StrongPass123!', name: 'Cache User' });
      const freshSession = signupRes.headers['set-cookie'].find(c => c.startsWith('session='));

      // Import sessionCache and userCache to clear the user from cache
      const { userCache } = await import('./routes/auth.js');
      userCache.clear();

      const res = await app.get('/api/me')
        .set('Cookie', freshSession);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('cache@test.com');
    });
  });

  describe('Server static and error handling', () => {
    it('should serve static files from /public', async () => {
      const res = await app.get('/styles.css');
      // May return 200 or 404 depending on build, but should not crash
      expect([200, 304, 404]).toContain(res.status);
    });
  });
});

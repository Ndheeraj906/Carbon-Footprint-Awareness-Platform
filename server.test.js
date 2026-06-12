import request from 'supertest';
import app from './server.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_PATH = path.join(__dirname, 'users.json');

describe('Server API & Security Tests', () => {
  beforeEach(async () => {
    // Reset database for tests
    await fs.writeFile(USERS_PATH, JSON.stringify([]));
  });

  afterAll(async () => {
    // Clean up
    await fs.writeFile(USERS_PATH, JSON.stringify([]));
  });

  describe('POST /api/signup', () => {
    it('should reject invalid email formats', async () => {
      const res = await request(app).post('/api/signup').send({
        name: 'Test',
        email: 'invalid-email',
        password: 'password123'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid email format');
    });

    it('should reject short passwords', async () => {
      const res = await request(app).post('/api/signup').send({
        name: 'Test',
        email: 'test@example.com',
        password: 'short'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Password must be at least 8 characters');
    });

    it('should register a valid user and set an HttpOnly cookie', async () => {
      const res = await request(app).post('/api/signup').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123!'
      });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test User');
      
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('session=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should prevent duplicate emails', async () => {
      await request(app).post('/api/signup').send({
        name: 'Test 1', email: 'dup@example.com', password: 'SecurePassword123!'
      });
      const res = await request(app).post('/api/signup').send({
        name: 'Test 2', email: 'dup@example.com', password: 'SecurePassword123!'
      });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/signup').send({
        name: 'Test', email: 'login@example.com', password: 'ValidPassword1!'
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@example.com',
        password: 'ValidPassword1!'
      });
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject incorrect credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@example.com',
        password: 'WrongPassword'
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });
});

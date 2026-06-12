import { jest } from '@jest/globals';
import { login, logout, getCurrentUser, signup } from './auth.js';

describe('Frontend Auth API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call /api/login and return data on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com', name: 'Test' })
    });

    const result = await login('test@example.com', 'password');
    expect(global.fetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
      method: 'POST',
      credentials: 'include'
    }));
    expect(result.name).toBe('Test');
  });

  it('should throw error on login failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    await expect(login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('should call /api/logout', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await logout();
    expect(global.fetch).toHaveBeenCalledWith('/api/logout', expect.objectContaining({ method: 'POST' }));
  });

  it('should return user from /api/me if authenticated', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com', name: 'Test' })
    });
    const user = await getCurrentUser();
    expect(user.name).toBe('Test');
  });

  it('should return null from /api/me if not authenticated', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  describe('signup()', () => {
    it('should call /api/signup with full name and return data on success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'new@example.com', name: 'Jane Doe' })
      });

      const result = await signup('Jane', 'Doe', 'new@example.com', 'Pass123!', 'US');
      expect(global.fetch).toHaveBeenCalledWith('/api/signup', expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      }));
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.name).toBe('Jane Doe');
      expect(result.name).toBe('Jane Doe');
    });

    it('should use first name only when last name is empty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'new@example.com', name: 'Jane' })
      });

      await signup('Jane', '', 'new@example.com', 'Pass123!', 'US');
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.name).toBe('Jane');
    });

    it('should throw error on signup failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' })
      });

      await expect(signup('Jane', 'Doe', 'dup@example.com', 'Pass123!', 'US'))
        .rejects.toThrow('Email already exists');
    });
  });
});

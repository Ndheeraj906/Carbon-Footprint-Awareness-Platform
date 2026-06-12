import { jest } from '@jest/globals';
import { login, logout, getCurrentUser } from './auth.js';

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
});

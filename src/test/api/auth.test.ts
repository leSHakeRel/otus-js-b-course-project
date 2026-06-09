import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';
import { authApi } from '@/api/auth.api';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockAuthResponse = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    accessToken: 'token-123',
    expiresIn: 3600,
  };

  describe('login', () => {
    it('calls POST /auth/login and returns auth response', async () => {
      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('calls POST /auth/register and returns auth response', async () => {
      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.register({
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      });
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /auth/profile and returns user data', async () => {
      const userData = {
        id: 'user-1',
        email: 'new@test.com',
        username: 'newuser',
      };
      mockedApi.put.mockResolvedValue({ data: userData });

      const result = await authApi.updateProfile({
        username: 'newuser',
        email: 'new@test.com',
      });

      expect(mockedApi.put).toHaveBeenCalledWith('/auth/profile', {
        username: 'newuser',
        email: 'new@test.com',
      });
      expect(result).toEqual(userData);
    });
  });

  describe('logout', () => {
    it('removes token and user from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));

      authApi.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

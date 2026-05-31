import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    createdAt: '2024-01-01T00:00:00Z',
  };

  describe('getAll', () => {
    it('calls GET /users with pagination', async () => {
      const response = {
        data: [mockUser],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { usersApi } = await import('@/api/users.api');
      const result = await usersApi.getAll(1, 10);

      expect(mockedApi.get).toHaveBeenCalledWith('/users', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(response);
    });

    it('uses default pagination values', async () => {
      const response = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { usersApi } = await import('@/api/users.api');
      await usersApi.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/users', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe('getById', () => {
    it('calls GET /users/:userId', async () => {
      mockedApi.get.mockResolvedValue({ data: mockUser });

      const { usersApi } = await import('@/api/users.api');
      const result = await usersApi.getById('user-1');

      expect(mockedApi.get).toHaveBeenCalledWith('/users/user-1');
      expect(result).toEqual(mockUser);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('commentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComment = {
    id: 'comment-1',
    eveningId: 'evening-1',
    userId: 'user-1',
    username: 'testuser',
    content: 'Great movie!',
    createdAt: '2024-01-10T10:00:00Z',
  };

  describe('getAll', () => {
    it('calls GET /evenings/:id/comments', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockComment] });

      const { commentsApi } = await import('@/api/comments.api');
      const result = await commentsApi.getAll('evening-1');

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/evenings/evening-1/comments'
      );
      expect(result).toEqual([mockComment]);
    });

    it('returns empty array when no comments', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      const { commentsApi } = await import('@/api/comments.api');
      const result = await commentsApi.getAll('evening-1');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls POST /evenings/:id/comments', async () => {
      mockedApi.post.mockResolvedValue({ data: mockComment });

      const { commentsApi } = await import('@/api/comments.api');
      const result = await commentsApi.create('evening-1', {
        content: 'Great movie!',
      });

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/evenings/evening-1/comments',
        {
          content: 'Great movie!',
        }
      );
      expect(result).toEqual(mockComment);
    });
  });
});

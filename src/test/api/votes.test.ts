import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('votesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVote = {
    id: 'vote-1',
    eveningFilmId: 'movie-1',
    userId: 'user-1',
    value: 5 as const,
    createdAt: '2024-01-10T10:00:00Z',
  };

  describe('getAll', () => {
    it('calls GET /evenings/:id/votes', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockVote] });

      const { votesApi } = await import('@/api/votes.api');
      const result = await votesApi.getAll('evening-1');

      expect(mockedApi.get).toHaveBeenCalledWith('/evenings/evening-1/votes');
      expect(result).toEqual([mockVote]);
    });
  });

  describe('create', () => {
    it('calls POST /evenings/:id/votes', async () => {
      mockedApi.post.mockResolvedValue({ data: mockVote });

      const { votesApi } = await import('@/api/votes.api');
      const result = await votesApi.create('evening-1', {
        eveningFilmId: 'movie-1',
        value: 5,
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/evenings/evening-1/votes', {
        eveningFilmId: 'movie-1',
        value: 5,
      });
      expect(result).toEqual(mockVote);
    });
  });

  describe('deleteVote', () => {
    it('calls DELETE /evenings/:id/votes/:voteId', async () => {
      mockedApi.delete.mockResolvedValue({});

      const { votesApi } = await import('@/api/votes.api');
      await votesApi.deleteVote('evening-1', 'vote-1');

      expect(mockedApi.delete).toHaveBeenCalledWith(
        '/evenings/evening-1/votes/vote-1'
      );
    });
  });
});

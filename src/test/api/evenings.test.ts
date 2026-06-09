import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('eveningsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvening = {
    id: 'evening-1',
    title: 'Test Evening',
    description: 'A test evening',
    scheduledAt: '2024-01-15T18:00:00Z',
    isPrivate: false,
    createdBy: {
      id: 'user-1',
      email: 'test@test.com',
      username: 'testuser',
      createdAt: '2024-01-01',
    },
    movies: [],
    votes: [],
    comments: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  };

  const mockMovie = {
    id: 'movie-1',
    tmdbId: 123,
    title: 'Inception',
    posterPath: '/poster.jpg',
    releaseDate: '2010-07-16',
    voteCount: 5,
    totalVotes: 10,
  };

  const mockVote = {
    id: 'vote-1',
    eveningFilmId: 'movie-1',
    userId: 'user-1',
    value: 5 as const,
    createdAt: '2024-01-10T10:00:00Z',
  };

  const mockComment = {
    id: 'comment-1',
    eveningId: 'evening-1',
    userId: 'user-1',
    username: 'testuser',
    content: 'Great movie!',
    createdAt: '2024-01-10T10:00:00Z',
  };

  describe('getAll', () => {
    it('calls GET /evenings with pagination', async () => {
      const response = {
        data: [mockEvening],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.getAll(1, 10);

      expect(mockedApi.get).toHaveBeenCalledWith('/evenings', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(response);
    });

    it('passes filter and createdBy params', async () => {
      const response = {
        data: [mockEvening],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { eveningsApi } = await import('@/api/evenings.api');
      await eveningsApi.getAll(1, 10, { filter: 'my', createdBy: 'user-1' });

      expect(mockedApi.get).toHaveBeenCalledWith('/evenings', {
        params: { page: 1, limit: 10, filter: 'my', createdBy: 'user-1' },
      });
    });
  });

  describe('getById', () => {
    it('calls GET /evenings/:id', async () => {
      mockedApi.get.mockResolvedValue({ data: mockEvening });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.getById('evening-1');

      expect(mockedApi.get).toHaveBeenCalledWith('/evenings/evening-1');
      expect(result).toEqual(mockEvening);
    });
  });

  describe('create', () => {
    it('calls POST /evenings', async () => {
      mockedApi.post.mockResolvedValue({ data: mockEvening });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.create({
        title: 'Test Evening',
        description: 'A test evening',
        scheduledAt: '2024-01-15T18:00:00Z',
        isPrivate: false,
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/evenings', {
        title: 'Test Evening',
        description: 'A test evening',
        scheduledAt: '2024-01-15T18:00:00Z',
        isPrivate: false,
      });
      expect(result).toEqual(mockEvening);
    });
  });

  describe('update', () => {
    it('calls PUT /evenings/:id', async () => {
      mockedApi.put.mockResolvedValue({ data: mockEvening });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.update('evening-1', {
        title: 'Updated Title',
      });

      expect(mockedApi.put).toHaveBeenCalledWith('/evenings/evening-1', {
        title: 'Updated Title',
      });
      expect(result).toEqual(mockEvening);
    });
  });

  describe('delete', () => {
    it('calls DELETE /evenings/:id', async () => {
      mockedApi.delete.mockResolvedValue({});

      const { eveningsApi } = await import('@/api/evenings.api');
      await eveningsApi.delete('evening-1');

      expect(mockedApi.delete).toHaveBeenCalledWith('/evenings/evening-1');
    });
  });

  describe('addMovie', () => {
    it('calls POST /evenings/:id/movies', async () => {
      mockedApi.post.mockResolvedValue({ data: mockMovie });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.addMovie('evening-1', { tmdbId: 123 });

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/evenings/evening-1/movies',
        { tmdbId: 123 }
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('removeMovie', () => {
    it('calls DELETE /evenings/:id/movies/:tmdbId', async () => {
      mockedApi.delete.mockResolvedValue({});

      const { eveningsApi } = await import('@/api/evenings.api');
      await eveningsApi.removeMovie('evening-1', 123);

      expect(mockedApi.delete).toHaveBeenCalledWith(
        '/evenings/evening-1/movies/123'
      );
    });
  });

  describe('getVotes', () => {
    it('calls GET /evenings/:id/votes', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockVote] });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.getVotes('evening-1');

      expect(mockedApi.get).toHaveBeenCalledWith('/evenings/evening-1/votes');
      expect(result).toEqual([mockVote]);
    });
  });

  describe('createVote', () => {
    it('calls POST /evenings/:id/votes', async () => {
      mockedApi.post.mockResolvedValue({ data: mockVote });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.createVote('evening-1', {
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

  describe('getComments', () => {
    it('calls GET /evenings/:id/comments', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockComment] });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.getComments('evening-1');

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/evenings/evening-1/comments'
      );
      expect(result).toEqual([mockComment]);
    });
  });

  describe('createComment', () => {
    it('calls POST /evenings/:id/comments', async () => {
      mockedApi.post.mockResolvedValue({ data: mockComment });

      const { eveningsApi } = await import('@/api/evenings.api');
      const result = await eveningsApi.createComment('evening-1', {
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

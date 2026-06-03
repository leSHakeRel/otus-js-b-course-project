import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axios';

vi.mock('@/api/axios');
const mockedApi = vi.mocked(api);

describe('moviesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMovie = {
    tmdbId: 1,
    title: 'Inception',
    overview: 'A mind-bending thriller',
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    releaseDate: '2010-07-16',
    voteAverage: 8.8,
    voteCount: 10000,
    genreIds: [28, 878],
  };

  describe('search', () => {
    it('calls GET /movies/search with query params', async () => {
      const response = {
        data: [mockMovie],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { moviesApi } = await import('@/api/movies.api');
      const result = await moviesApi.search({ q: 'Inception', page: 1 });

      expect(mockedApi.get).toHaveBeenCalledWith('/movies/search', {
        params: { q: 'Inception', page: 1 },
      });
      expect(result).toEqual(response);
    });

    it('handles empty search results', async () => {
      const response = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { moviesApi } = await import('@/api/movies.api');
      const result = await moviesApi.search({ q: 'NonExistent' });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('calls GET /movies/:tmdbId', async () => {
      mockedApi.get.mockResolvedValue({ data: mockMovie });

      const { moviesApi } = await import('@/api/movies.api');
      const result = await moviesApi.getById(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/movies/1');
      expect(result).toEqual(mockMovie);
    });
  });

  describe('getPopular', () => {
    it('calls GET /movies/popular with pagination', async () => {
      const response = {
        data: [mockMovie],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { moviesApi } = await import('@/api/movies.api');
      const result = await moviesApi.getPopular({ page: 1 });

      expect(mockedApi.get).toHaveBeenCalledWith('/movies/popular', {
        params: { page: 1 },
      });
      expect(result).toEqual(response);
    });

    it('calls GET /movies/popular without params', async () => {
      const response = {
        data: [mockMovie],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const { moviesApi } = await import('@/api/movies.api');
      const result = await moviesApi.getPopular();

      expect(mockedApi.get).toHaveBeenCalledWith('/movies/popular', {
        params: undefined,
      });
      expect(result).toEqual(response);
    });
  });
});

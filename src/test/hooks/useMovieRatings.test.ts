import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMovieRatings } from '@/hooks/useMovieRatings';

const mockFetchImdbRating = vi.hoisted(() => vi.fn());
const mockFetchKinopoiskRating = vi.hoisted(() => vi.fn());

vi.mock('@/api/omdb.api', () => ({
  fetchImdbRating: mockFetchImdbRating,
}));

vi.mock('@/api/kinopoisk.api', () => ({
  fetchKinopoiskRating: mockFetchKinopoiskRating,
}));

describe('useMovieRatings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockFetchImdbRating.mockImplementation(() => new Promise(() => {}));
    mockFetchKinopoiskRating.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useMovieRatings('Inception', '2010'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.imdbRating).toBeNull();
    expect(result.current.kinopoiskRating).toBeNull();
    expect(result.current.kinopoiskNameRu).toBeNull();
  });

  it('returns ratings when both APIs succeed', async () => {
    mockFetchImdbRating.mockResolvedValue(8.8);
    mockFetchKinopoiskRating.mockResolvedValue({
      rating: 8.7,
      nameRu: 'Начало',
    });

    const { result } = renderHook(() => useMovieRatings('Inception', '2010'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.imdbRating).toBe(8.8);
    expect(result.current.kinopoiskRating).toBe(8.7);
    expect(result.current.kinopoiskNameRu).toBe('Начало');
  });

  it('handles null kinopoisk result', async () => {
    mockFetchImdbRating.mockResolvedValue(8.8);
    mockFetchKinopoiskRating.mockResolvedValue(null);

    const { result } = renderHook(() => useMovieRatings('Inception', '2010'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.imdbRating).toBe(8.8);
    expect(result.current.kinopoiskRating).toBeNull();
    expect(result.current.kinopoiskNameRu).toBeNull();
  });

  it('handles null IMDB rating', async () => {
    mockFetchImdbRating.mockResolvedValue(null);
    mockFetchKinopoiskRating.mockResolvedValue({ rating: 7.5, nameRu: 'Test' });

    const { result } = renderHook(() => useMovieRatings('Test Movie'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.imdbRating).toBeNull();
    expect(result.current.kinopoiskRating).toBe(7.5);
    expect(result.current.kinopoiskNameRu).toBe('Test');
  });

  it('re-fetches when title changes', async () => {
    mockFetchImdbRating.mockResolvedValue(8.8);
    mockFetchKinopoiskRating.mockResolvedValue({
      rating: 8.7,
      nameRu: 'Начало',
    });

    const { result, rerender } = renderHook(
      ({ title, year }: { title: string; year?: string }) =>
        useMovieRatings(title, year),
      { initialProps: { title: 'Inception', year: '2010' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFetchImdbRating.mockResolvedValue(9.0);
    mockFetchKinopoiskRating.mockResolvedValue({ rating: 9.1, nameRu: 'Test' });

    rerender({ title: 'The Matrix', year: '1999' });

    await waitFor(() => {
      expect(result.current.imdbRating).toBe(9.0);
    });
  });
});

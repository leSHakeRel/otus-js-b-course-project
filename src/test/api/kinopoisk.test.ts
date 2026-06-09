import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('fetchKinopoiskRating', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns rating and Russian title on success', async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          keyword: 'Inception',
          films: [
            {
              filmId: 447301,
              nameRu: 'Начало',
              nameEn: 'Inception',
              year: '2010',
              rating: '8.7',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          kinopoiskId: 447301,
          nameRu: 'Начало',
          ratingKinopoisk: 8.7,
        },
      });

    vi.stubEnv('VITE_KINOPOISK_API_KEY', 'test-key');

    const { fetchKinopoiskRating } = await import('@/api/kinopoisk.api');
    const result = await fetchKinopoiskRating('Inception', '2010');

    expect(result).not.toBeNull();
    expect(result!.rating).toBe(8.7);
    expect(result!.nameRu).toBe('Начало');
  });

  it('returns null when no films found', async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get.mockResolvedValueOnce({
      data: { keyword: 'UnknownMovie', films: [] },
    });

    vi.stubEnv('VITE_KINOPOISK_API_KEY', 'test-key');

    const { fetchKinopoiskRating } = await import('@/api/kinopoisk.api');
    const result = await fetchKinopoiskRating('UnknownMovie');

    expect(result).toBeNull();
  });

  it('returns null when API key is missing', async () => {
    const { fetchKinopoiskRating } = await import('@/api/kinopoisk.api');
    const result = await fetchKinopoiskRating('Inception');

    expect(result).toBeNull();
  });

  it('caches results and avoids repeated API calls', async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          keyword: 'Inception',
          films: [
            { filmId: 447301, nameRu: 'Начало', year: '2010', rating: '8.7' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          kinopoiskId: 447301,
          nameRu: 'Начало',
          ratingKinopoisk: 8.7,
        },
      });

    vi.stubEnv('VITE_KINOPOISK_API_KEY', 'test-key');

    const { fetchKinopoiskRating } = await import('@/api/kinopoisk.api');
    await fetchKinopoiskRating('Inception', '2010');
    await fetchKinopoiskRating('Inception', '2010');

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});

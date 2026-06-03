import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

let fetchImdbRating: (title: string, year?: string) => Promise<number | null>;

beforeAll(async () => {
  vi.stubEnv('VITE_OMDB_API_KEY', 'test-key');
  const mod = await import('@/api/omdb.api');
  fetchImdbRating = mod.fetchImdbRating;
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('fetchImdbRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns IMDB rating on success', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        Title: 'Inception',
        Year: '2010',
        imdbID: 'tt1375666',
        imdbRating: '8.8',
        imdbVotes: '2,000,000',
        Response: 'True' as const,
      },
    });

    const result = await fetchImdbRating('Inception', '2010');

    expect(result).toBe(8.8);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.omdbapi.com/', {
      params: {
        apikey: 'test-key',
        t: 'Inception',
        type: 'movie',
        y: '2010',
      },
    });
  });

  it('returns null when movie not found', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        Response: 'False' as const,
        Error: 'Movie not found',
      },
    });

    const result = await fetchImdbRating('NonExistentMovie');

    expect(result).toBeNull();
  });

  it('returns null when IMDB rating is N/A', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        Title: 'Test',
        Year: '2020',
        imdbID: 'tt0000000',
        imdbRating: 'N/A',
        imdbVotes: 'N/A',
        Response: 'True' as const,
      },
    });

    const result = await fetchImdbRating('Test');

    expect(result).toBeNull();
  });

  it('handles network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const result = await fetchImdbRating('NetworkErrorTest');

    expect(result).toBeNull();
  });

  it('sanitizes title by removing parentheses content', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        Title: 'The Matrix',
        Year: '1999',
        imdbID: 'tt0133093',
        imdbRating: '8.7',
        imdbVotes: '2,000,000',
        Response: 'True' as const,
      },
    });

    await fetchImdbRating('The Matrix (Original Title)', '1999');

    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.omdbapi.com/', {
      params: expect.objectContaining({
        t: 'The Matrix',
      }),
    });
  });

  it('caches results and returns cached value on second call', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        Title: 'UniqueMovie',
        Year: '2020',
        imdbID: 'tt1111111',
        imdbRating: '7.5',
        imdbVotes: '1,000',
        Response: 'True' as const,
      },
    });

    const result1 = await fetchImdbRating('UniqueMovie', '2020');
    const result2 = await fetchImdbRating('UniqueMovie', '2020');

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(result1).toBe(7.5);
    expect(result2).toBe(7.5);
  });
});

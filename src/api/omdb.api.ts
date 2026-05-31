import axios from 'axios';

interface OmdbMovieResponse {
  Title: string;
  Year: string;
  imdbID: string;
  imdbRating: string;
  imdbVotes: string;
  Response: 'True' | 'False';
  Error?: string;
}

const OMDB_BASE_URL = 'https://www.omdbapi.com';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const ratingCache = new Map<string, number | null>();

function sanitizeTitle(title: string): string {
  // чистота - залог здоровья: надо удалить "(original title)" или "(2024)"
  return title.replace(/\(.*?\)/g, '').trim();
}

/**
 * Fetch IMDB rating for a movie by title and optional year.
 * Uses OMDB API (www.omdbapi.com).
 * Results are cached in-memory to avoid repeated API calls.
 *
 * @returns The IMDB rating as a number, or null if not found / error.
 */
export async function fetchImdbRating(
  title: string,
  year?: string
): Promise<number | null> {
  const cleanTitle = sanitizeTitle(title);
  const cacheKey = `${cleanTitle}|${year ?? 'unknown'}`;

  const cached = ratingCache.get(cacheKey);
  if (cached !== undefined) return cached;

  if (!API_KEY) {
    console.warn('[OMDB] API key not configured (VITE_OMDB_API_KEY)');
    ratingCache.set(cacheKey, null);
    return null;
  }

  try {
    const params: Record<string, string> = {
      apikey: API_KEY,
      t: cleanTitle,
      type: 'movie',
    };
    if (year) params['y'] = year;

    const response = await axios.get<OmdbMovieResponse>(`${OMDB_BASE_URL}/`, {
      params,
    });

    if (
      response.data.Response === 'True' &&
      response.data.imdbRating &&
      response.data.imdbRating !== 'N/A'
    ) {
      const rating = parseFloat(response.data.imdbRating);
      if (!isNaN(rating)) {
        ratingCache.set(cacheKey, rating);
        return rating;
      }
    }

    ratingCache.set(cacheKey, null);
    return null;
  } catch (err) {
    console.warn('[OMDB] Error fetching rating:', err);
    ratingCache.set(cacheKey, null);
    return null;
  }
}

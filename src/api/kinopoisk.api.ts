import axios from 'axios';

/** Base URL for kinopoiskapiunofficial.tech */
const KINOPOISK_BASE_URL = 'https://kinopoiskapiunofficial.tech/api';
const API_KEY = import.meta.env['VITE_KINOPOISK_API_KEY'] as string | undefined;

export interface KinopoiskRatingResult {
  rating: number | null;
  nameRu: string | null;
  description: string | null;
  shortDescription: string | null;
}

interface KinopoiskSearchResult {
  filmId: number;
  nameRu: string | null;
  nameEn: string | null;
  year: string | null;
  rating: string | null;
  posterUrl: string | null;
  posterUrlPreview: string | null;
}

interface KinopoiskSearchResponse {
  keyword: string;
  pagesCount: number;
  searchResultCount: number;
  films: KinopoiskSearchResult[];
}

interface KinopoiskFilmDetail {
  kinopoiskId: number;
  nameRu: string | null;
  nameEn: string | null;
  year: number | null;
  ratingKinopoisk: number | null;
  ratingKinopoiskVoteCount: number | null;
  ratingImdb: number | null;
  description: string | null;
  shortDescription: string | null;
}

const ratingCache = new Map<string, KinopoiskRatingResult | null>();

function sanitizeTitle(title: string): string {
  return title.replace(/\(.*?\)/g, '').trim();
}

function createApiClient() {
  return axios.create({
    baseURL: KINOPOISK_BASE_URL,
    headers: {
      'X-API-KEY': API_KEY ?? '',
      'Content-Type': 'application/json',
    },
  });
}

async function searchFilms(keyword: string): Promise<KinopoiskSearchResult[]> {
  if (!API_KEY) {
    console.warn('[KP] API key not configured');
    return [];
  }

  try {
    const client = createApiClient();
    const response = await client.get<KinopoiskSearchResponse>(
      '/v2.1/films/search-by-keyword',
      { params: { keyword, page: 1 } }
    );
    return response.data.films ?? [];
  } catch (err: unknown) {
    const axiosErr = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    console.warn('[KP] Search error:', axiosErr?.message ?? err);
    if (axiosErr?.response) {
      console.warn('[KP] Status:', axiosErr.response.status);
      console.warn('[KP] Body:', JSON.stringify(axiosErr.response.data));
    }
    return [];
  }
}

async function getFilmDetail(
  filmId: number
): Promise<KinopoiskFilmDetail | null> {
  if (!API_KEY) return null;

  try {
    const client = createApiClient();
    const response = await client.get<KinopoiskFilmDetail>(
      `/v2.2/films/${filmId}`
    );
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    console.warn('[KP] Detail error:', axiosErr?.message ?? err);
    if (axiosErr?.response) {
      console.warn('[KP] Status:', axiosErr.response.status);
      console.warn('[KP] Body:', JSON.stringify(axiosErr.response.data));
    }
    return null;
  }
}

// Public API
/**
 * Получаем рейтинг Kinopoisk и русское название
 * фильма по оригинальному названию и, при необходимости, году.
 * Использует API `kinopoiskapiunofficial.tech`.
 * Результаты кэшируются в памяти, чтобы избежать повторных вызовов API.
 *
 * @returns Объект с рейтингом (0-10) и русским названием, или null, если не найдено/ошибка.
 */
export async function fetchKinopoiskRating(
  title: string,
  year?: string
): Promise<KinopoiskRatingResult | null> {
  const cleanTitle = sanitizeTitle(title);
  const cacheKey = `${cleanTitle}|${year ?? 'unknown'}`;

  const cached = ratingCache.get(cacheKey);
  if (cached !== undefined) return cached;

  if (!API_KEY) {
    console.warn('[KP] API key missing');
    ratingCache.set(cacheKey, null);
    return null;
  }

  const films = await searchFilms(cleanTitle);
  if (films.length === 0) {
    console.warn('[KP] No films found for:', cleanTitle);
    ratingCache.set(cacheKey, null);
    return null;
  }

  let bestMatch: KinopoiskSearchResult | null = null;

  if (year) {
    bestMatch = films.find((f) => f.year === year) ?? null;
  }

  if (!bestMatch) {
    bestMatch = films[0] ?? null;
  }

  if (!bestMatch) {
    ratingCache.set(cacheKey, null);
    return null;
  }

  const detail = await getFilmDetail(bestMatch.filmId);

  let rating: number | null = null;

  if (detail?.ratingKinopoisk != null && detail.ratingKinopoisk > 0) {
    rating = detail.ratingKinopoisk;
  } else if (bestMatch.rating) {
    const parsed = parseFloat(bestMatch.rating);
    if (!isNaN(parsed) && parsed > 0) {
      rating = parsed;
    }
  }

  const result: KinopoiskRatingResult = {
    rating,
    nameRu: bestMatch.nameRu ?? detail?.nameRu ?? null,
    description: detail?.description ?? null,
    shortDescription: detail?.shortDescription ?? null,
  };

  ratingCache.set(cacheKey, result);
  return result;
}

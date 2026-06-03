import { useState, useEffect, useRef } from 'react';
import { fetchImdbRating } from '@/api/omdb.api';
import { fetchKinopoiskRating } from '@/api/kinopoisk.api';

interface MovieRatings {
  imdbRating: number | null;
  kinopoiskRating: number | null;
  kinopoiskNameRu: string | null;
  kinopoiskDescription: string | null;
  kinopoiskShortDescription: string | null;
  isLoading: boolean;
}

/**
 * Хук для загрузки рейтингов IMDB и Кинопоиска по названию фильма.
 * Использует встроенное кэширование API (omdb.api.ts, kinopoisk.api.ts).
 *
 * @param title - название фильма
 * @param year - год выпуска (опционально, для точного поиска)
 *
 * @example
 * ```typescript
 * const { imdbRating, kinopoiskRating, isLoading }
 *   = useMovieRatings('Inception', '2010');
 * ```
 */
export function useMovieRatings(title: string, year?: string): MovieRatings {
  const [imdbRating, setImdbRating] = useState<number | null>(null);
  const [kinopoiskRating, setKinopoiskRating] = useState<number | null>(null);
  const [kinopoiskNameRu, setKinopoiskNameRu] = useState<string | null>(null);
  const [kinopoiskDescription, setKinopoiskDescription] = useState<
    string | null
  >(null);
  const [kinopoiskShortDescription, setKinopoiskShortDescription] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const fetchRatings = async (): Promise<void> => {
      setIsLoading(true);

      const [imdb, kinopoisk] = await Promise.all([
        fetchImdbRating(title, year),
        fetchKinopoiskRating(title, year),
      ]);

      if (cancelledRef.current) return;

      setImdbRating(imdb);
      setKinopoiskRating(kinopoisk?.rating ?? null);
      setKinopoiskNameRu(kinopoisk?.nameRu ?? null);
      setKinopoiskDescription(kinopoisk?.description ?? null);
      setKinopoiskShortDescription(kinopoisk?.shortDescription ?? null);
      setIsLoading(false);
    };

    fetchRatings();

    return () => {
      cancelledRef.current = true;
    };
  }, [title, year]);

  return {
    imdbRating,
    kinopoiskRating,
    kinopoiskNameRu,
    kinopoiskDescription,
    kinopoiskShortDescription,
    isLoading,
  };
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesApi } from '@/api/movies.api';
import { eveningsApi } from '@/api/evenings.api';
import { useMovieRatings } from '@/hooks/useMovieRatings';
import { useUserEvenings } from '@/hooks/useUserEvenings';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import type { Movie } from '@/types';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

export const MovieDetail: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  const { evenings: userEvenings } = useUserEvenings();

  const { execute: handleAddToEvening, isLoading: addingToEvening } =
    useAsyncAction(
      (eveningId: string) => {
        return eveningsApi.addMovie(eveningId, {
          tmdbId: parseInt(tmdbId ?? '0', 10),
        });
      },
      {
        onSuccessMessage: 'Фильм добавлен в киновечер',
        onErrorMessage: 'Не удалось добавить фильм в киновечер',
      }
    );

  const year = movie?.releaseDate
    ? new Date(movie.releaseDate).getFullYear().toString()
    : '';

  const {
    imdbRating,
    kinopoiskRating,
    kinopoiskNameRu,
    isLoading: ratingsLoading,
  } = useMovieRatings(movie?.title ?? '', year);

  useEffect(() => {
    let cancelled = false;

    const fetchMovie = async (): Promise<void> => {
      if (!tmdbId) return;
      try {
        setIsLoading(true);
        setError(null);
        const numericId = parseInt(tmdbId, 10);
        if (isNaN(numericId)) {
          setError('Некорректный ID фильма');
          return;
        }
        const data = await moviesApi.getById(numericId);
        if (!cancelled) {
          setMovie(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Ошибка при загрузке фильма:', err);
          setError('Не удалось загрузить информацию о фильме');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchMovie();
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  const onAddToEvening = (eveningId: string): void => {
    handleAddToEvening(eveningId);
    setShowEveningPicker(false);
  };

  if (isLoading) return <Loading />;

  if (error || !movie) {
    return (
      <Error
        message={error || 'Фильм не найден'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/movies" className="text-primary-500 hover:text-primary-400">
          ← Назад к списку фильмов
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="md:flex">
          {movie.posterPath ? (
            <div className="flex-shrink-0 md:w-1/3">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                alt={movie.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="bg-dark-750 flex h-96 flex-shrink-0 items-center justify-center md:w-1/3">
              <span className="text-lg text-dark-400">Нет изображения</span>
            </div>
          )}
          <div className="flex-1 p-6 md:p-8">
            <h1 className="mb-4 text-3xl font-bold text-dark-100">
              {movie.title}
            </h1>
            {!ratingsLoading &&
              kinopoiskNameRu &&
              kinopoiskNameRu !== movie.title && (
                <h2 className="mb-4 text-xl text-dark-400">
                  {kinopoiskNameRu}
                </h2>
              )}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
              {movie.releaseDate && (
                <span className="text-primary-400">
                  Год выпуска: {new Date(movie.releaseDate).getFullYear()}
                </span>
              )}
              <span className="text-yellow-400">
                ★ TMDB: {movie.voteAverage.toFixed(1)} ({movie.voteCount}{' '}
                голосов)
              </span>
              <span
                className={`${imdbRating !== null && imdbRating !== undefined ? 'text-yellow-400' : 'text-dark-500'}`}
              >
                {imdbRating !== null && imdbRating !== undefined
                  ? `★ IMDB: ${imdbRating.toFixed(1)}`
                  : '★ IMDB: N/A'}
              </span>
              <span
                className={`${kinopoiskRating !== null && kinopoiskRating !== undefined ? 'text-yellow-400' : 'text-dark-500'}`}
              >
                {kinopoiskRating !== null && kinopoiskRating !== undefined
                  ? `★ Кинопоиск: ${kinopoiskRating.toFixed(1)}`
                  : '★ Кинопоиск: N/A'}
              </span>
            </div>

            <p className="mb-6 leading-relaxed text-dark-300">
              {movie.overview}
            </p>

            {isAuthenticated && (
              <div className="relative">
                <Button
                  onClick={() => setShowEveningPicker(!showEveningPicker)}
                  isLoading={addingToEvening}
                >
                  Добавить в киновечер
                </Button>

                {showEveningPicker && (
                  <div className="absolute z-20 mt-2 max-h-48 w-72 overflow-y-auto rounded-lg border border-dark-600 bg-dark-700 shadow-xl">
                    {userEvenings.length === 0 ? (
                      <div className="p-3 text-center text-sm text-dark-400">
                        Нет киновечеров.{' '}
                        <Link to="/evenings/new" className="text-primary-500">
                          Создать
                        </Link>
                      </div>
                    ) : (
                      userEvenings.map((evening) => (
                        <button
                          key={evening.id}
                          className="w-full px-4 py-2 text-left text-sm text-dark-200 transition-colors hover:bg-dark-600"
                          onClick={() => onAddToEvening(evening.id)}
                        >
                          {evening.title}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

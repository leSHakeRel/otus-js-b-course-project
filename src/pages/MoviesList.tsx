import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi } from '@/api/movies.api';
import { eveningsApi } from '@/api/evenings.api';
import type { Movie } from '@/types';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import { useUserEvenings } from '@/hooks/useUserEvenings';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

export const MoviesList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    data: movies,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
  } = usePaginatedFetch<Movie>((page) => moviesApi.getPopular({ page }));
  const { evenings: userEvenings } = useUserEvenings();

  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  const [showEveningPicker, setShowEveningPicker] = useState<number | null>(
    null
  );

  const { execute: addToEvening } = useAsyncAction(
    (tmdbId: number, eveningId: string) =>
      eveningsApi.addMovie(eveningId, { tmdbId }),
    {
      onSuccessMessage: 'Фильм добавлен в киновечер',
      onErrorMessage: 'Не удалось добавить фильм в киновечер',
    }
  );

  const handleAddToEvening = async (
    tmdbId: number,
    eveningId: string
  ): Promise<void> => {
    setAddingMovieId(tmdbId);
    await addToEvening(tmdbId, eveningId);
    setAddingMovieId(null);
    setShowEveningPicker(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark-100">Популярные фильмы</h1>
        <Link to="/evenings/new">
          <Button variant="secondary">Создать киновечер</Button>
        </Link>
      </div>

      {movies.length === 0 ? (
        <Card>
          <p className="text-dark-300">Фильмы не найдены</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <Card key={movie.tmdbId} className="overflow-hidden">
                <div className="flex h-full flex-col">
                  <Link to={`/movies/${movie.tmdbId}`}>
                    {movie.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                        alt={movie.title}
                        className="h-64 w-full object-cover transition-opacity hover:opacity-80"
                      />
                    ) : (
                      <div className="bg-dark-750 flex h-64 w-full items-center justify-center transition-colors hover:bg-dark-700">
                        <span className="text-dark-400">Нет изображения</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-grow flex-col p-4">
                    <Link to={`/movies/${movie.tmdbId}`}>
                      <h3 className="mb-2 text-lg font-semibold text-dark-100 transition-colors hover:text-primary-500">
                        {movie.title}
                      </h3>
                    </Link>
                    <p className="mb-3 line-clamp-3 text-sm text-dark-300">
                      {movie.overview}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm text-primary-400">
                        Год:{' '}
                        {movie.releaseDate &&
                        !isNaN(new Date(movie.releaseDate).getTime())
                          ? new Date(movie.releaseDate).getFullYear()
                          : 'N/A'}
                      </span>
                      <span className="text-sm text-yellow-400">
                        ★{' '}
                        {typeof movie.voteAverage === 'number' &&
                        !isNaN(movie.voteAverage)
                          ? movie.voteAverage.toFixed(1)
                          : 'N/A'}
                      </span>
                    </div>
                    {isAuthenticated && (
                      <div className="relative mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            setShowEveningPicker(
                              showEveningPicker === movie.tmdbId
                                ? null
                                : movie.tmdbId
                            )
                          }
                        >
                          Добавить в киновечер
                        </Button>
                        {showEveningPicker === movie.tmdbId && (
                          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-dark-600 bg-dark-700 shadow-xl">
                            {userEvenings.length === 0 ? (
                              <div className="p-3 text-center text-sm text-dark-400">
                                Нет киновечеров.{' '}
                                <Link
                                  to="/evenings/new"
                                  className="text-primary-500"
                                >
                                  Создать
                                </Link>
                              </div>
                            ) : (
                              userEvenings.map((evening) => (
                                <button
                                  key={evening.id}
                                  className="w-full px-4 py-2 text-left text-sm text-dark-200 transition-colors hover:bg-dark-600 disabled:opacity-50"
                                  disabled={addingMovieId === movie.tmdbId}
                                  onClick={() =>
                                    handleAddToEvening(movie.tmdbId, evening.id)
                                  }
                                >
                                  {addingMovieId === movie.tmdbId
                                    ? 'Добавление...'
                                    : evening.title}
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                variant="secondary"
              >
                ← Предыдущая
              </Button>
              <span className="text-sm text-dark-400">
                Страница {page} из {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                variant="secondary"
              >
                Следующая →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

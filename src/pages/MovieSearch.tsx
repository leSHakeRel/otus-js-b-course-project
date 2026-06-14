import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { moviesApi } from '@/api/movies.api';
import { eveningsApi } from '@/api/evenings.api';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import type { Movie, EveningMovie } from '@/types';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const MovieSearch = () => {
  const { id: eveningId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evening, setEvening] = useState<EveningMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { execute: handleAddMovie } = useAsyncAction(
    (tmdbId: number) => {
      if (!eveningId) return Promise.reject(new Error('No evening ID'));
      return eveningsApi.addMovie(eveningId, { tmdbId });
    },
    { onErrorMessage: 'Не удалось добавить фильм' }
  );

  useEffect(() => {
    if (eveningId) {
      eveningsApi
        .getById(eveningId)
        .then((data) => setEvening(data.movies))
        .catch(() => navigate('/'));
    }
  }, [eveningId, navigate]);

  const handleSearch = async (searchPage = 1): Promise<void> => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await moviesApi.search({
        q: searchQuery,
        page: searchPage,
      });
      setSearchResults(response.data);
      setTotalPages(response.pagination.totalPages);
      setPage(searchPage);
    } catch (err) {
      setError('Не удалось найти фильмы');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number): void => {
    handleSearch(newPage);
  };

  const handleAddMovieClick = async (tmdbId: number): Promise<void> => {
    const result = await handleAddMovie(tmdbId);
    if (result) {
      setSearchResults(searchResults.filter((m) => m.tmdbId !== tmdbId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/evenings/${eveningId}`}
          className="text-primary-500 hover:text-primary-400"
        >
          ← Назад к киновечеру
        </Link>
      </div>

      <Card>
        <h1 className="mb-4 text-2xl font-bold text-dark-100">
          Добавить фильм
        </h1>

        <div className="mb-6 flex space-x-4">
          <Input
            label="Поиск фильмов"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название фильма..."
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={() => handleSearch(1)}
            disabled={!searchQuery.trim() || isLoading}
          >
            {isLoading ? 'Поиск...' : 'Найти'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="space-y-3">
              {searchResults.map((movie) => {
                const isAdded = evening.some((m) => m.tmdbId === movie.tmdbId);

                return (
                  <div
                    key={movie.tmdbId}
                    className="bg-dark-750 flex items-center justify-between rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                          alt={movie.title}
                          className="h-24 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-16 items-center justify-center rounded bg-dark-700">
                          <span className="text-3xl">🎬</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-dark-100">
                          {movie.title}
                        </h3>
                        <p className="text-sm text-dark-500">
                          {movie.releaseDate
                            ? new Date(movie.releaseDate).getFullYear()
                            : 'Год выпуска неизвестен'}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-dark-400">
                          {movie.overview}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddMovieClick(movie.tmdbId)}
                      disabled={isAdded}
                      variant={isAdded ? 'secondary' : 'primary'}
                    >
                      {isAdded ? 'Добавлен' : 'Добавить'}
                    </Button>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-4">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="secondary"
                >
                  ← Предыдущая
                </Button>
                <span className="text-sm text-dark-400">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="secondary"
                >
                  Следующая →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

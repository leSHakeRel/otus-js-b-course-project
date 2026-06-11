import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eveningsApi } from '@/api/evenings.api';
import { commentsApi } from '@/api/comments.api';
import { useMovieRatings } from '@/hooks/useMovieRatings';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useVote } from '@/hooks/useVote';
import { useEveningPolling } from '@/hooks/useEveningPolling';
import type { Evening, EveningMovie } from '@/types';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IsAuthenticated } from '@/components/common/IsAuthenticated';
import { useAuth } from '@/contexts/AuthContext';
import spinnerSvg from '@/assets/icons/spinner.svg?raw';
import heartFilledSvg from '@/assets/icons/heart-filled.svg?raw';
import heartOutlineSvg from '@/assets/icons/heart-outline.svg?raw';

interface MovieRatingsProps {
  title: string;
  year?: string;
  imdbRating: number | null;
  kinopoiskRating: number | null;
  kinopoiskNameRu: string | null;
  isLoading: boolean;
}

const MovieRatings: React.FC<MovieRatingsProps> = ({
  title,
  imdbRating,
  kinopoiskRating,
  kinopoiskNameRu,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <>
        <p className="text-sm text-dark-500">★ IMDB: загрузка...</p>
        <p className="text-sm text-dark-500">★ Кинопоиск: загрузка...</p>
      </>
    );
  }

  return (
    <>
      {kinopoiskNameRu && kinopoiskNameRu !== title && (
        <p className="text-sm italic text-dark-500">{kinopoiskNameRu}</p>
      )}
      <p
        className={`text-sm ${imdbRating !== null && imdbRating !== undefined ? 'text-yellow-400' : 'text-dark-500'}`}
      >
        {imdbRating !== null && imdbRating !== undefined
          ? `★ IMDB: ${imdbRating.toFixed(1)}`
          : '★ IMDB: N/A'}
      </p>
      <p
        className={`text-sm ${kinopoiskRating !== null && kinopoiskRating !== undefined ? 'text-yellow-400' : 'text-dark-500'}`}
      >
        {kinopoiskRating !== null && kinopoiskRating !== undefined
          ? `★ Кинопоиск: ${kinopoiskRating.toFixed(1)}`
          : '★ Кинопоиск: N/A'}
      </p>
    </>
  );
};

type SortField = 'default' | 'releaseYear' | 'voteCount' | 'eveningVotes';

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'По умолчанию', field: 'default' },
  { label: 'Году', field: 'releaseYear' },
  { label: 'Рейтингу TMDB', field: 'voteCount' },
  { label: 'Голосам', field: 'eveningVotes' },
];

interface MovieCardItemProps {
  movie: EveningMovie;
  isOwner: boolean;
  hasVoted: boolean;
  votingMovieId: string | null;
  removingMovieTmdbId: number | null;
  eveningVotesCount: number;
  onToggleVote: (eveningFilmId: string, userId: string) => void;
  onRemoveMovie: (tmdbId: number, title: string) => void;
  currentUserId: string | undefined;
}

const MovieCardItem: React.FC<MovieCardItemProps> = ({
  movie,
  isOwner,
  hasVoted,
  votingMovieId,
  removingMovieTmdbId,
  eveningVotesCount,
  onToggleVote,
  onRemoveMovie,
  currentUserId,
}) => {
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear().toString()
    : undefined;

  const {
    imdbRating,
    kinopoiskRating,
    kinopoiskNameRu,
    kinopoiskDescription,
    isLoading: ratingsLoading,
  } = useMovieRatings(movie.title, releaseYear || '');

  return (
    <div className="bg-dark-750 flex items-center justify-between rounded-lg p-4">
      <div className="flex w-full min-w-0 items-center space-x-4">
        {movie.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
            alt={movie.title}
            className="h-16 w-12 flex-shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-dark-700">
            <span className="text-2xl">🎬</span>
          </div>
        )}
        <div className="w-full">
          <div className="group relative">
            <h3 className="max-w-[200px] cursor-help truncate font-medium text-dark-100 sm:max-w-[300px]">
              {movie.title}
            </h3>
            {kinopoiskDescription && !ratingsLoading && (
              <div className="pointer-events-none absolute left-0 z-20 mb-2 hidden group-hover:block">
                <div className="min-w-xs max-w-full rounded-lg border border-dark-600 bg-dark-700 p-3 text-sm text-dark-100 shadow-xl">
                  <p className="leading-relaxed">{kinopoiskDescription}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-dark-500">
            {movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : 'Год выпуска неизвестен'}
          </p>
          <MovieRatings
            title={movie.title}
            year={releaseYear || ''}
            imdbRating={imdbRating}
            kinopoiskRating={kinopoiskRating}
            kinopoiskNameRu={kinopoiskNameRu}
            isLoading={ratingsLoading}
          />
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center space-x-4">
        <IsAuthenticated
          fallback={
            <div className="text-right">
              <p className="text-sm text-dark-400">Голосов</p>
              <p className="text-lg font-semibold text-primary-500">
                {eveningVotesCount}
              </p>
            </div>
          }
        >
          <button
            onClick={() => onToggleVote(movie.id, currentUserId!)}
            disabled={votingMovieId === movie.id}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-lg transition-colors duration-200 hover:bg-dark-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={hasVoted ? 'Убрать голос' : 'Проголосовать за фильм'}
          >
            {votingMovieId === movie.id ? (
              <span
                className="flex h-6 w-6 animate-spin text-primary-500"
                dangerouslySetInnerHTML={{ __html: spinnerSvg }}
              />
            ) : hasVoted ? (
              <span
                className="flex h-6 w-6 text-red-500 transition-colors hover:text-red-400"
                dangerouslySetInnerHTML={{ __html: heartFilledSvg }}
              />
            ) : (
              <span
                className="flex h-6 w-6 text-primary-500 transition-colors hover:text-primary-400"
                dangerouslySetInnerHTML={{ __html: heartOutlineSvg }}
              />
            )}
            <span
              className={`mt-0.5 text-sm font-semibold ${hasVoted ? 'text-red-500' : 'text-primary-500'}`}
            >
              {eveningVotesCount}
            </span>
          </button>
        </IsAuthenticated>
        {isOwner && (
          <Button
            variant="danger"
            size="sm"
            isLoading={removingMovieTmdbId === movie.tmdbId}
            onClick={() => onRemoveMovie(movie.tmdbId, movie.title)}
          >
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
};

export const EveningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [evening, setEvening] = useState<Evening | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingMovieTmdbId, setRemovingMovieTmdbId] = useState<number | null>(
    null
  );
  const [newComment, setNewComment] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [sortField, setSortField] = useState<SortField>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { execute: handleDelete, isLoading: isDeleting } = useAsyncAction(
    async () => {
      if (id) {
        await eveningsApi.delete(id);
        navigate('/');
      }
    },
    { onErrorMessage: 'Не удалось удалить киновечер' }
  );

  const {
    execute: handleUpdate,
    isLoading: isUpdating,
    error: updateError,
  } = useAsyncAction(
    async () => {
      if (!id) return;
      await eveningsApi.update(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setEvening((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: editTitle.trim(),
          description: editDescription.trim(),
        };
      });
      setIsEditing(false);
    },
    { onErrorMessage: 'Не удалось обновить киновечер' }
  );

  const { execute: handleAddComment, isLoading: isSendingComment } =
    useAsyncAction(
      async () => {
        if (!id || !newComment.trim()) return;
        await commentsApi.create(id, { content: newComment.trim() });
        const updated = await eveningsApi.getById(id);
        setEvening(updated);
        setNewComment('');
      },
      { onErrorMessage: 'Не удалось отправить комментарий' }
    );

  const { toggleVote, votingMovieId } = useVote(id, evening, setEvening);

  // Polling: периодически перезапрашиваем данные киновечера,
  // чтобы видеть голоса и комментарии других пользователей
  // Можно было бы и web-socket'ом реализовать, но уже некогда
  // было узнавать что может, а что не может предоставить хост
  // для бэкенда
  useEveningPolling({
    eveningId: id,
    interval: 8000,
    enabled: !isLoading,
    onUpdate: (data) => {
      setEvening(data);
      setError(null);
    },
    onError: (msg) => {
      if (!error) return;
      setError(msg);
    },
  });

  useEffect(() => {
    const fetchEvening = async (): Promise<void> => {
      if (!id) return;
      try {
        const data = await eveningsApi.getById(id);
        setEvening(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить киновечер');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvening();
  }, [id]);

  const handleRemoveMovie = async (
    movieTmdbId: number,
    movieTitle: string
  ): Promise<void> => {
    if (!window.confirm(`Удалить фильм «${movieTitle}» из киновечера?`)) {
      return;
    }

    if (!id) return;
    setRemovingMovieTmdbId(movieTmdbId);
    try {
      await eveningsApi.removeMovie(id, movieTmdbId);
      setEvening((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          movies: prev.movies.filter((m) => m.tmdbId !== movieTmdbId),
        };
      });
      setError(null);
    } catch (err) {
      setError('Не удалось удалить фильм из киновечера');
    } finally {
      setRemovingMovieTmdbId(null);
    }
  };

  const startEditing = (): void => {
    if (!evening) return;
    setEditTitle(evening.title);
    setEditDescription(evening.description);
    setIsEditing(true);
  };

  const cancelEditing = (): void => {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEditing = async (): Promise<void> => {
    if (!editTitle.trim() || editTitle.trim().length < 3) return;
    await handleUpdate();
  };

  const handleDeleteClick = (): void => {
    if (!window.confirm('Вы уверены, что хотите удалить этот киновечер?')) {
      return;
    }
    handleDelete();
  };

  const handleSortFieldChange = (field: SortField): void => {
    setSortField(field);
  };

  const handleToggleSortOrder = (): void => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const countEveningVotes = useCallback(
    (movieId: string): number => {
      if (!evening) return 0;
      return evening.votes.filter((v) => v.eveningFilmId === movieId).length;
    },
    [evening]
  );

  const sortedMovies = useMemo(() => {
    if (!evening) return [];
    if (sortField === 'default') return evening.movies;

    return [...evening.movies].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'releaseYear': {
          const yearA = a.releaseDate
            ? new Date(a.releaseDate).getFullYear()
            : 0;
          const yearB = b.releaseDate
            ? new Date(b.releaseDate).getFullYear()
            : 0;
          comparison = yearA - yearB;
          break;
        }
        case 'voteCount':
          comparison = a.voteCount - b.voteCount;
          break;
        case 'eveningVotes': {
          const votesA = countEveningVotes(a.id);
          const votesB = countEveningVotes(b.id);
          comparison = votesA - votesB;
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [evening, sortField, sortOrder, countEveningVotes]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !evening) {
    return (
      <Error
        message={error || 'Киновечер не найден'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/" className="text-primary-500 hover:text-primary-400">
          ← Назад к списку
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex items-start justify-between">
          {isEditing ? (
            <div className="w-full space-y-4">
              <Input
                label="Название *"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Название киновечера"
                disabled={isUpdating}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-300">
                  Описание
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Описание киновечера..."
                  rows={3}
                  disabled={isUpdating}
                  className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2 text-dark-100 placeholder-dark-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                  disabled={!editTitle.trim() || editTitle.trim().length < 3}
                  onClick={saveEditing}
                >
                  Сохранить
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={cancelEditing}
                >
                  Отмена
                </Button>
              </div>
              {updateError && (
                <p className="text-sm text-red-500">{updateError}</p>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-dark-100">
                {evening.title}
              </h1>
              <div className="flex items-center space-x-3">
                <IsAuthenticated>
                  {user?.id === evening.createdBy.id && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={startEditing}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={isDeleting}
                        onClick={handleDeleteClick}
                      >
                        Удалить
                      </Button>
                    </>
                  )}
                </IsAuthenticated>
                {evening.isPrivate && (
                  <span className="rounded bg-dark-700 px-3 py-1 text-sm">
                    Приватный
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <p className="mb-4 text-dark-300">{evening.description}</p>
        )}

        <div className="mb-6 flex items-center text-sm text-dark-500">
          <span>
            {new Date(evening.scheduledAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="mx-2">•</span>
          <span>Автор: {evening.createdBy.username}</span>
        </div>

        <div className="border-t border-dark-700 pt-6">
          <h2 className="mb-4 text-xl font-semibold text-dark-100">Фильмы</h2>

          {evening.movies.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-dark-400">
                Сортировать по:
              </span>
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.field}
                  variant={sortField === option.field ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSortFieldChange(option.field)}
                >
                  {option.label}
                </Button>
              ))}
              <button
                onClick={handleToggleSortOrder}
                className="rounded-lg bg-dark-700 p-2 text-dark-100 transition-colors duration-200 hover:bg-dark-600"
                title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}

          {evening.movies.length === 0 ? (
            <p className="mb-4 text-dark-400">
              В этом киновечере пока нет фильмов
            </p>
          ) : (
            <div className="mb-6 space-y-3">
              {sortedMovies.map((movie) => {
                const isOwner =
                  isAuthenticated && user?.id === evening.createdBy.id;
                const hasVoted = user
                  ? evening.votes.some(
                      (v) =>
                        v.eveningFilmId === movie.id && v.userId === user.id
                    )
                  : false;

                return (
                  <MovieCardItem
                    key={movie.id}
                    movie={movie}
                    isOwner={isOwner}
                    hasVoted={hasVoted}
                    votingMovieId={votingMovieId}
                    removingMovieTmdbId={removingMovieTmdbId}
                    eveningVotesCount={countEveningVotes(movie.id)}
                    onToggleVote={toggleVote}
                    onRemoveMovie={handleRemoveMovie}
                    currentUserId={user?.id}
                  />
                );
              })}
            </div>
          )}

          <IsAuthenticated>
            <Link to={`/evenings/${id}/movies`}>
              <Button variant="secondary">Добавить фильм</Button>
            </Link>
          </IsAuthenticated>
        </div>

        <div className="mt-6 border-t border-dark-700 pt-6">
          <h2 className="mb-4 text-xl font-semibold text-dark-100">
            Комментарии
          </h2>

          {evening.comments.length === 0 ? (
            <p className="text-dark-400">Пока нет комментариев</p>
          ) : (
            <div className="mb-4 space-y-3">
              {evening.comments.map((comment) => (
                <div key={comment.id} className="bg-dark-750 rounded-lg p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-dark-100">
                      {comment.username}
                    </span>
                    <span className="text-sm text-dark-500">
                      {new Date(comment.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-dark-300">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          <IsAuthenticated>
            <div className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className="w-full resize-none rounded-lg border border-dark-700 bg-dark-800 px-4 py-2 text-dark-100 placeholder-dark-500 transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                disabled={isSendingComment}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSendingComment}
                  disabled={!newComment.trim()}
                  onClick={() => handleAddComment()}
                >
                  Отправить
                </Button>
              </div>
            </div>
          </IsAuthenticated>
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eveningsApi } from '@/api/evenings.api';
import type { Evening } from '@/types';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

type FilterTab = 'all' | 'public' | 'my';

export const EveningsList: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>(() => {
    return isAuthenticated ? 'all' : 'public';
  });

  const fetchEvenings = useCallback(
    (page: number) => {
      const apiFilter =
        filterTab === 'my'
          ? 'my'
          : filterTab === 'public'
            ? 'public'
            : undefined;
      return eveningsApi.getAll(
        page,
        10,
        apiFilter ? { filter: apiFilter } : undefined
      );
    },
    [filterTab]
  );

  const {
    data: evenings,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
  } = usePaginatedFetch<Evening>(fetchEvenings, [filterTab]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'public', label: 'Публичные' },
    ...(isAuthenticated ? [{ key: 'my' as const, label: 'Мои' }] : []),
  ];

  const handleDelete = async (
    e: React.MouseEvent,
    eveningId: string
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Вы уверены, что хотите удалить этот киновечер?')) {
      return;
    }

    setDeletingId(eveningId);
    try {
      await eveningsApi.delete(eveningId);
      setDeletingId(null);
    } catch (err) {
      setDeletingId(null);
    }
  };

  const handleTabChange = (tab: FilterTab): void => {
    setFilterTab(tab);
    setPage(1);
  };

  if (authLoading || isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark-100">Киновечера</h1>
        {isAuthenticated && (
          <Link to="/evenings/new">
            <Button variant="secondary">Создать киновечер</Button>
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              filterTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {evenings.length === 0 ? (
        <div className="py-12 text-center">
          {isAuthenticated ? (
            <>
              <p className="mb-4 text-dark-400">
                {filterTab === 'my'
                  ? 'У вас пока нет киновечеров'
                  : 'Пока нет публичных киновечеров'}
              </p>
              {filterTab === 'my' && (
                <Link
                  to="/evenings/new"
                  className="text-primary-500 hover:text-primary-400"
                >
                  Создать первый киновечер
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-400"
            >
              Войдите, чтобы создать первый киновечер
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {evenings.map((evening) => {
              try {
                const scheduledDate = new Date(evening.scheduledAt);
                const formattedDate = scheduledDate.toLocaleDateString(
                  'ru-RU',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                );

                const isAuthor = user?.id === evening.createdBy.id;

                return (
                  <div key={evening.id} className="relative">
                    <Link to={`/evenings/${evening.id}`}>
                      <Card className="h-full transition-shadow duration-200 hover:shadow-xl">
                        <h2 className="mb-2 text-xl font-semibold text-dark-100">
                          {evening.title}
                        </h2>
                        <p className="mb-4 line-clamp-2 text-sm text-dark-400">
                          {evening.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-dark-500">
                          <span>{formattedDate}</span>
                          <div className="flex items-center space-x-2">
                            {evening.isPrivate && (
                              <span className="rounded bg-dark-700 px-2 py-1 text-xs">
                                Приватный
                              </span>
                            )}
                          </div>
                        </div>
                        {!isAuthor && (
                          <div className="mt-2 text-xs text-dark-500">
                            Автор: {evening.createdBy.username}
                          </div>
                        )}
                      </Card>
                    </Link>
                    {isAuthenticated && isAuthor && (
                      <div className="absolute right-2 top-2 z-10">
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={deletingId === evening.id}
                          onClick={(e) => handleDelete(e, evening.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    )}
                  </div>
                );
              } catch (err) {
                console.error(
                  `Ошибка при рендеринге киновечера ${evening.id}:`,
                  err
                );
                return null;
              }
            })}
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

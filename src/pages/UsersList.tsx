import { Link } from 'react-router-dom';
import { usersApi } from '@/api/users.api';
import type { User } from '@/types';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';
import { Button } from '@/components/common/Button';

export const UsersList = () => {
  const {
    data: users,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
  } = usePaginatedFetch<User>((page) => usersApi.getAll(page, 12));

  if (isLoading) return <Loading />;

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-dark-100">Пользователи</h1>

      {users.length === 0 ? (
        <Card>
          <p className="text-dark-300">Пользователи не найдены</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Link key={user.id} to={`/users/${user.id}`}>
                <Card className="h-full transition-shadow duration-200 hover:shadow-xl">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-dark-100">
                        {user.username}
                      </h2>
                      <p className="text-sm text-dark-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-dark-500">
                    Зарегистрирован:{' '}
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </Card>
              </Link>
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

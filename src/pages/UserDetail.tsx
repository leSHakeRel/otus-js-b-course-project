import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '@/api/users.api';
import { eveningsApi } from '@/api/evenings.api';
import type { User, Evening } from '@/types';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Error } from '@/components/common/Error';

export const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [evenings, setEvenings] = useState<Evening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const [userData, eveningsData] = await Promise.all([
          usersApi.getById(userId),
          eveningsApi.getAll(1, 50, { filter: 'public', createdBy: userId }),
        ]);

        setUser(userData);
        setEvenings(eveningsData.data);
      } catch (err) {
        console.error('Ошибка при загрузке пользователя:', err);
        setError('Не удалось загрузить информацию о пользователе');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) return <Loading />;

  if (error || !user) {
    return (
      <Error
        message={error || 'Пользователь не найден'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/users" className="text-primary-500 hover:text-primary-400">
          ← Назад к списку пользователей
        </Link>
      </div>

      <Card className="mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-3xl font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-dark-100">
              {user.username}
            </h1>
            <p className="mt-1 text-dark-400">{user.email}</p>
            <p className="mt-1 text-sm text-dark-500">
              Зарегистрирован:{' '}
              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </Card>

      <h2 className="mb-4 text-2xl font-bold text-dark-100">
        Публичные киновечера
      </h2>

      {evenings.length === 0 ? (
        <p className="text-dark-400">
          У пользователя пока нет публичных киновечеров
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {evenings.map((evening) => {
            const scheduledDate = new Date(evening.scheduledAt);
            const formattedDate = scheduledDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <Link key={evening.id} to={`/evenings/${evening.id}`}>
                <Card className="h-full transition-shadow duration-200 hover:shadow-xl">
                  <h3 className="mb-2 text-xl font-semibold text-dark-100">
                    {evening.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-dark-400">
                    {evening.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-dark-500">
                    <span>{formattedDate}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

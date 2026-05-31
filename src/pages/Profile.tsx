import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const {
    execute: handleUpdate,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  } = useAsyncAction(
    () => updateProfile({ username: username.trim(), email: email.trim() }),
    {
      onSuccessMessage: 'Профиль успешно обновлён',
      onErrorMessage: 'Не удалось обновить профиль',
    }
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    clearError();
    clearSuccess();

    if (!username.trim()) {
      return;
    }

    if (username.trim().length < 3) {
      return;
    }

    handleUpdate();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-dark-100">
        Редактирование профиля
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500 bg-red-900/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500 bg-green-900/50 p-3">
              <p className="text-sm text-green-400">✓ {success}</p>
            </div>
          )}

          <Input
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ваше имя"
            disabled={isLoading}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" disabled={!username.trim() || isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

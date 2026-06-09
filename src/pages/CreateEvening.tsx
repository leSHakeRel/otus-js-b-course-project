import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eveningsApi } from '@/api/evenings.api';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

function isValidUuid(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) && value !== ZERO_UUID;
}

export const CreateEvening: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const {
    execute: createEvening,
    isLoading,
    error,
  } = useAsyncAction(
    () =>
      eveningsApi.create({
        title: title.trim(),
        description: description.trim(),
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : new Date().toISOString(),
        isPrivate,
      }),
    { onErrorMessage: 'Не удалось создать киновечер' }
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (title.trim().length < 3) {
      return;
    }

    const evening = await createEvening();

    if (evening?.id && isValidUuid(evening.id)) {
      navigate(`/evenings/${evening.id}/movies`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-dark-100">
        Создать киновечер
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500 bg-red-900/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Input
            label="Название *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Вечер комедий"
            disabled={isLoading}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-300">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание киновечера..."
              rows={3}
              disabled={isLoading}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2 text-dark-100 placeholder-dark-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Input
            label="Дата и время"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={isLoading}
          />

          <label className="flex cursor-pointer items-center space-x-3">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-dark-300">Приватный киновечер</span>
          </label>

          <div className="flex space-x-4">
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading ? 'Создание...' : 'Создать'}
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

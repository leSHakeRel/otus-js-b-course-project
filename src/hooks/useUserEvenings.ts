import { useState, useEffect } from 'react';
import { eveningsApi } from '@/api/evenings.api';
import type { Evening } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseUserEveningsResult {
  evenings: Evening[];
  isLoading: boolean;
}

/**
 * Хук для загрузки киновечеров текущего пользователя.
 * Автоматически подгружается при isAuthenticated === true.
 * Используется в компонентах для добавления фильмов в киновечер.
 *
 * @example
 * ```typescript
 * const { evenings: userEvenings } = useUserEvenings();
 * ```
 */
export function useUserEvenings(): UseUserEveningsResult {
  const { isAuthenticated } = useAuth();
  const [evenings, setEvenings] = useState<Evening[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setEvenings([]);
      return;
    }

    setIsLoading(true);
    eveningsApi
      .getAll(1, 50, { filter: 'my' })
      .then((res) => {
        setEvenings(res.data);
      })
      .catch(() => {
        // Игнорируем ошибку — список вечеров не критичен
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  return { evenings, isLoading };
}

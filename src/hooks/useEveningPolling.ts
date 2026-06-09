import { useState, useCallback } from 'react';
import { eveningsApi } from '@/api/evenings.api';
import { usePolling } from '@/hooks/usePolling';
import type { Evening } from '@/types';

interface UseEveningPollingOptions {
  /** ID киновечера для опроса */
  eveningId: string | undefined;
  /** Интервал опроса в мс (по умолчанию 8000 — 8 секунд) */
  interval?: number;
  /** Флаг активности — при false опрос приостанавливается */
  enabled?: boolean;
  /** Колбэк при успешном обновлении данных */
  onUpdate: (evening: Evening) => void;
  /** Колбэк при ошибке */
  onError?: (error: string) => void;
}

/**
 * Хук для автоматического опроса данных киновечера.
 *
 * Периодически перезапрашивает данные с сервера и вызывает
 * `onUpdate` с актуальными данными. Это позволяет всем
 * пользователям на странице киновечера видеть голоса,
 * комментарии и другие изменения других пользователей
 * без ручного обновления страницы.
 *
 * @example
 * ```typescript
 * useEveningPolling({
 *   eveningId: id,
 *   interval: 8000,
 *   enabled: !error,
 *   onUpdate: (data) => setEvening(data),
 *   onError: (msg) => setError(msg),
 * });
 * ```
 */
export function useEveningPolling({
  eveningId,
  interval = 8000,
  enabled = true,
  onUpdate,
  onError,
}: UseEveningPollingOptions): void {
  const [prevId, setPrevId] = useState<string | undefined>(eveningId);

  if (eveningId !== prevId) {
    setPrevId(eveningId);
  }

  const handleTick = useCallback(async () => {
    if (!eveningId) return;

    try {
      const data = await eveningsApi.getById(eveningId);
      onUpdate(data);
    } catch {
      onError?.('Не удалось обновить данные киновечера');
    }
  }, [eveningId, onUpdate, onError]);

  usePolling({
    interval,
    enabled: enabled && !!eveningId,
    onTick: handleTick,
  });
}

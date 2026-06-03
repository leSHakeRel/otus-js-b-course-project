import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  /** Интервал между опросами в миллисекундах (по умолчанию 5000) */
  interval?: number;
  /** Флаг активности — при false опрос приостанавливается */
  enabled?: boolean;
  /** Функция, вызываемая при каждом тике интервала */
  onTick: () => void | Promise<void>;
}

/**
 * Хук для периодического опроса (polling) с поддержкой
 * паузы при скрытии вкладки (Page Visibility API).
 *
 * - Автоматически приостанавливается, когда вкладка неактивна
 * - Возобновляется при возвращении на вкладку
 * - Выполняет немедленный tick при старте
 *
 * @example
 * ```typescript
 * usePolling({
 *   interval: 5000,
 *   enabled: !isLoading,
 *   onTick: fetchData,
 * });
 * ```
 */
export function usePolling({
  interval = 5000,
  enabled = true,
  onTick,
}: UsePollingOptions): void {
  const onTickRef = useRef(onTick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const clearPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    clearPolling();
    try {
      onTickRef.current();
    } catch (err) {
      console.error('что-то пошло не так с поллингом', err);
    }
    intervalRef.current = setInterval(() => {
      try {
        onTickRef.current();
      } catch (err) {
        console.error('что-то пошло не так с поллингом', err);
      }
    }, interval);
  }, [clearPolling, interval]);

  useEffect(() => {
    if (!enabled) {
      clearPolling();
      return;
    }

    startPolling();

    // Page Visibility API: пауза при скрытии вкладки
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPolling();
      } else {
        startPolling();
      }
    };

    // Пауза при потере фокуса окна
    const handleBlur = () => clearPolling();
    const handleFocus = () => startPolling();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [interval, enabled, startPolling, clearPolling]);
}

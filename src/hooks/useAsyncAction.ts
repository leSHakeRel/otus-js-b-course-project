import { useState, useCallback } from 'react';

interface UseAsyncActionState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface UseAsyncActionOptions {
  onSuccessMessage?: string;
  onErrorMessage?: string;
}

interface UseAsyncActionResult<TArgs extends unknown[], TReturn> {
  execute: (...args: TArgs) => Promise<TReturn | undefined>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  reset: () => void;
}

/**
 * Хук для выполнения асинхронных действий с автоматическим управлением
 * состояниями isLoading, error, success.
 *
 * @example
 * ```typescript
 * const { execute: handleSubmit, isLoading, error } = useAsyncAction(
 *   (data: CreateEveningRequest) => eveningsApi.create(data),
 *   { onSuccessMessage: 'Киновечер создан' }
 * );
 * ```
 */
export function useAsyncAction<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => Promise<TReturn>,
  options?: UseAsyncActionOptions
): UseAsyncActionResult<TArgs, TReturn> {
  const [state, setState] = useState<UseAsyncActionState>({
    isLoading: false,
    error: null,
    success: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, success: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: null });
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | undefined> => {
      setState({ isLoading: true, error: null, success: null });

      try {
        const result = await action(...args);
        setState({
          isLoading: false,
          error: null,
          success: options?.onSuccessMessage ?? null,
        });
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Произошла ошибка';
        setState({
          isLoading: false,
          error: options?.onErrorMessage ?? message,
          success: null,
        });
        return undefined;
      }
    },
    [action, options?.onSuccessMessage, options?.onErrorMessage]
  );

  return {
    execute,
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    clearError,
    clearSuccess,
    reset,
  };
}

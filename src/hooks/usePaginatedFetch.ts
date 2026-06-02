import { useState, useEffect, useCallback, useRef } from 'react';

interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    totalPages: number;
  };
}

interface UsePaginatedFetchResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (pageOrUpdater: number | ((prev: number) => number)) => void;
  refetch: () => void;
}

/**
 * Хук для загрузки данных с пагинацией.
 * Автоматически отменяет запросы при размонтировании компонента (cancelled flag).
 *
 * @example
 * ```typescript
 * const { data: evenings, isLoading, page, totalPages, setPage }
 *   = usePaginatedFetch((page) => eveningsApi.getAll(page, 10));
 * ```
 */
export function usePaginatedFetch<T>(
  fetcher: (page: number) => Promise<PaginatedResponse<T>>,
  deps: unknown[] = []
): UsePaginatedFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetcherRef.current(page);

        if (cancelled) return;
        setData(response.data);
        setTotalPages(response.pagination?.totalPages ?? 1);
      } catch (err) {
        if (cancelled) return;
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [page, refreshKey, depsKey]);

  return {
    data,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    refetch,
  };
}

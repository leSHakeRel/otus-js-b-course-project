import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';

describe('usePaginatedFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultResponse = {
    data: [{ id: 1, name: 'Item 1' }],
    pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
  };

  it('returns initial state and fetches data', async () => {
    const mockFetcher = vi.fn().mockResolvedValue(defaultResponse);

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(defaultResponse.data);
    expect(result.current.totalPages).toBe(3);
    expect(mockFetcher).toHaveBeenCalledWith(1);
  });

  it('handles empty data', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.totalPages).toBe(0);
  });

  it('handles error state', async () => {
    const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Не удалось загрузить данные');
    expect(result.current.data).toEqual([]);
  });

  it('changes page and fetches new data', async () => {
    const mockFetcher = vi.fn().mockResolvedValue(defaultResponse);

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFetcher.mockResolvedValue({
      data: [{ id: 2, name: 'Item 2' }],
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 2, name: 'Item 2' }]);
    });

    expect(mockFetcher).toHaveBeenCalledWith(2);
  });

  it('handles pagination without pagination field', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
    });

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalPages).toBe(1);
  });

  it('refetches data when refetch is called', async () => {
    const mockFetcher = vi.fn().mockResolvedValue(defaultResponse);

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newData = {
      data: [{ id: 3, name: 'Refetched Item' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    mockFetcher.mockResolvedValue(newData);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(newData.data);
    });
  });

  it('uses functional setPage updater', async () => {
    const mockFetcher = vi.fn().mockResolvedValue(defaultResponse);

    const { result } = renderHook(() => usePaginatedFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage((prev: number) => prev + 1);
    });

    expect(result.current.page).toBe(2);
  });

  it('cancels fetch on unmount', async () => {
    const mockFetcher = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(defaultResponse), 1000)
          )
      );

    const { result, unmount } = renderHook(() =>
      usePaginatedFetch(mockFetcher)
    );

    unmount();

    await new Promise((r) => setTimeout(r, 1100));

    expect(result.current.data).toEqual([]);
  });
});

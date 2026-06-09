import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEveningPolling } from '@/hooks/useEveningPolling';

const mockEveningsApi = vi.hoisted(() => ({
  getById: vi.fn(),
}));

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
}));

const mockUsePolling = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePolling', () => ({
  usePolling: mockUsePolling,
}));

describe('useEveningPolling', () => {
  const mockEvening = {
    id: 'evening-1',
    title: 'Test Evening',
    description: '',
    scheduledAt: '2024-01-15T18:00:00Z',
    isPrivate: false,
    createdBy: {
      id: 'user-1',
      email: 'test@test.com',
      username: 'TestUser',
      createdAt: '',
    },
    movies: [
      {
        id: 'movie-1',
        tmdbId: 123,
        title: 'Inception',
        posterPath: null,
        releaseDate: '2010-07-16',
        voteCount: 5,
        totalVotes: 10,
      },
    ],
    votes: [],
    comments: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('передаёт правильные параметры в usePolling', () => {
    const onUpdate = vi.fn();
    const onError = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: 'evening-1',
        interval: 8000,
        enabled: true,
        onUpdate,
        onError,
      })
    );

    expect(mockUsePolling).toHaveBeenCalledWith({
      interval: 8000,
      enabled: true,
      onTick: expect.any(Function),
    });
  });

  it('выключает polling, если eveningId не указан', () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: undefined,
        interval: 5000,
        enabled: true,
        onUpdate,
      })
    );

    expect(mockUsePolling).toHaveBeenCalledWith({
      interval: 5000,
      enabled: false,
      onTick: expect.any(Function),
    });
  });

  it('выключает polling, если enabled=false', () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: 'evening-1',
        interval: 5000,
        enabled: false,
        onUpdate,
      })
    );

    expect(mockUsePolling).toHaveBeenCalledWith({
      interval: 5000,
      enabled: false,
      onTick: expect.any(Function),
    });
  });

  it('вызывает onUpdate с данными при успешном запросе', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEvening);

    let capturedOnTick: () => void | Promise<void> = () => {};
    mockUsePolling.mockImplementation(({ onTick }) => {
      capturedOnTick = onTick;
    });

    const onUpdate = vi.fn();
    const onError = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: 'evening-1',
        interval: 5000,
        enabled: true,
        onUpdate,
        onError,
      })
    );

    await capturedOnTick();

    expect(mockEveningsApi.getById).toHaveBeenCalledWith('evening-1');
    expect(onUpdate).toHaveBeenCalledWith(mockEvening);
    expect(onError).not.toHaveBeenCalled();
  });

  it('вызывает onError при ошибке запроса', async () => {
    mockEveningsApi.getById.mockRejectedValue(new Error('Network error'));

    let capturedOnTick: () => void | Promise<void> = () => {};
    mockUsePolling.mockImplementation(({ onTick }) => {
      capturedOnTick = onTick;
    });

    const onUpdate = vi.fn();
    const onError = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: 'evening-1',
        interval: 5000,
        enabled: true,
        onUpdate,
        onError,
      })
    );

    await capturedOnTick();

    expect(mockEveningsApi.getById).toHaveBeenCalledWith('evening-1');
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      'Не удалось обновить данные киновечера'
    );
  });

  it('не вызывает eveningsApi если eveningId не указан', async () => {
    let capturedOnTick: () => void | Promise<void> = () => {};
    mockUsePolling.mockImplementation(({ onTick }) => {
      capturedOnTick = onTick;
    });

    const onUpdate = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: undefined,
        interval: 5000,
        enabled: true,
        onUpdate,
      })
    );

    await capturedOnTick();

    expect(mockEveningsApi.getById).not.toHaveBeenCalled();
  });

  it('передаёт usePolling с enabled=true по умолчанию', () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useEveningPolling({
        eveningId: 'evening-1',
        onUpdate,
      })
    );

    expect(mockUsePolling).toHaveBeenCalledWith({
      interval: 8000,
      enabled: true,
      onTick: expect.any(Function),
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVote } from '@/hooks/useVote';

const mockvotesApi = vi.hoisted(() => ({
  deleteVote: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/api/votes.api', () => ({
  votesApi: mockvotesApi,
}));

describe('useVote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvening = {
    id: 'evening-1',
    title: 'Test Evening',
    description: '',
    scheduledAt: '2024-01-15T18:00:00Z',
    isPrivate: false,
    createdBy: {
      id: 'user-2',
      email: 'other@test.com',
      username: 'other',
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
    votes: [
      {
        id: 'vote-1',
        eveningFilmId: 'movie-1',
        userId: 'user-1',
        value: 5 as const,
        createdAt: '2024-01-10T10:00:00Z',
      },
    ],
    comments: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  };

  it('creates a vote with optimistic update when no existing vote', async () => {
    const eveningWithoutUserVote = {
      ...mockEvening,
      votes: [],
    };

    mockvotesApi.create.mockResolvedValue({
      id: 'vote-new',
      eveningFilmId: 'movie-1',
      userId: 'user-1',
      value: 1,
      createdAt: '2024-01-10T11:00:00Z',
    });

    const setEvening = vi.fn();
    const { result } = renderHook(() =>
      useVote('evening-1', eveningWithoutUserVote, setEvening)
    );

    await act(async () => {
      await result.current.toggleVote('movie-1', 'user-1');
    });

    expect(setEvening).toHaveBeenNthCalledWith(1, {
      ...eveningWithoutUserVote,
      votes: [
        expect.objectContaining({
          eveningFilmId: 'movie-1',
          userId: 'user-1',
          value: 1,
        }),
      ],
    });

    expect(mockvotesApi.create).toHaveBeenCalledWith('evening-1', {
      eveningFilmId: 'movie-1',
      value: 1,
    });
  });

  it('deletes a vote with optimistic update when existing vote found', async () => {
    mockvotesApi.deleteVote.mockResolvedValue(undefined);

    const setEvening = vi.fn();
    const { result } = renderHook(() =>
      useVote('evening-1', mockEvening, setEvening)
    );

    await act(async () => {
      await result.current.toggleVote('movie-1', 'user-1');
    });

    expect(setEvening).toHaveBeenNthCalledWith(1, {
      ...mockEvening,
      votes: [],
    });

    expect(mockvotesApi.deleteVote).toHaveBeenCalledWith('evening-1', 'vote-1');
  });

  it('does nothing when eveningId is undefined', async () => {
    const setEvening = vi.fn();
    const { result } = renderHook(() =>
      useVote(undefined, mockEvening, setEvening)
    );

    await act(async () => {
      await result.current.toggleVote('movie-1', 'user-1');
    });

    expect(mockvotesApi.create).not.toHaveBeenCalled();
    expect(mockvotesApi.deleteVote).not.toHaveBeenCalled();
    expect(setEvening).not.toHaveBeenCalled();
  });

  it('does nothing when evening is null', async () => {
    const setEvening = vi.fn();
    const { result } = renderHook(() => useVote('evening-1', null, setEvening));

    await act(async () => {
      await result.current.toggleVote('movie-1', 'user-1');
    });

    expect(mockvotesApi.create).not.toHaveBeenCalled();
    expect(mockvotesApi.deleteVote).not.toHaveBeenCalled();
    expect(setEvening).not.toHaveBeenCalled();
  });

  it('sets votingMovieId during toggle', async () => {
    mockvotesApi.create.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ id: 'vote-new' }), 100)
        )
    );

    const setEvening = vi.fn();
    const { result } = renderHook(() =>
      useVote('evening-1', { ...mockEvening, votes: [] }, setEvening)
    );

    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.toggleVote('movie-1', 'user-1');
    });

    expect(result.current.votingMovieId).toBe('movie-1');

    await act(async () => {
      await togglePromise!;
    });

    expect(result.current.votingMovieId).toBeNull();
  });

  it('rolls back optimistic update when vote operation fails', async () => {
    mockvotesApi.create.mockRejectedValue(new Error('API Error'));

    const eveningWithoutUserVote = { ...mockEvening, votes: [] };
    const setEvening = vi.fn();
    const { result } = renderHook(() =>
      useVote('evening-1', eveningWithoutUserVote, setEvening)
    );

    const toggleFn = result.current.toggleVote;
    await expect(
      act(async () => {
        await toggleFn('movie-1', 'user-1');
      })
    ).rejects.toThrow('Не удалось проголосовать');

    expect(setEvening).toHaveBeenCalledTimes(2);
    expect(setEvening).toHaveBeenNthCalledWith(2, eveningWithoutUserVote);
  });
});

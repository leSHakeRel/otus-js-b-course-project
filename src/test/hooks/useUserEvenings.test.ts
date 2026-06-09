import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserEvenings } from '@/hooks/useUserEvenings';

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockGetAll = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: {
    getAll: mockGetAll,
  },
}));

describe('useUserEvenings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches evenings when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const mockEvenings = {
      data: [
        {
          id: 'evening-1',
          title: 'My Evening',
          description: '',
          scheduledAt: '2024-01-15T18:00:00Z',
          isPrivate: false,
          createdBy: {
            id: '1',
            email: 'test@test.com',
            username: 'test',
            createdAt: '',
          },
          movies: [],
          votes: [],
          comments: [],
          createdAt: '',
          updatedAt: '',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };

    mockGetAll.mockResolvedValue(mockEvenings);

    const { result } = renderHook(() => useUserEvenings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.evenings).toHaveLength(1);
    expect(result.current.evenings[0]?.id).toBe('evening-1');
    expect(mockGetAll).toHaveBeenCalledWith(1, 50, { filter: 'my' });
  });

  it('returns empty array when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useUserEvenings());

    expect(result.current.evenings).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles fetch error gracefully', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    mockGetAll.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useUserEvenings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.evenings).toEqual([]);
  });
});

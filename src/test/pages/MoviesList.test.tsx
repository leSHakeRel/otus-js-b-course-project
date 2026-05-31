import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { MoviesList } from '@/pages/MoviesList';

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUsePaginatedFetch = vi.hoisted(() => vi.fn());
const mockUseUserEvenings = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/hooks/usePaginatedFetch', () => ({
  usePaginatedFetch: mockUsePaginatedFetch,
}));

vi.mock('@/hooks/useUserEvenings', () => ({
  useUserEvenings: mockUseUserEvenings,
}));

vi.mock('@/hooks/useAsyncAction', () => ({
  useAsyncAction: () => ({
    execute: vi.fn(),
    isLoading: false,
    error: null,
    success: null,
    clearError: vi.fn(),
    clearSuccess: vi.fn(),
    reset: vi.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const mockMovies = [
  {
    tmdbId: 1,
    title: 'Inception',
    overview: 'A mind-bending thriller',
    posterPath: '/poster.jpg',
    backdropPath: null,
    releaseDate: '2010-07-16',
    voteAverage: 8.8,
    voteCount: 10000,
    genreIds: [28],
  },
];

describe('MoviesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserEvenings.mockReturnValue({ evenings: [], isLoading: false });
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
  });

  it('shows loading state', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<MoviesList />, { wrapper });
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Ошибка загрузки',
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<MoviesList />, { wrapper });
    expect(screen.getByText(/ошибка загрузки/i)).toBeInTheDocument();
  });

  it('renders movies when data is loaded', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: mockMovies,
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<MoviesList />, { wrapper });

    expect(screen.getByText('Популярные фильмы')).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('shows empty state when no movies', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<MoviesList />, { wrapper });
    expect(screen.getByText('Фильмы не найдены')).toBeInTheDocument();
  });
});

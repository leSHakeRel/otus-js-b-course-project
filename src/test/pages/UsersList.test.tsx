import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { UsersList } from '@/pages/UsersList';

const mockUsePaginatedFetch = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePaginatedFetch', () => ({
  usePaginatedFetch: mockUsePaginatedFetch,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const mockUsers = [
  {
    id: 'user-1',
    email: 'user1@test.com',
    username: 'User1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'user2@test.com',
    username: 'User2',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

describe('UsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    render(<UsersList />, { wrapper });
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

    render(<UsersList />, { wrapper });
    expect(screen.getByText(/ошибка загрузки/i)).toBeInTheDocument();
  });

  it('renders list of users', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<UsersList />, { wrapper });

    expect(screen.getByText('Пользователи')).toBeInTheDocument();
    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<UsersList />, { wrapper });
    expect(screen.getByText('Пользователи не найдены')).toBeInTheDocument();
  });
});

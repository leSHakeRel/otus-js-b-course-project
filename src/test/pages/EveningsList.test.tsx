import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { EveningsList } from '@/pages/EveningsList';

vi.mock('@/components/common/IsAuthenticated', () => ({
  IsAuthenticated: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const mockUsePaginatedFetch = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePaginatedFetch', () => ({
  usePaginatedFetch: mockUsePaginatedFetch,
}));

const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('@/contexts/AuthContext', () => ({ useAuth: mockUseAuth }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const mockEvenings = [
  {
    id: 'e1',
    title: 'Evening 1',
    description: 'Description 1',
    scheduledAt: '2024-06-15T18:00:00Z',
    isPrivate: false,
    createdBy: {
      id: 'user-1',
      email: 'user1@test.com',
      username: 'User1',
      createdAt: '',
    },
    movies: [],
    votes: [],
    comments: [],
    createdAt: '',
    updatedAt: '',
  },
];

const authValue = {
  isAuthenticated: true,
  user: { id: '1', email: 'test@test.com', username: 'test', createdAt: '' },
  token: 'token',
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  isLoading: false,
};

describe('EveningsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authValue);
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
    render(<EveningsList />, { wrapper });
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
    render(<EveningsList />, { wrapper });
    expect(screen.getByText(/ошибка загрузки/i)).toBeInTheDocument();
  });

  it('renders list of evenings', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: mockEvenings,
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });
    render(<EveningsList />, { wrapper });
    expect(screen.getByText('Evening 1')).toBeInTheDocument();
    expect(screen.getByText('Киновечера')).toBeInTheDocument();
  });

  it('shows creates evening button when authenticated', () => {
    mockUsePaginatedFetch.mockReturnValue({
      data: mockEvenings,
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      refetch: vi.fn(),
    });
    render(<EveningsList />, { wrapper });
    expect(screen.getByText('Создать киновечер')).toBeInTheDocument();
  });
});

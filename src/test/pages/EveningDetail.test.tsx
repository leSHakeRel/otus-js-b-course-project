import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockEveningsApi = {
  getById: vi.fn(),
  delete: vi.fn(),
  removeMovie: vi.fn(),
};

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
}));

const mockCommentsApi = {
  create: vi.fn(),
};

vi.mock('@/api/comments.api', () => ({
  commentsApi: mockCommentsApi,
}));

vi.mock('@/hooks/useMovieRatings', () => ({
  useMovieRatings: vi.fn(),
}));

vi.mock('@/hooks/useAsyncAction', () => ({
  useAsyncAction: (action: (...args: unknown[]) => Promise<unknown>) => ({
    execute: action,
    isLoading: false,
    error: null,
    success: null,
    clearError: vi.fn(),
    clearSuccess: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('@/hooks/useVote', () => ({
  useVote: () => ({
    toggleVote: vi.fn(),
    votingMovieId: null,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockEveningDetail = {
  id: 'evening-1',
  title: 'Test Evening',
  description: 'Test description',
  scheduledAt: '2024-06-15T18:00:00.000Z',
  isPrivate: false,
  createdBy: {
    id: 'user-1',
    email: 'user@test.com',
    username: 'TestUser',
    createdAt: '',
  },
  movies: [
    {
      id: 'movie-1',
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/poster.jpg',
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
      createdAt: '',
    },
  ],
  comments: [
    {
      id: 'comment-1',
      eveningId: 'evening-1',
      userId: 'user-1',
      username: 'TestUser',
      content: 'Great!',
      createdAt: '2024-06-15T19:00:00Z',
    },
  ],
  createdAt: '2024-06-10T10:00:00Z',
  updatedAt: '2024-06-10T10:00:00Z',
};

describe('EveningDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    mockEveningsApi.getById.mockImplementation(() => new Promise(() => {}));

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: true,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('renders evening details when loaded', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: 8.8,
      kinopoiskRating: 8.7,
      kinopoiskNameRu: 'Начало',
      kinopoiskDescription: 'Отличный фильм',
      kinopoiskShortDescription: 'Короткое описание',
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });

  it('shows error when evening not found', async () => {
    mockEveningsApi.getById.mockRejectedValue(new Error('Not found'));

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/не удалось загрузить киновечер/i)
      ).toBeInTheDocument();
    });
  });

  it('shows delete button for evening owner', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Удалить')[0]).toBeInTheDocument();
    });
  });

  it('does not show delete button for non-owner', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-2',
        email: 'other@test.com',
        username: 'OtherUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Удалить')).not.toBeInTheDocument();
    });
  });

  it('shows private badge for private evenings', async () => {
    mockEveningsApi.getById.mockResolvedValue({
      ...mockEveningDetail,
      isPrivate: true,
    });

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Приватный')).toBeInTheDocument();
    });
  });

  it('renders sort buttons', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: 8.8,
      kinopoiskRating: 8.7,
      kinopoiskNameRu: 'Начало',
      kinopoiskDescription: 'Отличный фильм',
      kinopoiskShortDescription: 'Короткое описание',
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByText('По умолчанию')).toBeInTheDocument();
    expect(screen.getByText('Году')).toBeInTheDocument();
    expect(screen.getByText('Рейтингу TMDB')).toBeInTheDocument();
    expect(screen.getByText('Голосам')).toBeInTheDocument();
  });

  it('shows sorting direction button', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'user@test.com',
        username: 'TestUser',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: 8.8,
      kinopoiskRating: 8.7,
      kinopoiskNameRu: 'Начало',
      kinopoiskDescription: 'Отличный фильм',
      kinopoiskShortDescription: 'Короткое описание',
      isLoading: false,
    });

    const { EveningDetail } = await import('@/pages/EveningDetail');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1']}>
        <Routes>
          <Route path="/evenings/:id" element={<EveningDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByTitle('По возрастанию')).toBeInTheDocument();
  });
});

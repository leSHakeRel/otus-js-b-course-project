import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { TestAuthProvider } from '@/test/utils/TestAuthProvider';

vi.mock('@/components/common/IsAuthenticated', () => ({
  IsAuthenticated: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const mockMoviesApi = {
  getById: vi.fn(),
};

vi.mock('@/api/movies.api', () => ({
  moviesApi: mockMoviesApi,
}));

const mockEveningsApi = {
  addMovie: vi.fn(),
};

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
}));

vi.mock('@/hooks/useMovieRatings', () => ({
  useMovieRatings: vi.fn(),
}));

vi.mock('@/hooks/useUserEvenings', () => ({
  useUserEvenings: vi.fn(),
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

const mockMovie = {
  tmdbId: 27205,
  title: 'Inception',
  overview:
    'A thief who steals corporate secrets through dream-sharing technology',
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 35000,
  genreIds: [28, 878, 12],
};

const authAuthenticated = {
  isAuthenticated: true,
  user: {
    id: '1',
    email: 'test@test.com',
    username: 'test',
    createdAt: '',
  },
};

const authNotAuthenticated = {
  isAuthenticated: false,
  user: null,
};

describe('MovieDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    mockMoviesApi.getById.mockImplementation(() => new Promise(() => {}));

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: true,
    });

    const { useUserEvenings } = await import('@/hooks/useUserEvenings');
    vi.mocked(useUserEvenings).mockReturnValue({
      evenings: [],
      isLoading: false,
    });

    const { MovieDetail } = await import('@/pages/MovieDetail');

    render(
      <MemoryRouter initialEntries={['/movies/27205']}>
        <TestAuthProvider value={authAuthenticated}>
          <Routes>
            <Route path="/movies/:tmdbId" element={<MovieDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('shows movie details when loaded', async () => {
    mockMoviesApi.getById.mockResolvedValue(mockMovie);

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: 8.8,
      kinopoiskRating: 8.7,
      kinopoiskNameRu: 'Начало',
      kinopoiskDescription: 'Описание',
      kinopoiskShortDescription: 'Короткое описание',
      isLoading: false,
    });

    const { useUserEvenings } = await import('@/hooks/useUserEvenings');
    vi.mocked(useUserEvenings).mockReturnValue({
      evenings: [],
      isLoading: false,
    });

    const { MovieDetail } = await import('@/pages/MovieDetail');

    render(
      <MemoryRouter initialEntries={['/movies/27205']}>
        <TestAuthProvider value={authAuthenticated}>
          <Routes>
            <Route path="/movies/:tmdbId" element={<MovieDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(screen.getByText('Начало')).toBeInTheDocument();
    expect(screen.getByText(/2010/)).toBeInTheDocument();
    expect(screen.getAllByText(/8\.8/)[0]).toBeInTheDocument();
    expect(screen.getByText(/IMDB/)).toBeInTheDocument();
    expect(screen.getByText(/Кинопоиск/)).toBeInTheDocument();
    expect(screen.getByText(/добавить в киновечер/i)).toBeInTheDocument();
  });

  it('shows error when movie not found', async () => {
    mockMoviesApi.getById.mockRejectedValue(new Error('Not found'));

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { useUserEvenings } = await import('@/hooks/useUserEvenings');
    vi.mocked(useUserEvenings).mockReturnValue({
      evenings: [],
      isLoading: false,
    });

    const { MovieDetail } = await import('@/pages/MovieDetail');

    render(
      <MemoryRouter initialEntries={['/movies/27205']}>
        <TestAuthProvider value={authAuthenticated}>
          <Routes>
            <Route path="/movies/:tmdbId" element={<MovieDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument();
    });
  });

  it('shows N/A ratings when ratings are null', async () => {
    mockMoviesApi.getById.mockResolvedValue(mockMovie);

    const { useMovieRatings } = await import('@/hooks/useMovieRatings');
    vi.mocked(useMovieRatings).mockReturnValue({
      imdbRating: null,
      kinopoiskRating: null,
      kinopoiskNameRu: null,
      kinopoiskDescription: null,
      kinopoiskShortDescription: null,
      isLoading: false,
    });

    const { useUserEvenings } = await import('@/hooks/useUserEvenings');
    vi.mocked(useUserEvenings).mockReturnValue({
      evenings: [],
      isLoading: false,
    });

    const { MovieDetail } = await import('@/pages/MovieDetail');

    render(
      <MemoryRouter initialEntries={['/movies/27205']}>
        <TestAuthProvider value={authNotAuthenticated}>
          <Routes>
            <Route path="/movies/:tmdbId" element={<MovieDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/N\/A/).length).toBeGreaterThan(0);
  });
});

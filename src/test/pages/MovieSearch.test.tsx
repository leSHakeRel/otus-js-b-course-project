import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const mockMoviesApi = {
  search: vi.fn(),
  getPopular: vi.fn(),
  getById: vi.fn(),
};

const mockEveningsApi = {
  addMovie: vi.fn(),
  getById: vi.fn(),
};

vi.mock('@/api/movies.api', () => ({
  moviesApi: mockMoviesApi,
}));

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MovieSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEveningsApi.getById.mockResolvedValue({
      id: 'evening-1',
      movies: [],
    });
  });

  it('renders search form', async () => {
    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Добавить фильм')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/поиск фильмов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /найти/i })).toBeInTheDocument();
  });

  it('searches movies on button click', async () => {
    mockMoviesApi.search.mockResolvedValue({
      data: [
        {
          tmdbId: 1,
          title: 'Inception',
          overview: 'Test overview',
          posterPath: null,
          backdropPath: null,
          releaseDate: '2010-07-16',
          voteAverage: 8.8,
          voteCount: 100,
          genreIds: [],
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = await screen.findByLabelText(/поиск фильмов/i);
    await userEvent.type(searchInput, 'Inception');
    fireEvent.click(screen.getByRole('button', { name: /найти/i }));

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(mockMoviesApi.search).toHaveBeenCalledWith({
      q: 'Inception',
      page: 1,
    });
  });

  it('shows error when search fails', async () => {
    mockMoviesApi.search.mockRejectedValue(new Error('Search Error'));

    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = await screen.findByLabelText(/поиск фильмов/i);
    await userEvent.type(searchInput, 'Inception');
    fireEvent.click(screen.getByRole('button', { name: /найти/i }));

    await waitFor(() => {
      expect(screen.getByText('Не удалось найти фильмы')).toBeInTheDocument();
    });
  });

  it('navigates back when evening not found', async () => {
    mockEveningsApi.getById.mockRejectedValue(new Error('Not found'));

    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/bad-id/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('disables search button when query is empty', async () => {
    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    const searchButton = await screen.findByRole('button', { name: /найти/i });
    expect(searchButton).toBeDisabled();
  });

  it('shows back link to evening', async () => {
    mockEveningsApi.getById.mockResolvedValue({ id: 'evening-1', movies: [] });

    const { MovieSearch } = await import('@/pages/MovieSearch');

    render(
      <MemoryRouter initialEntries={['/evenings/evening-1/movies']}>
        <Routes>
          <Route path="/evenings/:id/movies" element={<MovieSearch />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/назад к киновечеру/i)).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TestAuthProvider } from '@/test/utils/TestAuthProvider';

const mockEveningsApi = {
  getById: vi.fn(),
  delete: vi.fn(),
  removeMovie: vi.fn(),
  update: vi.fn(),
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

type AuthValue = {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  } | null;
};

const authOwner: AuthValue = {
  isAuthenticated: true,
  user: {
    id: 'user-1',
    email: 'user@test.com',
    username: 'TestUser',
    createdAt: '',
  },
};

const authOtherUser: AuthValue = {
  isAuthenticated: true,
  user: {
    id: 'user-2',
    email: 'other@test.com',
    username: 'OtherUser',
    createdAt: '',
  },
};

const mockEveningDetail = {
  id: 'evening-1',
  title: 'Test Evening',
  description: 'Test description',
  scheduledAt: '2024-06-15T18:00:00Z',
  isPrivate: true,
  createdBy: {
    id: 'user-1',
    email: 'user@test.com',
    username: 'TestUser',
    createdAt: '2024-06-10T10:00:00Z',
  },
  movies: [
    {
      id: 'movie-1',
      tmdbId: 27205,
      title: 'Inception',
      overview: 'A mind-bending thriller',
      posterPath: '/poster.jpg',
      backdropPath: null,
      releaseDate: '2010-07-16',
      voteAverage: 8.8,
      voteCount: 10000,
      genreIds: [28],
    },
  ],
  votes: [],
  comments: [
    {
      id: 'comment-1',
      userId: 'user-2',
      username: 'OtherUser',
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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('renders evening details when loaded', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText(/TestUser/)).toBeInTheDocument();
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });

  it('shows error when evening not found', async () => {
    mockEveningsApi.getById.mockRejectedValue(new Error('Not found'));

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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument();
    });
  });

  it('shows delete button for evening owner', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Удалить');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('does not show delete button for non-owner', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
        <TestAuthProvider value={authOtherUser}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.queryAllByText('Удалить')).toHaveLength(0);
  });

  it('shows private badge for private evenings', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByText('Приватный')).toBeInTheDocument();
  });

  it('renders sort buttons', async () => {
    mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
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
        <TestAuthProvider value={authOwner}>
          <Routes>
            <Route path="/evenings/:id" element={<EveningDetail />} />
          </Routes>
        </TestAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Evening')).toBeInTheDocument();
    });

    expect(screen.getByTitle('По возрастанию')).toBeInTheDocument();
  });

  describe('Edit mode', () => {
    it('shows edit button for owner', async () => {
      mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
          <TestAuthProvider value={authOwner}>
            <Routes>
              <Route path="/evenings/:id" element={<EveningDetail />} />
            </Routes>
          </TestAuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Evening')).toBeInTheDocument();
      });

      expect(screen.getByText('Редактировать')).toBeInTheDocument();
    });

    it('does not show edit button for non-owner', async () => {
      mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
          <TestAuthProvider value={authOtherUser}>
            <Routes>
              <Route path="/evenings/:id" element={<EveningDetail />} />
            </Routes>
          </TestAuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Evening')).toBeInTheDocument();
      });

      expect(screen.queryByText('Редактировать')).not.toBeInTheDocument();
    });

    it('clicking edit switches to edit mode with pre-filled values', async () => {
      const user = userEvent.setup();
      mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
          <TestAuthProvider value={authOwner}>
            <Routes>
              <Route path="/evenings/:id" element={<EveningDetail />} />
            </Routes>
          </TestAuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Evening')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Редактировать'));

      expect(screen.getByDisplayValue('Test Evening')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByText('Сохранить')).toBeInTheDocument();
      expect(screen.getByText('Отмена')).toBeInTheDocument();
    });

    it('cancelling edit restores original view', async () => {
      const user = userEvent.setup();
      mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);

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
          <TestAuthProvider value={authOwner}>
            <Routes>
              <Route path="/evenings/:id" element={<EveningDetail />} />
            </Routes>
          </TestAuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Evening')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Редактировать'));
      await user.click(screen.getByText('Отмена'));

      expect(screen.getByText('Test Evening')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue('Test Evening')
      ).not.toBeInTheDocument();
    });

    it('saving edits calls update API and updates display', async () => {
      const user = userEvent.setup();
      mockEveningsApi.getById.mockResolvedValue(mockEveningDetail);
      mockEveningsApi.update.mockResolvedValue({ ...mockEveningDetail });

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
          <TestAuthProvider value={authOwner}>
            <Routes>
              <Route path="/evenings/:id" element={<EveningDetail />} />
            </Routes>
          </TestAuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Evening')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Редактировать'));

      const titleInput = screen.getByDisplayValue('Test Evening');
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');

      const descInput = screen.getByDisplayValue('Test description');
      await user.clear(descInput);
      await user.type(descInput, 'New Description');

      await user.click(screen.getByText('Сохранить'));

      await waitFor(() => {
        expect(mockEveningsApi.update).toHaveBeenCalledWith('evening-1', {
          title: 'New Title',
          description: 'New Description',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('New Title')).toBeInTheDocument();
      });
      expect(screen.getByText('New Description')).toBeInTheDocument();
    });
  });
});

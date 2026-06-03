import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUsersApi = {
  getById: vi.fn(),
};

vi.mock('@/api/users.api', () => ({
  usersApi: mockUsersApi,
}));

const mockEveningsApi = {
  getAll: vi.fn(),
};

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
}));

const mockUser = {
  id: 'user-1',
  email: 'user@test.com',
  username: 'TestUser',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockEvenings = [
  {
    id: 'e1',
    title: 'Public Evening 1',
    description: 'Evening description',
    scheduledAt: '2024-06-15T18:00:00Z',
    isPrivate: false,
    createdBy: {
      id: 'user-1',
      email: 'user@test.com',
      username: 'TestUser',
      createdAt: '',
    },
    movies: [],
    votes: [],
    comments: [],
    createdAt: '',
    updatedAt: '',
  },
];

describe('UserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', async () => {
    mockUsersApi.getById.mockImplementation(() => new Promise(() => {}));
    mockEveningsApi.getAll.mockImplementation(() => new Promise(() => {}));

    const { UserDetail } = await import('@/pages/UserDetail');

    render(
      <MemoryRouter initialEntries={['/users/user-1']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('renders user details and their evenings', async () => {
    mockUsersApi.getById.mockResolvedValue(mockUser);
    mockEveningsApi.getAll.mockResolvedValue({ data: mockEvenings });

    const { UserDetail } = await import('@/pages/UserDetail');

    render(
      <MemoryRouter initialEntries={['/users/user-1']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
    expect(screen.getByText('Public Evening 1')).toBeInTheDocument();
    expect(screen.getByText('Публичные киновечера')).toBeInTheDocument();
  });

  it('shows error when user not found', async () => {
    mockUsersApi.getById.mockRejectedValue(new Error('Not found'));

    const { UserDetail } = await import('@/pages/UserDetail');

    render(
      <MemoryRouter initialEntries={['/users/user-1']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument();
    });
  });

  it('shows empty evenings message when user has no public evenings', async () => {
    mockUsersApi.getById.mockResolvedValue(mockUser);
    mockEveningsApi.getAll.mockResolvedValue({ data: [] });

    const { UserDetail } = await import('@/pages/UserDetail');

    render(
      <MemoryRouter initialEntries={['/users/user-1']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/нет публичных киновечеров/i)
      ).toBeInTheDocument();
    });
  });
});

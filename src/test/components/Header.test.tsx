import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { TestAuthProvider } from '@/test/utils/TestAuthProvider';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

type AuthValue = {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  } | null;
};

const renderWithAuth = (ui: ReactNode, authValue: AuthValue) => {
  return render(
    <MemoryRouter>
      <TestAuthProvider value={authValue}>{ui}</TestAuthProvider>
    </MemoryRouter>
  );
};

const authLoggedOut: AuthValue = {
  isAuthenticated: false,
  user: null,
};

const authLoggedIn: AuthValue = {
  isAuthenticated: true,
  user: {
    id: '1',
    email: 'test@test.com',
    username: 'TestUser',
    createdAt: '',
  },
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo link', () => {
    renderWithAuth(<Header />, authLoggedOut);
    expect(screen.getByText('Киновечера')).toBeInTheDocument();
  });

  it('shows login and register buttons when not authenticated', () => {
    renderWithAuth(<Header />, authLoggedOut);

    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
  });

  it('shows user info and logout when authenticated', () => {
    renderWithAuth(<Header />, authLoggedIn);

    expect(screen.getByText(/привет/i)).toBeInTheDocument();
    expect(screen.getByText(/TestUser/)).toBeInTheDocument();
    expect(screen.getByText('Выйти')).toBeInTheDocument();
    expect(screen.queryByText('Войти')).not.toBeInTheDocument();
  });

  it('shows navigation links when authenticated', () => {
    renderWithAuth(<Header />, authLoggedIn);

    expect(screen.getByText('Фильмы')).toBeInTheDocument();
    expect(screen.getByText('Пользователи')).toBeInTheDocument();
  });

  it('does not show Movies and Users links when not authenticated', () => {
    renderWithAuth(<Header />, authLoggedOut);

    expect(screen.queryByText('Фильмы')).not.toBeInTheDocument();
    expect(screen.queryByText('Пользователи')).not.toBeInTheDocument();
  });

  it('calls logout and navigates on logout click', () => {
    const authWithLogout: AuthValue = {
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '',
      },
    };

    renderWithAuth(<Header />, authWithLogout);

    fireEvent.click(screen.getByText('Выйти'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

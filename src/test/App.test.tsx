import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }),
}));

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('@/pages/EveningsList', () => ({
  EveningsList: () => <div data-testid="evenings-list">EveningsList</div>,
}));

vi.mock('@/pages/Login', () => ({
  Login: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('@/pages/Register', () => ({
  Register: () => <div data-testid="register-page">Register</div>,
}));

vi.mock('@/pages/NotFound', () => ({
  NotFound: () => <div data-testid="not-found">NotFound</div>,
}));

vi.mock('@/pages/MoviesList', () => ({
  MoviesList: () => <div data-testid="movies-list">MoviesList</div>,
}));

vi.mock('@/pages/MovieDetail', () => ({
  MovieDetail: () => <div data-testid="movie-detail">MovieDetail</div>,
}));

vi.mock('@/pages/Profile', () => ({
  Profile: () => <div data-testid="profile-page">Profile</div>,
}));

vi.mock('@/pages/CreateEvening', () => ({
  CreateEvening: () => <div data-testid="create-evening">CreateEvening</div>,
}));

vi.mock('@/pages/EveningDetail', () => ({
  EveningDetail: () => <div data-testid="evening-detail">EveningDetail</div>,
}));

vi.mock('@/pages/MovieSearch', () => ({
  MovieSearch: () => <div data-testid="movie-search">MovieSearch</div>,
}));

vi.mock('@/pages/UsersList', () => ({
  UsersList: () => <div data-testid="users-list">UsersList</div>,
}));

vi.mock('@/pages/UserDetail', () => ({
  UserDetail: () => <div data-testid="user-detail">UserDetail</div>,
}));

describe('App', () => {
  it('renders and provides routing for root path', async () => {
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('evenings-list')).toBeInTheDocument();
  });

  it('renders login page at /login', async () => {
    window.history.pushState({}, '', '/login');
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders register page at /register', async () => {
    window.history.pushState({}, '', '/register');
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', async () => {
    window.history.pushState({}, '', '/unknown-route');
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('renders movies list at /movies', async () => {
    window.history.pushState({}, '', '/movies');
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('movies-list')).toBeInTheDocument();
  });

  it('renders users list at /users', async () => {
    window.history.pushState({}, '', '/users');
    const App = (await import('@/App')).default;

    render(<App />);

    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });
});

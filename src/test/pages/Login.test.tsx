import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Login } from '@/pages/Login';

const mockLogin = vi.fn();
const mockUseAuthRedirect = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    token: null,
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: () => mockUseAuthRedirect(),
}));

const mockExecute = vi.fn();
const mockUseAsyncAction = vi.hoisted(() => ({
  useAsyncAction: () => ({
    execute: mockExecute,
    isLoading: false,
    error: null,
    success: null,
    clearError: vi.fn(),
    clearSuccess: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAsyncAction', () => mockUseAsyncAction);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />, { wrapper });

    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    expect(screen.getByText(/зарегистрироваться/i)).toBeInTheDocument();
  });

  it('calls useAuthRedirect on mount', () => {
    render(<Login />, { wrapper });
    expect(mockUseAuthRedirect).toHaveBeenCalled();
  });
});

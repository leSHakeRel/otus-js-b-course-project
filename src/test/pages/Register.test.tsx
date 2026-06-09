import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Register } from '@/pages/Register';

const mockRegister = vi.fn();
const mockUseAuthRedirect = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: () => mockUseAuthRedirect(),
}));

const mockUseAsyncAction = vi.hoisted(() => ({
  useAsyncAction: () => ({
    execute: vi.fn(),
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

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    render(<Register />, { wrapper });

    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/войти/i)).toBeInTheDocument();
  });

  it('calls useAuthRedirect on mount', () => {
    render(<Register />, { wrapper });
    expect(mockUseAuthRedirect).toHaveBeenCalled();
  });
});

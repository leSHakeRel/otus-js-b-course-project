import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Profile } from '@/pages/Profile';

const mockUpdateProfile = vi.fn();

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseAsyncAction = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/hooks/useAsyncAction', () => ({
  useAsyncAction: mockUseAsyncAction,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile form with user data', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        createdAt: '',
      },
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUseAsyncAction.mockReturnValue({
      execute: vi.fn(),
      isLoading: false,
      error: null,
      success: null,
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      reset: vi.fn(),
    });

    render(<Profile />, { wrapper });

    expect(screen.getByText('Редактирование профиля')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /сохранить/i })
    ).toBeInTheDocument();
  });

  it('shows success message', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        createdAt: '',
      },
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUseAsyncAction.mockReturnValue({
      execute: vi.fn(),
      isLoading: false,
      error: null,
      success: 'Профиль успешно обновлён',
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      reset: vi.fn(),
    });

    render(<Profile />, { wrapper });
    expect(screen.getByText(/профиль успешно обновлён/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        createdAt: '',
      },
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUseAsyncAction.mockReturnValue({
      execute: vi.fn(),
      isLoading: false,
      error: 'Не удалось обновить профиль',
      success: null,
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      reset: vi.fn(),
    });

    render(<Profile />, { wrapper });
    expect(screen.getByText('Не удалось обновить профиль')).toBeInTheDocument();
  });
});

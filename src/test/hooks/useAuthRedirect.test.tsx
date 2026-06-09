import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useAuth } from '@/contexts/AuthContext';

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

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useAuthRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to redirectTo when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    renderHook(() => useAuthRedirect('/profile'), { wrapper });

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigates to / by default when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '',
      },
      token: 'token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    renderHook(() => useAuthRedirect(), { wrapper });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not navigate when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    renderHook(() => useAuthRedirect(), { wrapper });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

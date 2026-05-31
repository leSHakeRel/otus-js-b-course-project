import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthApi = {
  login: vi.fn(),
  register: vi.fn(),
  updateProfile: vi.fn(),
  logout: vi.fn(),
};

const mockAuthEvents = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

vi.mock('@/api/auth.api', () => ({
  authApi: mockAuthApi,
}));

vi.mock('@/utils/authEvents', () => ({
  authEvents: mockAuthEvents,
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AuthProvider', () => {
    it('initializes with loading state', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      expect(authState).toBeDefined();
      expect(authState!.isLoading).toBe(false);
      expect(authState!.isAuthenticated).toBe(false);
      expect(authState!.user).toBeNull();
      expect(authState!.token).toBeNull();
    });

    it('restores user from localStorage', async () => {
      const storedUser = {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        createdAt: '2024-01-01',
      };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(storedUser));

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      expect(authState!.isAuthenticated).toBe(true);
      expect(authState!.user).toEqual(storedUser);
      expect(authState!.token).toBe('test-token');
    });

    it('handles corrupt localStorage data', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', 'invalid-json');

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      expect(authState!.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('performs login and updates state', async () => {
      const mockResponse = {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        accessToken: 'new-token',
        expiresIn: 3600,
      };
      mockAuthApi.login.mockResolvedValue(mockResponse);

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      await act(async () => {
        await authState!.login('test@test.com', 'password');
      });

      expect(authState!.isAuthenticated).toBe(true);
      expect(authState!.user?.id).toBe('1');
      expect(authState!.token).toBe('new-token');
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('performs register and updates state', async () => {
      const mockResponse = {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        accessToken: 'new-token',
        expiresIn: 3600,
      };
      mockAuthApi.register.mockResolvedValue(mockResponse);

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      await act(async () => {
        await authState!.register('test@test.com', 'password', 'testuser');
      });

      expect(authState!.isAuthenticated).toBe(true);
      expect(authState!.user?.username).toBe('testuser');
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('handles register failure', async () => {
      mockAuthApi.register.mockRejectedValue(new Error('Registration failed'));

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      await expect(
        act(async () => {
          await authState!.register('test@test.com', 'password', 'testuser');
        })
      ).rejects.toThrow('Registration failed');

      expect(authState!.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('performs logout and clears state', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: '1',
          email: 'test@test.com',
          username: 'test',
          createdAt: '2024-01-01',
        })
      );

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      act(() => {
        authState!.logout();
      });

      expect(authState!.isAuthenticated).toBe(false);
      expect(authState!.user).toBeNull();
      expect(authState!.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('updates profile', async () => {
      const existingUser = {
        id: '1',
        email: 'old@test.com',
        username: 'olduser',
        createdAt: '2024-01-01',
      };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(existingUser));

      mockAuthApi.updateProfile.mockResolvedValue({
        id: '1',
        email: 'new@test.com',
        username: 'newuser',
      });

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      let authState: ReturnType<typeof useAuth> | undefined;

      const Consumer: React.FC = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      await act(async () => {
        await authState!.updateProfile({
          username: 'newuser',
          email: 'new@test.com',
        });
      });

      expect(authState!.user?.username).toBe('newuser');
      expect(authState!.user?.email).toBe('new@test.com');
      expect(JSON.parse(localStorage.getItem('user')!).username).toBe(
        'newuser'
      );
    });

    it('subscribes to unauthorized events on mount', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

      const Consumer: React.FC = () => {
        useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );

      expect(mockAuthEvents.on).toHaveBeenCalledWith(
        'unauthorized',
        expect.any(Function)
      );
    });

    it('unsubscribes from unauthorized events on unmount', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');

      const { unmount } = render(
        <AuthProvider>
          <div />
        </AuthProvider>
      );

      unmount();

      expect(mockAuthEvents.off).toHaveBeenCalledWith(
        'unauthorized',
        expect.any(Function)
      );
    });

    it('throws error when useAuth is used outside AuthProvider', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');

      const BadComponent: React.FC = () => {
        useAuth();
        return null;
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<BadComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});

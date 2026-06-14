import { AuthContext } from '@/contexts/AuthContext';
import type { User } from '@/types';
import type { ReactNode } from 'react';

interface TestAuthValue {
  isAuthenticated: boolean;
  user: User | null;
  isLoading?: boolean;
  token?: string | null;
}

interface TestAuthProviderProps {
  children: ReactNode;
  value: TestAuthValue;
}

/**
 * Обёртка для тестов, которая предоставляет AuthContext
 * с контролируемыми значениями.
 *
 * @example
 * render(
 *   <TestAuthProvider isAuthenticated={true} user={mockUser}>
 *     <Header />
 *   </TestAuthProvider>
 * );
 */
export const TestAuthProvider = ({
  children,
  value,
}: TestAuthProviderProps) => {
  const authValue = {
    user: value.user,
    token: value.token ?? (value.isAuthenticated ? 'test-token' : null),
    isAuthenticated: value.isAuthenticated,
    isLoading: value.isLoading ?? false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    updateProfile: async () => {},
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

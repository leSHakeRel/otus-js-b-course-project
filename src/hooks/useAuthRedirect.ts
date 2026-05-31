import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Хук перенаправления аутентифицированного пользователя на указанный маршрут.
 *
 * @param redirectTo - маршрут для перенаправления (по умолчанию '/')
 *
 * @example
 * ```typescript
 * useAuthRedirect();
 * или
 * useAuthRedirect('/profile');
 * ```
 */
export function useAuthRedirect(redirectTo: string = '/'): void {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
}

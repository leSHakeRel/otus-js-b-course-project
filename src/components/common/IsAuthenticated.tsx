import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface IsAuthenticatedProps {
  children: ReactNode;
  /** Компонент для неаутентифицированного пользователя */
  fallback?: ReactNode;
}

/**
 * Компонент для отображения компонентов
 * аутентифицированных пользователей.
 *
 * @example
 * // Простое скрытие дочернего компонента
 * <IsAuthenticated>
 *   <Content />
 * </IsAuthenticated>
 *
 * @example
 * // С компонентом для неаутентифицированных пользователей
 * <IsAuthenticated fallback={<LoginPrompt />}>
 *   <Content />
 * </IsAuthenticated>
 */
export const IsAuthenticated = ({
  children,
  fallback,
}: IsAuthenticatedProps) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
};

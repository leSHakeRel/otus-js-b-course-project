import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface IsAuthenticatedProps {
  children: React.ReactNode;
  /** Компонент для неаутентифицированного пользователя */
  fallback?: React.ReactNode;
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
export const IsAuthenticated: React.FC<IsAuthenticatedProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
};

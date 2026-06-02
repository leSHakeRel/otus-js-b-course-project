import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { NotFound } from '@/pages/NotFound';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/usePaginatedFetch', () => ({
  usePaginatedFetch: vi.fn(),
}));

vi.mock('@/hooks/useUserEvenings', () => ({
  useUserEvenings: vi.fn(),
}));

vi.mock('@/hooks/useAsyncAction', () => ({
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('NotFound', () => {
  it('renders not found message', () => {
    render(<NotFound />, { wrapper });

    expect(screen.getByText('Страница не найдена')).toBeInTheDocument();
    expect(screen.getByText(/к сожалению/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /вернуться домой/i })
    ).toBeInTheDocument();
  });

  it('has link to home page', () => {
    render(<NotFound />, { wrapper });

    const link = screen.getByRole('link', { name: /вернуться домой/i });
    expect(link).toHaveAttribute('href', '/');
  });
});

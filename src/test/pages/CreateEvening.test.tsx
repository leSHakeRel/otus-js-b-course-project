import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CreateEvening } from '@/pages/CreateEvening';

const mockEveningsApi = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('@/api/evenings.api', () => ({
  eveningsApi: mockEveningsApi,
}));

const mockUseAsyncAction = vi.hoisted(() => vi.fn());

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

describe('CreateEvening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAsyncAction.mockReturnValue({
      execute: vi.fn(),
      isLoading: false,
      error: null,
      success: null,
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('renders creation form', () => {
    render(<CreateEvening />, { wrapper });

    expect(screen.getByText('Создать киновечер')).toBeInTheDocument();
    expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
    expect(screen.getByText('Описание')).toBeInTheDocument();
    expect(screen.getByText(/приватный/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /создать/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
  });

  it('disables submit when title is empty', () => {
    render(<CreateEvening />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /создать/i });
    expect(submitButton).toBeDisabled();
  });

  it('navigates to home on cancel', () => {
    render(<CreateEvening />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

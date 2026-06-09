import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Error } from '@/components/common/Error';

describe('Error', () => {
  it('renders with message', () => {
    render(<Error message="Something went wrong" />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders warning icon', () => {
    render(<Error message="Error message" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<Error message="Error message" />);
    expect(
      screen.queryByRole('button', { name: /повторить/i })
    ).not.toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<Error message="Error message" onRetry={() => {}} />);
    expect(
      screen.getByRole('button', { name: /повторить/i })
    ).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(<Error message="Error message" onRetry={handleRetry} />);
    const retryButton = screen.getByRole('button', { name: /повторить/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

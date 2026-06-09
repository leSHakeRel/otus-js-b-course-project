import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Loading } from '@/components/common/Loading';

describe('Loading', () => {
  it('renders with default message', () => {
    render(<Loading />);
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<Loading message="Custom loading..." />);
    expect(screen.getByText(/custom loading/i)).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = render(<Loading size="small" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('py-4');
  });

  it('applies medium size', () => {
    const { container } = render(<Loading size="medium" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('py-8');
  });

  it('applies large size', () => {
    const { container } = render(<Loading size="large" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('py-16');
  });

  it('renders spinner element', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

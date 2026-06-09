import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/common/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input label="Email" error="Invalid email" type="email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Input label="Email" type="email" value="test@example.com" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveValue('test@example.com');
  });

  it('applies error styles', () => {
    render(<Input label="Email" error="Invalid email" type="email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Email" type="email" onChange={handleChange} />);
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'new@email.com' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is required when required prop is set', () => {
    render(<Input label="Email" type="email" required />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('required');
  });
});

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-dark-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-dark-800 px-4 py-2 ${
          error ? 'border-red-500' : 'border-dark-700'
        } text-dark-100 placeholder-dark-500 transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

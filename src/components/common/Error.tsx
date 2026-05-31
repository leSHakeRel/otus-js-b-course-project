import React from 'react';
import { Button } from './Button';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="mb-4 text-4xl text-red-500">⚠️</div>
      <p className="mb-4 text-center text-dark-300">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Повторить
        </Button>
      )}
    </div>
  );
};

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`rounded-xl bg-dark-800 p-6 shadow-lg ${
        onClick
          ? 'hover:bg-dark-750 cursor-pointer transition-colors duration-200'
          : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

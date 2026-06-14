interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Loading = ({
  message = 'Загрузка...',
  size = 'medium',
}: LoadingProps) => {
  const sizeClasses = {
    small: 'py-4',
    medium: 'py-8',
    large: 'py-16',
  };

  const spinnerSize = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-500 ${spinnerSize[size]}`}
      />
      <p className="mt-4 text-dark-400">{message}</p>
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const { register } = useAuth();

  useAuthRedirect();

  const {
    execute: handleSubmit,
    isLoading,
    error,
  } = useAsyncAction(() => register(email, password, username), {
    onErrorMessage: 'Ошибка при регистрации',
  });

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-dark-100">
          Регистрация
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Имя пользователя"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="john_doe"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Зарегистрироваться
          </Button>
        </form>

        <p className="mt-4 text-center text-dark-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-400">
            Войти
          </Link>
        </p>
      </Card>
    </div>
  );
};

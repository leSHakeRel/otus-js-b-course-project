import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { IsAuthenticated } from '@/components/common/IsAuthenticated';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-dark-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-500">
            Киновечера
          </Link>

          <nav className="flex items-center space-x-4">
            <IsAuthenticated
              fallback={
                <>
                  <Link
                    to="/login"
                    className="rounded-lg bg-dark-700 px-4 py-2 text-dark-100 transition-colors duration-200 hover:bg-dark-600"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-primary-700"
                  >
                    Регистрация
                  </Link>
                </>
              }
            >
              <>
                <Link
                  to="/movies"
                  className="rounded-lg bg-dark-700 px-4 py-2 text-dark-100 transition-colors duration-200 hover:bg-dark-600"
                >
                  Фильмы
                </Link>
                <Link
                  to="/users"
                  className="rounded-lg bg-dark-700 px-4 py-2 text-dark-100 transition-colors duration-200 hover:bg-dark-600"
                >
                  Пользователи
                </Link>
                <Link
                  to="/profile"
                  className="text-dark-300 transition-colors duration-200 hover:text-primary-500"
                >
                  Привет, {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-700"
                >
                  Выйти
                </button>
              </>
            </IsAuthenticated>
          </nav>
        </div>
      </div>
    </header>
  );
};

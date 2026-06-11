/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { User } from '@/types';
import { authApi } from '@/api/auth.api';
import type { UpdateProfileRequest } from '@/api/auth.api';
import { authEvents } from '@/utils/authEvents';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = (): void => {
      logout();
    };

    authEvents.on('unauthorized', handleUnauthorized);
    return () => {
      authEvents.off('unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login({ email, password });
    setToken(response.accessToken);
    setUser({
      id: response.id,
      email: response.email,
      username: response.username,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: response.id,
        email: response.email,
        username: response.username,
        createdAt: new Date().toISOString(),
      })
    );
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ): Promise<void> => {
    try {
      const response = await authApi.register({ email, password, username });
      setToken(response.accessToken);
      setUser({
        id: response.id,
        email: response.email,
        username: response.username,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: response.id,
          email: response.email,
          username: response.username,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    const response = await authApi.updateProfile(data);
    const updatedUser: User = {
      id: response.id,
      email: response.email,
      username: response.username,
      createdAt: user?.createdAt ?? new Date().toISOString(),
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

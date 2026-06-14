import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { EveningsList } from '@/pages/EveningsList';
import { EveningDetail } from '@/pages/EveningDetail';
import { CreateEvening } from '@/pages/CreateEvening';
import { MovieSearch } from '@/pages/MovieSearch';
import { MoviesList } from '@/pages/MoviesList';
import { MovieDetail } from '@/pages/MovieDetail';
import { Profile } from '@/pages/Profile';
import { UsersList } from '@/pages/UsersList';
import { UserDetail } from '@/pages/UserDetail';
import { NotFound } from '@/pages/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EveningsList />} />
        <Route path="/movies" element={<MoviesList />} />
        <Route path="/movies/:tmdbId" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<UsersList />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evenings/new"
          element={
            <ProtectedRoute>
              <CreateEvening />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evenings/:id"
          element={
            <ProtectedRoute>
              <EveningDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evenings/:id/movies"
          element={
            <ProtectedRoute>
              <MovieSearch />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

function App(): React.ReactElement {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

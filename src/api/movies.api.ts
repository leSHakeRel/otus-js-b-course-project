import api from './axios';
import type { Movie } from '@/types';

export interface SearchMoviesParams {
  q: string;
  page?: number;
}

export interface SearchMoviesResponse {
  data: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PopularMoviesParams {
  page?: number;
}

export interface PopularMoviesResponse {
  data: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const moviesApi = {
  search: async (params: SearchMoviesParams): Promise<SearchMoviesResponse> => {
    const response = await api.get<SearchMoviesResponse>('/movies/search', {
      params,
    });
    return response.data;
  },

  getById: async (tmdbId: number): Promise<Movie> => {
    const response = await api.get<Movie>(`/movies/${tmdbId}`);
    return response.data;
  },

  getPopular: async (
    params?: PopularMoviesParams
  ): Promise<PopularMoviesResponse> => {
    const response = await api.get<PopularMoviesResponse>('/movies/popular', {
      params,
    });
    return response.data;
  },
};

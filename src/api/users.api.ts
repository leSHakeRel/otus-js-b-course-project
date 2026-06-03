import api from './axios';
import type { User } from '@/types';

export interface UsersListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  getAll: async (page = 1, limit = 10): Promise<UsersListResponse> => {
    const response = await api.get<UsersListResponse>('/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },
};

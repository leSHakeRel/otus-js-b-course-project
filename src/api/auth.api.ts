import api from './axios';

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  username: string;
  accessToken: string;
  expiresIn: number;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<{ id: string; email: string; username: string }> => {
    const response = await api.put<{
      id: string;
      email: string;
      username: string;
    }>('/auth/profile', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { authEvents } from '@/utils/authEvents';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export class ApiError extends Error {
  message: string;
  status: number;
  code?: string | undefined;
  fieldErrors?: Record<string, string[]> | undefined;

  constructor(
    message: string,
    status: number,
    code?: string | undefined,
    fieldErrors?: Record<string, string[]> | undefined
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      const apiError = new ApiError(
        data?.message || 'Произошла ошибка',
        status,
        data?.code,
        data?.fieldErrors
      );

      if (status === 401) {
        authEvents.emit('unauthorized');
      }

      return Promise.reject(apiError);
    }

    if (error.request) {
      return Promise.reject(new ApiError('Нет соединения с сервером', 0));
    }

    return Promise.reject(
      new ApiError(error.message || 'Неизвестная ошибка', 0)
    );
  }
);

export default api;

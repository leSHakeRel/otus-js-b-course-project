import api from './axios';
import type { Evening, EveningMovie, Vote, Comment } from '@/types';

export interface CreateEveningRequest {
  title: string;
  description: string;
  scheduledAt: string;
  isPrivate: boolean;
}

type UpdateEveningRequest = Partial<CreateEveningRequest>;

export interface EveningListResponse {
  data: Evening[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddMovieRequest {
  tmdbId: number;
}

export interface CreateVoteRequest {
  eveningFilmId: string;
  value: number;
}

export interface CreateCommentRequest {
  content: string;
}

export const eveningsApi = {
  getAll: async (
    page = 1,
    size = 10,
    options?: { filter?: 'my' | 'public' | 'all'; createdBy?: string }
  ): Promise<EveningListResponse> => {
    const params: Record<string, string | number> = { page, limit: size };
    if (options?.filter) params['filter'] = options.filter;
    if (options?.createdBy) params['createdBy'] = options.createdBy;
    const response = await api.get<EveningListResponse>('/evenings', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Evening> => {
    const response = await api.get<Evening>(`/evenings/${id}`);
    return response.data;
  },

  create: async (data: CreateEveningRequest): Promise<Evening> => {
    const response = await api.post<Evening>('/evenings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEveningRequest): Promise<Evening> => {
    const response = await api.put<Evening>(`/evenings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/evenings/${id}`);
  },

  addMovie: async (
    eveningId: string,
    data: AddMovieRequest
  ): Promise<EveningMovie> => {
    const response = await api.post<EveningMovie>(
      `/evenings/${eveningId}/movies`,
      data
    );
    return response.data;
  },

  removeMovie: async (eveningId: string, tmdbId: number): Promise<void> => {
    await api.delete(`/evenings/${eveningId}/movies/${tmdbId}`);
  },

  getVotes: async (eveningId: string): Promise<Vote[]> => {
    const response = await api.get<Vote[]>(`/evenings/${eveningId}/votes`);
    return response.data;
  },

  createVote: async (
    eveningId: string,
    data: CreateVoteRequest
  ): Promise<Vote> => {
    const response = await api.post<Vote>(`/evenings/${eveningId}/votes`, data);
    return response.data;
  },

  getComments: async (eveningId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(
      `/evenings/${eveningId}/comments`
    );
    return response.data;
  },

  createComment: async (
    eveningId: string,
    data: CreateCommentRequest
  ): Promise<Comment> => {
    const response = await api.post<Comment>(
      `/evenings/${eveningId}/comments`,
      data
    );
    return response.data;
  },
};

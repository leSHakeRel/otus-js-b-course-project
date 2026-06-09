import api from './axios';
import type { Comment } from '@/types';

export interface CreateCommentRequest {
  content: string;
}

export const commentsApi = {
  getAll: async (eveningId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(
      `/evenings/${eveningId}/comments`
    );
    return response.data;
  },

  create: async (
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

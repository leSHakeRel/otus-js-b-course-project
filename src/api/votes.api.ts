import api from './axios';
import type { Vote } from '@/types';

export interface CreateVoteRequest {
  eveningFilmId: string;
  value: number;
}

export const votesApi = {
  getAll: async (eveningId: string): Promise<Vote[]> => {
    const response = await api.get<Vote[]>(`/evenings/${eveningId}/votes`);
    return response.data;
  },

  create: async (eveningId: string, data: CreateVoteRequest): Promise<Vote> => {
    const response = await api.post<Vote>(`/evenings/${eveningId}/votes`, data);
    return response.data;
  },

  deleteVote: async (eveningId: string, voteId: string): Promise<void> => {
    await api.delete(`/evenings/${eveningId}/votes/${voteId}`);
  },
};

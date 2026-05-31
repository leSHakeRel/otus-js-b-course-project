import { useState, useCallback } from 'react';
import { votesApi } from '@/api/votes.api';
import type { Evening, Vote } from '@/types';

interface UseVoteResult {
  toggleVote: (eveningFilmId: string, userId: string) => Promise<void>;
  votingMovieId: string | null;
}

/**
 * Хук для управления голосованием за фильм в киновечере
 * с оптимистичным обновлением (optimistic update).
 *
 * При голосовании:
 * 1. Мгновенно обновляет счётчик локально (без ожидания сервера)
 * 2. Выполняет API-запрос
 * 3. При ошибке — откатывает стейт к предыдущему состоянию
 *
 * @param eveningId - ID киновечера
 * @param evening - текущее состояние киновечера
 * @param setEvening - функция обновления состояния киновечера
 *
 * @example
 * ```typescript
 * const { toggleVote, votingMovieId } = useVote(id, evening, setEvening);
 *
 * Использование:
 * <button onClick={() => toggleVote(movie.id, user.id)}>
 * ```
 */
export function useVote(
  eveningId: string | undefined,
  evening: Evening | null,
  setEvening: (evening: Evening) => void
): UseVoteResult {
  const [votingMovieId, setVotingMovieId] = useState<string | null>(null);

  const toggleVote = useCallback(
    async (eveningFilmId: string, userId: string): Promise<void> => {
      if (!eveningId || !evening) return;

      setVotingMovieId(eveningFilmId);

      const previousEvening = evening;

      const existingVote = evening.votes.find(
        (v) => v.eveningFilmId === eveningFilmId && v.userId === userId
      );

      const optimisticVotes: Vote[] = existingVote
        ? evening.votes.filter((v) => v.id !== existingVote.id)
        : [
            ...evening.votes,
            {
              id: `temp-${Date.now()}`,
              eveningFilmId,
              userId,
              value: 1,
              createdAt: new Date().toISOString(),
            },
          ];

      setEvening({ ...evening, votes: optimisticVotes });

      try {
        if (existingVote) {
          await votesApi.deleteVote(eveningId, existingVote.id);
        } else {
          await votesApi.create(eveningId, { eveningFilmId, value: 1 });
        }
      } catch {
        setEvening(previousEvening);
        throw new Error('Не удалось проголосовать');
      } finally {
        setVotingMovieId(null);
      }
    },
    [eveningId, evening, setEvening]
  );

  return {
    toggleVote,
    votingMovieId,
  };
}

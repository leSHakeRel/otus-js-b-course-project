export type VoteValue = 1 | 2 | 3 | 4 | 5;

export interface Vote {
  readonly id: string;
  readonly eveningFilmId: string;
  readonly userId: string;
  readonly value: VoteValue;
  readonly createdAt: string;
}

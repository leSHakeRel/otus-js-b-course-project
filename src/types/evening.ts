import type { User, Vote, Comment } from './index';

export interface Evening {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly scheduledAt: string;
  readonly isPrivate: boolean;
  readonly createdBy: User;
  readonly movies: EveningMovie[];
  readonly votes: Vote[];
  readonly comments: Comment[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EveningMovie {
  readonly id: string;
  readonly tmdbId: number;
  readonly title: string;
  readonly posterPath: string | null;
  readonly releaseDate: string | null;
  readonly voteCount: number;
  readonly totalVotes: number;
}

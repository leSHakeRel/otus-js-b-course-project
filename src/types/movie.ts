export interface Movie {
  readonly tmdbId: number;
  readonly title: string;
  readonly overview: string;
  readonly posterPath: string | null;
  readonly backdropPath: string | null;
  readonly releaseDate: string | null;
  readonly voteAverage: number;
  readonly voteCount: number;
  readonly genreIds: number[];
}

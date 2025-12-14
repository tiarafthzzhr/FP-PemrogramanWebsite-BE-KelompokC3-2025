export interface IPuzzleJson {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnail?: string;
  rows: number;
  cols: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSec: number;
}

export interface IPuzzleStartResponse {
  sessionId: string;
  gameId: string;
  gameName: string;
  gameJson: IPuzzleJson;
}

export interface IPuzzleSessionData {
  id: string;
  userId: string;
  puzzleId: string;
  startedAt: Date;
  finishedAt?: Date;
  durationSec?: number;
  moveCount: number;
}

export interface IPuzzleFinishResponse {
  message: string;
  sessionId: string;
  startedAt: Date;
  finishedAt: Date;
  totalDuration: number;
  moveCount: number;
  game: {
    id: string;
    title?: string;
    thumbnail?: string;
  };
}

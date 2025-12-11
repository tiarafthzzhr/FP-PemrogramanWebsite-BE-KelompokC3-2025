export interface PuzzleGameJson {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnail?: string;
  rows: number;       
  cols: number;       
  difficulty: "easy" | "medium" | "hard"; 
  timeLimitSec: number;
}

export interface PuzzleStartResponse {
  sessionId: string;
  gameId: string;
  gameJson: PuzzleGameJson;
}

export interface PuzzleSessionData {
  id: string;
  userId: string;
  puzzleId: string;
  startedAt: Date;
  finishedAt?: Date;
  durationSec?: number;
  moveCount: number;
}

export interface PuzzleFinishResponse {
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
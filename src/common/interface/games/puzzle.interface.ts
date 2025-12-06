export interface PuzzleResponse {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnail?: string;
  rows: number;
  cols: number;
  difficulty: string;
  totalPieces: number;
}

export interface PuzzleStartResponse {
  puzzle: PuzzleResponse;
  sessionId: string;
}
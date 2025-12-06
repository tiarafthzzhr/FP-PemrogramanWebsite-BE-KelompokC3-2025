import { z } from "zod";

export const finishPuzzleSchema = z.object({
  puzzleId: z.string().uuid(),
  durationSec: z.number().int().positive(),
  moveCount: z.number().int().min(0).optional().default(0),
});
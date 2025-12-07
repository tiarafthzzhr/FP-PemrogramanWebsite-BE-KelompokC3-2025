import { z } from "zod";

export const finishPuzzleSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  gameId: z.string().uuid("gameId must be a valid UUID"),
  moveCount: z.number().int().min(0).optional().default(0),
}).strict();

export type FinishPuzzlePayload = z.infer<typeof finishPuzzleSchema>;
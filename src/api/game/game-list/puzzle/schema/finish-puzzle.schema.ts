import z from 'zod';

export const FinishPuzzleSchema = z.object({
  sessionId: z.string().uuid(),
  gameId: z.string().uuid(),
  moveCount: z.coerce.number().min(0).optional(),
  timeTaken: z.coerce.number().min(0).optional(), // Time in seconds
});

export type IFinishPuzzle = z.infer<typeof FinishPuzzleSchema>;

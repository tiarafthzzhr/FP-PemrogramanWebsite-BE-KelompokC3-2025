import z from 'zod';

export const StartPuzzleSchema = z.object({
  gameId: z.string().uuid(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export type IStartPuzzle = z.infer<typeof StartPuzzleSchema>;

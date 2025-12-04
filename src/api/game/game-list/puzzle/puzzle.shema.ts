import { z } from "zod";

export const checkPuzzleAnswerSchema = z.object({
  id: z.string().uuid(),
  answer: z.string().min(1),
});

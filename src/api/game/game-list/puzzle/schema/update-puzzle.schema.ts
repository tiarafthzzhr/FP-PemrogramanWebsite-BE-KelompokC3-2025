import z from 'zod';

import { fileArraySchema, fileSchema, StringToBooleanSchema } from '@/common';

export const UpdatePuzzleSchema = z.object({
  name: z.string().max(128).trim().optional(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  files_to_upload: fileArraySchema({
    max_size: 2 * 1024 * 1024,
    min_amount: 1,
    max_amount: 1,
  }).optional(),
  is_publish: StringToBooleanSchema.optional(),
  rows: z.coerce.number().min(2).max(10).optional(),
  cols: z.coerce.number().min(2).max(10).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export type IUpdatePuzzle = z.infer<typeof UpdatePuzzleSchema>;

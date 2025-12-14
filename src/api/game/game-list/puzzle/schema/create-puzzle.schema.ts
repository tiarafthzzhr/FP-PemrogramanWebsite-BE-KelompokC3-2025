import z from 'zod';

import { fileArraySchema, fileSchema, StringToBooleanSchema } from '@/common';

export const CreatePuzzleSchema = z.object({
  name: z.string().max(128).trim(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}),
  files_to_upload: fileArraySchema({
    max_size: 2 * 1024 * 1024,
    min_amount: 1,
    max_amount: 1,
  }),
  is_publish_immediately: StringToBooleanSchema.default(false),
  rows: z.coerce.number().min(2).max(10).default(3),
  cols: z.coerce.number().min(2).max(10).default(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export type ICreatePuzzle = z.infer<typeof CreatePuzzleSchema>;

import { z } from 'zod'

export const addScoreSchema = z.object({
  score: z
    .number({ required_error: 'Score is required', invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(1, 'Minimum Stableford score is 1')
    .max(45, 'Maximum Stableford score is 45'),

  date: z
    .string({ required_error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' })
    .refine(
      (d) => new Date(d) <= new Date(),
      { message: 'Score date cannot be in the future' }
    ),

  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
})

console.log(addScoreSchema.safeParse({ score: 17, date: '2026-06-19', notes: '' }))
console.log(addScoreSchema.safeParse({ score: 17, date: '2026-06-19', notes: null }))
console.log(addScoreSchema.safeParse({ score: NaN, date: '2026-06-19', notes: '' }))
console.log(addScoreSchema.safeParse({ score: 17, date: '19-06-2026', notes: '' }))

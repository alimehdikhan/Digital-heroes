import { z } from 'zod'

export const runDrawSchema = z.object({
  month: z
    .number({ required_error: 'Month is required' })
    .int()
    .min(1, 'Month must be 1–12')
    .max(12, 'Month must be 1–12'),

  year: z
    .number({ required_error: 'Year is required' })
    .int()
    .min(2024, 'Year must be 2024 or later'),

  mode: z.enum(['random', 'algorithmic'], {
    required_error: 'Draw mode is required',
    invalid_type_error: 'Mode must be "random" or "algorithmic"',
  }),

  charityId: z
    .string()
    .uuid('Invalid charity ID')
    .optional(),

  charityPercentage: z
    .number()
    .min(10, 'Charity contribution cannot be less than 10%')
    .max(50, 'Charity contribution cannot exceed 50%')
    .optional()
    .default(10),
})

export type RunDrawInput = z.infer<typeof runDrawSchema>

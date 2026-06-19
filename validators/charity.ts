import { z } from 'zod'

export const createCharitySchema = z.object({
  name: z
    .string({ required_error: 'Charity name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),

  logoUrl: z
    .string()
    .url('Logo must be a valid URL')
    .optional()
    .or(z.literal('')),

  websiteUrl: z
    .string()
    .url('Website must be a valid URL')
    .optional()
    .or(z.literal('')),

  registeredNumber: z
    .string()
    .max(50, 'Registered number too long')
    .optional(),
})

export const updateCharitySchema = createCharitySchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateCharityInput = z.infer<typeof createCharitySchema>
export type UpdateCharityInput = z.infer<typeof updateCharitySchema>

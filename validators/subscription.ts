import { z } from 'zod'

export const createCheckoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly'], {
    required_error: 'Subscription plan is required',
  }),
})

export const updateUserSchema = z.object({
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  subscriptionStatus: z
    .enum(['active', 'inactive', 'cancelled', 'trialing', 'past_due'])
    .optional(),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

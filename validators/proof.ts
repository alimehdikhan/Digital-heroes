import { z } from 'zod'

export const reviewProofSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    required_error: 'Review status is required',
  }),
  adminNote: z
    .string()
    .max(500, 'Note cannot exceed 500 characters')
    .optional(),
})

export const uploadProofSchema = z.object({
  drawWinnerId: z.string().uuid('Invalid draw winner ID'),
  drawId: z.string().uuid('Invalid draw ID'),
})

// File validation (used on the client before upload)
export const proofFileSchema = z
  .instanceof(File)
  .refine(
    (f) => f.size <= 10 * 1024 * 1024,
    'File must be smaller than 10 MB'
  )
  .refine(
    (f) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type),
    'File must be a JPEG, PNG, WebP, or PDF'
  )

export type ReviewProofInput = z.infer<typeof reviewProofSchema>
export type UploadProofInput = z.infer<typeof uploadProofSchema>

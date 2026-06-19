/**
 * Structured application error for consistent API responses.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/** Common error factory functions */
export const errors = {
  unauthorized: (message = 'Authentication required') =>
    new AppError('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Access denied') =>
    new AppError('FORBIDDEN', message, 403),

  notFound: (entity = 'Resource') =>
    new AppError('NOT_FOUND', `${entity} not found`, 404),

  conflict: (message: string) =>
    new AppError('CONFLICT', message, 409),

  validation: (message: string, details?: unknown) =>
    new AppError('VALIDATION_ERROR', message, 422, details),

  internal: (message = 'An unexpected error occurred') =>
    new AppError('INTERNAL_ERROR', message, 500),

  subscriptionRequired: () =>
    new AppError(
      'SUBSCRIPTION_REQUIRED',
      'An active subscription is required to perform this action',
      403
    ),
}

/**
 * Format any error into a consistent API response shape.
 */
export function formatApiError(err: unknown): {
  error: { code: string; message: string; details?: unknown }
  status: number
} {
  if (err instanceof AppError) {
    return {
      error: { code: err.code, message: err.message, details: err.details },
      status: err.statusCode,
    }
  }
  if (err instanceof Error) {
    return {
      error: { code: 'INTERNAL_ERROR', message: err.message },
      status: 500,
    }
  }
  return {
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    status: 500,
  }
}

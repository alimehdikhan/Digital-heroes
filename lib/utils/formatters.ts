/**
 * Shared utility — format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a score with ordinal suffix for display
 */
export function formatScore(score: number): string {
  return `${score} pts`
}

/**
 * Format a date string to readable form
 */
export function formatDate(
  date: string | Date,
  locale: string = 'en-GB'
): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Format draw month/year to readable string
 */
export function formatDrawPeriod(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str
}

/**
 * Map subscription status to display label
 */
export function formatSubscriptionStatus(
  status: string
): { label: string; color: 'green' | 'yellow' | 'red' | 'gray' } {
  switch (status) {
    case 'active':    return { label: 'Active Hero',   color: 'green'  }
    case 'trialing':  return { label: 'Trial',         color: 'yellow' }
    case 'past_due':  return { label: 'Payment Due',   color: 'yellow' }
    case 'cancelled': return { label: 'Cancelled',     color: 'red'    }
    default:          return { label: 'Inactive',      color: 'gray'   }
  }
}

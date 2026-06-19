/**
 * Date utility helpers for the draw system.
 */

/** Get the current draw month and year */
export function getCurrentDrawPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

/** Get the first and last day of a month as ISO date strings */
export function getMonthDateRange(
  month: number,
  year: number
): { startDate: string; endDate: string } {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)  // day 0 = last day of previous month

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

/** Check if a date string (YYYY-MM-DD) is in the past or today */
export function isValidScoreDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date <= today
}

/** Returns the ISO date string for today (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Get the previous month's period */
export function getPrevDrawPeriod(
  month: number,
  year: number
): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

/** Format as "June 2026" */
export function drawPeriodLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

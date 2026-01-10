import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================================================
// Date Utility Functions for Availability System
// =============================================================================

/**
 * Get the next N occurrences of a specific day of the week
 * @param dayOfWeek 0-6 (Sunday-Saturday)
 * @param count Number of occurrences to find
 * @param startDate Optional start date (defaults to today)
 * @returns Array of dates
 */
export function getNextDaysOfWeek(
  dayOfWeek: number,
  count: number,
  startDate: Date = new Date()
): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  
  // Find the next occurrence of the target day
  const daysUntilTarget = (dayOfWeek - current.getDay() + 7) % 7 || 7
  current.setDate(current.getDate() + daysUntilTarget)
  
  for (let i = 0; i < count; i++) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 7) // Move to next week
  }
  
  return dates
}

/**
 * Get the next N Saturdays
 * @param count Number of Saturdays to find
 * @param startDate Optional start date (defaults to today)
 * @returns Array of Saturday dates
 */
export function getNextSaturdays(count: number, startDate?: Date): Date[] {
  return getNextDaysOfWeek(6, count, startDate) // 6 = Saturday
}

/**
 * Check if a date falls on a specific day of the week
 * @param date Date to check
 * @param dayOfWeek 0-6 (Sunday-Saturday)
 * @returns True if the date is on the specified day of the week
 */
export function isDayOfWeek(date: string | Date, dayOfWeek: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getDay() === dayOfWeek
}

/**
 * Check if a date is a Saturday
 * @param date Date to check
 * @returns True if the date is a Saturday
 */
export function isSaturday(date: string | Date): boolean {
  return isDayOfWeek(date, 6)
}

/**
 * Format date for database (YYYY-MM-DD)
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse database date string to Date object
 * @param dateString YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateFromDB(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get all dates between start and end that match the specified days of week
 * @param startDate Start date
 * @param endDate End date
 * @param daysOfWeek Array of days (0-6)
 * @returns Array of matching dates
 */
export function getDatesBetween(
  startDate: Date,
  endDate: Date,
  daysOfWeek: number[]
): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  while (current <= end) {
    if (daysOfWeek.includes(current.getDay())) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns True if the date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * Check if a date is today
 * @param date Date to check
 * @returns True if the date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

/**
 * Format date for display (e.g., "Saturday, Jan 18, 2026")
 * @param date Date to format
 * @param locale Locale string (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  date: string | Date,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get a human-readable relative date (e.g., "this Saturday", "next Saturday")
 * @param date Date to format
 * @returns Relative date string
 */
export function getRelativeDateString(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  
  const diffTime = d.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `This ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
  if (diffDays < 14) return `Next ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
  
  return formatDateForDisplay(d)
}

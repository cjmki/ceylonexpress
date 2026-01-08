/**
 * Format a date string to include the day of the week
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date with day of week (e.g., "Monday, 2024-01-15")
 */
export function formatDateWithDay(dateString: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  
  return `${dayName}, ${dateString}`
}

/**
 * Format a date string in a more readable format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date (e.g., "Monday, 15 Jan 2024")
 */
export function formatDateReadable(dateString: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString + 'T00:00:00')
  
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

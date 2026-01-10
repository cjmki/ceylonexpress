/**
 * Common validation schemas used across the application
 */
import { z } from 'zod'

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid ID format')

/**
 * Email validation with normalization
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase()
  .trim()
  .max(255, 'Email is too long')

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^\+?[0-9\s\-()]{8,20}$/,
    'Invalid phone number format (use digits, spaces, +, -, or parentheses)'
  )
  .trim()
  .transform(val => val.replace(/\s+/g, ' ')) // Normalize multiple spaces

/**
 * Name validation (customer, menu item names)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .trim()
  .regex(
    /^[a-zA-Z0-9\s\-'åäöÅÄÖ&.,()/]+$/,
    'Name contains invalid characters'
  )

/**
 * Description/Notes validation (sanitized text)
 */
export const textSchema = z
  .string()
  .max(1000, 'Text is too long')
  .trim()
  .optional()
  .transform(val => {
    if (!val) return val
    // Basic XSS prevention - strip potential HTML tags
    return val.replace(/<[^>]*>/g, '')
  })

/**
 * Address validation
 */
export const addressSchema = z
  .string()
  .min(10, 'Address must be at least 10 characters')
  .max(500, 'Address is too long')
  .trim()
  .regex(
    /^[a-zA-Z0-9\s\-,.'åäöÅÄÖ]+$/,
    'Address contains invalid characters'
  )

/**
 * URL validation (for image URLs)
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .startsWith('https://', 'URL must use HTTPS')
  .max(2000, 'URL is too long')
  .optional()
  .or(z.literal(''))

/**
 * Price validation (positive number with max 2 decimals)
 */
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .max(100000, 'Price is too high')
  .refine(
    val => Number.isFinite(val) && Math.round(val * 100) / 100 === val,
    'Price can have at most 2 decimal places'
  )

/**
 * Quantity validation
 */
export const quantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .positive('Quantity must be positive')
  .max(100, 'Quantity cannot exceed 100')

/**
 * Date validation (future dates only)
 */
export const futureDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
  .refine(
    val => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    },
    'Date must be today or in the future'
  )

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().min(1).max(100).default(10),
})

/**
 * Sort order validation
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')

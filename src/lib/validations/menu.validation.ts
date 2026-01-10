/**
 * Menu item validation schemas
 */
import { z } from 'zod'
import {
  uuidSchema,
  nameSchema,
  textSchema,
  urlSchema,
  priceSchema,
} from './common.validation'
import { MenuCategory } from '../../../app/constants/enums'

/**
 * Menu item includes array validation
 */
export const menuItemIncludesSchema = z
  .array(
    z
      .string()
      .min(1, 'Include item cannot be empty')
      .max(200, 'Include item is too long')
      .trim()
  )
  .max(20, 'Too many include items')
  .optional()

/**
 * Create menu item validation schema
 */
export const createMenuItemSchema = z.object({
  name: nameSchema,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description is too long')
    .trim()
    .transform(val => {
      // Basic XSS prevention
      return val.replace(/<[^>]*>/g, '')
    }),
  price: priceSchema,
  category: z.nativeEnum(MenuCategory),
  image_url: urlSchema,
  available: z.boolean().default(true),
  includes: menuItemIncludesSchema,
  has_limited_availability: z.boolean().default(false).optional(),
  pre_orders_only: z.boolean().default(false).optional(),
})

/**
 * Update menu item validation schema (all fields optional)
 */
export const updateMenuItemSchema = z.object({
  id: uuidSchema,
  data: z.object({
    name: nameSchema.optional(),
    description: z
      .string()
      .trim()
      .transform(val => {
        if (!val) return val
        // Validate length after trimming
        if (val.length < 10) throw new Error('Description must be at least 10 characters')
        if (val.length > 500) throw new Error('Description is too long')
        // Basic XSS prevention
        return val.replace(/<[^>]*>/g, '')
      }),
    price: priceSchema.optional(),
    category: z.nativeEnum(MenuCategory).optional(),
    image_url: z
      .string()
      .trim()
      .optional()
      .transform(val => val || undefined) // Convert empty string to undefined
      .pipe(
        z
          .string()
          .url('Invalid URL format')
          .startsWith('https://', 'URL must use HTTPS')
          .max(2000, 'URL is too long')
          .optional()
      ),
    available: z.boolean().optional(),
    includes: z
      .array(
        z
          .string()
          .min(1, 'Include item cannot be empty')
          .max(100, 'Include item is too long')
          .trim()
      )
      .max(20, 'Too many include items')
      .optional()
      .transform(val => {
        if (!val || val.length === 0) return undefined
        return val
      }),
    has_limited_availability: z.boolean().optional(),
    pre_orders_only: z.boolean().optional(),
  }).refine(
    data => Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined).length > 0,
    'At least one field must be provided for update'
  ),
})

/**
 * Delete menu item validation schema
 */
export const deleteMenuItemSchema = z.object({
  id: uuidSchema,
})

/**
 * Get menu item by ID validation schema
 */
export const getMenuItemByIdSchema = z.object({
  id: uuidSchema,
})

/**
 * Availability slot validation schema
 */
export const availabilitySlotSchema = z.object({
  date: z.string().refine(
    (date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today && !isNaN(d.getTime())
    },
    'Date must be valid and not in the past'
  ),
  maxOrders: z.number().int().min(1).max(100),
})

/**
 * Set availability schedule for a menu item
 */
export const setAvailabilitySchema = z.object({
  menuItemId: uuidSchema,
  slots: z.array(availabilitySlotSchema).min(1, 'At least one availability slot is required'),
})

/**
 * Generate availability schedule (bulk create)
 */
export const generateAvailabilitySchema = z.object({
  menuItemId: uuidSchema,
  startDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid start date'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid end date'
  ),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, 'At least one day of week is required'),
  maxOrders: z.number().int().min(1).max(100),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  'Start date must be before or equal to end date'
)

/**
 * Check availability for cart items
 */
export const checkAvailabilitySchema = z.object({
  cartItems: z.array(z.object({
    id: uuidSchema,
    quantity: z.number().int().min(1),
  })).min(1),
  deliveryDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid delivery date'
  ),
})

/**
 * Get availability for menu item
 */
export const getAvailabilitySchema = z.object({
  menuItemId: uuidSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

/**
 * Update availability slot
 */
export const updateAvailabilitySlotSchema = z.object({
  slotId: uuidSchema,
  maxOrders: z.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
}).refine(
  data => data.maxOrders !== undefined || data.isActive !== undefined,
  'At least one field (maxOrders or isActive) must be provided'
)

/**
 * Delete availability slot
 */
export const deleteAvailabilitySlotSchema = z.object({
  slotId: uuidSchema,
})

/**
 * Type exports for TypeScript
 */
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>
export type DeleteMenuItemInput = z.infer<typeof deleteMenuItemSchema>
export type GetMenuItemByIdInput = z.infer<typeof getMenuItemByIdSchema>
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
export type GenerateAvailabilityInput = z.infer<typeof generateAvailabilitySchema>
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>
export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>
export type UpdateAvailabilitySlotInput = z.infer<typeof updateAvailabilitySlotSchema>
export type DeleteAvailabilitySlotInput = z.infer<typeof deleteAvailabilitySlotSchema>
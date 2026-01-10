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
      .max(100, 'Include item is too long')
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
 * Type exports for TypeScript
 */
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>
export type DeleteMenuItemInput = z.infer<typeof deleteMenuItemSchema>
export type GetMenuItemByIdInput = z.infer<typeof getMenuItemByIdSchema>

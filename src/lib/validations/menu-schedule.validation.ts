/**
 * Menu schedule / live menu updates validation schemas
 */
import { z } from 'zod'
import { uuidSchema, nameSchema } from './common.validation'

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .refine(
    (date) => {
      const d = new Date(date)
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date
    },
    'Invalid date'
  )

export const menuUpdateItemSchema = z.object({
  menu_item_id: uuidSchema,
  menu_item_name: nameSchema,
  max_orders: z.number().int().min(1, 'Max orders must be at least 1').max(999, 'Max orders must be at most 999'),
  dates: z
    .array(dateStringSchema)
    .min(1, 'At least one date is required'),
})

export const applyMenuUpdatesSchema = z.object({
  items: z.array(menuUpdateItemSchema).min(1, 'At least one menu item is required'),
})

export const scheduleMenuUpdateSchema = z.object({
  items: z.array(menuUpdateItemSchema).min(1, 'At least one menu item is required'),
  scheduledFor: z
    .string()
    .datetime({ message: 'Must be a valid ISO 8601 datetime' })
    .refine(
      (s) => new Date(s) > new Date(),
      'Scheduled time must be in the future'
    ),
  notes: z.string().max(500).optional(),
})

export const cancelScheduledUpdateSchema = z.object({
  id: uuidSchema,
})

export const deleteScheduledUpdateSchema = z.object({
  id: uuidSchema,
})

export type MenuUpdateItem = z.infer<typeof menuUpdateItemSchema>
export type ApplyMenuUpdatesInput = z.infer<typeof applyMenuUpdatesSchema>
export type ScheduleMenuUpdateInput = z.infer<typeof scheduleMenuUpdateSchema>
export type CancelScheduledUpdateInput = z.infer<typeof cancelScheduledUpdateSchema>
export type DeleteScheduledUpdateInput = z.infer<typeof deleteScheduledUpdateSchema>

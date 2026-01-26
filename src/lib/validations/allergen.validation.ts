import { z } from 'zod'

// ==================== Allergens ====================

export const getAllergensSchema = z.object({
  activeOnly: z.boolean().optional().default(true),
})

export const updateAllergenSchema = z.object({
  id: z.number().int().positive('Invalid allergen ID'),
  data: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    iconEmoji: z.string().max(10).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
})

export const getMenuItemAllergensSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
})

// Export types
export type UpdateAllergenInput = z.infer<typeof updateAllergenSchema>
export type GetMenuItemAllergensInput = z.infer<typeof getMenuItemAllergensSchema>

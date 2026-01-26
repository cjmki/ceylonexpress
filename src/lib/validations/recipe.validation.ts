import { z } from 'zod'

// ==================== Recipes ====================

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  portionSize: z.string().max(100, 'Portion size too long').optional(),
  preparationTime: z.number().int().min(0, 'Preparation time cannot be negative').optional(),
  cookingTime: z.number().int().min(0, 'Cooking time cannot be negative').optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
})

export const updateRecipeSchema = z.object({
  id: z.number().int().positive('Invalid recipe ID'),
  data: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    portionSize: z.string().max(100).optional(),
    preparationTime: z.number().int().min(0).optional(),
    cookingTime: z.number().int().min(0).optional(),
    instructions: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
})

export const deleteRecipeSchema = z.object({
  id: z.number().int().positive('Invalid recipe ID'),
})

export const getRecipeSchema = z.object({
  id: z.number().int().positive('Invalid recipe ID'),
})

// ==================== Recipe Ingredients ====================

export const addRecipeIngredientSchema = z.object({
  recipeId: z.number().int().positive('Invalid recipe ID'),
  stockItemId: z.number().int().positive('Invalid stock item ID'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit too long'),
  notes: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
})

export const updateRecipeIngredientSchema = z.object({
  id: z.number().int().positive('Invalid ingredient ID'),
  data: z.object({
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).max(50).optional(),
    notes: z.string().optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
})

export const deleteRecipeIngredientSchema = z.object({
  id: z.number().int().positive('Invalid ingredient ID'),
})

export const getRecipeIngredientsSchema = z.object({
  recipeId: z.number().int().positive('Invalid recipe ID'),
})

// ==================== Menu Item Recipe Linking ====================

export const linkRecipeToMenuItemSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  recipeId: z.number().int().positive('Invalid recipe ID').nullable(),
  allergenInfoProvided: z.boolean().default(false),
})

// ==================== Calculate Ingredient Requirements ====================

export const calculateIngredientRequirementsSchema = z.object({
  orderIds: z.array(z.number().int().positive('Invalid order ID')),
})

// Export types
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type AddRecipeIngredientInput = z.infer<typeof addRecipeIngredientSchema>
export type UpdateRecipeIngredientInput = z.infer<typeof updateRecipeIngredientSchema>
export type LinkRecipeToMenuItemInput = z.infer<typeof linkRecipeToMenuItemSchema>

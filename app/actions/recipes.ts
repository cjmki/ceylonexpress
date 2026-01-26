'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth/middleware'
import {
  safeValidate,
  createRecipeSchema,
  updateRecipeSchema,
  deleteRecipeSchema,
  getRecipeSchema,
  addRecipeIngredientSchema,
  updateRecipeIngredientSchema,
  deleteRecipeIngredientSchema,
  getRecipeIngredientsSchema,
  linkRecipeToMenuItemSchema,
  calculateIngredientRequirementsSchema,
} from '@/lib/validations'

// ==================== Recipes ====================

export async function getAllRecipes(options?: { activeOnly?: boolean }) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('recipes')
      .select('*')
      .order('name', { ascending: true })
    
    if (options?.activeOnly !== false) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch recipes', data: [] }
  }
}

export async function getRecipe(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getRecipeSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipes')
      .select('*')
      .eq('id', validatedId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch recipe:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to fetch recipe' }
  }
}

export async function createRecipe(recipeData: {
  name: string
  description?: string
  portionSize?: string
  preparationTime?: number
  cookingTime?: number
  instructions?: string
  notes?: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(createRecipeSchema, recipeData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipes')
      .insert([{
        name: validatedData.name,
        description: validatedData.description || null,
        portion_size: validatedData.portionSize || null,
        preparation_time: validatedData.preparationTime || null,
        cooking_time: validatedData.cookingTime || null,
        instructions: validatedData.instructions || null,
        notes: validatedData.notes || null,
        is_active: true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Recipe created successfully' }
  } catch (error) {
    console.error('Failed to create recipe:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to create recipe' }
  }
}

export async function updateRecipe(id: number, recipeData: {
  name?: string
  description?: string
  portionSize?: string
  preparationTime?: number
  cookingTime?: number
  instructions?: string
  notes?: string
  isActive?: boolean
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateRecipeSchema, { id, data: recipeData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Map camelCase to snake_case
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.portionSize !== undefined) updateData.portion_size = validatedData.portionSize
    if (validatedData.preparationTime !== undefined) updateData.preparation_time = validatedData.preparationTime
    if (validatedData.cookingTime !== undefined) updateData.cooking_time = validatedData.cookingTime
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    
    const { data, error } = await serverClient
      .from('recipes')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Recipe updated successfully' }
  } catch (error) {
    console.error('Failed to update recipe:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update recipe' }
  }
}

export async function deleteRecipe(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteRecipeSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Soft delete by setting is_active to false
    const { error } = await serverClient
      .from('recipes')
      .update({ is_active: false })
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, message: 'Recipe deleted successfully' }
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete recipe' }
  }
}

// ==================== Recipe Ingredients ====================

export async function getRecipeIngredients(recipeId: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getRecipeIngredientsSchema, { recipeId })
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const { recipeId: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipe_ingredients')
      .select('*, stock_items(*)')
      .eq('recipe_id', validatedId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch recipe ingredients:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch ingredients', data: [] }
  }
}

export async function addRecipeIngredient(ingredientData: {
  recipeId: number
  stockItemId: number
  quantity: number
  unit: string
  notes?: string
  displayOrder?: number
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(addRecipeIngredientSchema, ingredientData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipe_ingredients')
      .insert([{
        recipe_id: validatedData.recipeId,
        stock_item_id: validatedData.stockItemId,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        notes: validatedData.notes || null,
        display_order: validatedData.displayOrder || 0,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Ingredient added successfully' }
  } catch (error) {
    console.error('Failed to add ingredient:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to add ingredient' }
  }
}

export async function updateRecipeIngredient(id: number, ingredientData: {
  quantity?: number
  unit?: string
  notes?: string
  displayOrder?: number
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateRecipeIngredientSchema, { id, data: ingredientData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const updateData: any = {}
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.displayOrder !== undefined) updateData.display_order = validatedData.displayOrder
    
    const { data, error } = await serverClient
      .from('recipe_ingredients')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Ingredient updated successfully' }
  } catch (error) {
    console.error('Failed to update ingredient:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update ingredient' }
  }
}

export async function deleteRecipeIngredient(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteRecipeIngredientSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { error } = await serverClient
      .from('recipe_ingredients')
      .delete()
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, message: 'Ingredient removed successfully' }
  } catch (error) {
    console.error('Failed to delete ingredient:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to remove ingredient' }
  }
}

// ==================== Recipe Allergens ====================

export async function getRecipeAllergens(recipeId: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipe_allergen_summary')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()
    
    if (error) {
      // If no allergens, return empty arrays
      if (error.code === 'PGRST116') {
        return { 
          success: true, 
          data: { 
            allergen_names: [], 
            allergen_icons: [], 
            allergen_codes: [],
            allergen_count: 0 
          } 
        }
      }
      throw error
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch recipe allergens:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to fetch allergens' }
  }
}

// ==================== Menu Item Recipe Linking ====================

export async function linkRecipeToMenuItem(menuItemId: string, recipeId: number | null, allergenInfoProvided: boolean = false) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(linkRecipeToMenuItemSchema, { 
      menuItemId, 
      recipeId, 
      allergenInfoProvided 
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('menu_items')
      .update({ 
        recipe_id: validatedData.recipeId,
        allergen_info_provided: validatedData.allergenInfoProvided
      })
      .eq('id', validatedData.menuItemId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Recipe linked successfully' }
  } catch (error) {
    console.error('Failed to link recipe:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to link recipe' }
  }
}

// ==================== Recipe with Full Details ====================

export async function getRecipeWithDetails(recipeId: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    // Get recipe
    const recipeResult = await getRecipe(recipeId)
    if (!recipeResult.success) {
      return recipeResult
    }
    
    // Get ingredients
    const ingredientsResult = await getRecipeIngredients(recipeId)
    if (!ingredientsResult.success) {
      return ingredientsResult
    }
    
    // Get allergens
    const allergensResult = await getRecipeAllergens(recipeId)
    if (!allergensResult.success) {
      return allergensResult
    }
    
    // Get cost from view
    const { data: costData } = await serverClient
      .from('recipe_costs')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()
    
    return {
      success: true,
      data: {
        recipe: recipeResult.data,
        ingredients: ingredientsResult.data,
        allergens: allergensResult.data,
        cost: costData || { total_cost: 0, cost_per_portion: 0, ingredient_count: 0 }
      }
    }
  } catch (error) {
    console.error('Failed to fetch recipe details:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to fetch recipe details' }
  }
}

// ==================== Calculate Ingredient Requirements ====================

export async function calculateIngredientRequirements(orderIds: number[]) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(calculateIngredientRequirementsSchema, { orderIds })
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const { orderIds: validatedIds } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Use the database function if available
    const { data, error } = await serverClient
      .rpc('calculate_ingredient_requirements', { p_order_ids: validatedIds })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to calculate ingredient requirements:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to calculate requirements', data: [] }
  }
}

export async function getMenuItemIngredientsForOrders(orderIds: number[]) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    // Get orders with their items
    const { data: orders, error: ordersError } = await serverClient
      .from('orders')
      .select('id, order_items(menu_item_id, menu_item_name, quantity)')
      .in('id', orderIds)
    
    if (ordersError) throw ordersError
    
    // Get unique menu item IDs
    const menuItemIds = new Set<string>()
    const menuItemQuantities: Record<string, { name: string, quantity: number }> = {}
    
    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        menuItemIds.add(item.menu_item_id)
        if (!menuItemQuantities[item.menu_item_id]) {
          menuItemQuantities[item.menu_item_id] = {
            name: item.menu_item_name,
            quantity: 0
          }
        }
        menuItemQuantities[item.menu_item_id].quantity += item.quantity
      })
    })
    
    // Get menu items with recipes
    const { data: menuItems, error: menuError } = await serverClient
      .from('menu_items')
      .select('id, name, recipe_id')
      .in('id', Array.from(menuItemIds))
      .not('recipe_id', 'is', null)
    
    if (menuError) throw menuError
    
    // For each menu item with recipe, get its ingredients
    const menuItemIngredients = await Promise.all(
      (menuItems || []).map(async (menuItem) => {
        const { data: recipeIngredients, error: ingredientsError } = await serverClient
          .from('recipe_ingredients')
          .select('*, stock_items(*)')
          .eq('recipe_id', menuItem.recipe_id)
        
        if (ingredientsError) throw ingredientsError
        
        const quantity = menuItemQuantities[menuItem.id]?.quantity || 0
        
        return {
          menu_item_id: menuItem.id,
          menu_item_name: menuItem.name,
          total_portions: quantity,
          ingredients: (recipeIngredients || []).map((ing: any) => ({
            stock_item_id: ing.stock_item_id,
            stock_item_name: ing.stock_items.name,
            quantity_per_portion: ing.quantity,
            unit: ing.unit,
            total_needed: ing.quantity * quantity,
            current_stock: ing.stock_items.current_quantity,
            minimum_threshold: ing.stock_items.minimum_threshold
          }))
        }
      })
    )
    
    return { success: true, data: menuItemIngredients }
  } catch (error) {
    console.error('Failed to get menu item ingredients:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to get ingredients', data: [] }
  }
}

// ==================== Get All Recipes with Allergens ====================

export async function getAllRecipesWithAllergens() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('recipe_allergen_summary')
      .select('*')
      .order('recipe_name', { ascending: true })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch recipes with allergens:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch recipes', data: [] }
  }
}

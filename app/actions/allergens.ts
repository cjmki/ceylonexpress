'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth/middleware'
import {
  safeValidate,
  getAllergensSchema,
  updateAllergenSchema,
  getMenuItemAllergensSchema,
} from '@/lib/validations'

// ==================== Get All Allergens ====================

export async function getAllAllergens(options?: { activeOnly?: boolean }) {
  'use server'
  
  try {
    // Allergens are public data, no auth required for reading
    const validation = safeValidate(getAllergensSchema, options || {})
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const { activeOnly } = validation.data
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('allergens')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch allergens:', error)
    return { success: false, error: 'Failed to fetch allergens', data: [] }
  }
}

// ==================== Update Allergen ====================

export async function updateAllergen(id: number, allergenData: {
  name?: string
  description?: string
  iconEmoji?: string
  displayOrder?: number
  isActive?: boolean
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateAllergenSchema, { id, data: allergenData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Map camelCase to snake_case
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.iconEmoji !== undefined) updateData.icon_emoji = validatedData.iconEmoji
    if (validatedData.displayOrder !== undefined) updateData.display_order = validatedData.displayOrder
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    
    const { data, error } = await serverClient
      .from('allergens')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Allergen updated successfully' }
  } catch (error) {
    console.error('Failed to update allergen:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update allergen' }
  }
}

// ==================== Get Menu Item Allergens ====================

export async function getMenuItemAllergens(menuItemId: string) {
  'use server'
  
  try {
    const validation = safeValidate(getMenuItemAllergensSchema, { menuItemId })
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: { allergens: [] } }
    }

    const { menuItemId: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Use the database view for efficient querying
    const { data, error } = await serverClient
      .from('menu_items_with_allergens')
      .select('*')
      .eq('menu_item_id', validatedId)
      .single()
    
    if (error) {
      // If menu item has no recipe, return empty allergens
      if (error.code === 'PGRST116') {
        return { success: true, data: { allergens: [] } }
      }
      throw error
    }
    
    // Transform the arrays into allergen objects
    const allergens = []
    const ids = data.allergen_ids || []
    const names = data.allergen_names || []
    const codes = data.allergen_codes || []
    const icons = data.allergen_icons || []
    
    for (let i = 0; i < ids.length; i++) {
      if (ids[i]) {
        allergens.push({
          allergen_id: ids[i],
          allergen_name: names[i],
          allergen_code: codes[i],
          icon_emoji: icons[i]
        })
      }
    }
    
    return { 
      success: true, 
      data: {
        allergens: allergens
      }
    }
  } catch (error) {
    console.error('Failed to fetch menu item allergens:', error)
    return { success: false, error: 'Failed to fetch allergens', data: { allergens: [] } }
  }
}

// ==================== Get Allergen Statistics ====================

export async function getAllergenStats() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    // Get count of menu items per allergen
    const { data, error } = await serverClient.rpc('get_allergen_usage_stats')
    
    if (error) {
      // If function doesn't exist, do a manual query
      const { data: viewData, error: viewError } = await serverClient
        .from('menu_items_with_allergens')
        .select('allergen_codes')
      
      if (viewError) throw viewError
      
      // Count allergens manually
      const allergenCounts: Record<string, number> = {}
      viewData?.forEach((item: any) => {
        item.allergen_codes?.forEach((code: string) => {
          allergenCounts[code] = (allergenCounts[code] || 0) + 1
        })
      })
      
      return { success: true, data: allergenCounts }
    }
    
    return { success: true, data: data || {} }
  } catch (error) {
    console.error('Failed to fetch allergen stats:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: {} }
    }
    
    return { success: false, error: 'Failed to fetch statistics', data: {} }
  }
}

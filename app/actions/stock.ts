'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth/middleware'
import {
  safeValidate,
  createStockItemSchema,
  updateStockItemSchema,
  deleteStockItemSchema,
  getStockItemSchema,
  adjustStockSchema,
  setStockAllergensSchema,
  getStockTransactionsSchema,
  getLowStockItemsSchema,
} from '@/lib/validations'

// ==================== Stock Items ====================

export async function getAllStockItems(options?: { activeOnly?: boolean }) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('stock_items')
      .select('*')
      .order('name', { ascending: true })
    
    if (options?.activeOnly !== false) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch stock items:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch stock items', data: [] }
  }
}

export async function getStockItem(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getStockItemSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('stock_items')
      .select('*')
      .eq('id', validatedId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch stock item:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to fetch stock item' }
  }
}

export async function createStockItem(itemData: {
  name: string
  description?: string
  unit: string
  currentQuantity?: number
  minimumThreshold?: number
  unitCost?: number
  supplier?: string
  supplierCode?: string
  storageLocation?: string
  notes?: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(createStockItemSchema, itemData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('stock_items')
      .insert([{
        name: validatedData.name,
        description: validatedData.description || null,
        unit: validatedData.unit,
        current_quantity: validatedData.currentQuantity || 0,
        minimum_threshold: validatedData.minimumThreshold || 0,
        unit_cost: validatedData.unitCost || null,
        supplier: validatedData.supplier || null,
        supplier_code: validatedData.supplierCode || null,
        storage_location: validatedData.storageLocation || null,
        notes: validatedData.notes || null,
        is_active: true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    // Log initial stock transaction if quantity > 0
    if (validatedData.currentQuantity && validatedData.currentQuantity > 0) {
      await serverClient.from('stock_transactions').insert([{
        stock_item_id: data.id,
        transaction_type: 'INITIAL',
        quantity_change: validatedData.currentQuantity,
        quantity_before: 0,
        quantity_after: validatedData.currentQuantity,
        reference_type: 'MANUAL',
        notes: 'Initial stock entry',
        created_by: 'admin',
      }])
    }
    
    return { success: true, data, message: 'Stock item created successfully' }
  } catch (error) {
    console.error('Failed to create stock item:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to create stock item' }
  }
}

export async function updateStockItem(id: number, itemData: {
  name?: string
  description?: string
  unit?: string
  currentQuantity?: number
  minimumThreshold?: number
  unitCost?: number
  supplier?: string
  supplierCode?: string
  storageLocation?: string
  notes?: string
  isActive?: boolean
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateStockItemSchema, { id, data: itemData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Map camelCase to snake_case
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit
    if (validatedData.currentQuantity !== undefined) updateData.current_quantity = validatedData.currentQuantity
    if (validatedData.minimumThreshold !== undefined) updateData.minimum_threshold = validatedData.minimumThreshold
    if (validatedData.unitCost !== undefined) updateData.unit_cost = validatedData.unitCost
    if (validatedData.supplier !== undefined) updateData.supplier = validatedData.supplier
    if (validatedData.supplierCode !== undefined) updateData.supplier_code = validatedData.supplierCode
    if (validatedData.storageLocation !== undefined) updateData.storage_location = validatedData.storageLocation
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    
    const { data, error } = await serverClient
      .from('stock_items')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Stock item updated successfully' }
  } catch (error) {
    console.error('Failed to update stock item:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update stock item' }
  }
}

export async function deleteStockItem(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteStockItemSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Soft delete by setting is_active to false
    const { error } = await serverClient
      .from('stock_items')
      .update({ is_active: false })
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, message: 'Stock item deleted successfully' }
  } catch (error) {
    console.error('Failed to delete stock item:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete stock item' }
  }
}

// ==================== Stock Adjustments ====================

export async function adjustStock(adjustmentData: {
  stockItemId: number
  quantityChange: number
  transactionType: 'RESTOCK' | 'USAGE' | 'ADJUSTMENT' | 'WASTE' | 'INITIAL'
  notes?: string
  createdBy: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(adjustStockSchema, adjustmentData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Get current stock level
    const { data: stockItem, error: fetchError } = await serverClient
      .from('stock_items')
      .select('current_quantity')
      .eq('id', validatedData.stockItemId)
      .single()
    
    if (fetchError) throw fetchError
    
    const quantityBefore = stockItem.current_quantity
    const quantityAfter = quantityBefore + validatedData.quantityChange
    
    // Prevent negative stock
    if (quantityAfter < 0) {
      return { 
        success: false, 
        error: 'Cannot reduce stock below zero. Current quantity: ' + quantityBefore 
      }
    }
    
    // Update stock quantity
    const { error: updateError } = await serverClient
      .from('stock_items')
      .update({ current_quantity: quantityAfter })
      .eq('id', validatedData.stockItemId)
    
    if (updateError) throw updateError
    
    // Log transaction
    const { data: transaction, error: transactionError } = await serverClient
      .from('stock_transactions')
      .insert([{
        stock_item_id: validatedData.stockItemId,
        transaction_type: validatedData.transactionType,
        quantity_change: validatedData.quantityChange,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        reference_type: 'MANUAL',
        notes: validatedData.notes || null,
        created_by: validatedData.createdBy,
      }])
      .select()
      .single()
    
    if (transactionError) throw transactionError
    
    return { 
      success: true, 
      data: transaction, 
      message: 'Stock adjusted successfully',
      newQuantity: quantityAfter
    }
  } catch (error) {
    console.error('Failed to adjust stock:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to adjust stock' }
  }
}

// ==================== Stock Allergens ====================

export async function getStockItemAllergens(stockItemId: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('stock_allergens')
      .select('allergen_id, allergens(*)')
      .eq('stock_item_id', stockItemId)
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch stock allergens:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch allergens', data: [] }
  }
}

export async function setStockAllergens(stockItemId: number, allergenIds: number[]) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(setStockAllergensSchema, { stockItemId, allergenIds })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { stockItemId: validatedId, allergenIds: validatedAllergenIds } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Delete existing allergen associations
    const { error: deleteError } = await serverClient
      .from('stock_allergens')
      .delete()
      .eq('stock_item_id', validatedId)
    
    if (deleteError) throw deleteError
    
    // Insert new allergen associations
    if (validatedAllergenIds.length > 0) {
      const insertData = validatedAllergenIds.map(allergenId => ({
        stock_item_id: validatedId,
        allergen_id: allergenId,
      }))
      
      const { error: insertError } = await serverClient
        .from('stock_allergens')
        .insert(insertData)
      
      if (insertError) throw insertError
    }
    
    return { success: true, message: 'Allergens updated successfully' }
  } catch (error) {
    console.error('Failed to set stock allergens:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update allergens' }
  }
}

// ==================== Stock Transactions ====================

export async function getStockTransactions(filters?: {
  stockItemId?: number
  transactionType?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getStockTransactionsSchema, filters || {})
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const validatedFilters = validation.data
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('stock_transactions')
      .select('*, stock_items(name, unit)')
      .order('created_at', { ascending: false })
    
    if (validatedFilters.stockItemId) {
      query = query.eq('stock_item_id', validatedFilters.stockItemId)
    }
    
    if (validatedFilters.transactionType) {
      query = query.eq('transaction_type', validatedFilters.transactionType)
    }
    
    if (validatedFilters.dateFrom) {
      query = query.gte('created_at', new Date(validatedFilters.dateFrom).toISOString())
    }
    
    if (validatedFilters.dateTo) {
      const endDate = new Date(validatedFilters.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
    }
    
    if (validatedFilters.limit) {
      query = query.limit(validatedFilters.limit)
    } else {
      query = query.limit(100)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch stock transactions:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch transactions', data: [] }
  }
}

// ==================== Low Stock ====================

export async function getLowStockItems() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('low_stock_items')
      .select('*')
      .order('stock_percentage', { ascending: true, nullsFirst: true })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch low stock items:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch low stock items', data: [] }
  }
}

// ==================== Stock with Allergens ====================

export async function getAllStockItemsWithAllergens() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('stock_items_with_allergens')
      .select('*')
      .eq('is_active', true)
      .order('stock_item_name', { ascending: true })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch stock items with allergens:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch stock items', data: [] }
  }
}

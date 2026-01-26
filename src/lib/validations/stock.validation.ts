import { z } from 'zod'

// ==================== Stock Items ====================

export const createStockItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit too long'),
  currentQuantity: z.number().min(0, 'Quantity cannot be negative').default(0),
  minimumThreshold: z.number().min(0, 'Threshold cannot be negative').default(0),
  unitCost: z.number().min(0, 'Cost cannot be negative').optional(),
  supplier: z.string().max(200, 'Supplier name too long').optional(),
  supplierCode: z.string().max(100, 'Supplier code too long').optional(),
  storageLocation: z.string().max(100, 'Storage location too long').optional(),
  notes: z.string().optional(),
})

export const updateStockItemSchema = z.object({
  id: z.number().int().positive('Invalid stock item ID'),
  data: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    unit: z.string().min(1).max(50).optional(),
    currentQuantity: z.number().min(0).optional(),
    minimumThreshold: z.number().min(0).optional(),
    unitCost: z.number().min(0).optional(),
    supplier: z.string().max(200).optional(),
    supplierCode: z.string().max(100).optional(),
    storageLocation: z.string().max(100).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
})

export const deleteStockItemSchema = z.object({
  id: z.number().int().positive('Invalid stock item ID'),
})

export const getStockItemSchema = z.object({
  id: z.number().int().positive('Invalid stock item ID'),
})

// ==================== Stock Adjustments ====================

export const adjustStockSchema = z.object({
  stockItemId: z.number().int().positive('Invalid stock item ID'),
  quantityChange: z.number().refine((val) => val !== 0, {
    message: 'Quantity change cannot be zero'
  }),
  transactionType: z.enum(['RESTOCK', 'USAGE', 'ADJUSTMENT', 'WASTE', 'INITIAL'] as const, {
    message: 'Invalid transaction type'
  }),
  notes: z.string().optional(),
  createdBy: z.string().min(1, 'Created by is required'),
})

export const getStockTransactionsSchema = z.object({
  stockItemId: z.number().int().positive().optional(),
  transactionType: z.enum(['RESTOCK', 'USAGE', 'ADJUSTMENT', 'DELIVERY', 'WASTE', 'INITIAL'] as const).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().int().positive().max(1000).optional(),
})

// ==================== Stock Allergens ====================

export const setStockAllergensSchema = z.object({
  stockItemId: z.number().int().positive('Invalid stock item ID'),
  allergenIds: z.array(z.number().int().positive('Invalid allergen ID')),
})

// ==================== Low Stock ====================

export const getLowStockItemsSchema = z.object({
  threshold: z.number().min(0).optional(),
})

// Export types
export type CreateStockItemInput = z.infer<typeof createStockItemSchema>
export type UpdateStockItemInput = z.infer<typeof updateStockItemSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
export type SetStockAllergensInput = z.infer<typeof setStockAllergensSchema>

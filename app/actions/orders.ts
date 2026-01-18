'use server'

import { supabase, createServerSupabaseClient } from '@/lib/supabase'
import { OrderStatus } from '../constants/enums'
import {
  safeValidate,
  createOrderSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  deleteMenuItemSchema,
  getOrderByIdSchema,
  getFilteredOrdersSchema,
  updateOrderStatusSchema,
  setAvailabilitySchema,
  generateAvailabilitySchema,
  checkAvailabilitySchema,
  getAvailabilitySchema,
  updateAvailabilitySlotSchema,
  deleteAvailabilitySlotSchema,
} from '@/lib/validations'
import { requireAuth } from '@/lib/auth/middleware'
import { formatDateForDB, getDatesBetween } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface OrderFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: string
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  orderItems: CartItem[]
  totalAmount: number
  notes?: string
}

export async function createOrder(formData: OrderFormData) {
  try {
    // Validate input
    const validation = safeValidate(createOrderSchema, formData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data

    // Check availability before creating order
    const availabilityCheck = await checkOrderAvailability(
      validatedData.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
      })),
      validatedData.deliveryDate
    )

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: `Some items are not available for ${validatedData.deliveryDate}: ${
          availabilityCheck.unavailableItems.join(', ')
        }`,
      }
    }

    // Step 1: Create the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: validatedData.customerName,
        customer_email: validatedData.customerEmail,
        customer_phone: validatedData.customerPhone,
        delivery_method: validatedData.deliveryMethod,
        delivery_address: validatedData.deliveryAddress,
        delivery_date: validatedData.deliveryDate,
        delivery_time: validatedData.deliveryTime,
        total_amount: validatedData.totalAmount,
        notes: validatedData.notes,
        status: OrderStatus.PENDING
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Step 2: Create order items (line items)
    const orderItemsData = validatedData.orderItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      menu_item_name: item.name,
      menu_item_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) throw itemsError

    // Step 3: Decrement availability for items with limited availability
    for (const item of validatedData.orderItems) {
      try {
        // Check if item has limited availability
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('has_limited_availability')
          .eq('id', item.id)
          .single()

        if (menuItem?.has_limited_availability) {
          // Use database function to safely decrement
          const { error: decrementError } = await supabase.rpc('decrement_availability', {
            p_menu_item_id: item.id,
            p_date: validatedData.deliveryDate,
            p_quantity: item.quantity,
          })

          if (decrementError) {
            console.error('Failed to decrement availability:', decrementError)
            // Note: Order is already created, so we log but don't fail
            // In production, you might want to handle this differently
          }
        }
      } catch (err) {
        console.error('Error processing availability for item:', item.id, err)
      }
    }

    // Optional: Send email notification here
    // await sendOrderConfirmation(validatedData.customerEmail, order)

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category', { ascending: true })
  
  if (error) throw error
  
  // Enrich with availability data for items with limited availability
  if (!data) return []
  
  const today = formatDateForDB(new Date())
  
  const enrichedData = await Promise.all(
    data.map(async (item) => {
      if (item.has_limited_availability) {
        try {
          // Get all upcoming slots for this item
          const { data: availabilitySlots, error: availError } = await supabase
            .from('menu_item_availability')
            .select('*')
            .eq('menu_item_id', item.id)
            .eq('is_active', true)
            .gte('available_date', today)
            .order('available_date', { ascending: true })

          if (availError) {
            console.error('Error fetching availability slots:', availError)
            return item
          }

          // Find the first slot that has availability (not sold out)
          const nextAvailableSlot = availabilitySlots?.find(
            slot => slot.current_orders < slot.max_orders
          )

          if (nextAvailableSlot) {
            const remaining = nextAvailableSlot.max_orders - nextAvailableSlot.current_orders
            return {
              ...item,
              next_available_date: nextAvailableSlot.available_date,
              available_slots: remaining,
            }
          } else {
            // All slots are full or no slots exist
            return {
              ...item,
              next_available_date: null,
              available_slots: 0,
            }
          }
        } catch (err) {
          console.error('Failed to fetch availability for item:', item.id, err)
        }
      }
      return item
    })
  )
  
  return enrichedData
}

// Get all menu items including unavailable ones (for admin)
export async function getAllMenuItems() {
  try {
    // Require authentication - admin only
    await requireAuth()
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch menu items:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw new Error('Authentication required. Please log in.')
    }
    
    throw error
  }
}

// Create new menu item (for admin)
export async function createMenuItem(menuItemData: {
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  available: boolean
  includes?: string[]
  has_limited_availability?: boolean
  pre_orders_only?: boolean
  minimum_order_quantity?: number
}) {
  'use server'
  
  try {
    // Require authentication - admin only
    await requireAuth()
    
    // Validate input
    const validation = safeValidate(createMenuItemSchema, menuItemData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('menu_items')
      .insert([{
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category: validatedData.category,
        image_url: validatedData.image_url || null,
        available: validatedData.available,
        includes: validatedData.includes || null,
        has_limited_availability: validatedData.has_limited_availability || false,
        pre_orders_only: validatedData.pre_orders_only || false,
        minimum_order_quantity: validatedData.minimum_order_quantity || 1
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Menu item created successfully:', data)
    return { success: true, data, message: 'Menu item created successfully' }
  } catch (error) {
    console.error('Failed to create menu item:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to create menu item' }
  }
}

// Update menu item (for admin)
export async function updateMenuItem(id: string, menuItemData: {
  name?: string
  description?: string
  price?: number
  category?: string
  image_url?: string
  available?: boolean
  includes?: string[]
  has_limited_availability?: boolean
  pre_orders_only?: boolean
  minimum_order_quantity?: number
}) {
  'use server'
  
  try {
    // Require authentication - admin only
    await requireAuth()
    
    // Validate input
    const validation = safeValidate(updateMenuItemSchema, { id, data: menuItemData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('menu_items')
      .update(validatedData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Menu item updated successfully' }
  } catch (error) {
    console.error('Failed to update menu item:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update menu item' }
  }
}

// Delete menu item (for admin)
export async function deleteMenuItem(id: string) {
  'use server'
  
  try {
    // Require authentication - admin only
    await requireAuth()
    
    // Validate input
    const validation = safeValidate(deleteMenuItemSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { error } = await serverClient
      .from('menu_items')
      .delete()
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Menu item deleted successfully')
    return { success: true, message: 'Menu item deleted successfully' }
  } catch (error) {
    console.error('Failed to delete menu item:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete menu item' }
  }
}

// Get a single order with its items (for admin or order confirmation)
export async function getOrderById(orderId: string | number) {
  // Validate input - handles both string (from URL) and number types
  const validation = safeValidate(getOrderByIdSchema, { orderId })
  
  if (!validation.success) {
    throw new Error(validation.error)
  }

  const { orderId: validatedOrderId } = validation.data

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        menu_item_name,
        menu_item_price,
        quantity,
        subtotal
      )
    `)
    .eq('id', validatedOrderId)
    .single()

  if (orderError) throw orderError
  return order
}

// Get all orders (for admin dashboard)
export async function getAllOrders() {
  try {
    // Require authentication - admin only
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_name,
          menu_item_price,
          quantity,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw new Error('Authentication required. Please log in.')
    }
    
    throw error
  }
}

// Get orders with pagination and filters (for admin dashboard)
export async function getFilteredOrders({
  page = 1,
  pageSize = 10,
  status,
  deliveryMethod,
  searchQuery,
  dateFrom,
  dateTo,
  sortBy = 'created_at',
  sortOrder = 'desc',
  useCompletionDate = false
}: {
  page?: number
  pageSize?: number
  status?: string
  deliveryMethod?: string
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  useCompletionDate?: boolean
} = {}) {
  'use server'
  
  try {
    // Require authentication - admin only
    await requireAuth()
    
    // Validate input
    const validation = safeValidate(getFilteredOrdersSchema, {
      page,
      pageSize,
      status,
      deliveryMethod,
      searchQuery,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      useCompletionDate,
    })
    
    if (!validation.success) {
      return {
        success: false,
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        error: validation.error,
      }
    }

    const validatedData = validation.data

    // Calculate offset for pagination
    const offset = ((validatedData.page || 1) - 1) * (validatedData.pageSize || 10)

    // Build the base query
    const serverClient = createServerSupabaseClient()
    let query = serverClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_name,
          menu_item_price,
          quantity,
          subtotal
        )
      `, { count: 'exact' })

    // Apply filters
    if (validatedData.status && validatedData.status !== 'all') {
      query = query.eq('status', validatedData.status)
    }

    if (validatedData.deliveryMethod && validatedData.deliveryMethod !== 'all') {
      query = query.eq('delivery_method', validatedData.deliveryMethod)
    }

    if (validatedData.searchQuery) {
      // Search across customer name, email, and phone
      query = query.or(`customer_name.ilike.%${validatedData.searchQuery}%,customer_email.ilike.%${validatedData.searchQuery}%,customer_phone.ilike.%${validatedData.searchQuery}%`)
    }

    // Use updated_at for date filtering when status is completed AND useCompletionDate is true
    // Also auto-use updated_at if status is completed (regardless of flag)
    const dateFilterField = (validatedData.status === OrderStatus.COMPLETED || validatedData.useCompletionDate) 
      ? 'updated_at' 
      : 'created_at'

    if (validatedData.dateFrom) {
      // Convert date string to start of day in ISO format
      const startDate = new Date(validatedData.dateFrom)
      query = query.gte(dateFilterField, startDate.toISOString())
    }

    if (validatedData.dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(validatedData.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt(dateFilterField, endDate.toISOString())
    }

    // Apply sorting
    query = query.order(validatedData.sortBy || 'created_at', { 
      ascending: validatedData.sortOrder === 'asc' 
    })

    // Apply pagination
    query = query.range(offset, offset + (validatedData.pageSize || 10) - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      success: true,
      data: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / (validatedData.pageSize || 10)),
      currentPage: validatedData.page || 1
    }
  } catch (error) {
    console.error('Failed to fetch filtered orders:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        error: 'Authentication required. Please log in.'
      }
    }
    
    return {
      success: false,
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      error: 'Failed to fetch orders'
    }
  }
}

// Update order status (for admin)
export async function updateOrderStatus(orderId: string | number, status: string) {
  'use server'
  
  try {
    // Require authentication - admin only
    await requireAuth()
    
    // Validate input - handles both string and number types
    const validation = safeValidate(updateOrderStatusSchema, { orderId, status })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { orderId: validatedOrderId, status: validatedStatus } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Get the current order details before updating
    const { data: currentOrder, error: fetchError } = await serverClient
      .from('orders')
      .select('status, delivery_date')
      .eq('id', validatedOrderId)
      .single()
    
    if (fetchError || !currentOrder) {
      console.error('Failed to fetch current order:', fetchError)
      throw new Error('Order not found')
    }
    
    // Update the order status
    const { data, error } = await serverClient
      .from('orders')
      .update({ 
        status: validatedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedOrderId)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    // If order is being cancelled, restore availability
    if (validatedStatus === OrderStatus.CANCELLED && currentOrder.status !== OrderStatus.CANCELLED) {
      try {
        console.log(`Order ${validatedOrderId} is being cancelled, restoring availability...`)
        
        // Get order items
        const { data: orderItems, error: itemsError } = await serverClient
          .from('order_items')
          .select('menu_item_id, quantity')
          .eq('order_id', validatedOrderId)
        
        if (itemsError) {
          console.error('Failed to fetch order items:', itemsError)
        } else if (orderItems && orderItems.length > 0) {
          console.log(`Found ${orderItems.length} order items to process`)
          
          // Restore availability for each item
          for (const item of orderItems) {
            try {
              // Check if item has limited availability
              const { data: menuItem } = await serverClient
                .from('menu_items')
                .select('has_limited_availability')
                .eq('id', item.menu_item_id)
                .single()

              if (menuItem?.has_limited_availability) {
                // Get the current availability slot
                const { data: currentSlot } = await serverClient
                  .from('menu_item_availability')
                  .select('current_orders')
                  .eq('menu_item_id', item.menu_item_id)
                  .eq('available_date', currentOrder.delivery_date)
                  .eq('is_active', true)
                  .single()

                if (currentSlot) {
                  // Calculate new current_orders (ensure it doesn't go below 0)
                  const newCurrentOrders = Math.max(0, currentSlot.current_orders - item.quantity)
                  
                  // Update the availability slot
                  const { error: restoreError } = await serverClient
                    .from('menu_item_availability')
                    .update({ current_orders: newCurrentOrders })
                    .eq('menu_item_id', item.menu_item_id)
                    .eq('available_date', currentOrder.delivery_date)
                    .eq('is_active', true)

                  if (restoreError) {
                    console.error('Failed to restore availability:', restoreError)
                  } else {
                    console.log(`✓ Restored ${item.quantity} slot(s) for item ${item.menu_item_id} on ${currentOrder.delivery_date} (${currentSlot.current_orders} -> ${newCurrentOrders})`)
                  }
                } else {
                  console.log(`No availability slot found for item ${item.menu_item_id} on ${currentOrder.delivery_date}`)
                }
              }
            } catch (err) {
              console.error('Error restoring availability for item:', item.menu_item_id, err)
            }
          }
        }
      } catch (err) {
        console.error('Error restoring availability:', err)
        // Don't fail the status update if availability restore fails
      }
    }
    
    console.log('Order updated successfully:', data)
    return { success: true, message: `Order status updated to ${validatedStatus}` }
  } catch (error) {
    console.error('Failed to update order status:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update order status' }
  }
}

// =============================================================================
// Availability Management Functions
// =============================================================================

/**
 * Get availability for a menu item
 */
export async function getMenuItemAvailability(
  menuItemId: string,
  startDate?: string,
  endDate?: string
) {
  'use server'
  
  try {
    const validation = safeValidate(getAvailabilitySchema, {
      menuItemId,
      startDate,
      endDate,
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const { menuItemId: validatedId, startDate: validStart, endDate: validEnd } = validation.data

    let query = supabase
      .from('menu_item_availability')
      .select('*')
      .eq('menu_item_id', validatedId)
      .eq('is_active', true)
      .order('available_date', { ascending: true })

    if (validStart) {
      query = query.gte('available_date', validStart)
    }

    if (validEnd) {
      query = query.lte('available_date', validEnd)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data to include remaining capacity
    const availabilityData = (data || []).map(slot => ({
      id: slot.id,
      date: slot.available_date,
      maxOrders: slot.max_orders,
      currentOrders: slot.current_orders,
      remaining: slot.max_orders - slot.current_orders,
      isActive: slot.is_active,
    }))

    return { success: true, data: availabilityData }
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return { success: false, error: 'Failed to fetch availability', data: [] }
  }
}

/**
 * Set availability schedule for a menu item (admin only)
 */
export async function setMenuItemAvailability(
  menuItemId: string,
  slots: Array<{ date: string; maxOrders: number }>
) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(setAvailabilitySchema, {
      menuItemId,
      slots,
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { menuItemId: validatedId, slots: validatedSlots } = validation.data
    const serverClient = createServerSupabaseClient()

    // Insert or update availability slots
    const slotsToInsert = validatedSlots.map(slot => ({
      menu_item_id: validatedId,
      available_date: slot.date,
      max_orders: slot.maxOrders,
      current_orders: 0,
      is_active: true,
    }))

    const { data, error } = await serverClient
      .from('menu_item_availability')
      .upsert(slotsToInsert, {
        onConflict: 'menu_item_id,available_date',
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return { 
      success: true, 
      message: `Created ${slotsToInsert.length} availability slots`,
      data 
    }
  } catch (error) {
    console.error('Failed to set availability:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to set availability' }
  }
}

/**
 * Generate availability schedule automatically (admin only)
 * Useful for "next 3 Saturdays" type operations
 */
export async function generateAvailabilitySchedule(
  menuItemId: string,
  startDate: string,
  endDate: string,
  daysOfWeek: number[],
  maxOrders: number
) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(generateAvailabilitySchema, {
      menuItemId,
      startDate,
      endDate,
      daysOfWeek,
      maxOrders,
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data

    // Generate dates between start and end that match the days of week
    const dates = getDatesBetween(
      new Date(validatedData.startDate),
      new Date(validatedData.endDate),
      validatedData.daysOfWeek
    )

    if (dates.length === 0) {
      return { 
        success: false, 
        error: 'No dates found matching the criteria' 
      }
    }

    // Create availability slots for these dates
    const slots = dates.map(date => ({
      date: formatDateForDB(date),
      maxOrders: validatedData.maxOrders,
    }))

    return await setMenuItemAvailability(validatedData.menuItemId, slots)
  } catch (error) {
    console.error('Failed to generate availability:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to generate availability' }
  }
}

/**
 * Check if cart items are available for a specific date
 */
export async function checkOrderAvailability(
  cartItems: Array<{ id: string; quantity: number }>,
  deliveryDate: string
) {
  'use server'
  
  try {
    const validation = safeValidate(checkAvailabilitySchema, {
      cartItems,
      deliveryDate,
    })
    
    if (!validation.success) {
      return { 
        success: false, 
        available: false,
        error: validation.error,
        unavailableItems: [] 
      }
    }

    const { cartItems: validatedItems, deliveryDate: validatedDate } = validation.data
    const unavailableItems: string[] = []

    // Check each item
    for (const item of validatedItems) {
      // First check if the item has limited availability
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('name, has_limited_availability')
        .eq('id', item.id)
        .single()

      if (!menuItem) {
        unavailableItems.push(`Unknown item (${item.id})`)
        continue
      }

      // If item doesn't have limited availability, it's always available
      if (!menuItem.has_limited_availability) {
        continue
      }

      // Check availability for this date
      const { data: availability } = await supabase
        .from('menu_item_availability')
        .select('max_orders, current_orders')
        .eq('menu_item_id', item.id)
        .eq('available_date', validatedDate)
        .eq('is_active', true)
        .single()

      if (!availability) {
        unavailableItems.push(menuItem.name)
        continue
      }

      const remaining = availability.max_orders - availability.current_orders
      if (remaining < item.quantity) {
        unavailableItems.push(`${menuItem.name} (only ${remaining} available)`)
      }
    }

    return {
      success: true,
      available: unavailableItems.length === 0,
      unavailableItems,
    }
  } catch (error) {
    console.error('Failed to check availability:', error)
    return {
      success: false,
      available: false,
      error: 'Failed to check availability',
      unavailableItems: [],
    }
  }
}

/**
 * Get available dates for items in cart (intersection of all items' availability)
 */
export async function getAvailableDatesForCart(
  cartItems: Array<{ id: string; quantity: number }>
) {
  'use server'
  
  try {
    if (cartItems.length === 0) {
      return { success: true, dates: [] }
    }

    // Get items with limited availability from the cart
    const itemIds = cartItems.map(item => item.id)
    
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, has_limited_availability')
      .in('id', itemIds)

    if (menuError) throw menuError

    const limitedAvailabilityItems = (menuItems || [])
      .filter(item => item.has_limited_availability)
      .map(item => item.id)

    // If no items have limited availability, return empty (all dates available)
    if (limitedAvailabilityItems.length === 0) {
      return { success: true, dates: [], hasLimitedItems: false }
    }

    // Get availability for limited items
    const today = formatDateForDB(new Date())
    const { data: availabilitySlots, error: availError } = await supabase
      .from('menu_item_availability')
      .select('menu_item_id, available_date, max_orders, current_orders')
      .in('menu_item_id', limitedAvailabilityItems)
      .gte('available_date', today)
      .eq('is_active', true)

    if (availError) throw availError

    // Group by date and check if all items are available with sufficient capacity
    const dateAvailability: Record<string, boolean> = {}
    
    ;(availabilitySlots || []).forEach(slot => {
      const date = slot.available_date
      const remaining = slot.max_orders - slot.current_orders
      const itemInCart = cartItems.find(item => item.id === slot.menu_item_id)
      const requiredQuantity = itemInCart?.quantity || 0

      // Mark date as available if this item has enough capacity
      if (!dateAvailability[date]) {
        dateAvailability[date] = remaining >= requiredQuantity
      } else {
        // Date is available only if ALL items have capacity
        dateAvailability[date] = dateAvailability[date] && (remaining >= requiredQuantity)
      }
    })

    // Filter dates where ALL limited items are available
    const availableDates = Object.entries(dateAvailability)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([date]) => date)
      .sort()

    return { 
      success: true, 
      dates: availableDates,
      hasLimitedItems: true 
    }
  } catch (error) {
    console.error('Failed to get available dates:', error)
    return { success: false, dates: [], error: 'Failed to fetch available dates' }
  }
}

/**
 * Update availability slot (admin only)
 */
export async function updateAvailabilitySlot(
  slotId: string,
  updates: { maxOrders?: number; isActive?: boolean }
) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateAvailabilitySlotSchema, {
      slotId,
      ...updates,
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()
    
    const updateData: any = {}
    if (validation.data.maxOrders !== undefined) {
      updateData.max_orders = validation.data.maxOrders
    }
    if (validation.data.isActive !== undefined) {
      updateData.is_active = validation.data.isActive
    }

    const { data, error } = await serverClient
      .from('menu_item_availability')
      .update(updateData)
      .eq('id', validation.data.slotId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data, message: 'Availability slot updated successfully' }
  } catch (error) {
    console.error('Failed to update availability slot:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update availability slot' }
  }
}

/**
 * Delete availability slot (admin only)
 */
export async function deleteAvailabilitySlot(slotId: string) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteAvailabilitySlotSchema, { slotId })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()
    
    const { error } = await serverClient
      .from('menu_item_availability')
      .delete()
      .eq('id', validation.data.slotId)

    if (error) throw error

    return { success: true, message: 'Availability slot deleted successfully' }
  } catch (error) {
    console.error('Failed to delete availability slot:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete availability slot' }
  }
}

/**
 * Update createOrder to check and decrement availability
 */
export async function createOrderWithAvailability(formData: OrderFormData) {
  'use server'
  
  try {
    // Validate input
    const validation = safeValidate(createOrderSchema, formData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data

    // Check availability before creating order
    const availabilityCheck = await checkOrderAvailability(
      validatedData.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
      })),
      validatedData.deliveryDate
    )

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: `Some items are not available for ${validatedData.deliveryDate}: ${
          availabilityCheck.unavailableItems.join(', ')
        }`,
      }
    }

    // Create the order (using existing logic)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: validatedData.customerName,
        customer_email: validatedData.customerEmail,
        customer_phone: validatedData.customerPhone,
        delivery_method: validatedData.deliveryMethod,
        delivery_address: validatedData.deliveryAddress,
        delivery_date: validatedData.deliveryDate,
        delivery_time: validatedData.deliveryTime,
        total_amount: validatedData.totalAmount,
        notes: validatedData.notes,
        status: OrderStatus.PENDING
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItemsData = validatedData.orderItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      menu_item_name: item.name,
      menu_item_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) throw itemsError

    // Decrement availability for items with limited availability
    for (const item of validatedData.orderItems) {
      try {
        // Check if item has limited availability
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('has_limited_availability')
          .eq('id', item.id)
          .single()

        if (menuItem?.has_limited_availability) {
          // Use database function to safely decrement
          const { error: decrementError } = await supabase.rpc('decrement_availability', {
            p_menu_item_id: item.id,
            p_date: validatedData.deliveryDate,
            p_quantity: item.quantity,
          })

          if (decrementError) {
            console.error('Failed to decrement availability:', decrementError)
            // Note: Order is already created, so we log but don't fail
          }
        }
      } catch (err) {
        console.error('Error processing availability for item:', item.id, err)
      }
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Failed to create order' }
  }
}


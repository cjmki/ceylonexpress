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
} from '@/lib/validations'

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
  return data
}

// Get all menu items including unavailable ones (for admin)
export async function getAllMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  
  if (error) throw error
  return data
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
}) {
  'use server'
  
  try {
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
        includes: validatedData.includes || null
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
}) {
  'use server'
  
  try {
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
    return { success: false, error: 'Failed to update menu item' }
  }
}

// Delete menu item (for admin)
export async function deleteMenuItem(id: string) {
  'use server'
  
  try {
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
    return { success: false, error: 'Failed to delete menu item' }
  }
}

// Get a single order with its items (for admin or order confirmation)
export async function getOrderById(orderId: string) {
  // Validate input
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
  sortOrder = 'desc'
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
} = {}) {
  'use server'
  
  try {
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

    if (validatedData.dateFrom) {
      query = query.gte('created_at', validatedData.dateFrom)
    }

    if (validatedData.dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(validatedData.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
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
export async function updateOrderStatus(orderId: string, status: string) {
  'use server'
  
  try {
    // Validate input
    const validation = safeValidate(updateOrderStatusSchema, { orderId, status })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { orderId: validatedOrderId, status: validatedStatus } = validation.data
    const serverClient = createServerSupabaseClient()
    
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
    
    console.log('Order updated successfully:', data)
    return { success: true, message: `Order status updated to ${validatedStatus}` }
  } catch (error) {
    console.error('Failed to update order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}


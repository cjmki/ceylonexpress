'use server'

import { supabase, createServerSupabaseClient } from '@/lib/supabase'

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
    // Step 1: Create the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        delivery_method: formData.deliveryMethod,
        delivery_address: formData.deliveryAddress,
        delivery_date: formData.deliveryDate,
        delivery_time: formData.deliveryTime,
        total_amount: formData.totalAmount,
        notes: formData.notes,
        status: 'pending'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Step 2: Create order items (line items)
    const orderItemsData = formData.orderItems.map(item => ({
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
    // await sendOrderConfirmation(formData.customerEmail, order)

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

// Get a single order with its items (for admin or order confirmation)
export async function getOrderById(orderId: string) {
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
    .eq('id', orderId)
    .single()

  if (orderError) throw orderError
  return order
}

// Get all orders (for admin dashboard)
export async function getAllOrders() {
  const { data, error } = await supabase
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

// Update order status (for admin)
export async function updateOrderStatus(orderId: string, status: string) {
  'use server'
  
  try {
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Order updated successfully:', data)
    return { success: true, message: `Order status updated to ${status}` }
  } catch (error) {
    console.error('Failed to update order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}


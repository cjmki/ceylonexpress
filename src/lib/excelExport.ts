import * as XLSX from 'xlsx'
import { formatPrice } from '@/app/constants/currency'

interface ExportOrder {
  id: string
  customer_name: string
  total_amount: number
  created_at: string
  updated_at: string
  order_items: Array<{
    menu_item_name: string
    menu_item_price: number
    quantity: number
    subtotal: number
  }>
}

export function generateOrdersExcel(orders: ExportOrder[]) {
  // Prepare order rows
  const orderRows: any[] = []
  
  // Header row
  orderRows.push([
    'Order ID',
    'Order Date',
    'Completed Date',
    'Customer Name',
    'Item Name',
    'Item Price',
    'Quantity',
    'Item Subtotal',
    'Order Total',
  ])

  // Calculate total revenue
  let totalRevenue = 0

  // Data rows
  orders.forEach(order => {
    const orderDate = new Date(order.created_at).toLocaleDateString()
    const completedDate = new Date(order.updated_at).toLocaleDateString()
    
    totalRevenue += order.total_amount

    if (order.order_items && order.order_items.length > 0) {
      // First item with full order details
      const firstItem = order.order_items[0]
      orderRows.push([
        order.id.substring(0, 8),
        orderDate,
        completedDate,
        order.customer_name,
        firstItem.menu_item_name,
        firstItem.menu_item_price,
        firstItem.quantity,
        firstItem.subtotal,
        order.total_amount,
      ])

      // Remaining items (skip order details to avoid duplication)
      for (let i = 1; i < order.order_items.length; i++) {
        const item = order.order_items[i]
        orderRows.push([
          '', '', '', '', // Empty cells for order info
          item.menu_item_name,
          item.menu_item_price,
          item.quantity,
          item.subtotal,
          '', // Empty for order total
        ])
      }
    } else {
      // Order with no items
      orderRows.push([
        order.id.substring(0, 8),
        orderDate,
        completedDate,
        order.customer_name,
        'No items',
        0,
        0,
        0,
        order.total_amount,
      ])
    }
  })

  // Add totals row
  orderRows.push([])
  orderRows.push([
    '', '', '', '',
    'TOTAL REVENUE:',
    '', '',
    formatPrice(totalRevenue),
    '', 
  ])

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(orderRows)

  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // Order ID
    { wch: 12 }, // Order Date
    { wch: 12 }, // Completed Date
    { wch: 20 }, // Customer Name
    { wch: 30 }, // Item Name
    { wch: 10 }, // Item Price
    { wch: 8 },  // Quantity
    { wch: 12 }, // Item Subtotal
    { wch: 12 }, // Order Total
  ]

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Orders')

  // Generate filename with current date
  const now = new Date()
  const filename = `CeylonExpress_Orders_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`

  // Write file
  XLSX.writeFile(wb, filename)

  return { filename, totalRevenue, orderCount: orders.length }
}

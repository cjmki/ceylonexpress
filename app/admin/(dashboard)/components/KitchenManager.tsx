'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFilteredOrders } from '../../../actions/orders'
import { Loader2, ChefHat, Calendar } from 'lucide-react'
import { OrderStatus } from '../../../constants/enums'
import { formatPrice } from '../../../constants/currency'

interface OrderItem {
  id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  notes?: string
  order_items: OrderItem[]
}

interface ItemSummary {
  itemName: string
  quantities: Record<string, number> // date -> quantity
  totalQuantity: number
}

export function KitchenManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConfirmedOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFilteredOrders({
        page: 1,
        pageSize: 10000, // Get all confirmed orders
        status: OrderStatus.CONFIRMED,
        sortBy: 'delivery_date',
        sortOrder: 'asc'
      })

      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfirmedOrders()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchConfirmedOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchConfirmedOrders])

  // Calculate item summary grouped by date
  const itemSummary: ItemSummary[] = React.useMemo(() => {
    const summaryMap = new Map<string, ItemSummary>()

    orders.forEach(order => {
      order.order_items.forEach(item => {
        const existing = summaryMap.get(item.menu_item_name)
        
        if (existing) {
          existing.quantities[order.delivery_date] = 
            (existing.quantities[order.delivery_date] || 0) + item.quantity
          existing.totalQuantity += item.quantity
        } else {
          summaryMap.set(item.menu_item_name, {
            itemName: item.menu_item_name,
            quantities: { [order.delivery_date]: item.quantity },
            totalQuantity: item.quantity
          })
        }
      })
    })

    return Array.from(summaryMap.values()).sort((a, b) => 
      a.itemName.localeCompare(b.itemName)
    )
  }, [orders])

  // Get unique dates sorted
  const uniqueDates = React.useMemo(() => {
    const dates = new Set(orders.map(o => o.delivery_date))
    return Array.from(dates).sort()
  }, [orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C5F7F]" />
        <span className="ml-3 text-gray-600">Loading kitchen orders...</span>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">👨‍🍳</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No confirmed orders</h3>
        <p className="text-gray-600">
          Confirmed orders will appear here for kitchen preparation
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Item Summary Section */}
      <div className="bg-gradient-to-br from-[#E8F2F7] to-[#D6E8F0] rounded-lg shadow-md border-2 border-[#A7C7D7] p-6">
        <div className="flex items-center gap-3 mb-6">
          <ChefHat className="h-7 w-7 text-[#2C5F7F]" />
          <div>
            <h2 className="text-2xl font-bold text-[#1A4158]">Preparation Summary</h2>
            <p className="text-sm text-[#2C5F7F] mt-1">
              Total items to prepare for confirmed orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#A7C7D7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2C5F7F] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Menu Item</th>
                  {uniqueDates.map(date => (
                    <th key={date} className="px-4 py-3 text-center font-bold">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-4 w-4 mb-1" />
                        <span className="text-xs">{formatDate(date)}</span>
                      </div>
                    </th>
                  ))}
                  {uniqueDates.length > 1 && (
                    <th className="px-4 py-3 text-center font-bold bg-[#1A4158]">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemSummary.map((item, idx) => (
                  <tr 
                    key={item.itemName}
                    className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {item.itemName}
                    </td>
                    {uniqueDates.map(date => (
                      <td key={date} className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-full text-sm font-bold bg-[#D6E8F0] text-[#1A4158]">
                          {item.quantities[date] || '-'}
                        </span>
                      </td>
                    ))}
                    {uniqueDates.length > 1 && (
                      <td className="px-4 py-3 text-center bg-[#E8F2F7]">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-full text-sm font-bold bg-[#2C5F7F] text-white">
                          {item.totalQuantity}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KOT Grid Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Order Tickets</h2>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-[#D6E8F0] text-[#1A4158]">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => (
            <KitchenOrderTicket key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Kitchen Order Ticket Component
function KitchenOrderTicket({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#2C5F7F] text-white px-4 py-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium opacity-90">Order #</div>
            <div className="text-2xl font-bold">{order.id}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">{formatDate(order.delivery_date)}</div>
            <div className="text-sm font-bold">{formatTime(order.delivery_time)}</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-bold text-gray-900 truncate">
          {order.customer_name}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          {order.customer_phone}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          {order.delivery_method === 'delivery' ? '🚚' : '🏪'} {order.delivery_method.toUpperCase()}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 py-3 flex-grow">
        <div className="space-y-2">
          {order.order_items.map((item, idx) => (
            <div 
              key={item.id} 
              className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {item.menu_item_name}
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2C5F7F] text-white font-bold text-sm">
                  {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
          <div className="text-xs font-semibold text-yellow-900 mb-1">SPECIAL NOTES:</div>
          <div className="text-xs text-yellow-800">{order.notes}</div>
        </div>
      )}

      {/* Delivery Address (for delivery orders) - Always at bottom */}
      {order.delivery_method === 'delivery' && order.delivery_address && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 mt-auto">
          <div className="text-xs font-semibold text-blue-900 mb-1">DELIVERY TO:</div>
          <div className="text-xs text-blue-800 leading-tight">{order.delivery_address}</div>
        </div>
      )}
    </div>
  )
}

// Utility functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(timeString: string): string {
  const timeMap: Record<string, string> = {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner'
  }
  return timeMap[timeString.toLowerCase()] || timeString
}

// Import React for useMemo
import * as React from 'react'

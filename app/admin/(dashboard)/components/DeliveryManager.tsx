'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getFilteredOrders } from '../../../actions/orders'
import { Loader2, Truck, MapPin, Copy, Check, Calendar, Clock } from 'lucide-react'
import { OrderStatus, DeliveryMethod } from '../../../constants/enums'
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

// Configuration constant for origin
const DELIVERY_ORIGIN = 'Bondhagsvägen 47, Upplands-Bro, Sweden'

export function DeliveryManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const fetchDeliveryOrders = useCallback(async () => {
    setLoading(true)
    try {
      const today = getTodayDate()
      
      const result = await getFilteredOrders({
        page: 1,
        pageSize: 10000,
        status: OrderStatus.CONFIRMED,
        deliveryMethod: DeliveryMethod.DELIVERY,
        sortBy: 'delivery_date',
        sortOrder: 'asc'
      })

      if (result.success) {
        // Filter out past orders (only show today and future)
        const activeOrders = result.data.filter(order => order.delivery_date >= today)
        setOrders(activeOrders)
      }
    } catch (error) {
      console.error('Error fetching delivery orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeliveryOrders()
  }, [fetchDeliveryOrders])

  // Filter orders by selected date
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.delivery_date === selectedDate)
  }, [orders, selectedDate])

  // Get unique dates from all orders
  const availableDates = useMemo(() => {
    const dates = new Set(orders.map(o => o.delivery_date))
    return Array.from(dates).sort()
  }, [orders])

  // Auto-select the appropriate date when orders are loaded
  useEffect(() => {
    if (availableDates.length > 0) {
      const today = getTodayDate()
      
      // If no date is selected, or selected date is not in available dates
      if (!selectedDate || !availableDates.includes(selectedDate)) {
        // Try to select today if it's available, otherwise select the first available date
        if (availableDates.includes(today)) {
          setSelectedDate(today)
        } else {
          setSelectedDate(availableDates[0])
        }
      }
    }
  }, [availableDates, selectedDate])

  // Generate AI prompt
  const generateAIPrompt = useCallback(() => {
    if (filteredOrders.length === 0) return ''

    const selectedDateObj = new Date(selectedDate)
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    let prompt = `Optimize Delivery Route for Ceylon Express\n\n`
    prompt += `**Origin:** ${DELIVERY_ORIGIN}\n\n`
    prompt += `**Delivery Date:** ${dayOfWeek}, ${formattedDate}\n`
    prompt += `**Latest Arrival Time:** 2:00 PM (14:00)\n`
    prompt += `**Transport Method:** Car\n\n`
    prompt += `**Deliveries:**\n\n`

    filteredOrders.forEach((order, index) => {
      prompt += `${index + 1}. ${order.customer_name}\n`
      prompt += `   Address: ${order.delivery_address}\n`
      prompt += `   Time Window: ${formatTime(order.delivery_time)}\n`
      prompt += `   Phone: ${order.customer_phone}\n`
      
      // Add order items summary
      const itemsSummary = order.order_items
        .map(item => `${item.quantity}x ${item.menu_item_name}`)
        .join(', ')
      prompt += `   Items: ${itemsSummary}\n`
      
      if (order.notes) {
        prompt += `   Notes: ${order.notes}\n`
      }
      prompt += `\n`
    })

    prompt += `**Request:**\n`
    prompt += `1. Determine the most fuel-efficient delivery route that minimizes total driving time\n`
    prompt += `2. Calculate estimated arrival time at each stop (assuming 5 minutes per delivery)\n`
    prompt += `3. Account for typical ${dayOfWeek} traffic in the Stockholm area\n`
    prompt += `4. Specify the optimal departure time from origin to ensure all deliveries complete by 2:00 PM\n`
    prompt += `5. Provide the total estimated driving time and distance\n`
    prompt += `6. List the optimized route order with turn-by-turn sequence\n\n`
    prompt += `**Additional Constraints:**\n`
    prompt += `- All deliveries must be completed latest by 2:00 PM\n`
    prompt += `- Please account for 5 minutes unloading time at each stop\n`
    prompt += `- Consider current traffic patterns for ${dayOfWeek} midday\n`

    return prompt
  }, [filteredOrders, selectedDate])

  const handleCopyPrompt = async () => {
    const prompt = generateAIPrompt()
    if (!prompt) return

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading delivery orders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {orders.length === 0 && !loading && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-1">No Confirmed Orders Found</h3>
              <p className="text-sm text-yellow-800 mb-2">
                This tab shows orders that are:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                <li>Status: <span className="font-semibold">CONFIRMED</span></li>
                <li>Delivery Method: <span className="font-semibold">DELIVERY</span> (not Pickup)</li>
                <li>Delivery Date: <span className="font-semibold">Today or Future</span> (not past orders)</li>
              </ul>
              <p className="text-sm text-yellow-800 mt-2">
                Check the <span className="font-semibold">Orders</span> tab to confirm orders and set delivery method.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Date Selector */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md border-2 border-blue-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Truck className="h-7 w-7 text-blue-700" />
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Delivery Route Manager</h2>
              <p className="text-sm text-blue-700 mt-1">
                Origin: {DELIVERY_ORIGIN}
              </p>
              {orders.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Showing {orders.length} confirmed {orders.length === 1 ? 'order' : 'orders'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Selector */}
            {availableDates.length > 0 ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-700" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg font-semibold text-blue-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {formatDate(date)} {date === getTodayDate() && '(Today)'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">No dates available</span>
              </div>
            )}

            {/* Copy AI Prompt Button */}
            {filteredOrders.length > 0 && (
              <button
                onClick={handleCopyPrompt}
                disabled={copied}
                className={`flex items-center gap-2 px-6 py-2 font-bold rounded-lg transition-all shadow-md hover:shadow-lg ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copy AI Prompt
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {selectedDate && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <div className="text-sm font-medium text-blue-700">Total Deliveries</div>
              <div className="text-3xl font-bold text-blue-900 mt-1">{filteredOrders.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <div className="text-sm font-medium text-blue-700">Selected Date</div>
              <div className="text-xl font-bold text-blue-900 mt-1">{formatDate(selectedDate)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🚚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries scheduled</h3>
          <p className="text-gray-600 mb-4">
            {availableDates.length > 0
              ? 'No confirmed delivery orders for this date. Try selecting a different date.'
              : 'No confirmed delivery orders available.'}
          </p>
          <div className="text-sm text-gray-500 mt-4 bg-gray-50 p-4 rounded-lg inline-block">
            <p className="font-semibold mb-2">This tab shows only:</p>
            <ul className="text-left space-y-1">
              <li>✓ Orders with status: <span className="font-mono bg-green-100 px-2 py-0.5 rounded">CONFIRMED</span></li>
              <li>✓ Delivery method: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">DELIVERY</span></li>
              <li>✓ Orders scheduled for: <span className="font-mono bg-orange-100 px-2 py-0.5 rounded">Today or Future</span></li>
            </ul>
            <p className="mt-3 text-xs">Pickup orders and past orders are not shown here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Delivery Orders ({filteredOrders.length})
            </h3>
            <div className="text-sm text-gray-600">
              Click addresses to open in Google Maps
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-fr">
            {filteredOrders.map((order, index) => (
              <DeliveryCard key={order.id} order={order} orderNumber={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Delivery Card Component
function DeliveryCard({ order, orderNumber }: { order: Order; orderNumber: number }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`
  
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              {order.id}
            </div>
            <div>
              <div className="text-lg font-bold">{order.customer_name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-bold">{formatTime(order.delivery_time)}</span>
            </div>
            <div className="text-xs opacity-90 mt-1">{order.customer_phone}</div>
          </div>
        </div>
      </div>

      {/* Delivery Address - Clickable */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-blue-900 mb-1">DELIVERY ADDRESS</div>
            <div className="text-sm font-medium text-blue-800 leading-tight break-words">
              {order.delivery_address}
            </div>
            <div className="text-xs text-blue-600 mt-2 font-medium group-hover:underline">
              Click to open in Google Maps →
            </div>
          </div>
        </div>
      </a>

      {/* Order Items - Grows to fill space */}
      <div className="px-4 py-4 flex-grow">
        <div className="text-xs font-semibold text-gray-700 mb-3">ORDER ITEMS</div>
        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="text-sm text-gray-900">
                <span className="font-bold text-blue-600">{item.quantity}x</span>{' '}
                {item.menu_item_name}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
          <div className="text-xs font-semibold text-yellow-900 mb-1">SPECIAL NOTES</div>
          <div className="text-sm text-yellow-800">{order.notes}</div>
        </div>
      )}

      {/* Total - Anchored to bottom */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200 mt-auto">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-blue-600">{formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </div>
  )
}

// Utility functions
function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(timeString: string): string {
  const timeMap: Record<string, string> = {
    'breakfast': '🌅 Breakfast (8-10 AM)',
    'lunch': '🍱 Lunch (12-2 PM)',
    'dinner': '🌙 Dinner (6-8 PM)'
  }
  return timeMap[timeString.toLowerCase()] || timeString
}

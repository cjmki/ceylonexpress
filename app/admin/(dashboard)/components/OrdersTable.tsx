'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateOrderStatus } from '../../../actions/orders'
import { useRouter } from 'next/navigation'
import { formatPrice } from '../../../constants/currency'
import { formatDateWithDay } from '../../../constants/dateUtils'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  created_at: string
  notes?: string
  order_items: Array<{
    id: string
    menu_item_name: string
    menu_item_price: number
    quantity: number
    subtotal: number
  }>
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      return
    }
    
    setUpdatingStatus(orderId)
    await updateOrderStatus(orderId, newStatus)
    router.refresh()
    setUpdatingStatus(null)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Delivery
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-900">
                  #{order.id.slice(0, 8)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(order.created_at)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                <div className="text-sm text-gray-500">{order.customer_phone}</div>
                <div className="text-xs text-gray-400">{order.customer_email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  {order.order_items.slice(0, 2).map(item => item.menu_item_name).join(', ')}
                  {order.order_items.length > 2 && '...'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                </div>
                <div className="text-sm text-gray-600">{formatDateWithDay(order.delivery_date)}</div>
                <div className="text-xs text-gray-500">{order.delivery_time}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">
                  {formatPrice(order.total_amount)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                <div className="flex flex-col space-y-1">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'confirmed')}
                      disabled={updatingStatus === order.id}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      {updatingStatus === order.id ? '...' : '✓ Confirm'}
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      disabled={updatingStatus === order.id}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      {updatingStatus === order.id ? '...' : '✓ Complete'}
                    </button>
                  )}
                  <Link
                    href={`/order-confirmation/${order.id}`}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-center"
                  >
                    View Details →
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

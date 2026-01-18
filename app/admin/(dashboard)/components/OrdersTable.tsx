'use client'

import { useState, useMemo } from 'react'
import { updateOrderStatus } from '../../../actions/orders'
import { useRouter } from 'next/navigation'
import { formatPrice } from '../../../constants/currency'
import { formatDateWithDay } from '../../../constants/dateUtils'
import { ConfirmModal } from './ConfirmModal'
import { OrderDetailsModal } from './OrderDetailsModal'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { OrderStatus, getOrderStatusDisplay, getDeliveryMethodDisplay, getDeliveryTimeDisplay } from '../../../constants/enums'

type SortField = 'created_at' | 'customer_name' | 'delivery_date' | 'total_amount' | 'status'
type SortDirection = 'asc' | 'desc'

interface Order {
  id: number
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

export function OrdersTable({ orders, onOrderUpdate }: { orders: Order[]; onOrderUpdate?: () => void }) {
  const router = useRouter()
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    orderId: number
    newStatus: string
    title: string
    message: string
  }>({
    isOpen: false,
    orderId: 0,
    newStatus: '',
    title: '',
    message: ''
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const closeOrderDetails = () => {
    setIsDetailsModalOpen(false)
    setSelectedOrder(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to descending
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'customer_name':
          aValue = a.customer_name.toLowerCase()
          bValue = b.customer_name.toLowerCase()
          break
        case 'delivery_date':
          aValue = new Date(a.delivery_date).getTime()
          bValue = new Date(b.delivery_date).getTime()
          break
        case 'total_amount':
          aValue = a.total_amount
          bValue = b.total_amount
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [orders, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />
  }

  const formatOrderDetailsForModal = (order: Order) => {
    const itemsList = order.order_items
      .map(item => `  • ${item.menu_item_name} x${item.quantity} - ${formatPrice(item.subtotal)}`)
      .join('\n')
    
    const detailsParts = [
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Phone: ${order.customer_phone}`,
      '',
      `Delivery: ${getDeliveryMethodDisplay(order.delivery_method)}`,
    ]
    
    if (order.delivery_method === 'delivery') {
      detailsParts.push(`Address: ${order.delivery_address}`)
    }
    
    detailsParts.push(
      `Date: ${formatDateWithDay(order.delivery_date)}`,
      `Time: ${getDeliveryTimeDisplay(order.delivery_time, true)}`,
      '',
      'Items:',
      itemsList,
      '',
      `Total: ${formatPrice(order.total_amount)}`
    )
    
    if (order.notes) {
      detailsParts.push('', `Notes: ${order.notes}`)
    }
    
    return detailsParts.join('\n')
  }

  const openConfirmModal = (order: Order, newStatus: OrderStatus) => {
    const statusTitles = {
      [OrderStatus.CONFIRMED]: 'Confirm Order',
      [OrderStatus.COMPLETED]: 'Complete Order',
      [OrderStatus.CANCELLED]: 'Cancel Order'
    }
    
    const statusMessages = {
      [OrderStatus.CONFIRMED]: 'Are you sure you want to confirm this order?\n\nThis will notify the customer that their order has been accepted.',
      [OrderStatus.COMPLETED]: 'Are you sure you want to mark this order as completed?\n\nThis indicates the order has been delivered/picked up.',
      [OrderStatus.CANCELLED]: 'Are you sure you want to cancel this order?\n\nThis action should only be done after contacting the customer.'
    }
    
    const orderDetails = formatOrderDetailsForModal(order)
    
    setConfirmModal({
      isOpen: true,
      orderId: order.id,
      newStatus,
      title: statusTitles[newStatus as keyof typeof statusTitles] || 'Update Order',
      message: `${statusMessages[newStatus as keyof typeof statusMessages] || 'Update order status?'}\n\n━━━━━━━━━━━━━━━━━━━━━━\nORDER DETAILS\n━━━━━━━━━━━━━━━━━━━━━━\n\n${orderDetails}`
    })
  }

  const handleConfirmAction = async () => {
    const { orderId, newStatus } = confirmModal
    setConfirmModal({ ...confirmModal, isOpen: false })
    setUpdatingStatus(orderId)
    
    try {
      const result = await updateOrderStatus(orderId, newStatus)
      
      if (result.success) {
        setNotification({ type: 'success', message: result.message || 'Order updated successfully!' })
        
        // Refetch orders to update the UI
        if (onOrderUpdate) {
          await onOrderUpdate()
        }
        
        router.refresh()
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to update order' })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'An error occurred while updating the order' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [OrderStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-300',
      [OrderStatus.COMPLETED]: 'bg-gray-100 text-gray-800 border-gray-300',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles[OrderStatus.PENDING]}`}>
        {getOrderStatusDisplay(status).toUpperCase()}
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
    <>
      {/* Notification Banner */}
      {notification && (
        <div className={`m-4 p-4 rounded-lg border-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✗'}</span>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              onClick={() => handleSort('created_at')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Order ID
                <SortIcon field="created_at" />
              </div>
            </th>
            <th 
              onClick={() => handleSort('customer_name')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Customer
                <SortIcon field="customer_name" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th 
              onClick={() => handleSort('delivery_date')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Delivery
                <SortIcon field="delivery_date" />
              </div>
            </th>
            <th 
              onClick={() => handleSort('total_amount')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Total
                <SortIcon field="total_amount" />
              </div>
            </th>
            <th 
              onClick={() => handleSort('status')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOrders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-900">
                  #{order.id}
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
                  {getDeliveryMethodDisplay(order.delivery_method, true)}
                </div>
                <div className="text-sm text-gray-600">{formatDateWithDay(order.delivery_date)}</div>
                <div className="text-xs text-gray-500">{getDeliveryTimeDisplay(order.delivery_time, true)}</div>
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
                  {order.status === OrderStatus.PENDING && (
                    <button
                      onClick={() => openConfirmModal(order, OrderStatus.CONFIRMED)}
                      disabled={updatingStatus === order.id}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      {updatingStatus === order.id ? '⏳ Confirming...' : '✓ Confirm'}
                    </button>
                  )}
                  {order.status === OrderStatus.CONFIRMED && (
                    <button
                      onClick={() => openConfirmModal(order, OrderStatus.COMPLETED)}
                      disabled={updatingStatus === order.id}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      {updatingStatus === order.id ? '⏳ Completing...' : '✓ Complete'}
                    </button>
                  )}
                  {(order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) && (
                    <button
                      onClick={() => openConfirmModal(order, OrderStatus.CANCELLED)}
                      disabled={updatingStatus === order.id}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      {updatingStatus === order.id ? '⏳ Cancelling...' : '✗ Cancel Order'}
                    </button>
                  )}
                  <button
                    onClick={() => openOrderDetails(order)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-center text-xs font-medium"
                  >
                    📋 View Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.newStatus === OrderStatus.CANCELLED ? 'danger' : 'confirm'}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        order={selectedOrder}
        onClose={closeOrderDetails}
      />
    </>
  )
}

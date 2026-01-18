'use client'

import { X, User, Mail, Phone, MapPin, Calendar, Clock, Package } from 'lucide-react'
import { formatPrice, DELIVERY_FEE } from '../../../constants/currency'
import { formatDateReadable } from '../../../constants/dateUtils'
import { OrderStatus, DeliveryMethod, getOrderStatusDisplay, getDeliveryMethodDisplay, getDeliveryTimeDisplay } from '../../../constants/enums'

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
  order_items: OrderItem[]
}

interface OrderDetailsModalProps {
  isOpen: boolean
  order: Order | null
  onClose: () => void
}

export function OrderDetailsModal({ isOpen, order, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null

  const getStatusBadge = (status: string) => {
    const styles = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [OrderStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-300',
      [OrderStatus.COMPLETED]: 'bg-gray-100 text-gray-800 border-gray-300',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
    }
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles] || styles[OrderStatus.PENDING]}`}>
        {getOrderStatusDisplay(status).toUpperCase()}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-1">Order ID: #{order.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Customer Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{order.customer_phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Delivery Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-orange-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Method</p>
                  <p className="font-semibold text-gray-900">
                    {getDeliveryMethodDisplay(order.delivery_method, true)}
                  </p>
                </div>
              </div>
              {order.delivery_method === DeliveryMethod.DELIVERY && order.delivery_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-orange-600 mt-1" />
                  <div>
                    <p className="text-xs text-gray-600">Delivery Address</p>
                    <p className="font-semibold text-gray-900">{order.delivery_address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-orange-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{formatDateReadable(order.delivery_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-orange-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Time</p>
                  <p className="font-semibold text-gray-900">{getDeliveryTimeDisplay(order.delivery_time, true)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.menu_item_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatPrice(item.menu_item_price)}
                    </p>
                  </div>
                  <p className="font-bold text-green-700">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t-2 border-green-300 space-y-2">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">Subtotal</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(order.order_items.reduce((sum, item) => sum + item.subtotal, 0))}
                </span>
              </div>
              
              {/* Delivery Fee */}
              {order.delivery_method === DeliveryMethod.DELIVERY ? (
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">Delivery Fee</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-green-700">Pickup (No delivery fee)</span>
                  <span className="text-base font-semibold text-green-700">
                    {formatPrice(0)}
                  </span>
                </div>
              )}
              
              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-green-300">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Order Notes</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Order Metadata */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Created: </span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Order ID: </span>
                <span className="font-mono text-xs text-gray-900">{order.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

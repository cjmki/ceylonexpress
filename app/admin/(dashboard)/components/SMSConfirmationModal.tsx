'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare, Send, Phone, Loader2 } from 'lucide-react'
import { generateSMSTemplate, getSMSSegmentInfo } from '@/lib/smsTemplate'
import { sendOrderConfirmationSMS } from '../../../actions/sms'
import { updateOrderStatus } from '../../../actions/orders'
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

interface SMSConfirmationModalProps {
  isOpen: boolean
  order: Order | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

type ModalState = 'editing' | 'sending' | 'confirming'

export function SMSConfirmationModal({
  isOpen,
  order,
  onClose,
  onSuccess,
  onError,
}: SMSConfirmationModalProps) {
  const [smsMessage, setSmsMessage] = useState('')
  const [modalState, setModalState] = useState<ModalState>('editing')

  useEffect(() => {
    if (isOpen && order) {
      setSmsMessage(generateSMSTemplate(order))
      setModalState('editing')
    }
  }, [isOpen, order])

  if (!isOpen || !order) return null

  const { charCount, segments } = getSMSSegmentInfo(smsMessage)

  const handleSendAndConfirm = async () => {
    setModalState('sending')

    try {
      const smsResult = await sendOrderConfirmationSMS(
        order.customer_phone,
        smsMessage
      )

      if (!smsResult.success) {
        onError(`SMS failed: ${smsResult.error}. Order was NOT confirmed.`)
        setModalState('editing')
        return
      }

      const statusResult = await updateOrderStatus(order.id, OrderStatus.CONFIRMED)

      if (!statusResult.success) {
        onError(`SMS was sent but order status update failed: ${statusResult.error}`)
        onClose()
        return
      }

      onSuccess('Order confirmed & SMS sent!')
      onClose()
    } catch (error) {
      onError('An unexpected error occurred.')
      setModalState('editing')
    }
  }

  const handleConfirmWithoutSMS = async () => {
    setModalState('confirming')

    try {
      const result = await updateOrderStatus(order.id, OrderStatus.CONFIRMED)

      if (result.success) {
        onSuccess('Order confirmed (no SMS sent)')
      } else {
        onError(result.error || 'Failed to confirm order')
      }
      onClose()
    } catch (error) {
      onError('An unexpected error occurred.')
      setModalState('editing')
    }
  }

  const isBusy = modalState === 'sending' || modalState === 'confirming'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isBusy ? undefined : onClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Order #{order.id}
              </h3>
              <p className="text-sm text-gray-500">
                Review and send SMS confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Recipient info */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-blue-700 font-medium">Sending to</p>
              <p className="text-base font-bold text-blue-900">
                {order.customer_name} &mdash; {order.customer_phone}
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Order Summary
            </p>
            <div className="space-y-1">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.menu_item_name}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-300 mt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-green-700">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Editable SMS message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="sms-message"
                className="text-sm font-semibold text-gray-700"
              >
                SMS Message
              </label>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={charCount > 1600 ? 'text-red-600 font-semibold' : ''}>
                  {charCount} chars
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  {segments} SMS segment{segments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <textarea
              id="sms-message"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              disabled={isBusy}
              rows={12}
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm font-mono leading-relaxed focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors resize-y disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 p-5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmWithoutSMS}
            disabled={isBusy}
            className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {modalState === 'confirming' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Without SMS'
            )}
          </button>
          <button
            onClick={handleSendAndConfirm}
            disabled={isBusy || smsMessage.trim().length === 0}
            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 sm:ml-auto"
          >
            {modalState === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending SMS...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send SMS & Confirm Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

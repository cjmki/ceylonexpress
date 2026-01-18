'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, ShoppingBag } from 'lucide-react'
import { formatPrice } from '../constants/currency'
import { DeliveryMethod } from '../constants/enums'

interface OrderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  customerName: string
  deliveryMethod: string
  deliveryDate: string
  deliveryTime: string
  subtotal: number
  deliveryFee: number
  totalAmount: number
  isSubmitting: boolean
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  customerName,
  deliveryMethod,
  deliveryDate,
  deliveryTime,
  subtotal,
  deliveryFee,
  totalAmount,
  isSubmitting
}: OrderConfirmationModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b-3 border-ceylon-cream px-6 py-4 flex items-center justify-between rounded-t-3xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-ceylon-orange/10 p-2 rounded-xl">
                <AlertCircle className="h-6 w-6 text-ceylon-orange" />
              </div>
              <h2 className="text-heading-lg text-ceylon-text font-bold"> Submit Your Order</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-ceylon-text/60 hover:text-ceylon-text transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Info message */}
            <div className="bg-ceylon-yellow/20 border-2 border-ceylon-orange/30 rounded-2xl p-4">
              <p className="text-body-md text-ceylon-text">
                <strong>Please review your order details before submitting.</strong> We will contact you via email or phone to confirm availability and finalize the order.
              </p>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="text-heading-md text-ceylon-text font-bold border-b-2 border-ceylon-cream pb-2">
                Customer Details
              </h3>
              <div className="bg-ceylon-cream/50 rounded-xl p-4 space-y-2">
                <p className="text-body-md text-ceylon-text">
                  <strong>Name:</strong> {customerName}
                </p>
                <p className="text-body-md text-ceylon-text">
                  <strong>Delivery Method:</strong> {deliveryMethod === DeliveryMethod.DELIVERY ? 'Delivery' : 'Pickup'}
                </p>
                <p className="text-body-md text-ceylon-text">
                  <strong>Date:</strong> {formatDate(deliveryDate)}
                </p>
                <p className="text-body-md text-ceylon-text">
                  <strong>Time:</strong> {deliveryTime}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="text-heading-md text-ceylon-text font-bold border-b-2 border-ceylon-cream pb-2 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-ceylon-orange" />
                Order Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center bg-white border-2 border-ceylon-cream rounded-xl p-3"
                  >
                    <div className="flex-1">
                      <p className="text-body-md text-ceylon-text font-semibold">{item.name}</p>
                      <p className="text-body-sm text-ceylon-text/60">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-body-lg text-ceylon-orange font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-ceylon-orange/10 border-3 border-ceylon-orange rounded-2xl p-4">
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-body-lg text-ceylon-text">Subtotal</span>
                  <span className="text-body-lg text-ceylon-text font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                
                {/* Delivery Fee */}
                {deliveryMethod === DeliveryMethod.DELIVERY ? (
                  <div className="flex justify-between items-center">
                    <span className="text-body-lg text-ceylon-text">Delivery Fee</span>
                    <span className="text-body-lg text-ceylon-text font-semibold">
                      {formatPrice(deliveryFee)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-body-lg text-green-700">Pickup (No delivery fee)</span>
                    <span className="text-body-lg text-green-700 font-semibold">
                      {formatPrice(0)}
                    </span>
                  </div>
                )}
                
                {/* Total with separator */}
                <div className="pt-3 border-t-2 border-ceylon-orange">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-body-lg sm:text-heading-md text-ceylon-text font-bold">Total Amount</span>
                    <span className="text-heading-md sm:text-heading-lg text-ceylon-orange font-bold whitespace-nowrap">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <p className="text-xs italic text-gray-500 mt-1 text-right">Inc. of 12% VAT</p>
                </div>
              </div>
              <p className="text-body-sm text-ceylon-text/70 mt-6">
                Payment will be collected upon delivery
              </p>
            </div>

            {/* Important Note */}
            <div className="bg-ceylon-cream border-2 border-dashed border-ceylon-text/20 rounded-2xl p-4">
              <p className="text-body-sm text-ceylon-text/70 leading-relaxed">
                <strong className="text-ceylon-text">Important:</strong> This is a pre-order request. We will review the availability of your items and contact you via email or phone to confirm your order before the delivery date.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t-3 border-ceylon-cream px-6 py-4 flex flex-col sm:flex-row gap-3 rounded-b-3xl flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-3 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-ceylon-orange hover:bg-ceylon-text text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? 'Placing Order...' : 'Submit Order'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

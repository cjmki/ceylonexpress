'use client'

import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { formatPrice, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/app/constants/currency'

interface InquiryItem {
  id: string
  name: string
  price: number
  quantity: number
  minimum_order_quantity?: number
  image_url: string | null
}

interface InquiryCartProps {
  items: InquiryItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export function InquiryCart({ items, onUpdateQuantity, onRemoveItem }: InquiryCartProps) {
  if (items.length === 0) {
    return null
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const isFreeDelivery = totalCost >= FREE_DELIVERY_THRESHOLD

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-3 border-ceylon-orange/30 shadow-lg mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-ceylon-orange" />
        <h3 className="text-base md:text-lg font-bold text-ceylon-text">
          Items to Inquire About ({totalItems})
        </h3>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 p-3 bg-ceylon-cream/30 rounded-xl border-2 border-ceylon-text/5"
          >
            {/* Small Image */}
            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-ceylon-cream">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ceylon-yellow/30 via-ceylon-cream/50 to-ceylon-orange/20 flex items-center justify-center">
                  <span className="text-xl">🍛</span>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-ceylon-text line-clamp-1 mb-0.5">
                {item.name}
              </h4>
              <p className="text-xs text-ceylon-text/60">
                {formatPrice(item.price)} each
                {item.minimum_order_quantity && item.minimum_order_quantity > 1 && (
                  <span className="ml-1 text-ceylon-orange">
                    (MOQ: {item.minimum_order_quantity})
                  </span>
                )}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= (item.minimum_order_quantity || 1)}
                className="p-1.5 rounded-lg bg-ceylon-orange/20 text-ceylon-orange hover:bg-ceylon-orange hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-bold text-ceylon-text min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="p-1.5 rounded-lg bg-ceylon-orange/20 text-ceylon-orange hover:bg-ceylon-orange hover:text-white transition-all"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
              title="Remove item"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Total Cost Section */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-ceylon-orange/30 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ceylon-text">Subtotal:</span>
          <span className="text-base font-bold text-ceylon-text">{formatPrice(totalCost)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ceylon-text">Delivery Fee:</span>
          {isFreeDelivery ? (
            <span className="text-base font-bold text-green-600">FREE 🎉</span>
          ) : (
            <span className="text-base font-bold text-ceylon-text">{formatPrice(DELIVERY_FEE)}</span>
          )}
        </div>

        {!isFreeDelivery && (
          <div className="bg-ceylon-yellow/20 border-2 border-ceylon-yellow/40 rounded-lg p-2">
            <p className="text-xs text-ceylon-text/80 text-center">
              🚚 Add {formatPrice(FREE_DELIVERY_THRESHOLD - totalCost)} more for free delivery!
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t-2 border-ceylon-orange/20">
          <span className="text-base font-bold text-ceylon-text">Estimated Total:</span>
          <span className="text-xl font-bold text-ceylon-orange">
            {formatPrice(totalCost + (isFreeDelivery ? 0 : DELIVERY_FEE))}
          </span>
        </div>

        <p className="text-xs text-ceylon-text/60 italic">
          💡 This is an estimate. Final pricing will be confirmed via email.
        </p>
      </div>
    </div>
  )
}

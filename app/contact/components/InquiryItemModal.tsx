'use client'

import { X, Plus } from 'lucide-react'
import { formatPrice } from '@/app/constants/currency'
import { getMenuCategoryDisplay } from '@/app/constants/enums'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  minimum_order_quantity?: number
  includes: string[] | null
  allergens?: Array<{
    allergen_id: number
    allergen_name: string
    allergen_code: string
    icon_emoji: string
  }>
}

interface InquiryItemModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAdd: (item: MenuItem) => void
}

export function InquiryItemModal({ item, isOpen, onClose, onAdd }: InquiryItemModalProps) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ceylon-text/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-ceylon-cream rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border-4 border-white custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 md:p-2.5 bg-white hover:bg-ceylon-orange text-ceylon-text hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 border-2 border-ceylon-orange/30"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {/* Image */}
        {item.image_url && (
          <div className="w-full h-48 md:h-80 bg-gradient-to-br from-ceylon-yellow/20 to-ceylon-orange/20 overflow-hidden rounded-t-3xl relative">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ceylon-text/20 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 bg-white rounded-b-3xl">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-ceylon-orange/10 text-ceylon-orange text-xs md:text-sm font-bold rounded-full border-2 border-ceylon-orange/30">
              {getMenuCategoryDisplay(item.category)}
            </span>
          </div>

          {/* Title */}
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-ceylon-text mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {item.name}
          </h2>

          {/* Description */}
          <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 mb-6 leading-relaxed">
            {item.description}
          </p>

          {/* MOQ Info */}
          {item.minimum_order_quantity && item.minimum_order_quantity > 1 && (
            <div className="mb-6 p-4 md:p-5 bg-ceylon-orange/10 border-3 border-ceylon-orange/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl md:text-2xl">📦</span>
                <h3 className="text-xs md:text-sm font-bold text-ceylon-text uppercase tracking-wider">
                  Minimum Order Quantity
                </h3>
              </div>
              <p className="text-ceylon-orange font-bold text-lg">
                Minimum order - {item.minimum_order_quantity}
              </p>
            </div>
          )}

          {/* Allergen Information */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mb-6 p-4 md:p-5 bg-orange-50 rounded-2xl border-3 border-orange-300 shadow-sm">
              <h3 className="text-xs md:text-sm font-bold text-ceylon-text mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-base md:text-lg">⚠️</span>
                Allergen Information:
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen) => (
                  <div
                    key={allergen.allergen_id}
                    className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-orange-300 rounded-lg shadow-sm"
                  >
                    <span className="text-lg">{allergen.icon_emoji}</span>
                    <span className="text-xs md:text-sm font-semibold text-ceylon-text">
                      {allergen.allergen_name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ceylon-text/60 mt-3 italic">
                If you have allergies, please mention them in your message below.
              </p>
            </div>
          )}

          {/* Includes Section */}
          {item.includes && item.includes.length > 0 && (
            <div className="mb-6 p-4 md:p-5 bg-white rounded-2xl border-3 border-ceylon-blue/30 shadow-sm">
              <h3 className="text-xs md:text-sm font-bold text-ceylon-text mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-base md:text-lg">✨</span>
                What's Included:
              </h3>
              <ul className="space-y-2">
                {item.includes.map((include, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-ceylon-text/80"
                  >
                    <span className="text-ceylon-orange flex-shrink-0 text-base md:text-lg leading-none mt-0.5">•</span>
                    <span className="text-xs md:text-sm leading-relaxed">{include}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price and Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t-2 border-dashed border-ceylon-orange/30">
            <div className="bg-ceylon-cream/50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-ceylon-yellow/50">
              <p className="text-xs text-ceylon-text/60 mb-1 uppercase tracking-wider font-semibold">Price</p>
              <span className="text-2xl md:text-3xl font-bold text-ceylon-orange">
                {formatPrice(item.price)}
              </span>
            </div>
            
            <button
              onClick={() => {
                onAdd(item)
                onClose()
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 font-bold uppercase text-xs md:text-sm tracking-wider transition-all duration-300 rounded-full shadow-lg border-3 bg-ceylon-orange border-ceylon-orange text-white hover:bg-ceylon-text hover:border-ceylon-text hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Add to Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

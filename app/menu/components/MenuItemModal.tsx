'use client'

import { X, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '../../constants/currency'
import { getMenuCategoryDisplay } from '../../constants/enums'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  available: boolean
  includes: string[] | null
  has_limited_availability?: boolean
  pre_orders_only?: boolean
  next_available_date?: string
  available_slots?: number
  minimum_order_quantity?: number
}

interface MenuItemModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem) => void
  isAdded: boolean
}

export function MenuItemModal({ item, isOpen, onClose, onAddToCart, isAdded }: MenuItemModalProps) {
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

          {/* Availability Info */}
          {item.has_limited_availability && (
            <div className="mb-6 p-4 md:p-5 bg-ceylon-yellow/20 border-3 border-ceylon-orange/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl md:text-2xl">📅</span>
                <h3 className="text-xs md:text-sm font-bold text-ceylon-text uppercase tracking-wider">
                  Limited Availability
                </h3>
              </div>
              {item.available_slots !== undefined && item.available_slots > 0 ? (
                <div className="space-y-1">
                  <p className="text-ceylon-orange font-bold text-lg">
                    {item.available_slots} {item.available_slots === 1 ? 'spot' : 'spots'} remaining
                    {item.next_available_date && (
                      <span className="text-ceylon-text/60 font-normal text-base ml-2">
                        ({new Date(item.next_available_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })})
                      </span>
                    )}
                  </p>
                  {item.pre_orders_only && (
                    <p className="text-sm text-ceylon-text/70">
                      ⏰ Pre-orders only - Order in advance
                    </p>
                  )}
                </div>
              ) : item.available_slots === 0 ? (
                <div>
                  <p className="text-red-600 font-bold mb-1">
                    😔 Sold out
                    {item.next_available_date && (
                      <span className="text-ceylon-text/60 font-normal ml-2">
                        ({new Date(item.next_available_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })})
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-ceylon-text/70">
                  Check availability at checkout
                </p>
              )}
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
                if (item.available_slots !== 0) {
                  onAddToCart(item)
                }
              }}
              disabled={item.available_slots === 0}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 font-bold uppercase text-xs md:text-sm tracking-wider transition-all duration-300 rounded-full shadow-lg border-3 ${
                item.available_slots === 0
                  ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-green-600 border-green-600 text-white scale-105'
                  : 'bg-ceylon-orange border-ceylon-orange text-white hover:bg-ceylon-text hover:border-ceylon-text hover:shadow-xl hover:scale-105'
              }`}
            >
              {item.available_slots === 0 ? (
                <>
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                  Sold Out
                </>
              ) : isAdded ? (
                <>
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          {!item.available && (
            <div className="mt-4 p-3 md:p-4 bg-red-50 border-3 border-red-300 rounded-2xl">
              <p className="text-red-700 text-xs md:text-sm font-bold text-center uppercase tracking-wider">
                ⚠️ Currently Unavailable
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

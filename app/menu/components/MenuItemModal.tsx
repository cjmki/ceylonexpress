'use client'

import { X, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '../../constants/currency'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  available: boolean
  includes: string[] | null
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Image */}
        {item.image_url && (
          <div className="w-full h-64 md:h-80 bg-ceylon-cream/30 overflow-hidden rounded-t-2xl">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-ceylon-orange/10 text-ceylon-orange text-sm font-semibold rounded-full">
              {item.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-ceylon-text mb-4">
            {item.name}
          </h2>

          {/* Description */}
          <p className="text-lg text-ceylon-text/70 mb-6 leading-relaxed">
            {item.description}
          </p>

          {/* Includes Section */}
          {item.includes && item.includes.length > 0 && (
            <div className="mb-6 p-4 bg-ceylon-cream/50 rounded-lg border-2 border-ceylon-orange/20">
              <h3 className="text-sm font-bold text-ceylon-text mb-3 uppercase tracking-wider">
                What's Included:
              </h3>
              <ul className="space-y-2">
                {item.includes.map((include, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-2 text-ceylon-text/80"
                  >
                    <span className="text-ceylon-orange flex-shrink-0 text-lg leading-none">•</span>
                    <span className="text-sm leading-relaxed">{include}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price and Add Button */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-ceylon-cream">
            <div>
              <p className="text-sm text-ceylon-text/60 mb-1">Price</p>
              <span className="text-3xl font-bold text-ceylon-orange">
                {formatPrice(item.price)}
              </span>
            </div>
            
            <button
              onClick={() => onAddToCart(item)}
              className={`flex items-center gap-3 px-8 py-4 font-bold uppercase text-sm tracking-wider transition-all rounded-xl shadow-lg ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-ceylon-orange text-white hover:bg-ceylon-text hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          {!item.available && (
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold text-center">
                Currently Unavailable
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

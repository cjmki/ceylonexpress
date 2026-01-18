'use client'

import { useState } from 'react'
import { Plus, Eye, Check } from 'lucide-react'
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
}

interface MenuItemRowProps {
  item: MenuItem
  onViewDetails: (item: MenuItem) => void
  onAdd: (item: MenuItem) => void
}

export function MenuItemRow({ item, onViewDetails, onAdd }: MenuItemRowProps) {
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAdd(item)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1000)
  }

  return (
    <div 
      className="bg-white border-2 border-ceylon-text/5 hover:border-ceylon-orange rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 hover:shadow-lg cursor-pointer group"
      onClick={() => onViewDetails(item)}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Small Image */}
        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden relative bg-ceylon-cream/30">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ceylon-yellow/30 via-ceylon-cream/50 to-ceylon-orange/20 flex items-center justify-center">
              <span className="text-2xl md:text-3xl">🍛</span>
            </div>
          )}
          <div className="absolute inset-0 bg-ceylon-orange/0 group-hover:bg-ceylon-orange/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 p-1.5 rounded-full">
              <Eye className="h-3 w-3 md:h-4 md:w-4 text-ceylon-orange" />
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-bold text-ceylon-text mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs md:text-sm text-ceylon-text/60 line-clamp-1 mb-1">
            {item.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-ceylon-orange/70 bg-ceylon-orange/10 px-2 py-0.5 rounded">
              {getMenuCategoryDisplay(item.category)}
            </span>
            {item.minimum_order_quantity && item.minimum_order_quantity > 1 && (
              <span className="text-xs font-semibold text-ceylon-orange bg-ceylon-orange/10 px-2 py-0.5 rounded">
                MOQ: {item.minimum_order_quantity}
              </span>
            )}
          </div>
        </div>

        {/* Price and Add Button */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm md:text-base font-bold text-ceylon-orange whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={handleAdd}
            className={`p-2 md:p-2.5 rounded-lg border-2 text-white transition-all duration-300 ${
              justAdded 
                ? 'bg-green-600 border-green-600 scale-110' 
                : 'bg-ceylon-orange border-ceylon-orange hover:bg-ceylon-text hover:border-ceylon-text hover:scale-110'
            }`}
            title="Add to inquiry"
          >
            {justAdded ? (
              <Check className="h-3 w-3 md:h-4 md:w-4 animate-in fade-in zoom-in" />
            ) : (
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

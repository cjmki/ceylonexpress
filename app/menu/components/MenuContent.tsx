'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../contexts/CartContext'
import { getMenuItemsFresh } from '../../actions/menu'
import type { MenuItem } from '../../actions/menu'
import { formatPrice } from '../../constants/currency'
import { MenuItemModal } from './MenuItemModal'
import { MENU_CATEGORIES, getMenuCategoryDisplay } from '../../constants/enums'

// Skeleton shimmer image component - shows a shimmer until the image loads, then fades it in
function MenuItemImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {/* Shimmer skeleton - visible until image loads */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-ceylon-cream/60 via-white/80 to-ceylon-cream/60 bg-[length:200%_100%] animate-shimmer transition-opacity duration-500 ${
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Faint food icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl md:text-3xl opacity-30">🍛</span>
        </div>
      </div>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        className={`object-cover group-hover:scale-110 transition-all duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

interface MenuContentProps {
  initialMenuItems: MenuItem[]
}

export default function MenuContent({ initialMenuItems }: MenuContentProps) {
  // Initialize with server-fetched data - no loading spinner needed!
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart, cart } = useCart()

  // Build a lookup: itemId -> quantity in cart (for adjusting displayed slots)
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const cartItem of cart) {
      map.set(cartItem.id, cartItem.quantity)
    }
    return map
  }, [cart])

  // Get the display slots for an item (server slots minus what's in cart)
  const getDisplaySlots = useCallback((item: MenuItem): number | undefined => {
    if (!item.has_limited_availability || item.available_slots === undefined) {
      return item.available_slots
    }
    const inCart = cartQuantityMap.get(item.id) || 0
    return Math.max(0, item.available_slots - inCart)
  }, [cartQuantityMap])

  // Refresh only availability data periodically (not the full page)
  const refreshAvailability = useCallback(async () => {
    try {
      const freshItems = await getMenuItemsFresh()
      setMenuItems(freshItems)
    } catch (error) {
      console.error('Failed to refresh menu data:', error)
    }
  }, [])

  // Refresh availability every 60 seconds (reduced from 30s, data already loaded on server)
  useEffect(() => {
    const interval = setInterval(refreshAvailability, 60000)
    return () => clearInterval(interval)
  }, [refreshAvailability])

  // Refresh when page becomes visible (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAvailability()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshAvailability])

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url || undefined
    })
    
    setAddedItems(prev => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }, 2000)
  }

  const openModal = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedItem(null), 200)
  }

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  // Sort items within each category: available items first, sold out last, then alphabetically
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      const aIsSoldOut = a.has_limited_availability && getDisplaySlots(a) === 0
      const bIsSoldOut = b.has_limited_availability && getDisplaySlots(b) === 0
      
      if (aIsSoldOut && !bIsSoldOut) return 1
      if (!aIsSoldOut && bIsSoldOut) return -1
      
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    })
  })

  // Sort categories by defined order
  const sortedCategories = Object.entries(groupedItems).sort(([categoryA], [categoryB]) => {
    const indexA = MENU_CATEGORIES.indexOf(categoryA as any)
    const indexB = MENU_CATEGORIES.indexOf(categoryB as any)
    
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    
    return orderA - orderB
  })

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🍽️</div>
        <p className="text-lg md:text-xl text-ceylon-text/70 mb-8">No menu items available at the moment.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-8 py-4 font-bold uppercase text-sm tracking-wider transition-all duration-300 rounded-full shadow-lg hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-12 md:space-y-16">
        {sortedCategories.map(([category, items], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
          >
            {/* Category Header */}
            <div className="relative inline-block mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-ceylon-text px-6 py-3 bg-white rounded-2xl border-3 border-ceylon-orange shadow-md">
                {getMenuCategoryDisplay(category)}
              </h2>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-ceylon-orange rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {items.map((item, index) => {
                const displaySlots = getDisplaySlots(item)
                const isSoldOut = item.has_limited_availability && displaySlots === 0

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="bg-white border-3 border-ceylon-text/5 hover:border-ceylon-orange shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl md:rounded-3xl flex flex-col group cursor-pointer hover:scale-105"
                    onClick={() => openModal(item)}
                  >
                    {/* Image with skeleton shimmer */}
                    {item.image_url ? (
                      <div className="w-full h-28 md:h-36 bg-ceylon-cream/30 overflow-hidden relative rounded-t-2xl md:rounded-t-3xl">
                        <MenuItemImage src={item.image_url} alt={item.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 p-2 rounded-full">
                            <Eye className="h-4 w-4 md:h-5 md:w-5 text-ceylon-orange" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-28 md:h-36 bg-gradient-to-br from-ceylon-yellow/30 via-ceylon-cream/50 to-ceylon-orange/20 flex items-center justify-center rounded-t-2xl md:rounded-t-3xl">
                        <span className="text-3xl md:text-4xl">🍛</span>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-3 md:p-4 flex flex-col flex-grow">
                      <h3 className="text-xs md:text-sm font-bold text-ceylon-text mb-1 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                        {item.name}
                      </h3>
                      
                      <p className="text-[10px] md:text-xs text-ceylon-text/60 mb-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* MOQ Badge */}
                      {item.minimum_order_quantity && item.minimum_order_quantity > 1 && (
                        <div className="mb-2">
                          <div className="text-[10px] md:text-xs font-bold bg-ceylon-orange/10 px-2 py-1 rounded-lg">
                            <span className="text-ceylon-orange">Minimum order - {item.minimum_order_quantity}</span>
                          </div>
                        </div>
                      )}

                      {/* Availability Badge */}
                      {item.has_limited_availability && (
                        <div className="mb-2">
                          {displaySlots !== undefined && displaySlots > 0 ? (
                            <div 
                              className="text-[10px] md:text-xs font-bold cursor-help bg-ceylon-orange/10 px-2 py-1 rounded-lg"
                              title="More dates may be available at checkout"
                            >
                              <span className="text-ceylon-orange">
                                {displaySlots} {displaySlots === 1 ? 'spot' : 'spots'} left
                              </span>
                              {item.next_available_date && (
                                <span className="text-ceylon-text/60 ml-1">
                                  ({new Date(item.next_available_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                                </span>
                              )}
                              {item.pre_orders_only && (
                                <span className="ml-1 text-ceylon-text/50 block mt-0.5">• Pre-order</span>
                              )}
                            </div>
                          ) : isSoldOut ? (
                            <div 
                              className="text-[10px] md:text-xs font-bold text-red-600 cursor-help bg-red-50 px-2 py-1 rounded-lg"
                              title="Check other dates at checkout"
                            >
                              Sold out
                              {item.next_available_date && (
                                <span className="text-ceylon-text/50 ml-1">
                                  ({new Date(item.next_available_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] md:text-xs font-semibold text-ceylon-text/50 bg-ceylon-cream/50 px-2 py-1 rounded-lg">
                              📅 Limited
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-2 border-t-2 border-ceylon-cream">
                        <span className="text-sm md:text-base font-bold text-ceylon-orange">
                          {formatPrice(item.price)}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isSoldOut) {
                              handleAddToCart(item)
                            }
                          }}
                          disabled={isSoldOut}
                          className={`p-2 md:p-2.5 rounded-xl border-2 transition-all duration-300 ${
                            isSoldOut
                              ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                              : addedItems.has(item.id)
                              ? 'bg-green-600 border-green-600 text-white scale-110'
                              : 'bg-ceylon-orange border-ceylon-orange text-white hover:bg-ceylon-text hover:border-ceylon-text hover:scale-110'
                          }`}
                          title={isSoldOut ? 'Sold out' : 'Add to cart'}
                        >
                          {addedItems.has(item.id) ? (
                            <Check className="h-3 w-3 md:h-4 md:w-4" />
                          ) : (
                            <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Menu Item Modal - pass item with cart-adjusted slots */}
      <MenuItemModal
        item={selectedItem ? {
          ...selectedItem,
          available_slots: getDisplaySlots(selectedItem),
        } : null}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
        isAdded={selectedItem ? addedItems.has(selectedItem.id) : false}
      />
    </>
  )
}

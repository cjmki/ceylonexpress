'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Eye } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useCart } from '../contexts/CartContext'
import { getMenuItems } from '../actions/orders'
import { formatPrice } from '../constants/currency'
import { MenuItemModal } from './components/MenuItemModal'
import { MENU_CATEGORIES, MENU_CATEGORY_DISPLAY, getMenuCategoryDisplay } from '../constants/enums'

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

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart, getItemCount } = useCart()

  // Function to fetch menu data (now includes availability)
  const fetchMenuData = async () => {
    try {
      const items = await getMenuItems()
      setMenuItems(items || [])
    } catch (error) {
      console.error('Failed to load menu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMenuData()
  }, [])

  // Refresh availability data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMenuData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Also refresh when page becomes visible (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMenuData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url || undefined
    })
    
    // Show feedback
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

  const cartItemCount = getItemCount()

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  // Sort items within each category: available items first, sold out last
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      // If item has limited availability, check slots
      const aIsSoldOut = a.has_limited_availability && a.available_slots === 0
      const bIsSoldOut = b.has_limited_availability && b.available_slots === 0
      
      // Available items (not sold out) come first
      if (aIsSoldOut && !bIsSoldOut) return 1
      if (!aIsSoldOut && bIsSoldOut) return -1
      
      // If both have same availability status, maintain original order
      return 0
    })
  })

  // Sort categories by defined order
  const sortedCategories = Object.entries(groupedItems).sort(([categoryA], [categoryB]) => {
    const indexA = MENU_CATEGORIES.indexOf(categoryA as any)
    const indexB = MENU_CATEGORIES.indexOf(categoryB as any)
    
    // If category is not in the order list, put it at the end
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    
    return orderA - orderB
  })

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <Navigation />

      {/* Menu Content */}
      <section className="flex-1 pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header with Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16 text-center"
          >
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Authentic Sri Lankan{' '}
              <span className="text-ceylon-orange relative inline-block">
                Flavors
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
                />
              </span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 max-w-2xl mx-auto">
              Traditional recipes made fresh with love and authentic spices
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-ceylon-orange/20 border-t-ceylon-orange"></div>
              <p className="mt-4 text-ceylon-text/70 font-medium">Loading delicious dishes...</p>
            </div>
          ) : menuItems.length === 0 ? (
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
          ) : (
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
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="bg-white border-3 border-ceylon-text/5 hover:border-ceylon-orange shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl md:rounded-3xl flex flex-col group cursor-pointer hover:scale-105"
                        onClick={() => openModal(item)}
                      >
                        {/* Image */}
                        {item.image_url ? (
                          <div className="w-full h-28 md:h-36 bg-ceylon-cream/30 overflow-hidden relative rounded-t-2xl md:rounded-t-3xl">
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
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
                              {item.available_slots !== undefined && item.available_slots > 0 ? (
                                <div 
                                  className="text-[10px] md:text-xs font-bold cursor-help bg-ceylon-orange/10 px-2 py-1 rounded-lg"
                                  title="More dates may be available at checkout"
                                >
                                  <span className="text-ceylon-orange">
                                    {item.available_slots} {item.available_slots === 1 ? 'spot' : 'spots'} left
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
                              ) : item.available_slots === 0 ? (
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
                                if (item.available_slots !== 0) {
                                  handleAddToCart(item)
                                }
                              }}
                              disabled={item.available_slots === 0}
                              className={`p-2 md:p-2.5 rounded-xl border-2 transition-all duration-300 ${
                                item.available_slots === 0
                                  ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                                  : addedItems.has(item.id)
                                  ? 'bg-green-600 border-green-600 text-white scale-110'
                                  : 'bg-ceylon-orange border-ceylon-orange text-white hover:bg-ceylon-text hover:border-ceylon-text hover:scale-110'
                              }`}
                              title={item.available_slots === 0 ? 'Sold out' : 'Add to cart'}
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
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Menu Item Modal */}
      <MenuItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
        isAdded={selectedItem ? addedItems.has(selectedItem.id) : false}
      />

      <Footer />
    </div>
  )
}

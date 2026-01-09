'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Eye } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import TestingBanner from '../components/TestingBanner'
import { useCart } from '../contexts/CartContext'
import { getMenuItems } from '../actions/orders'
import { formatPrice } from '../constants/currency'
import { MenuItemModal } from './components/MenuItemModal'

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

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart, getItemCount } = useCart()

  useEffect(() => {
    async function fetchMenu() {
      try {
        const items = await getMenuItems()
        setMenuItems(items || [])
      } catch (error) {
        console.error('Failed to load menu:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
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

  // Define category display order
  const CATEGORY_ORDER = ['Featured', 'Mains', 'Bites', 'Snaks', 'Drinks', 'Specials']
  
  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  // Sort categories by defined order
  const sortedCategories = Object.entries(groupedItems).sort(([categoryA], [categoryB]) => {
    const indexA = CATEGORY_ORDER.indexOf(categoryA)
    const indexB = CATEGORY_ORDER.indexOf(categoryB)
    
    // If category is not in the order list, put it at the end
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    
    return orderA - orderB
  })

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <Navigation />
      <TestingBanner />

      {/* Menu Content */}
      <section className="flex-1 pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-display-md md:text-display-lg text-ceylon-text mb-4">
              Our Menu
            </h1>
            <p className="text-body-xl text-ceylon-text/70 max-w-2xl mx-auto">
              Authentic Sri Lankan dishes made fresh with traditional recipes
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ceylon-orange"></div>
              <p className="mt-4 text-ceylon-text/70">Loading menu...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-ceylon-text/70">No menu items available at the moment.</p>
              <Link
                href="/"
                className="inline-block mt-8 border-2 border-ceylon-text text-ceylon-text px-10 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text hover:text-ceylon-cream transition-colors rounded-lg"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {sortedCategories.map(([category, items], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <h2 className="text-heading-xl text-ceylon-text mb-8 border-b-2 border-ceylon-orange pb-2 inline-block">
                    {category}
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="bg-white shadow-md overflow-hidden hover:shadow-xl transition-all rounded-xl flex flex-col group cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                        {/* Image */}
                        {item.image_url ? (
                          <div className="w-full h-32 bg-ceylon-cream/30 overflow-hidden relative">
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-ceylon-orange/20 to-ceylon-cream flex items-center justify-center">
                            <span className="text-4xl">🍛</span>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="p-3 flex flex-col flex-grow">
                          <h3 className="text-sm font-bold text-ceylon-text mb-1 line-clamp-2 min-h-[2.5rem]">
                            {item.name}
                          </h3>
                          
                          <p className="text-xs text-ceylon-text/60 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-ceylon-cream">
                            <span className="text-base font-bold text-ceylon-orange">
                              {formatPrice(item.price)}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddToCart(item)
                              }}
                              className={`p-2 rounded-lg transition-all ${
                                addedItems.has(item.id)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-ceylon-orange text-white hover:bg-ceylon-text'
                              }`}
                              title="Add to cart"
                            >
                              {addedItems.has(item.id) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
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

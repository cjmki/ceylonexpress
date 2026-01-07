'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import Link from 'next/link'
import MenuNavigation from '../components/MenuNavigation'
import Footer from '../components/Footer'
import TestingBanner from '../components/TestingBanner'
import { useCart } from '../contexts/CartContext'
import { getMenuItems } from '../actions/orders'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  available: boolean
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
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

  const cartItemCount = getItemCount()

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <MenuNavigation />
      <TestingBanner />

      {/* Menu Content */}
      <section className="flex-1 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-ceylon-text mb-4">
              Our Menu
            </h1>
            <p className="text-xl text-ceylon-text/70 max-w-2xl mx-auto">
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
              {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <h2 className="text-3xl font-bold text-ceylon-text mb-8 border-b-2 border-ceylon-orange pb-2 inline-block">
                    {category}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow rounded-2xl"
                      >
                        {item.image_url && (
                          <div className="w-full h-48 bg-ceylon-cream/30 overflow-hidden rounded-t-2xl">
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-ceylon-text mb-2">
                            {item.name}
                          </h3>
                          <p className="text-ceylon-text/70 mb-4 min-h-[3rem]">
                            {item.description}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-ceylon-orange">
                              {item.price} SEK
                            </span>
                            
                            <button
                              onClick={() => handleAddToCart(item)}
                              className={`flex items-center gap-2 px-6 py-2 font-bold uppercase text-sm tracking-wider transition-all rounded-lg ${
                                addedItems.has(item.id)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-ceylon-orange text-white hover:bg-ceylon-text'
                              }`}
                            >
                              {addedItems.has(item.id) ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Add
                                </>
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

      <Footer />
    </div>
  )
}

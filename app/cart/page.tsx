'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../actions/orders'
import MenuNavigation from '../components/MenuNavigation'
import Footer from '../components/Footer'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const result = await createOrder({
        ...formData,
        orderItems: cart,
        totalAmount: getTotal()
      })

      if (result.success) {
        clearCart()
        router.push(`/order-confirmation/${result.orderId}`)
      } else {
        setError(result.error || 'Failed to place order. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ceylon-cream flex flex-col">
        <MenuNavigation />
        
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingBag className="h-24 w-24 text-ceylon-orange/30 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-ceylon-text mb-4">Your cart is empty</h2>
            <p className="text-xl text-ceylon-text/70 mb-8">
              Add some delicious Sri Lankan dishes to get started!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-ceylon-orange text-white px-8 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Browse Menu
            </Link>
          </motion.div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <MenuNavigation />
      
      <section className="flex-1 py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/menu"
                className="text-ceylon-text hover:text-ceylon-orange transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-5xl font-bold text-ceylon-text">Your Order</h1>
            </div>

            {/* Cart Items */}
            <div className="bg-white p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-ceylon-text mb-6">Order Items</h2>
              
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-6 border-b border-ceylon-cream py-6 last:border-b-0">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-ceylon-text">{item.name}</h3>
                    <p className="text-ceylon-orange font-bold">{item.price} SEK</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="text-xl font-bold text-ceylon-text min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="text-right min-w-[6rem]">
                    <p className="text-xl font-bold text-ceylon-text">
                      {(item.price * item.quantity).toFixed(2)} SEK
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 pt-6 border-t-2 border-ceylon-orange">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-ceylon-text">Total</span>
                  <span className="text-3xl font-bold text-ceylon-orange">
                    {getTotal().toFixed(2)} SEK
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-ceylon-text mb-6">Delivery Details</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-bold text-ceylon-text mb-2">
                    Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-bold text-ceylon-text mb-2">
                    Email Address *
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-bold text-ceylon-text mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors"
                    placeholder="+46 70 123 4567"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-bold text-ceylon-text mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    required
                    rows={3}
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors"
                    placeholder="Street address, city, postal code"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-bold text-ceylon-text mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors"
                    placeholder="Any allergies, preferences, or delivery instructions"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-ceylon-cream p-6 rounded">
                  <p className="text-sm text-ceylon-text/70 leading-relaxed">
                    <strong>Note:</strong> We will review the availability of your items and contact you 
                    via email or phone to confirm your order. Payment will be collected upon delivery.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-ceylon-orange text-white py-4 text-lg font-bold uppercase tracking-wider hover:bg-ceylon-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


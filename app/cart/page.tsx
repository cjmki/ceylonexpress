'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '../contexts/CartContext'
import { createOrder, checkOrderAvailability, getAvailableDatesForCart } from '../actions/orders'
import { formatDateForDisplay } from '@/lib/utils'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import TestingBanner from '../components/TestingBanner'
import { formatPrice, CURRENCY } from '../constants/currency'
import { DeliveryMethod, DeliveryTime, DELIVERY_TIMES, getDeliveryTimeDisplay } from '../constants/enums'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [hasLimitedItems, setHasLimitedItems] = useState(false)
  const [loadingDates, setLoadingDates] = useState(false)
  const [availabilityWarning, setAvailabilityWarning] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryMethod: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  })

  const pickupAddress = 'Bondhagsvägen, Upplands-Bro'

  // Fetch available dates when cart changes
  useEffect(() => {
    async function fetchAvailableDates() {
      if (cart.length === 0) {
        setAvailableDates([])
        setHasLimitedItems(false)
        return
      }

      setLoadingDates(true)
      try {
        const cartItems = cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
        }))

        const result = await getAvailableDatesForCart(cartItems)
        
        if (result.success) {
          if (result.hasLimitedItems) {
            setAvailableDates(result.dates || [])
            setHasLimitedItems(true)
          } else {
            // No limited items, all dates available
            setHasLimitedItems(false)
            setAvailableDates([])
          }
        }
      } catch (err) {
        console.error('Failed to fetch available dates:', err)
      } finally {
        setLoadingDates(false)
      }
    }

    fetchAvailableDates()
  }, [cart])

  // Check availability when date changes
  useEffect(() => {
    async function checkAvailability() {
      if (!formData.deliveryDate || cart.length === 0) {
        setAvailabilityWarning([])
        return
      }

      try {
        const cartItems = cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
        }))

        const result = await checkOrderAvailability(cartItems, formData.deliveryDate)
        
        if (result.success && !result.available) {
          setAvailabilityWarning(result.unavailableItems || [])
        } else {
          setAvailabilityWarning([])
        }
      } catch (err) {
        console.error('Failed to check availability:', err)
      }
    }

    checkAvailability()
  }, [formData.deliveryDate, cart])

  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Calculate maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  // Check if a date is available
  const isDateAvailable = (date: string) => {
    if (!hasLimitedItems) return true // No restrictions
    return availableDates.includes(date)
  }

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
        // Navigate first, then clear cart to avoid showing empty cart message
        router.push(`/order-confirmation/${result.orderId}`)
        // Clear cart after a short delay to ensure navigation has started
        setTimeout(() => {
          clearCart()
        }, 100)
      } else {
        setError(result.error || 'Failed to place order. Please try again.')
        setIsSubmitting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
      setIsSubmitting(false)
    }
    // Don't set isSubmitting to false on success - keep loading state during redirect
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-ceylon-cream flex flex-col">
        <Navigation />
        <TestingBanner />
        
        <div className="flex-1 flex items-center justify-center px-6 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingBag className="h-24 w-24 text-ceylon-orange/30 mx-auto mb-6" />
            <h2 className="text-display-sm text-ceylon-text mb-4">Your cart is empty</h2>
            <p className="text-body-xl text-ceylon-text/70 mb-8">
              Add some delicious Sri Lankan dishes to get started!
            </p>
            <Link
              href="/menu"
              className="btn btn-lg btn-primary"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Browse Menu</span>
            </Link>
          </motion.div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <Navigation />
      <TestingBanner />
      
      <section className="flex-1 pt-36 pb-12 md:pt-40 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
              <Link
                href="/menu"
                className="text-ceylon-text hover:text-ceylon-orange transition-colors"
              >
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <h1 className="text-heading-xl md:text-display-sm text-ceylon-text">Your Order</h1>
            </div>

            {/* Cart Items */}
            <div className="bg-white p-4 md:p-8 shadow-lg mb-6 md:mb-8 rounded-2xl">
              <h2 className="text-heading-sm md:text-heading-md text-ceylon-text mb-4 md:mb-6">Order Items</h2>
              
              {cart.map((item) => (
                <div key={item.id} className="border-b border-ceylon-cream py-6 last:border-b-0">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-4">
                    <div className="flex gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-heading-sm text-ceylon-text mb-1">{item.name}</h3>
                        <p className="text-body-sm text-ceylon-orange font-bold">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="text-heading-sm text-ceylon-text min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="text-heading-sm text-ceylon-text">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center gap-6">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-heading-sm text-ceylon-text">{item.name}</h3>
                      <p className="text-body-md text-ceylon-orange font-bold">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="text-heading-sm text-ceylon-text min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg"
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
                      <p className="text-heading-sm text-ceylon-text">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t-2 border-ceylon-orange">
                <div className="flex justify-between items-center">
                  <span className="text-heading-sm md:text-heading-md text-ceylon-text">Total</span>
                  <span className="text-heading-md md:text-heading-xl text-ceylon-orange">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-4 md:p-8 shadow-lg rounded-2xl">
              <h2 className="text-heading-md md:text-heading-xl text-ceylon-text mb-4 md:mb-6">Delivery Details</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-label text-ceylon-text mb-2">
                    Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerEmail" className="block text-label text-ceylon-text mb-2">
                    Email Address *
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerPhone" className="block text-label text-ceylon-text mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                    placeholder="+46 70 123 4567"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="deliveryMethod" className="block text-label text-ceylon-text mb-2">
                    Delivery Method *
                  </label>
                  <select
                    id="deliveryMethod"
                    name="deliveryMethod"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors bg-white rounded-lg"
                    value={formData.deliveryMethod}
                    onChange={handleInputChange}
                  >
                    <option value="">Select delivery method</option>
                    <option value={DeliveryMethod.DELIVERY}>Delivery (Stockholm area only)</option>
                    <option value={DeliveryMethod.PICKUP}>Pick up from {pickupAddress}</option>
                  </select>
                </div>
                
                {formData.deliveryMethod === DeliveryMethod.DELIVERY && (
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-label text-ceylon-text mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      required
                      rows={3}
                      className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                      placeholder="Street address, city, postal code (Stockholm area only)"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                    />
                    <p className="text-body-xs text-ceylon-text/60 mt-1">
                      ⚠️ We only deliver within Stockholm area
                    </p>
                  </div>
                )}
                
                {formData.deliveryMethod === DeliveryMethod.PICKUP && (
                  <div className="bg-ceylon-cream p-4 rounded-xl border-2 border-ceylon-orange/30">
                    <p className="text-body-md font-bold text-ceylon-text mb-2">📍 Pickup Location:</p>
                    <p className="text-body-md text-ceylon-text">{pickupAddress}</p>
                    <p className="text-body-xs text-ceylon-text/60 mt-2">
                      We&apos;ll send you the exact address and instructions after confirming your order
                    </p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="deliveryDate" className="block text-label text-ceylon-text mb-2">
                    Preferred Delivery Date *
                  </label>
                  
                  {loadingDates && (
                    <div className="mb-2 text-sm text-ceylon-text/60 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ceylon-orange"></div>
                      Checking availability...
                    </div>
                  )}

                  {hasLimitedItems && availableDates.length > 0 && (
                    <div className="mb-3 p-3 bg-ceylon-yellow/30 border border-ceylon-orange/30 rounded-lg">
                      <p className="text-sm font-semibold text-ceylon-text mb-2">
                        📅 Available dates for your items:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableDates.slice(0, 5).map(date => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setFormData({ ...formData, deliveryDate: date })}
                            className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                              formData.deliveryDate === date
                                ? 'border-ceylon-orange bg-ceylon-orange text-white font-bold'
                                : 'border-ceylon-text/20 bg-white text-ceylon-text hover:border-ceylon-orange'
                            }`}
                          >
                            {formatDateForDisplay(date)}
                          </button>
                        ))}
                        {availableDates.length > 5 && (
                          <span className="text-sm text-ceylon-text/60 self-center">
                            +{availableDates.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {hasLimitedItems && availableDates.length === 0 && !loadingDates && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg">
                      <p className="text-sm font-semibold text-red-700">
                        ⚠️ No availability found for your items
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Please contact us or adjust your cart items.
                      </p>
                    </div>
                  )}

                  <input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    required
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                  />
                  
                  {hasLimitedItems ? (
                    <p className="text-body-xs text-ceylon-text/60 mt-1">
                      ℹ️ Your cart contains items with limited availability. Please select from available dates above.
                    </p>
                  ) : (
                    <p className="text-body-xs text-ceylon-text/60 mt-1">
                      Select a date between tomorrow and {new Date(getMaxDate()).toLocaleDateString('sv-SE')}
                    </p>
                  )}

                  {/* Availability Warning */}
                  {availabilityWarning.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                      <p className="text-red-800 font-semibold mb-2 text-sm">
                        ⚠️ Some items are not available for this date:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {availabilityWarning.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-red-700 mt-2">
                        Please select a different date or remove these items from your cart.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="deliveryTime" className="block text-label text-ceylon-text mb-2">
                    Delivery Time *
                  </label>
                  <select
                    id="deliveryTime"
                    name="deliveryTime"
                    required
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors bg-white rounded-lg"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a time slot</option>
                    <option value={DeliveryTime.BREAKFAST} disabled>{getDeliveryTimeDisplay(DeliveryTime.BREAKFAST, true)} - Coming Soon</option>
                    <option value={DeliveryTime.LUNCH}>{getDeliveryTimeDisplay(DeliveryTime.LUNCH, true)}</option>
                    <option value={DeliveryTime.DINNER} disabled>{getDeliveryTimeDisplay(DeliveryTime.DINNER, true)} - Coming Soon</option>
                  </select>
                  <p className="text-body-xs text-ceylon-text/60 mt-1">
                    Currently only offering lunch delivery
                  </p>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-label text-ceylon-text mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="w-full p-3 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none transition-colors rounded-lg"
                    placeholder="Any allergies, preferences, or delivery instructions"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-ceylon-cream p-6 rounded-xl">
                  <p className="text-body-sm text-ceylon-text/70 leading-relaxed">
                    <strong>Note:</strong> We will review the availability of your items and contact you 
                    via email or phone to confirm your order. Payment will be collected upon delivery.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || availabilityWarning.length > 0}
                  className="btn btn-lg btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  title={availabilityWarning.length > 0 ? 'Please resolve availability issues first' : ''}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
                
                {availabilityWarning.length > 0 && (
                  <p className="text-sm text-red-600 text-center">
                    Please select a date when all items are available
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


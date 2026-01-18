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
import OrderConfirmationModal from '../components/OrderConfirmationModal'
import { formatPrice, CURRENCY, DELIVERY_FEE } from '../constants/currency'
import { DeliveryMethod, DeliveryTime, DELIVERY_TIMES, getDeliveryTimeDisplay } from '../constants/enums'
import CustomSelect from '../components/CustomSelect'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [hasLimitedItems, setHasLimitedItems] = useState(false)
  const [loadingDates, setLoadingDates] = useState(false)
  const [availabilityWarning, setAvailabilityWarning] = useState<string[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
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

  // Calculate totals
  const getSubtotal = () => getTotal()
  const getDeliveryFee = () => {
    return formData.deliveryMethod === DeliveryMethod.DELIVERY ? DELIVERY_FEE : 0
  }
  const getFinalTotal = () => {
    return getSubtotal() + getDeliveryFee()
  }

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

  // Generate available dates based on restrictions
  const getSelectableDates = () => {
    if (hasLimitedItems) {
      // If items have limited availability, return only those available dates
      // If no dates available, return empty array (will disable dropdown)
      return availableDates
    } else {
      // No restrictions - generate next 30 days starting from tomorrow
      const dates: string[] = []
      for (let i = 1; i <= 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowConfirmModal(true)
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await createOrder({
        ...formData,
        orderItems: cart,
        totalAmount: getFinalTotal()
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
        setShowConfirmModal(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
      setIsSubmitting(false)
      setShowConfirmModal(false)
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

  const handleSelectChange = (e: { target: { name: string; value: string } }) => {
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
        
        <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-16 md:pb-20">
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
              <h1 className="text-heading-xl md:text-display-sm text-ceylon-text">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Delivery Details Form */}
              <div className="bg-white p-4 md:p-8 shadow-lg mb-6 md:mb-8 rounded-2xl">
                <h2 className="text-heading-md md:text-heading-xl text-ceylon-text mb-4 md:mb-6">Delivery Details</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    className="w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerEmail" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Email Address *
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    className="w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerPhone" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Phone Number *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    className="w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium"
                    placeholder="+46 70 123 4567"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="deliveryMethod" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Delivery Method *
                  </label>
                  <CustomSelect
                    id="deliveryMethod"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleSelectChange}
                    required
                    placeholder="Select delivery method"
                    options={[
                      { value: DeliveryMethod.DELIVERY, label: 'Delivery (Stockholm area only)' },
                      { value: DeliveryMethod.PICKUP, label: `Pick up from ${pickupAddress}` }
                    ]}
                  />
                </div>
                
                {formData.deliveryMethod === DeliveryMethod.DELIVERY && (
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                      Delivery Address *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      required
                      rows={3}
                      className="w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium resize-none"
                      placeholder="Street address, city, postal code (Stockholm area only)"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                    />
                    <p className="text-body-xs text-ceylon-text/70 mt-2 flex items-center gap-1.5">
                      <span className="text-ceylon-orange">📍</span>
                      <span>We only deliver within Stockholm area</span>
                    </p>
                  </div>
                )}
                
                {formData.deliveryMethod === DeliveryMethod.PICKUP && (
                  <div className="bg-gradient-to-br from-ceylon-yellow/30 to-ceylon-cream/50 p-5 rounded-xl border-2 border-ceylon-orange/40 shadow-md">
                    <p className="text-body-lg font-bold text-ceylon-text mb-2 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      <span>Pickup Location:</span>
                    </p>
                    <p className="text-body-lg text-ceylon-text font-medium ml-8">{pickupAddress}</p>
                    <p className="text-body-sm text-ceylon-text/70 mt-3 ml-8">
                      We&apos;ll send you the exact address and instructions after confirming your order
                    </p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="deliveryDate" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Preferred Delivery Date *
                  </label>
                  
                  {loadingDates && (
                    <div className="mb-3 p-3 bg-ceylon-yellow/20 border-2 border-ceylon-orange/30 rounded-xl flex items-center gap-2 shadow-sm">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-ceylon-orange border-t-transparent"></div>
                      <span className="text-sm font-medium text-ceylon-text">Checking availability...</span>
                    </div>
                  )}

                  {hasLimitedItems && availableDates.length === 0 && !loadingDates && (
                    <div className="mb-3 p-4 bg-red-50 border-2 border-red-400 rounded-xl shadow-md">
                      <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        No availability found for your items
                      </p>
                      <p className="text-sm text-red-600 mt-2">
                        Please contact us or adjust your cart items.
                      </p>
                    </div>
                  )}

                  <CustomSelect
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleSelectChange}
                    required
                    disabled={loadingDates || (hasLimitedItems && availableDates.length === 0)}
                    placeholder="Select a date"
                    options={getSelectableDates().map(date => ({
                      value: date,
                      label: formatDateForDisplay(date)
                    }))}
                  />
                  
                  {hasLimitedItems ? (
                    <p className="text-body-xs text-ceylon-text/70 mt-2 flex items-center gap-1.5">
                      <span className="text-ceylon-orange">ℹ️</span>
                      <span>Your cart contains items with limited availability. Only available dates are shown.</span>
                    </p>
                  ) : (
                    <p className="text-body-xs text-ceylon-text/70 mt-2 flex items-center gap-1.5">
                      <span className="text-ceylon-orange">📅</span>
                      <span>Select a date for delivery (up to 30 days in advance)</span>
                    </p>
                  )}

                  {/* Availability Warning */}
                  {availabilityWarning.length > 0 && (
                    <div className="mt-3 p-4 bg-red-50 border-2 border-red-400 rounded-xl shadow-md">
                      <p className="text-red-800 font-bold mb-2 text-sm flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        Some items are not available for this date:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
                        {availabilityWarning.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-red-700 mt-3 font-medium">
                        Please select a different date or remove these items from your cart.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="deliveryTime" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Delivery Time *
                  </label>
                  <CustomSelect
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleSelectChange}
                    required
                    placeholder="Select a time slot"
                    options={[
                      { 
                        value: DeliveryTime.BREAKFAST, 
                        label: `${getDeliveryTimeDisplay(DeliveryTime.BREAKFAST, true)} - Coming Soon`,
                        disabled: true 
                      },
                      { 
                        value: DeliveryTime.LUNCH, 
                        label: getDeliveryTimeDisplay(DeliveryTime.LUNCH, true)
                      },
                      { 
                        value: DeliveryTime.DINNER, 
                        label: `${getDeliveryTimeDisplay(DeliveryTime.DINNER, true)} - Coming Soon`,
                        disabled: true 
                      }
                    ]}
                  />
                  <p className="text-body-xs text-ceylon-text/70 mt-2 flex items-center gap-1.5">
                    <span className="text-ceylon-orange">🕐</span>
                    <span>Currently only offering lunch delivery</span>
                  </p>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-label text-ceylon-text mb-2 font-bold tracking-wide">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium resize-none"
                    placeholder="Any allergies, preferences, or delivery instructions"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              </div>

              {/* Order Items */}
              <div className="bg-white p-4 md:p-8 shadow-lg rounded-2xl">
              <h2 className="text-heading-sm md:text-heading-md text-ceylon-text mb-4 md:mb-6">Your Order</h2>
              
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
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg flex-shrink-0"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        
                        <span className="text-body-lg text-ceylon-text min-w-[2rem] text-center font-bold">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-ceylon-text text-ceylon-text hover:bg-ceylon-text hover:text-white transition-colors rounded-lg flex-shrink-0"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-body-lg font-bold text-ceylon-text">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
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
              
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t-2 border-ceylon-cream space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-lg text-ceylon-text">Subtotal</span>
                  <span className="text-body-lg text-ceylon-text">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                
                {formData.deliveryMethod && (
                  <>
                    {formData.deliveryMethod === DeliveryMethod.DELIVERY && (
                      <div className="flex justify-between items-center">
                        <span className="text-body-lg text-ceylon-text">Delivery Fee</span>
                        <span className="text-body-lg text-ceylon-text">
                          {formatPrice(getDeliveryFee())}
                        </span>
                      </div>
                    )}
                    
                    {formData.deliveryMethod === DeliveryMethod.PICKUP && (
                      <div className="flex justify-between items-center">
                        <span className="text-body-lg text-green-700">Pickup (No delivery fee)</span>
                        <span className="text-body-lg text-green-700">
                          {formatPrice(0)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                <div className={`${formData.deliveryMethod ? 'pt-4 border-t-2 border-ceylon-orange' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-heading-sm md:text-heading-md text-ceylon-text font-bold">Total</span>
                    <span className="text-heading-md md:text-heading-xl text-ceylon-orange font-bold">
                      {formatPrice(getFinalTotal())}
                    </span>
                  </div>
                  <p className="text-xs italic text-gray-500 mt-1 text-right">Inc. of 12% VAT</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-ceylon-yellow/20 to-ceylon-cream/40 p-6 rounded-xl mb-6 mt-6 border-2 border-ceylon-orange/20 shadow-md">
                <p className="text-body-md text-ceylon-text leading-relaxed">
                  <span className="font-bold text-ceylon-orange">📝 Note:</span> We will review the availability of your items and contact you 
                  via email or phone to confirm your order. Payment will be collected upon delivery (we prefer swish or bank transfer).
                </p>
              </div>
              
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  availabilityWarning.length > 0 || 
                  (hasLimitedItems && availableDates.length === 0)
                }
                className="btn btn-lg btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  availabilityWarning.length > 0 
                    ? 'Please resolve availability issues first' 
                    : (hasLimitedItems && availableDates.length === 0)
                    ? 'No available dates for your items'
                    : ''
                }
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
              
              {availabilityWarning.length > 0 && (
                <p className="text-sm text-red-600 text-center mt-4">
                  Please select a date when all items are available
                </p>
              )}
              
              {hasLimitedItems && availableDates.length === 0 && !loadingDates && (
                <p className="text-sm text-red-600 text-center mt-4">
                  Cannot place order - no available dates for your items. Please contact us or adjust your cart.
                </p>
              )}
            </div>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        items={cart}
        customerName={formData.customerName}
        deliveryMethod={formData.deliveryMethod}
        deliveryDate={formData.deliveryDate}
        deliveryTime={formData.deliveryTime}
        subtotal={getSubtotal()}
        deliveryFee={getDeliveryFee()}
        totalAmount={getFinalTotal()}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}


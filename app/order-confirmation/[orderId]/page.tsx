'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Phone, MapPin, Package, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import MenuNavigation from '../../components/MenuNavigation'
import Footer from '../../components/Footer'
import TestingBanner from '../../components/TestingBanner'
import { getOrderById } from '../../actions/orders'

interface OrderItem {
  id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await getOrderById(orderId)
        setOrder(orderData)
      } catch (err) {
        console.error('Failed to load order:', err)
        setError('Failed to load order details.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-ceylon-cream flex flex-col">
        <MenuNavigation />
        <TestingBanner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ceylon-orange"></div>
            <p className="mt-4 text-ceylon-text/70">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-ceylon-cream flex flex-col">
        <MenuNavigation />
        <TestingBanner />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ceylon-text mb-4">Order Not Found</h2>
            <p className="text-xl text-ceylon-text/70 mb-8">
              We couldn&apos;t find the order you&apos;re looking for.
            </p>
            <Link
              href="/menu"
              className="inline-block bg-ceylon-orange text-white px-8 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <MenuNavigation />
      <TestingBanner />
      
      <section className="flex-1 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-6">
              <CheckCircle className="h-24 w-24 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-ceylon-text mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-ceylon-text/70">
              Thank you for your order, {order.customer_name}!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 shadow-lg mb-8"
          >
            <div className="border-b-2 border-ceylon-orange pb-4 mb-6">
              <h2 className="text-2xl font-bold text-ceylon-text">Order Details</h2>
              <p className="text-sm text-ceylon-text/70 mt-1">
                Order ID: {order.id}
              </p>
              <p className="text-sm text-ceylon-text/70">
                Placed on: {new Date(order.created_at).toLocaleString('sv-SE')}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="font-bold text-ceylon-text">Email</p>
                  <p className="text-ceylon-text/70">{order.customer_email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="font-bold text-ceylon-text">Phone</p>
                  <p className="text-ceylon-text/70">{order.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="font-bold text-ceylon-text">
                    {order.delivery_method === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                  </p>
                  {order.delivery_method === 'pickup' ? (
                    <div>
                      <p className="text-ceylon-text/70">Bondhagsvägen, Upplands-Bro</p>
                      <p className="text-xs text-ceylon-text/50 mt-1">
                        We&apos;ll send exact address and instructions via email
                      </p>
                    </div>
                  ) : (
                    <p className="text-ceylon-text/70">{order.delivery_address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="font-bold text-ceylon-text">
                    Preferred {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'} Date
                  </p>
                  <p className="text-ceylon-text/70">
                    {new Date(order.delivery_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="font-bold text-ceylon-text">
                    {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'} Time
                  </p>
                  <p className="text-ceylon-text/70 capitalize">
                    {order.delivery_time === 'breakfast' && 'Breakfast (8:00 AM - 10:00 AM)'}
                    {order.delivery_time === 'lunch' && 'Lunch (12:00 PM - 2:00 PM)'}
                    {order.delivery_time === 'dinner' && 'Dinner (6:00 PM - 8:00 PM)'}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-ceylon-orange mt-1" />
                  <div>
                    <p className="font-bold text-ceylon-text">Special Instructions</p>
                    <p className="text-ceylon-text/70">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-ceylon-text mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <p className="font-bold text-ceylon-text">{item.menu_item_name}</p>
                      <p className="text-sm text-ceylon-text/70">
                        {item.quantity} × {item.menu_item_price} SEK
                      </p>
                    </div>
                    <p className="font-bold text-ceylon-orange">
                      {item.subtotal.toFixed(2)} SEK
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-ceylon-orange mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-ceylon-text">Total</span>
                  <span className="text-3xl font-bold text-ceylon-orange">
                    {order.total_amount.toFixed(2)} SEK
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-ceylon-orange/10 border-2 border-ceylon-orange p-8 mb-8"
          >
            <h3 className="text-xl font-bold text-ceylon-text mb-4">What&apos;s Next?</h3>
            <div className="space-y-3 text-ceylon-text/80">
              <p className="flex items-start gap-2">
                <span className="font-bold text-ceylon-orange">1.</span>
                <span>We&apos;ll review your order and check the availability of all items.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-ceylon-orange">2.</span>
                <span>You&apos;ll receive a confirmation email or phone call within 24 hours.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-ceylon-orange">3.</span>
                <span>We&apos;ll arrange a delivery time that works for you.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-ceylon-orange">4.</span>
                <span>Payment will be collected upon delivery (cash or card).</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-4"
          >
            <Link
              href="/menu"
              className="inline-block bg-ceylon-orange text-white px-10 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text transition-colors"
            >
              Order More
            </Link>
            
            <div className="text-center">
              <Link
                href="/"
                className="text-ceylon-text/70 hover:text-ceylon-text underline"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


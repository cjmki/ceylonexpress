'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Phone, MapPin, Package, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { getOrderById } from '../../actions/orders'
import { formatPrice, DELIVERY_FEE, ENABLE_DELIVERY_FEE } from '../../constants/currency'
import { formatDateReadable } from '../../constants/dateUtils'
import { DeliveryMethod, getDeliveryTimeDisplay } from '../../constants/enums'

interface OrderItem {
  id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
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

  // Calculate order breakdown
  const getOrderSubtotal = () => {
    if (!order) return 0
    return order.order_items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const getOrderDeliveryFee = () => {
    if (!order) return 0
    if (!ENABLE_DELIVERY_FEE) return 0
    return order.delivery_method === DeliveryMethod.DELIVERY ? DELIVERY_FEE : 0
  }

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
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ceylon-orange"></div>
            <p className="mt-4 text-body-md text-ceylon-text/70">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-ceylon-cream flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-6 pt-32">
          <div className="text-center">
            <h2 className="text-heading-xl text-ceylon-text mb-4">Order Not Found</h2>
            <p className="text-body-xl text-ceylon-text/70 mb-8">
              We couldn&apos;t find the order you&apos;re looking for.
            </p>
            <Link
              href="/menu"
              className="btn btn-lg btn-primary"
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
      <Navigation />
      
      <section className="flex-1 pt-40 pb-20 px-6">
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
            <h1 className="text-display-sm text-ceylon-text mb-4">
              Order Placed!
            </h1>
            <p className="text-body-xl text-ceylon-text/70">
              Thank you for your order, {order.customer_name}!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 shadow-lg mb-8 rounded-2xl"
          >
            <div className="border-b-2 border-ceylon-orange pb-4 mb-6">
              <h2 className="text-heading-md text-ceylon-text">Order Details</h2>
              <p className="text-body-sm text-ceylon-text/70 mt-1">
                Order ID: {order.id}
              </p>
              <p className="text-body-sm text-ceylon-text/70">
                Placed on: {new Date(order.created_at).toLocaleString('sv-SE')}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="text-body-md font-bold text-ceylon-text">Email</p>
                  <p className="text-body-md text-ceylon-text/70">{order.customer_email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="text-body-md font-bold text-ceylon-text">Phone</p>
                  <p className="text-body-md text-ceylon-text/70">{order.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="text-body-md font-bold text-ceylon-text">
                    {order.delivery_method === DeliveryMethod.PICKUP ? 'Pickup Location' : 'Delivery Address'}
                  </p>
                  {order.delivery_method === DeliveryMethod.PICKUP ? (
                    <div>
                      <p className="text-body-md text-ceylon-text/70">Bondhagsvägen, Upplands-Bro</p>
                      <p className="text-body-xs text-ceylon-text/50 mt-1">
                        We&apos;ll send exact address and instructions via email
                      </p>
                    </div>
                  ) : (
                    <p className="text-body-md text-ceylon-text/70">{order.delivery_address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="text-body-md font-bold text-ceylon-text">
                    Preferred {order.delivery_method === DeliveryMethod.PICKUP ? 'Pickup' : 'Delivery'} Date
                  </p>
                  <p className="text-body-md text-ceylon-text/70">
                    {formatDateReadable(order.delivery_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-ceylon-orange mt-1" />
                <div>
                  <p className="text-body-md font-bold text-ceylon-text">
                    {order.delivery_method === DeliveryMethod.PICKUP ? 'Pickup' : 'Delivery'} Time
                  </p>
                  <p className="text-body-md text-ceylon-text/70 capitalize">
                    {getDeliveryTimeDisplay(order.delivery_time, true)}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-ceylon-orange mt-1" />
                  <div>
                    <p className="text-body-md font-bold text-ceylon-text">Special Instructions</p>
                    <p className="text-body-md text-ceylon-text/70">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-heading-sm text-ceylon-text mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <p className="text-body-md font-bold text-ceylon-text">{item.menu_item_name}</p>
                      <p className="text-body-sm text-ceylon-text/70">
                        {item.quantity} × {formatPrice(item.menu_item_price)}
                      </p>
                    </div>
                    <p className="text-price text-ceylon-orange">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-body-lg text-ceylon-text">Subtotal</span>
                  <span className="text-body-lg text-ceylon-text font-semibold">
                    {formatPrice(getOrderSubtotal())}
                  </span>
                </div>

                {/* Delivery Fee */}
                {ENABLE_DELIVERY_FEE ? (
                  order.delivery_method === DeliveryMethod.DELIVERY ? (
                    <div className="flex justify-between items-center">
                      <span className="text-body-lg text-ceylon-text">Delivery Fee</span>
                      <span className="text-body-lg text-ceylon-text font-semibold">
                        {formatPrice(getOrderDeliveryFee())}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-body-lg text-green-700">Pickup (No delivery fee)</span>
                      <span className="text-body-lg text-green-700 font-semibold">
                        {formatPrice(0)}
                      </span>
                    </div>
                  )
                ) : null}

                {/* Total with separator */}
                <div className="border-t-2 border-ceylon-orange pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-heading-md text-ceylon-text font-bold">Total</span>
                    <span className="text-heading-xl text-ceylon-orange font-bold">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                  <p className="text-xs italic text-gray-500 mt-1 text-right">Inc. of 12% VAT</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-ceylon-orange/10 border-2 border-ceylon-orange p-8 mb-8 rounded-2xl"
          >
            <h3 className="text-heading-sm text-ceylon-text mb-4">What&apos;s Next?</h3>
            <div className="space-y-3 text-body-md text-ceylon-text/80">
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
                <span>Payment will be collected upon delivery (we prefer swish or bank transfer).</span>
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
              className="btn btn-lg btn-primary"
            >
              Order More
            </Link>
            
            <div className="text-center">
              <Link
                href="/"
                className="text-body-md text-ceylon-text/70 hover:text-ceylon-text underline"
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


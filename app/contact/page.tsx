'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Phone, Calendar, Users, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import type { ContactFormData } from '@/lib/validations/contact.validation'
import Navigation from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Check if guest count exceeds limit
  const guestCount = parseInt(formData.guestCount || '0')
  const exceedsGuestLimit = guestCount > 20
  const isFormValid = !exceedsGuestLimit

  // Validate individual fields with friendly messages
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value) return 'Please enter your name'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (value.length > 100) return 'Name is too long'
        return ''
      case 'email':
        if (!value) return 'Please enter your email'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
        return ''
      case 'phone':
        if (value && value.length < 8) return 'Please enter a valid phone number'
        if (value && value.length > 20) return 'Phone number is too long'
        return ''
      case 'message':
        if (!value) return 'Please enter a message'
        if (value.length < 10) return 'Message must be at least 10 characters'
        if (value.length > 1000) return 'Message is too long (max 1000 characters)'
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof ContactFormData] || '')
      if (error) newErrors[key] = error
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      setSubmitStatus({
        success: false,
        message: 'Please fix the errors in the form'
      })
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Submit directly to Web3Forms from client-side (bypasses Cloudflare protection)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          subject: `Catering Inquiry from ${formData.name}`,
          name: formData.name,
          email: formData.email,
          message: `Phone: ${formData.phone || 'Not provided'}
Event Date: ${formData.eventDate || 'Not provided'}
Number of Guests: ${formData.guestCount || 'Not provided'}

Message:
${formData.message}

---
Submitted from Ceylon Express Catering Form`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Thank you for your inquiry! We will get back to you soon.',
        })
        
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventDate: '',
          guestCount: '',
          message: '',
        })
        setErrors({})
        setTouched({})
      } else {
        setSubmitStatus({
          success: false,
          message: result.message || 'Failed to send message. Please try again.',
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        success: false,
        message: 'An error occurred. Please contact us directly at cvljayawardana@gmail.com',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  return (
    <div className="min-h-screen bg-ceylon-cream">
      <Navigation />
      
      <main className="pt-16 md:pt-20">
        <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px),
                           repeating-linear-gradient(90deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px)`
        }}></div>
        <div className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-ceylon-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 md:w-80 md:h-80 bg-ceylon-blue/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-4xl relative z-10">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
          </motion.div>

          {/* Header */}
          <motion.div
            {...fadeInUp}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full border-3 border-ceylon-orange/30 mb-6 md:mb-8 shadow-lg"
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-ceylon-orange" />
              <span className="text-ceylon-orange font-bold text-xs md:text-sm uppercase tracking-wider">
                Get In Touch
              </span>
            </motion.div>

            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Catering{' '}
              <span className="text-ceylon-orange relative inline-block">
                Inquiry
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
                />
              </span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-2xl mx-auto">
              Planning an event? We'd love to make it special with authentic Sri Lankan cuisine. 
              Fill out the form below and we'll get back to you soon!
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Dashed border decoration */}
            <div className="absolute -inset-3 md:-inset-4 border-3 border-dashed border-ceylon-orange/40 rounded-2xl md:rounded-3xl"></div>
            
            {/* Main form card */}
            <div className="relative bg-white p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl shadow-2xl border-4 border-ceylon-orange/20">
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl border-2 ${
                    submitStatus.success
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {submitStatus.success && <CheckCircle className="h-5 w-5" />}
                    <p className="font-semibold">{submitStatus.message}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        touched.name && errors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                      } focus:outline-none focus:ring-2 transition-all`}
                      placeholder="Your name"
                    />
                    {touched.name && errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ceylon-orange/50" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          touched.email && errors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                        } focus:outline-none focus:ring-2 transition-all`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ceylon-orange/50" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                        touched.phone && errors.phone 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                      } focus:outline-none focus:ring-2 transition-all`}
                      placeholder="+46 XX XXX XXXX"
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Event Date and Guest Count Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Event Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ceylon-orange/50" />
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-ceylon-orange/30 focus:border-ceylon-orange focus:outline-none focus:ring-2 focus:ring-ceylon-orange/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Number of Guests (Max 20)
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ceylon-orange/50" />
                      <input
                        type="number"
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleChange}
                        min="1"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          exceedsGuestLimit 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                        } focus:outline-none focus:ring-2 transition-all`}
                        placeholder="Number of guests"
                      />
                    </div>
                    {exceedsGuestLimit && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2"
                      >
                        <span>⚠️</span>
                        <span>We're still a small operation and can only cater for up to 20 people at once. Please contact us directly for larger events.</span>
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      touched.message && errors.message 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                    } focus:outline-none focus:ring-2 transition-all resize-none`}
                    placeholder="Tell us about your event, dietary requirements, and any special requests..."
                  />
                  {touched.message && errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full group inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">Sending...</span>
                    </>
                  ) : exceedsGuestLimit ? (
                    <>
                      <span>Guest Limit Exceeded</span>
                    </>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-xs md:text-sm text-ceylon-text/60 text-center">
                  * Required fields. We'll respond to your inquiry within 24-48 hours.
                </p>
              </form>

              {/* Decorative dots */}
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ceylon-orange shadow-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-ceylon-blue shadow-lg"></div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 text-center"
          >
          </motion.div>
        </div>
      </section>
      </main>
      
      <Footer />
    </div>
  )
}

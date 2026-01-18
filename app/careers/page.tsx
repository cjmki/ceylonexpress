'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Phone, Briefcase, Sparkles, CheckCircle, Users, ChefHat, Truck } from 'lucide-react'
import type { CareersFormData } from '@/lib/validations/careers.validation'
import Navigation from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

const jobOpenings = [
  {
    id: 'delivery-partner',
    title: 'Delivery Partner',
    type: 'Part-time',
    status: 'Open',
    icon: Truck,
    iconColor: 'text-ceylon-orange',
    iconBg: 'bg-ceylon-orange/10',
    borderColor: 'border-ceylon-orange/30',
    description: 'Looking for someone who can make deliveries for us. Currently about 3-4 hours per day, mostly on weekends.',
    details: [
      'Mainly from Upplands Bro to Stockholm area',
      '3-4 hours per day',
      'Mostly weekend work',
      'Great for students or part-time workers'
    ]
  },
  {
    id: 'culinary-assistant',
    title: 'Culinary Assistant',
    type: 'Part-time',
    status: 'Open',
    icon: ChefHat,
    iconColor: 'text-ceylon-blue',
    iconBg: 'bg-ceylon-blue/10',
    borderColor: 'border-ceylon-blue/30',
    description: 'We\'re seeking a passionate female cook for a part-time role with long-term potential. This position offers the opportunity to grow with us and transition into a permanent role as we expand.',
    details: [
      'If you can make an awesome watalappan or butter cake, you\'re the person we\'re looking for!',
      'Part-time position with long-term opportunity',
      'Work at our location (Upplands Bro)',
      'Mainly Friday nights and Saturday mornings (may change in the future)',
      'Passionate about food and cooking, someone who can help us to improve our menu and recipes',
      'We do not compromise on ingredients so you have the opportunity to work with quality sri lankan ingredients',
      'Share your social media if you post your cooking creations'
    ]
  }
]

export default function CareersPage() {
  const [formData, setFormData] = useState<CareersFormData>({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    socialMedia: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [selectedJob, setSelectedJob] = useState<string>('')

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
        if (!value) return 'Please enter your phone number'
        if (value.length < 8) return 'Please enter a valid phone number'
        if (value.length > 20) return 'Phone number is too long'
        return ''
      case 'jobTitle':
        if (!value) return 'Please select a position'
        return ''
      case 'message':
        if (!value) return 'Please tell us about yourself'
        if (value.length < 10) return 'Please tell us a bit more (at least 10 characters)'
        if (value.length > 1000) return 'Message is too long (max 1000 characters)'
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (key !== 'socialMedia') { // socialMedia is optional
        const error = validateField(key, formData[key as keyof CareersFormData] || '')
        if (error) newErrors[key] = error
      }
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
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      
      if (!accessKey) {
        console.error('Web3Forms access key not configured')
        setSubmitStatus({
          success: false,
          message: 'Something went wrong on our end.',
        })
        setIsSubmitting(false)
        return
      }

      // Submit directly to Web3Forms from client-side
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Job Application: ${formData.jobTitle} - ${formData.name}`,
          name: formData.name,
          email: formData.email,
          message: `JOB APPLICATION

Position: ${formData.jobTitle}

Applicant Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
${formData.socialMedia ? `Social Media: ${formData.socialMedia}` : ''}

About Them:
${formData.message}

---
Submitted from Ceylon Express Careers Page`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Thank you for your application! We will review it and get back to you soon.',
        })
        
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          jobTitle: '',
          socialMedia: '',
          message: '',
        })
        setErrors({})
        setTouched({})
        setSelectedJob('')
      } else {
        // Don't show API error messages to users
        console.error('Form submission failed:', result.message || 'Unknown error')
        setSubmitStatus({
          success: false,
          message: 'Something went wrong. Please try again or contact us directly at cvljayawardana@gmail.com',
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        success: false,
        message: 'Something went wrong. Please try again or contact us directly at cvljayawardana@gmail.com',
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

  const handleJobSelect = (jobId: string, jobTitle: string) => {
    setSelectedJob(jobId)
    setFormData(prev => ({
      ...prev,
      jobTitle: jobTitle,
    }))
    // Scroll to form
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-ceylon-cream">
      <Navigation />
      
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px),
                             repeating-linear-gradient(90deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px)`
          }}></div>
          <div className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-ceylon-yellow/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-48 h-48 md:w-80 md:h-80 bg-ceylon-blue/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto max-w-6xl relative z-10">
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
                  Join Our Team
                </span>
              </motion.div>

              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Join{' '}
                <span className="text-ceylon-orange relative inline-block">
                  Ceylon Express
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
                  />
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-2xl mx-auto">
                We're a small team with big dreams. Join us in bringing authentic Sri Lankan flavors to Stockholm!
              </p>
            </motion.div>

            {/* Job Openings */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Dashed border decoration */}
                  <div className={`absolute -inset-3 border-3 border-dashed ${job.borderColor} rounded-2xl group-hover:border-opacity-100 transition-all`}></div>
                  
                  {/* Job Card */}
                  <div className="relative bg-white p-6 md:p-8 rounded-2xl shadow-xl border-4 border-opacity-20" style={{ borderColor: job.iconColor.replace('text-', '') }}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${job.iconBg} border-2 ${job.borderColor} p-3 rounded-xl`}>
                        <job.icon className={`h-8 w-8 ${job.iconColor}`} />
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {job.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-ceylon-text mb-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-ceylon-text/60 mb-4 font-semibold uppercase tracking-wide">
                      {job.type}
                    </p>

                    {/* Description */}
                    <p className="text-ceylon-text/80 mb-6">
                      {job.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2 mb-6">
                      {job.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-ceylon-text/70">
                          <span className="text-ceylon-orange flex-shrink-0 leading-[1.4]">•</span>
                          <span className="flex-1">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleJobSelect(job.id, job.title)}
                      className={`w-full ${job.iconColor.replace('text-', 'bg-')} hover:bg-ceylon-text text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105`}
                    >
                      Apply Now
                    </button>

                    {/* Decorative dots */}
                    <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full ${job.iconColor.replace('text-', 'bg-')} shadow-lg`}></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Application Form */}
            <motion.div
              id="application-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative scroll-mt-20"
            >
              {/* Dashed border decoration */}
              <div className="absolute -inset-3 md:-inset-4 border-3 border-dashed border-ceylon-orange/40 rounded-2xl md:rounded-3xl"></div>
              
              {/* Main form card */}
              <div className="relative bg-white p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl shadow-2xl border-4 border-ceylon-orange/20">
                <div className="text-center mb-8">
                  <Briefcase className="h-12 w-12 text-ceylon-orange mx-auto mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold text-ceylon-text mb-2">
                    Submit Your Application
                  </h2>
                  <p className="text-ceylon-text/60">
                    Tell us about yourself and why you'd be a great fit
                  </p>
                </div>

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
                  {/* Position Selection */}
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Position *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ceylon-orange/50" />
                      <select
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          touched.jobTitle && errors.jobTitle 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-ceylon-orange/30 focus:border-ceylon-orange focus:ring-ceylon-orange/20'
                        } focus:outline-none focus:ring-2 transition-all appearance-none bg-white`}
                      >
                        <option value="">Select a position</option>
                        {jobOpenings.map(job => (
                          <option key={job.id} value={job.title}>
                            {job.title} ({job.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    {touched.jobTitle && errors.jobTitle && (
                      <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
                    )}
                  </div>

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
                      Phone Number *
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
                        required
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

                  {/* Social Media (Optional - shown for Culinary Assistant) */}
                  {formData.jobTitle === 'Culinary Assistant' && (
                    <div>
                      <label htmlFor="socialMedia" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                        Social Media Links (Optional)
                      </label>
                      <input
                        type="text"
                        id="socialMedia"
                        name="socialMedia"
                        value={formData.socialMedia}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-ceylon-orange/30 focus:border-ceylon-orange focus:outline-none focus:ring-2 focus:ring-ceylon-orange/20 transition-all"
                        placeholder="Instagram, Facebook, or any platform where you share your cooking"
                      />
                      <p className="mt-2 text-xs text-ceylon-text/60">
                        If you post your cooking creations on social media, we'd love to see them!
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                      Tell Us About Yourself *
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
                      placeholder="Tell us about your experience, availability, and why you'd like to join Ceylon Express..."
                    />
                    {touched.message && errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-xs md:text-sm text-ceylon-text/60 text-center">
                    * Required fields. We'll review your application and get back to you soon.
                  </p>
                </form>

                {/* Decorative dots */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ceylon-orange shadow-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-ceylon-blue shadow-lg"></div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

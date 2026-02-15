'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Sparkles, MapPin, Truck, Clock } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

interface FAQItem {
  id: string
  question: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  borderColor: string
  answer: React.ReactNode
}

const faqItems: FAQItem[] = [
  {
    id: 'sold-out',
    question: 'Why is everything on the menu sold out?',
    icon: Clock,
    iconColor: 'text-ceylon-orange',
    iconBg: 'bg-ceylon-orange/10',
    borderColor: 'border-ceylon-orange/30',
    answer: (
      <div className="space-y-3">
        <p>
          We are still a small operation and only do a few orders on weekends (Saturday lunch). So we update menu availability normally on <strong>Sunday evening</strong> for the coming weekend.
        </p>
        <p>
          We are trying to expand and hopefully we can have more slots open soon. Thank you for your patience and support!
        </p>
      </div>
    ),
  },
  {
    id: 'location',
    question: 'Where are you located?',
    icon: MapPin,
    iconColor: 'text-ceylon-blue',
    iconBg: 'bg-ceylon-blue/10',
    borderColor: 'border-ceylon-blue/30',
    answer: (
      <p>
        We are based in <strong>Upplands Bro</strong>, Stockholm.
      </p>
    ),
  },
  {
    id: 'delivery-fee',
    question: 'What is the delivery fee?',
    icon: Truck,
    iconColor: 'text-ceylon-orange',
    iconBg: 'bg-ceylon-orange/10',
    borderColor: 'border-ceylon-orange/30',
    answer: (
      <div className="space-y-3">
        <p>
          For now, <strong>delivery is free of charge!</strong> We currently deliver only within a limited area in Stockholm.
        </p>
        <p>
          DM us on social media or use our{' '}
          <Link href="/contact" className="text-ceylon-orange hover:text-ceylon-text underline underline-offset-2 font-semibold transition-colors">
            contact form
          </Link>{' '}
          to inquire about delivery to your area.
        </p>
        <p>
          We are trying to expand and are actively looking for delivery partners. If you&apos;re interested, check out our{' '}
          <Link href="/careers" className="text-ceylon-orange hover:text-ceylon-text underline underline-offset-2 font-semibold transition-colors">
            careers page
          </Link>
          !
        </p>
      </div>
    ),
  },
]

function FAQAccordionItem({ item, isOpen, onToggle, index }: { item: FAQItem; isOpen: boolean; onToggle: () => void; index: number }) {
  const Icon = item.icon

  return (
    <motion.div
      id={item.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="relative group scroll-mt-24"
    >
      {/* Dashed border decoration */}
      <div className={`absolute -inset-3 border-3 border-dashed ${item.borderColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${isOpen ? '!opacity-100' : ''}`}></div>

      {/* FAQ Card */}
      <div className={`relative bg-white rounded-2xl shadow-xl border-4 border-opacity-20 overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-2xl' : ''}`}>
        {/* Question Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-6 md:p-8 text-left hover:bg-ceylon-cream/30 transition-colors duration-300"
          aria-expanded={isOpen}
        >
          <div className={`${item.iconBg} border-2 ${item.borderColor} p-3 rounded-xl flex-shrink-0`}>
            <Icon className={`h-6 w-6 md:h-7 md:w-7 ${item.iconColor}`} />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-ceylon-text flex-1">
            {item.question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown className={`h-6 w-6 ${item.iconColor}`} />
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                <div className="pl-[60px] md:pl-[68px] text-ceylon-text/80 leading-relaxed text-base">
                  {item.answer}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative dot */}
        <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full ${item.iconColor.replace('text-', 'bg-')} shadow-lg`}></div>
      </div>
    </motion.div>
  )
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>('sold-out')

  // Handle hash-based navigation (e.g. /faq#sold-out)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && faqItems.some(item => item.id === hash)) {
      setOpenId(hash)
      // Wait for animations to settle, then scroll to the item
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [])

  const handleToggle = (id: string) => {
    setOpenId(prev => prev === id ? null : id)
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

          <div className="container mx-auto max-w-4xl relative z-10">
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
                  Got Questions?
                </span>
              </motion.div>

              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Frequently Asked{' '}
                <span className="text-ceylon-orange relative inline-block">
                  Questions
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
                  />
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-2xl mx-auto">
                Here are the answers to the most common questions we get. Can&apos;t find what you&apos;re looking for? Feel free to{' '}
                <Link href="/contact" className="text-ceylon-orange hover:text-ceylon-text underline underline-offset-2 font-semibold transition-colors">
                  contact us
                </Link>
                !
              </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="space-y-6 md:space-y-8">
              {faqItems.map((item, index) => (
                <FAQAccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => handleToggle(item.id)}
                  index={index}
                />
              ))}
            </div>

            {/* Still have questions CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 md:mt-20 relative"
            >
              <div className="absolute -inset-3 border-3 border-dashed border-ceylon-blue/30 rounded-2xl"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-xl border-4 border-ceylon-blue/20 text-center">
                <HelpCircle className="h-12 w-12 text-ceylon-blue mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-ceylon-text mb-3">
                  Still have questions?
                </h2>
                <p className="text-ceylon-text/70 mb-6 max-w-lg mx-auto">
                  We&apos;d love to hear from you! Reach out to us through our contact form or social media.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Contact Us
                  </Link>
                  <a
                    href="https://www.instagram.com/ceylonexpress.se/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-ceylon-blue hover:bg-ceylon-text text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    DM on Instagram
                  </a>
                </div>

                {/* Decorative dots */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ceylon-blue shadow-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-ceylon-orange shadow-lg"></div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Instagram, Facebook, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LocationSection() {
  return (
    <section id="location" className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-ceylon-cream overflow-hidden">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px),
                         repeating-linear-gradient(90deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px)`
      }}></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header with Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full border-3 border-ceylon-orange/30 mb-6 md:mb-8 shadow-lg"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-ceylon-orange" />
            <span className="text-ceylon-orange font-bold text-xs md:text-sm uppercase tracking-wider">
              Now Serving
            </span>
          </motion.div>

          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            How to{' '}
            <span className="text-ceylon-orange relative inline-block">
              Order
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
              />
            </span>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-2xl mx-auto mb-6 md:mb-8">
            Order online for delivery or pickup. We also cater for events and parties.
          </p>

          {/* View Menu Button */}
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>View Our Menu</span>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </motion.div>

        {/* Catering CTA Banner - Outlined Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-12 md:mb-16"
        >
          {/* Outer dashed border */}
          <div className="absolute -inset-3 md:-inset-4 border-3 border-dashed border-ceylon-orange/40 rounded-2xl md:rounded-3xl"></div>
          
          {/* Main CTA Card */}
          <div className="relative bg-white p-8 md:p-12 lg:p-16 rounded-2xl md:rounded-3xl text-center shadow-2xl border-4 border-ceylon-orange">
            <div className="max-w-2xl mx-auto">
              {/* Icon */}
              <div className="text-5xl md:text-6xl mb-4 md:mb-6">🎉</div>
              
              {/* Heading */}
              <h3 
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-ceylon-text mb-4 md:mb-6"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Need Catering for{' '}
                <span className="text-ceylon-orange">Your Event?</span>
              </h3>
              
              {/* Description */}
              <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 mb-6 md:mb-8 leading-relaxed">
                We cater for birthdays, office events, family gatherings, and parties. 
                Get in touch through Instagram or Facebook to discuss your event.
              </p>

              {/* Catering inquiry CTA button */}
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Message us for catering inquiries</span>
              </a>

              {/* Accent dots */}
              <div className="absolute top-4 right-4 w-3 h-3 md:w-4 md:h-4 rounded-full bg-ceylon-yellow shadow-lg"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 md:w-3 md:h-3 rounded-full bg-ceylon-blue shadow-lg"></div>
            </div>
          </div>
        </motion.div>

        {/* Social Media Section - Pastel Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-12 md:mb-16"
        >
          <div className="relative bg-white p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl shadow-lg border-3 border-ceylon-orange/20">
            <div className="text-center max-w-xl mx-auto">
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">💌</div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-ceylon-text mb-3 md:mb-4">
                Follow Our Journey
              </h3>
              
              <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 mb-6 md:mb-8">
                Stay connected for menu updates, special offers, and catering availability
              </p>

              {/* Social Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <a
                  href="https://www.instagram.com/ceylonexpress.se/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  aria-label="Follow on Instagram"
                >
                  <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/ceylonexpressse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 bg-ceylon-blue hover:bg-ceylon-text text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  aria-label="Follow on Facebook"
                >
                  <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Instagram, Facebook, Sparkles, TruckIcon } from 'lucide-react'

const locationInfo = [
  {
    icon: MapPin,
    title: 'Location',
    description: 'Stockholm, Sweden',
    emoji: '📍',
    cardBg: 'bg-ceylon-yellow/20',
    cardBorder: 'border-ceylon-yellow/40',
    dashedBorder: 'border-ceylon-yellow/40',
    delay: 0,
  },
  {
    icon: Clock,
    title: 'Hours',
    description: 'Coming Soon',
    emoji: '⏰',
    cardBg: 'bg-ceylon-cream/30',
    cardBorder: 'border-ceylon-cream/50',
    dashedBorder: 'border-ceylon-cream/50',
    delay: 0.1,
  },
  {
    icon: TruckIcon,
    title: 'Food Truck',
    description: 'Mobile Service',
    emoji: '🚚',
    cardBg: 'bg-ceylon-blue/20',
    cardBorder: 'border-ceylon-blue/40',
    dashedBorder: 'border-ceylon-blue/40',
    delay: 0.2,
  },
]

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
              Coming Soon
            </span>
          </motion.div>

          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Find Us{' '}
            <span className="text-ceylon-orange relative inline-block">
              Soon
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
              />
            </span>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-2xl mx-auto">
            Follow our journey as we prepare to bring authentic Sri Lankan flavors to Stockholm
          </p>
        </motion.div>

        {/* Info Cards - Outlined Pastel Style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {locationInfo.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: item.delay }}
                className="group relative"
              >
                {/* Dashed border decoration */}
                <div className={`absolute -inset-2 border-2 border-dashed ${item.dashedBorder} rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Card */}
                <div className="relative bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl text-center hover:shadow-2xl transition-all duration-300 border-3 border-ceylon-text/5 hover:border-ceylon-orange h-full hover:scale-105">
                  {/* Emoji + Icon Container */}
                  <div className="relative inline-block mb-4 md:mb-6">
                    <div className={`${item.cardBg} border-3 ${item.cardBorder} w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="h-7 w-7 md:h-9 md:w-9 text-ceylon-orange" />
                    </div>
                    {/* Emoji badge */}
                    <div className="absolute -top-1 -right-1 text-xl md:text-2xl bg-white rounded-full shadow-lg p-1">
                      {item.emoji}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-ceylon-text mb-2 uppercase tracking-wide">
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm md:text-base text-ceylon-text/70 font-medium">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

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
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">📱</div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-ceylon-text mb-3 md:mb-4">
                Follow Our Journey
              </h3>
              
              <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 mb-6 md:mb-8">
                Stay connected and be the first to know about our launch, menu updates, and special offers
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

        {/* Final CTA Banner - Outlined Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
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
                Stay Updated on{' '}
                <span className="text-ceylon-orange">Our Launch</span>
              </h3>
              
              {/* Description */}
              <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 mb-6 md:mb-8 leading-relaxed">
                Be the first to know when we launch, discover exclusive menu previews, 
                and follow our journey bringing authentic Sri Lankan cuisine to Stockholm.
              </p>

              {/* Email placeholder or social prompt */}
              <div className="inline-flex items-center gap-2 bg-ceylon-cream px-4 md:px-6 py-3 md:py-4 rounded-full border-2 border-dashed border-ceylon-orange/40">
                <span className="text-xs md:text-sm text-ceylon-text/60 font-medium italic">
                  Join our growing community of food lovers 🍛
                </span>
              </div>

              {/* Accent dots */}
              <div className="absolute top-4 right-4 w-3 h-3 md:w-4 md:h-4 rounded-full bg-ceylon-yellow shadow-lg"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 md:w-3 md:h-3 rounded-full bg-ceylon-blue shadow-lg"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Instagram, Sparkles, ChefHat, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen px-4 md:px-6 overflow-hidden bg-ceylon-cream">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px),
                         repeating-linear-gradient(90deg, transparent, transparent 40px, #1A1A1A 40px, #1A1A1A 41px)`
      }}></div>

      {/* Content */}
      <div className="relative container mx-auto max-w-7xl min-h-screen flex flex-col justify-center py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="order-2 lg:order-1 space-y-6 md:space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full border-3 border-ceylon-orange shadow-lg"
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-ceylon-orange" />
              <span className="text-ceylon-orange font-bold tracking-wider text-xs md:text-sm uppercase">
                ශ්‍රී ලංකන් Inspired
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-ceylon-text leading-[1.1]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Authentic Flavors{' '}
              <span className="text-ceylon-orange relative inline-block">
                From The Island
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow rounded-full"
                />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base md:text-lg lg:text-xl text-ceylon-text/70 max-w-xl leading-relaxed"
            >
              Bringing the warmth of home-cooked Sri Lankan cuisine to Stockholm. 
              Every dish tells a story of tradition, spice, and love.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <a
                href="/menu"
                className="group inline-flex items-center justify-center gap-2 bg-ceylon-orange hover:bg-ceylon-text text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Order Now</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-ceylon-orange text-ceylon-orange hover:text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider border-3 border-ceylon-orange transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                <span>Follow Us</span>
              </a>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-ceylon-yellow/30 px-4 md:px-6 py-3 rounded-2xl border-2 border-dashed border-ceylon-orange"
            >
              <ChefHat className="h-5 w-5 text-ceylon-orange" />
              <p className="text-xs md:text-sm text-ceylon-text font-semibold">
                Coming Soon to Stockholm
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Logo with Decorative Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            {/* Decorative dashed border container */}
            <div className="relative">
              {/* Outer dashed border frame */}
              <motion.div
                animate={{ rotate: [0, 1, 0, -1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 md:-inset-6 border-3 border-dashed border-ceylon-orange rounded-[2.5rem] md:rounded-[3rem]"
              />
              
              {/* Main image container */}
              <div className="relative bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl border-4 border-ceylon-text/5">
                <div className="relative bg-gradient-to-br from-ceylon-yellow/20 via-ceylon-cream/30 to-ceylon-blue/20 p-4 md:p-6 rounded-2xl">
                  <Image
                    src="/images/logo_transparent.png"
                    alt="Ceylon Express - Sri Lankan Inspired"
                    width={600}
                    height={450}
                    priority
                    className="relative z-10 w-full h-auto"
                  />
                </div>
                
                {/* Decorative accent dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-ceylon-orange shadow-lg animate-pulse" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 md:w-5 md:h-5 rounded-full bg-ceylon-blue shadow-lg" />
                <div className="absolute top-1/2 -right-3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-ceylon-yellow shadow-lg" />
              </div>

              {/* Floating decorative element */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl border-3 border-ceylon-blue hidden sm:block"
              >
                <p className="text-xs md:text-sm font-bold text-ceylon-text">
                  🌶️ Authentic Spices
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-ceylon-orange px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl border-3 border-white hidden sm:block"
              >
                <p className="text-xs md:text-sm font-bold text-white">
                  🍛 Home-Cooked
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section - Editorial Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { label: 'Traditional Recipes', value: '20+', icon: '🍛' },
            { label: 'Authentic Spices', value: '15+', icon: '🌶️' },
            { label: 'Happy Customers', value: '500+', icon: '❤️' },
            { label: 'Years Experience', value: '10+', icon: '⭐' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
              className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-3 border-ceylon-text/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-ceylon-orange mb-1 md:mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-ceylon-text/60 font-semibold uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

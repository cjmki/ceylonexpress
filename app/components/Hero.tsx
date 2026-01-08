'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Instagram, Facebook, ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen px-6 overflow-hidden">
      {/* Warm gradient background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-ceylon-cream via-ceylon-yellow to-ceylon-orange/20"></div>
      
      {/* Decorative geometric pattern - subtle */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #D9873B 35px, #D9873B 36px)`
      }}></div>

      {/* Content */}
      <div className="relative container mx-auto max-w-6xl min-h-screen flex flex-col justify-center py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Logo and Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="order-2 md:order-1"
          >
            {/* Sinhala text badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="bg-ceylon-orange/10 border-l-4 border-ceylon-orange px-6 py-3">
                <span className="text-ceylon-orange font-bold tracking-widest text-sm">
                  ශ්‍රී ලංකන් INSPIRED
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-ceylon-text mb-6 leading-[1.1]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Authentic Flavors
              <br />
              <span className="text-ceylon-orange">From the Island</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-ceylon-text/70 mb-10 leading-relaxed max-w-lg"
            >
              Bringing the warmth of home-cooked Sri Lankan cuisine to Stockholm. 
              Every dish tells a story of tradition, spice, and love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="/menu"
                className="group relative overflow-hidden bg-ceylon-orange text-white px-8 py-4 font-bold uppercase text-sm tracking-wider transition-all duration-300 hover:shadow-xl"
              >
                <span className="relative z-10">
                  Order Now
                </span>
                <div className="absolute inset-0 bg-ceylon-text transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </a>

              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-ceylon-orange text-ceylon-orange px-8 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-orange hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                <Instagram className="h-5 w-5" />
                Follow Us
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-8 text-sm text-ceylon-text/50 italic"
            >
              Coming soon to Stockholm • Food truck & catering services
            </motion.p>
          </motion.div>

          {/* Right: Logo with decorative elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="order-1 md:order-2 relative"
          >
            {/* Decorative circle behind logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-[110%] h-[110%] rounded-full border-2 border-ceylon-orange/20"
                style={{ borderStyle: 'dashed' }}
              ></motion.div>
            </div>

            <div className="relative bg-white/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
              <Image
                src="/images/logo_transparent.png"
                alt="Ceylon Express - Sri Lankan Inspired"
                width={600}
                height={450}
                priority
                className="w-full h-auto relative z-10"
              />
              
              {/* Small accent dots */}
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-ceylon-orange animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-ceylon-blue"></div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <p className="text-sm text-ceylon-text/50 mb-2 uppercase tracking-wider">Scroll to explore</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="h-6 w-6 text-ceylon-orange mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

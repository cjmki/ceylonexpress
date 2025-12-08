'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook } from 'lucide-react'
import Link from 'next/link'
import MenuNavigation from '../components/MenuNavigation'
import MenuFooter from '../components/MenuFooter'

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-ceylon-cream">
      <MenuNavigation />

      {/* Menu Content */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-7xl md:text-8xl font-bold text-ceylon-text mb-8">
              Menu
              <br />
              <span className="text-ceylon-orange">Coming Soon</span>
            </h1>

            <p className="text-xl text-ceylon-text/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              We&apos;re carefully crafting our menu featuring authentic 
              Sri Lankan dishes. Follow us on Instagram and Facebook for 
              sneak peeks, availability, and updates!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-ceylon-orange text-white px-10 py-5 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text transition-colors"
              >
                <Instagram className="h-5 w-5" />
                Follow on Instagram
              </a>

              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-ceylon-text text-white px-10 py-5 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-orange transition-colors"
              >
                <Facebook className="h-5 w-5" />
                Follow on Facebook
              </a>
            </div>

            <Link
              href="/"
              className="inline-block border-2 border-ceylon-text text-ceylon-text px-10 py-4 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text hover:text-ceylon-cream transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>

      <MenuFooter />
    </div>
  )
}

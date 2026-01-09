'use client'

import Link from 'next/link'
import { Instagram, Facebook, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'

export default function Navigation() {
  const { getItemCount } = useCart()
  const cartItemCount = getItemCount()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-ceylon-orange/10 shadow-sm"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors text-label uppercase tracking-wider relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ceylon-orange group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/menu"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors text-label uppercase tracking-wider relative group"
            >
              Menu
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ceylon-orange group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/#about"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors text-label uppercase tracking-wider relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ceylon-orange group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/#location"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors text-label uppercase tracking-wider relative group"
            >
              Location
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ceylon-orange group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative text-ceylon-text hover:text-ceylon-orange transition-all hover:scale-110 duration-300 mr-1"
              aria-label="View cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-ceylon-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <a
              href="https://www.instagram.com/ceylonexpress.se/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-orange transition-all hover:scale-110 duration-300"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/ceylonexpressse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-blue transition-all hover:scale-110 duration-300"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

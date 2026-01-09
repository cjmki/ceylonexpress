'use client'

import Link from 'next/link'
import { Instagram, Facebook, ShoppingCart, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { getItemCount } = useCart()
  const cartItemCount = getItemCount()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/#about', label: 'About' },
    { href: '/#location', label: 'Location' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      },
    },
  }

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-ceylon-orange/10 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-ceylon-text hover:text-ceylon-orange transition-colors text-label uppercase tracking-wider relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ceylon-orange group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Mobile Logo/Brand Area */}
            <div className="md:hidden flex items-center">
              <Link 
                href="/" 
                className="text-ceylon-text font-bold text-lg tracking-wider"
              >
                Ceylon Express
              </Link>
            </div>

            {/* Right Side Icons (Cart + Social) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/cart"
                className="relative text-ceylon-text hover:text-ceylon-orange transition-all hover:scale-110 duration-300"
                aria-label="View cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-ceylon-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
              
              {/* Social Icons - Hidden on small mobile, visible on tablet+ */}
              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block text-ceylon-text hover:text-ceylon-orange transition-all hover:scale-110 duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block text-ceylon-text hover:text-ceylon-blue transition-all hover:scale-110 duration-300"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>

              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-ceylon-text hover:text-ceylon-orange transition-colors p-2 -mr-2"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop with gradient */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-ceylon-cream via-ceylon-yellow to-ceylon-orange/30"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 300 
              }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header - Spacer for fixed nav */}
                <div className="h-20" />

                {/* Navigation Links */}
                <motion.nav
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex-1 px-8 py-8"
                >
                  <div className="space-y-2">
                    {menuItems.map((item, index) => (
                      <motion.div key={item.href} variants={itemVariants}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-4 text-heading-md font-bold text-ceylon-text hover:text-ceylon-orange transition-colors border-b border-ceylon-orange/10 uppercase tracking-wide"
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social Links in Mobile Menu */}
                  <motion.div 
                    variants={itemVariants}
                    className="mt-12 pt-8 border-t border-ceylon-orange/20"
                  >
                    <p className="text-label text-ceylon-text/60 uppercase tracking-wider mb-4">
                      Follow Us
                    </p>
                    <div className="flex gap-6">
                      <a
                        href="https://www.instagram.com/ceylonexpress.se/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-ceylon-text hover:text-ceylon-orange transition-all hover:scale-105 duration-300"
                        aria-label="Follow us on Instagram"
                      >
                        <Instagram className="h-6 w-6" />
                        <span className="text-body-sm font-medium">Instagram</span>
                      </a>
                      <a
                        href="https://www.facebook.com/ceylonexpressse"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-ceylon-text hover:text-ceylon-blue transition-all hover:scale-105 duration-300"
                        aria-label="Follow us on Facebook"
                      >
                        <Facebook className="h-6 w-6" />
                        <span className="text-body-sm font-medium">Facebook</span>
                      </a>
                    </div>
                  </motion.div>
                </motion.nav>

                {/* Decorative Footer Pattern */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="px-8 py-6 bg-gradient-to-t from-ceylon-orange/5 to-transparent"
                >
                  <p className="text-body-xs text-ceylon-text/50 text-center italic">
                    Authentic Sri Lankan flavors
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

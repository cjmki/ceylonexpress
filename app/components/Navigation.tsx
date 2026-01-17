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
    { href: '/contact', label: 'Contact' },
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
        className="fixed top-0 left-0 right-0 z-50 bg-ceylon-cream/95 backdrop-blur-md border-b-3 border-ceylon-orange/20 shadow-lg"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 text-xs lg:text-sm font-bold uppercase tracking-wider px-4 lg:px-6 py-2.5 lg:py-3 rounded-full border-2 border-transparent hover:border-ceylon-orange hover:scale-105"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Logo/Brand Area */}
            <div className="md:hidden flex items-center">
              <Link 
                href="/" 
                className="text-ceylon-text font-bold text-base sm:text-lg tracking-wider flex items-center gap-2"
              >
                <span className="text-lg sm:text-xl">🍛</span>
                <span>Ceylon Express</span>
              </Link>
            </div>

            {/* Right Side Icons (Cart + Social) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/cart"
                className="relative text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 p-2.5 sm:p-3 rounded-full border-2 border-ceylon-orange/30 hover:border-ceylon-orange hover:scale-110"
                aria-label="View cart"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-ceylon-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-ceylon-cream shadow-lg"
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
                className="hidden sm:flex items-center justify-center text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 p-2.5 sm:p-3 rounded-full border-2 border-ceylon-orange/30 hover:border-ceylon-orange hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center text-ceylon-text hover:text-white hover:bg-ceylon-blue transition-all duration-300 p-2.5 sm:p-3 rounded-full border-2 border-ceylon-blue/30 hover:border-ceylon-blue hover:scale-110"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>

              {/* Join Us Link - Desktop only, slightly smaller */}
              <Link
                href="/careers"
                className="hidden md:flex items-center text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border-2 border-transparent hover:border-ceylon-orange hover:scale-105"
              >
                Join Us
              </Link>

              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 p-2.5 rounded-full border-2 border-ceylon-orange/30 hover:border-ceylon-orange"
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
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
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
            {/* Backdrop with pattern */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ceylon-cream"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, #1A1A1A 30px, #1A1A1A 31px),
                                 repeating-linear-gradient(90deg, transparent, transparent 30px, #1A1A1A 30px, #1A1A1A 31px)`
              }}></div>
            </motion.div>

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
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white/98 backdrop-blur-xl shadow-2xl overflow-y-auto border-l-4 border-ceylon-orange"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header - Spacer for fixed nav */}
                <div className="h-16" />

                {/* Navigation Links */}
                <motion.nav
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex-1 px-6 py-8"
                >
                  <div className="space-y-3">
                    {menuItems.map((item, index) => (
                      <motion.div key={item.href} variants={itemVariants}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between py-4 px-6 text-lg font-bold text-ceylon-text hover:text-white hover:bg-ceylon-orange transition-all duration-300 rounded-2xl border-3 border-ceylon-text/5 hover:border-ceylon-orange uppercase tracking-wide hover:scale-105"
                        >
                          <span>{item.label}</span>
                          <span className="text-2xl">→</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social Links in Mobile Menu */}
                  <motion.div 
                    variants={itemVariants}
                    className="mt-10 pt-8 border-t-2 border-dashed border-ceylon-orange/30"
                  >
                    <p className="text-xs text-ceylon-text/60 uppercase tracking-wider mb-4 font-bold px-2">
                      Follow Our Journey
                    </p>
                    <div className="space-y-3">
                      <a
                        href="https://www.instagram.com/ceylonexpress.se/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-4 bg-ceylon-orange hover:bg-ceylon-text text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
                        aria-label="Follow us on Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase">Instagram</span>
                      </a>
                      <a
                        href="https://www.facebook.com/ceylonexpressse"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-4 bg-ceylon-blue hover:bg-ceylon-text text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
                        aria-label="Follow us on Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase">Facebook</span>
                      </a>
                    </div>
                  </motion.div>
                </motion.nav>

                {/* Decorative Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="px-6 py-6 bg-gradient-to-t from-ceylon-yellow/20 to-transparent"
                >
                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-ceylon-orange/30 text-center">
                    <p className="text-xs text-ceylon-text/70 font-medium">
                      🍛 Authentic Sri Lankan Flavors
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import { AlertCircle, Instagram } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TestingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-ceylon-orange text-white py-3 px-6"
    >
      <div className="container mx-auto flex items-center justify-center gap-3 text-center flex-wrap">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm md:text-base font-medium">
          We&apos;re currently testing our booking system.
          <a
            href="https://www.instagram.com/ceylonexpress.se/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-2 underline hover:text-ceylon-yellow transition-colors font-bold"
          >
            <Instagram className="h-4 w-4" />
            DM us on Instagram
          </a>
          {' '}for orders in the meantime!
        </p>
      </div>
    </motion.div>
  )
}


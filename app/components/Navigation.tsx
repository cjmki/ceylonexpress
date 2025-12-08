'use client'

import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="py-6 border-b border-ceylon-text/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <a
              href="#about"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors font-bold uppercase text-sm tracking-wider"
            >
              About
            </a>
            <a
              href="#location"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors font-bold uppercase text-sm tracking-wider"
            >
              Location
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/ceylonexpress.se/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/ceylonexpressse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}


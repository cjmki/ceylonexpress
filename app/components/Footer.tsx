'use client'

import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-ceylon-text/10">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-ceylon-text/50">
            © {new Date().getFullYear()} Ceylon Express. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#about"
              className="text-sm text-ceylon-text/70 hover:text-ceylon-orange transition-colors"
            >
              About
            </a>
            <a
              href="#location"
              className="text-sm text-ceylon-text/70 hover:text-ceylon-orange transition-colors"
            >
              Location
            </a>
            <a
              href="https://www.instagram.com/ceylonexpress.se/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text/70 hover:text-ceylon-orange transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/ceylonexpressse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text/70 hover:text-ceylon-orange transition-colors"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


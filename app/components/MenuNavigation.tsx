'use client'

import Link from 'next/link'
import { Instagram, Facebook, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function MenuNavigation() {
  const { getItemCount } = useCart()
  const cartItemCount = getItemCount()

  return (
    <nav className="py-6 border-b border-ceylon-text/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors font-bold uppercase text-sm tracking-wider"
            >
              Home
            </Link>
            <Link
              href="/#about"
              className="text-ceylon-text hover:text-ceylon-orange transition-colors font-bold uppercase text-sm tracking-wider"
            >
              About
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


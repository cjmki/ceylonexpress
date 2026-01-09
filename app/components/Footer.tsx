'use client'

import Link from 'next/link'
import { Instagram, Facebook, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative py-12 px-6 bg-ceylon-text text-white overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 30px 30px, #F0D871 2px, transparent 0)`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 
              className="text-heading-md text-ceylon-yellow mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Ceylon Express
            </h3>
            <p className="text-body-sm text-white/60 mb-4">
              Sri Lankan Inspired • Stockholm, Sweden
            </p>
            <p className="text-body-md text-white/80">
              Bringing authentic island flavors to your neighborhood through 
              our food truck and catering services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-label text-ceylon-yellow mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-white/80 hover:text-ceylon-yellow transition-colors inline-block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#location"
                  className="text-white/80 hover:text-ceylon-yellow transition-colors inline-block"
                >
                  Location
                </a>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="text-white/80 hover:text-ceylon-yellow transition-colors inline-block"
                >
                  Menu
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-label text-ceylon-yellow mb-4 uppercase tracking-wider">
              Connect With Us
            </h4>
            <p className="text-body-sm text-white/80 mb-4">
              Follow our journey and stay updated on our launch
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-ceylon-orange p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-ceylon-blue p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-body-sm text-white/60">
            © {new Date().getFullYear()} Ceylon Express. All rights reserved.
          </p>
          <p className="text-body-sm text-white/60 flex items-center gap-2">
            Made with <Heart className="h-4 w-4 text-ceylon-orange fill-current" /> in Stockholm
          </p>
        </div>
      </div>
    </footer>
  )
}

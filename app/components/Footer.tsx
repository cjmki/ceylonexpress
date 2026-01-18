'use client'

import Link from 'next/link'
import { Instagram, Facebook, Heart, MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative py-12 md:py-16 px-4 md:px-6 bg-ceylon-text text-white overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #F0D871 40px, #F0D871 41px),
                         repeating-linear-gradient(90deg, transparent, transparent 40px, #F0D871 40px, #F0D871 41px)`
      }}></div>

      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-ceylon-orange/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-ceylon-yellow/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Main Footer Content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/favicon.svg" 
                  alt="Ceylon Express Logo" 
                  className="h-7 w-7 md:h-8 md:w-8 object-contain"
                />
                <h3 
                  className="text-2xl md:text-3xl font-bold text-ceylon-yellow"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Ceylon Express
                </h3>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-ceylon-orange/20 px-4 py-2 rounded-full border-2 border-ceylon-orange/30 w-fit">
                <span className="text-xs md:text-sm text-ceylon-yellow font-bold uppercase tracking-wider">
                  Sri Lankan Inspired • Stockholm
                </span>
              </div>
            </div>
            
            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 max-w-md">
              Bringing authentic island flavors to your neighborhood through 
              our cloud kitchen and catering services. Experience the warmth of home-cooked Sri Lankan cuisine.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <div className="bg-ceylon-orange/20 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-ceylon-yellow" />
                </div>
                <span>Stockholm, Sweden</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-sm md:text-base font-bold text-ceylon-yellow mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '#about', label: 'About Us' },
                { href: '#location', label: 'Location' },
                { href: '/menu', label: 'Menu' },
                { href: '/contact', label: 'Contact' },
                { href: '/careers', label: 'Join Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm md:text-base text-white/80 hover:text-ceylon-yellow transition-all duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-ceylon-orange rounded-full group-hover:scale-150 transition-transform"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-sm md:text-base font-bold text-ceylon-yellow mb-4 uppercase tracking-wider">
              Connect
            </h4>
            <p className="text-xs md:text-sm text-white/80 mb-4 leading-relaxed">
              Follow our journey and stay updated
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-ceylon-orange hover:bg-ceylon-orange/80 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md text-sm font-bold"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-ceylon-blue hover:bg-ceylon-blue/80 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md text-sm font-bold"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-white/10 my-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-white/60 text-xs md:text-sm">
            © {new Date().getFullYear()} Ceylon Express. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Share2, Instagram, Facebook } from 'lucide-react'

const locationInfo = [
  {
    icon: MapPin,
    title: 'Location',
    description: 'Stockholm, Sweden',
    delay: 0,
  },
  {
    icon: Clock,
    title: 'Hours',
    description: 'Coming Soon',
    delay: 0.1,
  },
  {
    icon: Share2,
    title: 'Social Media',
    description: 'Follow us',
    delay: 0.2,
  },
]

export default function LocationSection() {
  return (
    <section id="location" className="py-20 px-6 border-t border-ceylon-text/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-ceylon-text mb-6">Find Us</h2>
          <p className="text-xl text-ceylon-text/70">
            Follow us for location updates and launch announcements
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {locationInfo.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: item.delay }}
              >
                <Icon className="h-12 w-12 text-ceylon-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-ceylon-text mb-2">
                  {item.title}
                </h3>
                {item.title === 'Social Media' ? (
                  <div className="flex gap-4 justify-center mt-2">
                    <a
                      href="https://www.instagram.com/ceylonexpress.se/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ceylon-orange hover:text-ceylon-text transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="https://www.facebook.com/ceylonexpressse"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ceylon-orange hover:text-ceylon-text transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  </div>
                ) : (
                  <p className="text-ceylon-text/70">{item.description}</p>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/ceylonexpress.se/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-ceylon-orange text-white px-10 py-5 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-text transition-colors"
          >
            <Instagram className="h-5 w-5" />
            Stay Updated
          </a>
        </div>
      </div>
    </section>
  )
}


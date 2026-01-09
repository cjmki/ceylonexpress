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
    <section id="location" className="relative py-32 px-6 bg-gradient-to-br from-ceylon-cream via-ceylon-yellow/50 to-ceylon-orange/20 overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #D9873B 50px, #D9873B 51px),
                         repeating-linear-gradient(90deg, transparent, transparent 50px, #D9873B 50px, #D9873B 51px)`
      }}></div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-24 h-1 bg-ceylon-orange mx-auto mb-6"
          ></motion.div>

          <h2 
            className="text-display-sm md:text-display-md text-ceylon-text mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Find Us Soon
          </h2>
          <p className="text-body-xl text-ceylon-text/70 max-w-2xl mx-auto">
            Follow our journey as we prepare to bring authentic Sri Lankan flavors to Stockholm
          </p>
        </motion.div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {locationInfo.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: item.delay }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-ceylon-orange"
              >
                <div className="bg-ceylon-orange/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-10 w-10 text-ceylon-orange" />
                </div>
                
                <h3 className="text-heading-sm text-ceylon-text mb-2">
                  {item.title}
                </h3>
                
                {item.title === 'Social Media' ? (
                  <div className="flex gap-4 justify-center mt-4">
                    <a
                      href="https://www.instagram.com/ceylonexpress.se/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-ceylon-orange/10 hover:bg-ceylon-orange p-3 rounded-full transition-all duration-300"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-6 w-6 text-ceylon-orange group-hover:text-white transition-colors" />
                    </a>
                    <a
                      href="https://www.facebook.com/ceylonexpressse"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-ceylon-blue/20 hover:bg-ceylon-blue p-3 rounded-full transition-all duration-300"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-6 w-6 text-ceylon-blue group-hover:text-white transition-colors" />
                    </a>
                  </div>
                ) : (
                  <p className="text-body-lg text-ceylon-text/70">{item.description}</p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-2xl border-4 border-ceylon-orange/20"
        >
          <div className="max-w-2xl mx-auto">
            <h3 
              className="text-heading-xl md:text-display-sm text-ceylon-text mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Stay Updated on Our Launch
            </h3>
            
            <p className="text-body-lg text-ceylon-text/70 mb-10">
              Be the first to know when we launch, discover exclusive menu previews, 
              and follow our journey bringing authentic Sri Lankan cuisine to Stockholm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/ceylonexpress.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg btn-primary"
              >
                <Instagram className="h-5 w-5" />
                <span>Follow on Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/ceylonexpressse"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg btn-outline"
              >
                <Facebook className="h-5 w-5" />
                <span>Follow on Facebook</span>
              </a>
            </div>

            <p className="mt-8 text-body-sm text-ceylon-text/50 italic">
              Join our growing community of food lovers
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

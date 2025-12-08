'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

export default function Hero() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="relative w-full max-w-2xl mx-auto mb-12">
            <Image
              src="/images/logo_transparent.png"
              alt="Ceylon Express - Sri Lankan Inspired"
              width={800}
              height={600}
              priority
              className="w-full h-auto"
            />
          </div>

          <p className="text-2xl md:text-3xl text-ceylon-text/80 mb-12 leading-relaxed font-light">
            Authentic Sri Lankan cuisine
            <br />
            coming soon to Stockholm
          </p>

          <a
            href="https://www.instagram.com/ceylonexpress.se/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-ceylon-text text-ceylon-cream px-10 py-5 font-bold uppercase text-sm tracking-wider hover:bg-ceylon-orange transition-colors"
          >
            <Instagram className="h-5 w-5" />
            Follow Our Journey
          </a>
        </motion.div>
      </div>
    </section>
  )
}


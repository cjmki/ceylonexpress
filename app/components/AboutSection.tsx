'use client'

import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-6 border-t border-ceylon-text/10 bg-white">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-6xl md:text-7xl font-bold text-ceylon-text mb-8">
            Sri Lankan Inspired
          </h2>

          <div className="space-y-6 text-lg text-ceylon-text/70 leading-relaxed">
            <p>
              Ceylon Express brings the vibrant flavors of Sri Lanka to Sweden.
              We serve authentic dishes prepared with traditional
              spices and cooking methods passed down through generations.
            </p>

            <p>
              From the fiery kick of our curries to the aromatic blend of
              cinnamon, cardamom, and curry leaves, every dish celebrates the
              rich culinary heritage of the island formerly known as Ceylon.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


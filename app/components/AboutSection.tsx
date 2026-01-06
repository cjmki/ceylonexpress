'use client'

import { motion } from 'framer-motion'
import { Flame, Heart, Users } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
}

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.2
    }
  },
  viewport: { once: true }
}

const values = [
  {
    icon: Flame,
    title: 'Traditional Spices',
    description: 'Authentic recipes using time-honored spice blends from the island'
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every dish prepared with the warmth of home-cooked meals'
  },
  {
    icon: Users,
    title: 'Community Spirit',
    description: 'Bringing people together through the joy of shared flavors'
  }
]

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ceylon-yellow/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-ceylon-blue/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section header */}
        <motion.div
          {...fadeInUp}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-24 h-1 bg-ceylon-orange mx-auto mb-6"
          ></motion.div>
          
          <h2 
            className="text-5xl md:text-7xl font-bold text-ceylon-text mb-6 leading-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            A Taste of
            <br />
            <span className="text-ceylon-orange">Ceylon</span>
          </h2>
        </motion.div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6 text-lg text-ceylon-text/80 leading-relaxed">
              <p className="text-xl text-ceylon-orange font-semibold italic">
                From our family to yours
              </p>
              
              <p>
                Ceylon Express brings the vibrant, soul-warming flavors of Sri Lanka 
                to Sweden. We&apos;re more than a food truck — we&apos;re a bridge between 
                cultures, a reminder of home for expats, and an invitation to discover 
                the rich culinary heritage of the island.
              </p>

              <p>
                Our dishes are crafted using traditional methods passed down through 
                generations. From the aromatic blend of cinnamon, cardamom, and curry 
                leaves to the perfect balance of heat and flavor, every bite tells a 
                story of our heritage.
              </p>

              <p className="font-semibold text-ceylon-text">
                We celebrate the spices, the traditions, and the warmth that makes 
                Sri Lankan cuisine unforgettable.
              </p>
            </div>
          </motion.div>

          {/* Right: Decorative element with pattern */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-ceylon-yellow via-ceylon-cream to-ceylon-orange/30 p-12 rounded-3xl relative overflow-hidden">
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 20px 20px, #D9873B 2px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
              
              <div className="relative space-y-8">
                <div className="text-6xl font-bold text-ceylon-text/20" style={{ fontFamily: 'Georgia, serif' }}>
                  "
                </div>
                <p className="text-2xl text-ceylon-text/80 leading-relaxed italic">
                  Food is not just about taste — it&apos;s about memories, 
                  connection, and the stories we share.
                </p>
                <div className="text-right">
                  <p className="font-bold text-ceylon-orange text-lg">Ceylon Express Team</p>
                  <p className="text-ceylon-text/60">Stockholm, Sweden</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid md:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={fadeInUp}
              className="group relative"
            >
              <div className="bg-ceylon-cream/50 border-2 border-transparent hover:border-ceylon-orange p-8 rounded-2xl transition-all duration-300 hover:shadow-xl h-full">
                <div className="bg-ceylon-orange/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-ceylon-orange group-hover:scale-110 transition-all duration-300">
                  <value.icon className="h-8 w-8 text-ceylon-orange group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-ceylon-text mb-3">
                  {value.title}
                </h3>
                
                <p className="text-ceylon-text/70 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-ceylon-orange font-bold text-xl mb-2 uppercase tracking-wider">
            Food Truck & Catering Services
          </p>
          <p className="text-ceylon-text/60 text-lg">
            Launching Soon in Stockholm
          </p>
        </motion.div>
      </div>
    </section>
  )
}

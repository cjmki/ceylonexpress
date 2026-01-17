'use client'

import { motion } from 'framer-motion'
import { Flame, Heart, Users, Sparkles } from 'lucide-react'

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
      staggerChildren: 0.15
    }
  },
  viewport: { once: true }
}

const values = [
  {
    icon: Flame,
    title: 'Traditional Recipes',
    description: 'Authentic family recipes passed down through generations',
    cardBg: 'bg-ceylon-yellow/10',
    cardBorder: 'border-ceylon-orange/30 hover:border-ceylon-orange',
    iconBg: 'bg-ceylon-orange/10',
    iconBorder: 'border-ceylon-orange/30',
    iconColor: 'text-ceylon-orange',
    accentBg: 'bg-ceylon-orange'
  },
  {
    icon: Heart,
    title: 'Home-Cooked Quality',
    description: 'Every dish prepared with care, just like your amma would make',
    cardBg: 'bg-ceylon-cream/30',
    cardBorder: 'border-ceylon-orange/30 hover:border-ceylon-orange',
    iconBg: 'bg-ceylon-orange/10',
    iconBorder: 'border-ceylon-orange/30',
    iconColor: 'text-ceylon-orange',
    accentBg: 'bg-ceylon-orange'
  },
  {
    icon: Users,
    title: 'Catering Available',
    description: 'Perfect for events, parties, and family gatherings',
    cardBg: 'bg-ceylon-blue/10',
    cardBorder: 'border-ceylon-blue/30 hover:border-ceylon-blue',
    iconBg: 'bg-ceylon-blue/10',
    iconBorder: 'border-ceylon-blue/30',
    iconColor: 'text-ceylon-blue',
    accentBg: 'bg-ceylon-blue'
  }
]

export default function AboutSection() {
  return (
    <section id="about" className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 overflow-hidden bg-white">
      {/* Decorative background circles */}
      <div className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-ceylon-yellow/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 md:w-80 md:h-80 bg-ceylon-blue/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section header with badge */}
        <motion.div
          {...fadeInUp}
          className="text-center mb-12 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 bg-ceylon-orange/10 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-ceylon-orange/30 mb-6 md:mb-8"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-ceylon-orange" />
            <span className="text-ceylon-orange font-bold text-xs md:text-sm uppercase tracking-wider">
              Our Story
            </span>
          </motion.div>
          
          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Authentic{' '}
            <span className="text-ceylon-orange relative inline-block">
              Sri Lankan Food
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-1 md:h-2 bg-ceylon-yellow/50 rounded-full"
              />
            </span>
          </h2>

          <p className="text-base md:text-lg text-ceylon-text/60 max-w-2xl mx-auto">
            Real Sri Lankan food made by Sri Lankans, for Sri Lankans in Stockholm
          </p>
        </motion.div>

        {/* Main content grid - Editorial Layout */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start mb-12 md:mb-20">
          {/* Left: Story Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Highlighted intro */}
            <div className="bg-ceylon-yellow/20 p-4 md:p-6 rounded-2xl md:rounded-3xl border-3 border-ceylon-yellow/50 border-dashed">
              <p className="text-lg md:text-xl font-bold text-ceylon-orange italic">
                Bringing back the nostalgia of home
              </p>
            </div>

            {/* Story paragraphs */}
            <div className="space-y-4 md:space-y-6 text-sm md:text-base lg:text-lg text-ceylon-text/80 leading-relaxed">
              <p>
                We know what it&apos;s like to miss home. Ceylon Express brings you the 
                real flavors of Sri Lanka right here in Stockholm. Whether you&apos;re 
                craving a proper rice and curry or planning a family event, we&apos;ve got you covered.
              </p>

              <p>
                Our food is made the traditional way, using recipes we grew up with. 
                We use real Sri Lankan spices and ingredients to give you that authentic 
                taste you remember from home.
              </p>

              <div className="bg-white p-4 md:p-6 rounded-2xl border-3 border-ceylon-orange shadow-lg">
                <p className="font-bold text-ceylon-text text-base md:text-lg">
                  Order from our cloud kitchen or book us for your next event. 
                  We serve fresh, home-cooked meals and cater for parties and gatherings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Quote Card - Editorial Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative">
              {/* Dashed border decoration */}
              <div className="absolute -inset-3 md:-inset-4 border-3 border-dashed border-ceylon-blue/30 rounded-[2rem] md:rounded-[2.5rem]"></div>
              
              {/* Main quote card */}
              <div className="relative bg-gradient-to-br from-ceylon-blue/20 via-ceylon-cream/40 to-ceylon-yellow/20 p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl shadow-xl border-4 border-white">
                {/* Quote marks */}
                <div className="text-5xl md:text-7xl font-bold text-ceylon-orange/20 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  "
                </div>
                
                {/* Quote text */}
                <p className="text-lg md:text-xl lg:text-2xl text-ceylon-text font-medium italic mb-6 md:mb-8 leading-relaxed">
                  Good food brings people together. We make the food that reminds 
                  you of family, celebrations, and home.
                </p>
                
                {/* Attribution */}
                <div className="flex items-center justify-between pt-4 md:pt-6 border-t-2 border-ceylon-orange/20">
                  <div>
                    <p className="text-xs md:text-sm text-ceylon-text/60">Stockholm, Sweden</p>
                  </div>
                  <div className="text-3xl md:text-4xl">🇱🇰</div>
                </div>

                {/* Decorative dots */}
                <div className="absolute -top-2 -left-2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-ceylon-orange shadow-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 md:w-5 md:h-5 rounded-full bg-ceylon-blue shadow-lg"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Cards - Outlined Pastel Style */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={fadeInUp}
              className="group relative"
            >
              {/* Card container */}
              <div className={`relative ${value.cardBg} border-3 ${value.cardBorder} p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full`}>
                {/* Icon */}
                <div className={`${value.iconBg} border-2 ${value.iconBorder} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <value.icon className={`h-7 w-7 md:h-8 md:w-8 ${value.iconColor} group-hover:scale-110 transition-transform`} />
                </div>
                
                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-ceylon-text mb-2 md:mb-3">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm md:text-base text-ceylon-text/70 leading-relaxed">
                  {value.description}
                </p>

                {/* Hover accent dot */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full ${value.accentBg} opacity-0 group-hover:opacity-100 transition-opacity shadow-lg`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

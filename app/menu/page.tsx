import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { getMenuItemsCached } from '../actions/menu'
import MenuContent from './components/MenuContent'

// Force dynamic rendering - caching is handled by unstable_cache in the data layer
export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  // Data is fetched on the server - no client-side loading spinner needed!
  // Cached for 2 minutes with automatic revalidation
  const menuItems = await getMenuItemsCached()

  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      <Navigation />

      {/* Menu Content */}
      <section className="flex-1 pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 md:mb-16 text-center">
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-ceylon-text mb-4 md:mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Authentic Sri Lankan{' '}
              <span className="text-ceylon-orange relative inline-block">
                Flavors
              </span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-ceylon-text/70 max-w-3xl mx-auto">
              Items sold out?{' '}
              <Link 
                href="/faq#sold-out" 
                className="text-ceylon-orange font-semibold hover:text-ceylon-text underline decoration-ceylon-orange/30 hover:decoration-ceylon-orange transition-all"
              >
                Find out why &amp; when we make them available again
              </Link>
            </p>
            
            <p className="text-sm md:text-base text-ceylon-text/60 max-w-3xl mx-auto mt-3">
              <span className="mr-1">🎉</span>
              Planning a larger event or special occasion?{' '}
              <Link 
                href="/contact" 
                className="text-ceylon-orange font-semibold hover:text-ceylon-text underline decoration-ceylon-orange/30 hover:decoration-ceylon-orange transition-all"
              >
                Contact us for personalized quotes
              </Link>
            </p>
          </div>

          {/* Interactive menu content with cart functionality */}
          <MenuContent initialMenuItems={menuItems} />
        </div>
      </section>

      <Footer />
    </div>
  )
}

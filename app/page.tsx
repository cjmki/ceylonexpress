import Navigation from './components/Navigation'
import Hero from './components/Hero'
import AboutSection from './components/AboutSection'
import LocationSection from './components/LocationSection'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-ceylon-cream">
      <Navigation />
      <Hero />
      <AboutSection />
      <LocationSection />
      <Footer />
    </div>
  )
}

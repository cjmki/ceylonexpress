import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../src/index.css'
import { CartProvider } from './contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Ceylon Express - Authentic Sri Lankan Cuisine',
  description: 'Ceylon Express brings you the authentic flavors of Sri Lanka. Traditional recipes passed down through generations, made fresh daily with premium ingredients and spices.',
  keywords: ['Sri Lankan food', 'Ceylon cuisine', 'food truck', 'catering', 'authentic Sri Lankan', 'Ceylon Express'],
  authors: [{ name: 'Ceylon Express' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/logo_transparent.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/images/logo_transparent.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Ceylon Express - Authentic Sri Lankan Cuisine',
    description: 'Authentic Sri Lankan flavors made fresh daily. Follow our journey on Instagram and Facebook!',
    type: 'website',
    locale: 'en_US',
    siteName: 'Ceylon Express',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ceylon Express - Authentic Sri Lankan Cuisine',
    description: 'Authentic Sri Lankan flavors made fresh daily',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}


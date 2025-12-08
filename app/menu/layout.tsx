import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu - Ceylon Express',
  description: 'Explore our authentic Sri Lankan menu featuring traditional recipes and modern fusion dishes.',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


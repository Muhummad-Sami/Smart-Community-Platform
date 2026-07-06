import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { TopLoadingBar } from '@/components/layout/TopLoadingBar'
import { PageTransition } from '@/components/layout/PageTransition'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'SmartCommunity – Local Marketplace & Services',
    template: '%s | SmartCommunity',
  },
  description: 'Your trusted local community marketplace for products and professional services.',
  keywords: ['community', 'marketplace', 'local services', 'buy sell', 'professionals'],
  openGraph: {
    title: 'SmartCommunity Platform',
    description: 'Your trusted local community marketplace',
    type: 'website',
  },
  // ✅ ADD THIS: Favicon configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  // ✅ ADD THIS: Manifest
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background text-gray-900 min-h-screen">
        <Providers>
          <TopLoadingBar />
          <Navbar />
          <main className="pt-16">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  )
}
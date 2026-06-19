import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Digital Heroes — Golf Draw & Jackpot',
    template: '%s | Digital Heroes',
  },
  description:
    'Your Stableford scores become your lottery ticket. Monthly jackpots, charity giving, and a community of golf heroes. Join Digital Heroes today.',
  keywords: ['golf', 'stableford', 'lottery', 'jackpot', 'charity', 'subscription'],
  authors: [{ name: 'Digital Heroes' }],
  metadataBase: new URL('https://arena.digitalheroes.app'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Digital Heroes',
    title: 'Digital Heroes — Golf Draw & Jackpot',
    description:
      'Your Stableford scores become your lottery ticket. Monthly jackpots, charity giving, and a community of golf heroes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Heroes — Golf Draw & Jackpot',
    description: 'Your scores. Your jackpot. Your legacy.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0e27',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-navy text-white antialiased">
        {children}
      </body>
    </html>
  )
}

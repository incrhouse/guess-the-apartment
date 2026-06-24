import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guess the Apartment — Can You Spot the Flaw?',
  description: 'A game where you identify the layout flaws, design mistakes, and hidden problems in real apartment floor plans. Play free.',
  keywords: 'apartment floor plan game, guess the apartment flaw, rental apartment problems, floor plan quiz',
  openGraph: {
    title: 'Guess the Apartment — Can You Spot the Flaw?',
    description: 'Identify the layout flaws hiding in apartment floor plans. A free game for anyone who has ever rented.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8217135306638009"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
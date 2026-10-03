import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0D1B2A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.drawspy.com'),
  title: {
    default: 'DrawSpy – Draw. Blend In. Don\'t Get Caught.',
    template: '%s | DrawSpy',
  },
  description:
    'DrawSpy is a free multiplayer drawing & social deduction game. One secret Spy doesn\'t know the word — draw, bluff, and unmask the Impostor! Play online with friends now.',
  keywords: [
    'drawing game',
    'spy game',
    'impostor game',
    'multiplayer online',
    'party game',
    'free browser game',
    'social deduction game',
    'draw and guess',
    'skribbl alternative',
    'drawspy',
  ],
  authors: [{ name: 'DrawSpy Team', url: 'https://www.drawspy.com' }],
  creator: 'DrawSpy',
  publisher: 'DrawSpy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.drawspy.com',
  },
  openGraph: {
    title: 'DrawSpy – Draw. Blend In. Don\'t Get Caught.',
    description: 'Free multiplayer drawing + social deduction game. Draw the secret word, find the Spy! Play now with friends.',
    url: 'https://www.drawspy.com',
    siteName: 'DrawSpy',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DrawSpy – Multiplayer Drawing & Spy Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DrawSpy – Draw. Blend In. Don\'t Get Caught.',
    description: 'One of you has no idea what they\'re drawing. Free multiplayer drawing game — find the Spy!',
    images: ['/og-image.png'],
    creator: '@drawspygame',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Structured Data – WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DrawSpy',
              url: 'https://www.drawspy.com',
              description: 'Free multiplayer drawing and social deduction game. Draw, bluff, find the Spy!',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.drawspy.com',
              },
            }),
          }}
        />
        {/* Structured Data – Game */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoGame',
              name: 'DrawSpy',
              url: 'https://www.drawspy.com',
              description: 'A free multiplayer browser game where one player is the secret Spy. Draw, bluff, and find the Impostor!',
              genre: ['Party Game', 'Drawing Game', 'Social Deduction'],
              gamePlatform: 'Web Browser',
              applicationCategory: 'Game',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              publisher: {
                '@type': 'Organization',
                name: 'DrawSpy',
                url: 'https://www.drawspy.com',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-navy-900 antialiased">
        {children}
      </body>
    </html>
  );
}

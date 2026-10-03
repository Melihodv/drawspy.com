import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0D1B2A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'DrawSpy – Draw. Blend In. Don\'t Get Caught.',
  description:
    'A free multiplayer drawing + social deduction game. One player is the Spy and doesn\'t know the secret word. Draw, bluff, and find the Spy!',
  keywords: ['drawing game', 'spy game', 'multiplayer', 'party game', 'free', 'online'],
  openGraph: {
    title: 'DrawSpy',
    description: 'Draw. Blend in. Don\'t get caught.',
    url: 'https://drawspy.com',
    siteName: 'DrawSpy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DrawSpy',
    description: 'One of you has no idea what you\'re drawing. 👀',
  },
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
      </head>
      <body className="min-h-screen bg-navy-900 antialiased">
        {children}
      </body>
    </html>
  );
}

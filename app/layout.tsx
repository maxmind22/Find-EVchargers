import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AuthProvider } from '@/lib/authContext';
import { ChatbotClientWrapper } from '@/components/chatbot/ChatbotClientWrapper';

export const metadata: Metadata = {
  title: 'EVchargers | Interactive EV Charging Map & Network (Kigali)',
  description:
    'Find available electric vehicle charging stations, ultra-fast DC & GB/T chargers, pricing, and connector specs in Kigali, Rwanda.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to CARTO tile CDN for ultra-fast initial Leaflet tile rendering */}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
      </head>
      <body className="flex h-[100dvh] flex-col bg-slate-900 antialiased selection:bg-brand-500 selection:text-white pb-safe">
        <AuthProvider>
          <NavigationHeader />
          <main className="relative flex-1 overflow-hidden">{children}</main>
          <ChatbotClientWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}

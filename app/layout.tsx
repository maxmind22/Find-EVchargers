import type { Metadata } from 'next';
import './globals.css';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AuthProvider } from '@/lib/authContext';
import { AIChatbot } from '@/components/chatbot/AIChatbot';

export const metadata: Metadata = {
  title: 'EVchargers | Interactive EV Charging Map & Network (Kigali)',
  description:
    'Find available electric vehicle charging stations, ultra-fast DC & GB/T chargers, pricing, and connector specs in Kigali, Rwanda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col bg-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <NavigationHeader />
          <main className="relative flex-1 overflow-hidden">{children}</main>
          <AIChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}


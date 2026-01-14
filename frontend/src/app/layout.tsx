import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AIChatWidget } from '@/components/chat/AIChatWidget';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI RoomBook - Inteligentny System Rezerwacji Sal',
  description: 'Inteligentny system zarządzania rezerwacjami sal konferencyjnych z asystentem AI',
  keywords: ['rezerwacje', 'sale konferencyjne', 'kalendarz', 'booking', 'AI', 'OpenAI'],
  authors: [{ name: 'Piotr Adamczyk', url: 'https://octadecimal.pl' }],
};

/**
 * Główny layout aplikacji.
 * Design System: WIP.pl (Wiedza i Praktyka)
 * Zawiera sidebar, main content area, footer i providery.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#1a365d" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar - stały na desktop */}
            <Sidebar />
            
            {/* Main content area - ml-64 tylko na desktop (lg+) */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
              {/* Page content */}
              <main className="flex-1">
                {children}
              </main>
              
              {/* Footer */}
              <Footer />
            </div>
          </div>
          
          {/* AI Chat Widget - pływający przycisk */}
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}

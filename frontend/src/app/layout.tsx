import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Conference Room Booking',
  description: 'System zarządzania rezerwacjami sal konferencyjnych',
};

/**
 * Główny layout aplikacji.
 * Zawiera sidebar, providery dla React Query i Toast.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

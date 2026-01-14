'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Logo } from '@/components/ui/Logo';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    description: 'Przegląd systemu',
  },
  {
    name: 'Sale konferencyjne',
    href: '/rooms',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Zarządzanie salami',
  },
  {
    name: 'Rezerwacje',
    href: '/reservations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Kalendarz rezerwacji',
  },
];

/**
 * Sidebar z nawigacją aplikacji - styl WIP.pl
 * Responsywny - ukryty na mobile z hamburger menu
 */
export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Zamknij sidebar przy zmianie ścieżki (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Zamknij sidebar przy resize do desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Otwórz menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
          // Mobile: ukryty domyślnie, pokazuje się gdy isOpen
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700"
          aria-label="Zamknij menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center px-5 py-5 border-b border-gray-100">
          <Link href="/">
            <Logo size="md" variant="full" />
          </Link>
        </div>

        {/* Quick action button */}
        <div className="px-4 py-4">
          <Link
            href="/reservations"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-sm shadow-md hover:from-primary-700 hover:to-primary-600 transition-all"
            style={{ color: '#ffffff' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nowa rezerwacja
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="mb-2 px-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu
            </span>
          </div>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      {isActive && (
                        <div className="text-xs text-primary-500 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 p-4">
          {/* Help card */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Potrzebujesz pomocy?</div>
                <div className="text-xs text-gray-500 mt-0.5">Sprawdź dokumentację</div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-600 text-center">
            © 2026 Piotr Adamczyk,{' '}
            <a href="https://octadecimal.pl" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 underline">
              Octadecimal.pl
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

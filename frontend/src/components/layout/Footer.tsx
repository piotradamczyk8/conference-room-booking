'use client';

import Link from 'next/link';

/**
 * Stopka aplikacji w stylu WIP.pl
 * 3-4 kolumnowy layout z linkami i informacjami
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    system: [
      { name: 'Dashboard', href: '/' },
      { name: 'Sale konferencyjne', href: '/rooms' },
      { name: 'Kalendarz rezerwacji', href: '/reservations' },
    ],
    pomoc: [
      { name: 'Jak zarezerwować salę?', href: '#' },
      { name: 'FAQ', href: '#' },
      { name: 'Kontakt z administracją', href: '#' },
    ],
    firma: [
      { name: 'O nas', href: '#' },
      { name: 'Polityka prywatności', href: '#' },
      { name: 'Regulamin', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                  <path d="M3 9H21" stroke="white" strokeWidth="1.5" />
                  <path d="M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M16 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-white">RoomBook</div>
                <div className="text-xs text-gray-400">Rezerwacje sal</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Profesjonalny system zarządzania rezerwacjami sal konferencyjnych.
              Prosty, szybki i intuicyjny.
            </p>
          </div>

          {/* System links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              System
            </h3>
            <ul className="space-y-2">
              {footerLinks.system.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Pomoc
            </h3>
            <ul className="space-y-2">
              {footerLinks.pomoc.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informacje
            </h3>
            <ul className="space-y-2">
              {footerLinks.firma.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} RoomBook. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                Wykonałem w ramach testu rekrutacyjnego dla{' '}
                <a href="https://wip.pl" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white underline">
                  WIP.pl
                </a>
                , Piotr Adamczyk{' '}
                <a href="https://octadecimal.pl" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white underline">
                  octadecimal.pl
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

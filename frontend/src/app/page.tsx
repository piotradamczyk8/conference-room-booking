import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

/**
 * Strona główna - Dashboard AI RoomBook
 */
export default function HomePage() {
  return (
    <PageWrapper 
      title="Dashboard" 
      subtitle="Witaj w AI RoomBook - inteligentnym systemie rezerwacji"
    >
      <div className="max-w-6xl">
        {/* Hero section */}
        <div className="card-gradient p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                🤖 Inteligentne zarządzanie rezerwacjami
              </h2>
              <p className="max-w-lg" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                System z asystentem AI - zapytaj o wolne sale, sprawdź dostępność lub po prostu zarezerwuj termin. 
                Kliknij ikonę czatu w prawym dolnym rogu!
              </p>
            </div>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nowa rezerwacja
            </Link>
          </div>
        </div>

        {/* Stats cards - pobierane z API */}
        <DashboardStats />

        {/* Quick actions */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Szybkie akcje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card: Sale */}
          <Link href="/rooms" className="card p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-primary-700 transition-colors">
                  Sale konferencyjne
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Przeglądaj dostępne sale, sprawdź ich pojemność i wyposażenie.
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  Zarządzaj salami
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Card: Rezerwacje */}
          <Link href="/reservations" className="card p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-accent-dark transition-colors">
                  Kalendarz rezerwacji
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Zobacz wszystkie rezerwacje w widoku kalendarza. Zarezerwuj salę na spotkanie.
                </p>
                <span className="inline-flex items-center text-sm font-medium text-accent group-hover:text-accent-dark">
                  Otwórz kalendarz
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* AI Assistant info */}
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-accent/10 border-primary-200 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                🤖 Asystent AI
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Online
                </span>
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Kliknij ikonę czatu w prawym dolnym rogu, aby porozmawiać z asystentem. Możesz zapytać:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• &quot;Jakie sale są wolne dziś po 14:00?&quot;</li>
                <li>• &quot;Pokaż rezerwacje na jutro&quot;</li>
                <li>• &quot;Która sala ma projektor?&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="card p-6 bg-gray-50 border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Jak korzystać z systemu?
              </h3>
              <p className="text-sm text-gray-600">
                Wybierz salę z listy dostępnych sal, następnie kliknij na wolny termin w kalendarzu, 
                aby utworzyć nową rezerwację. Możesz również przeciągać istniejące rezerwacje, 
                aby zmienić ich termin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

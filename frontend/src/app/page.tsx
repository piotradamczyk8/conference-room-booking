import Link from 'next/link';

/**
 * Strona główna - Dashboard.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Conference Room Booking
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Sale */}
          <Link
            href="/rooms"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sale konferencyjne
                </h2>
                <p className="text-sm text-gray-500">
                  Zarządzaj salami konferencyjnymi
                </p>
              </div>
            </div>
          </Link>

          {/* Card: Rezerwacje */}
          <Link
            href="/reservations"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Rezerwacje
                </h2>
                <p className="text-sm text-gray-500">
                  Kalendarz rezerwacji sal
                </p>
              </div>
            </div>
          </Link>

          {/* Card: Statystyki */}
          <div className="card p-6 bg-gray-100/50 cursor-not-allowed">
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Statystyki
                </h2>
                <p className="text-sm text-gray-500">Wkrótce dostępne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Witaj w systemie rezerwacji sal konferencyjnych
          </h3>
          <p className="text-gray-600">
            Ten system pozwala na zarządzanie salami konferencyjnymi oraz
            rezerwacjami. Możesz dodawać, edytować i usuwać sale, a także
            tworzyć rezerwacje przez interaktywny kalendarz.
          </p>
          <div className="mt-4 flex gap-4">
            <Link href="/rooms" className="btn-primary">
              Przejdź do sal
            </Link>
            <Link href="/reservations" className="btn-secondary">
              Zobacz kalendarz
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

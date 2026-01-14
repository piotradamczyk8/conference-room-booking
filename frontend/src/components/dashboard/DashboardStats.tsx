'use client';

import { useRooms } from '@/hooks/useRooms';
import { useReservations } from '@/hooks/useReservations';

/**
 * Komponent statystyk na dashboardzie
 * Pobiera dane z API i wyświetla podsumowanie
 */
export function DashboardStats() {
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: reservations, isLoading: reservationsLoading } = useReservations();

  // Oblicz statystyki
  const activeRooms = rooms?.filter(room => room.isActive).length ?? 0;
  const totalRooms = rooms?.length ?? 0;
  
  // Rezerwacje dziś
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayReservations = reservations?.filter(res => {
    const start = new Date(res.startTime);
    return start >= today && start < tomorrow;
  }).length ?? 0;

  // Aktywne rezerwacje (od teraz do przodu)
  const now = new Date();
  const activeReservations = reservations?.filter(res => {
    const end = new Date(res.endTime);
    return end > now;
  }).length ?? 0;

  const isLoading = roomsLoading || reservationsLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Dostępne sale */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            {isLoading ? (
              <div className="skeleton h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {activeRooms}
                {totalRooms > activeRooms && (
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    /{totalRooms}
                  </span>
                )}
              </div>
            )}
            <div className="text-sm text-gray-500">Dostępnych sal</div>
          </div>
        </div>
      </div>

      {/* Rezerwacje dziś */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            {isLoading ? (
              <div className="skeleton h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-gray-800">{todayReservations}</div>
            )}
            <div className="text-sm text-gray-500">Rezerwacji dziś</div>
          </div>
        </div>
      </div>

      {/* Aktywne rezerwacje */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            {isLoading ? (
              <div className="skeleton h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-gray-800">{activeReservations}</div>
            )}
            <div className="text-sm text-gray-500">Nadchodzących rezerwacji</div>
          </div>
        </div>
      </div>
    </div>
  );
}

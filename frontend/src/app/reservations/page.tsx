'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Calendar } from '@/components/reservations/Calendar';
import { ReservationModal } from '@/components/reservations/ReservationModal';
import { Button } from '@/components/ui/Button';
import { useRooms } from '@/hooks/useRooms';

export default function ReservationsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const { data: rooms } = useRooms();

  const headerAction = (
    <div className="flex items-center gap-3">
      {/* Filtr sal */}
      <select
        value={selectedRoomId || ''}
        onChange={(e) => setSelectedRoomId(e.target.value || undefined)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Wszystkie sale</option>
        {rooms?.filter(r => r.isActive).map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* Przycisk nowej rezerwacji */}
      <Button
        variant="primary"
        onClick={() => setShowNewModal(true)}
      >
        <svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
        Nowa rezerwacja
      </Button>
    </div>
  );

  return (
    <PageWrapper 
      title="Rezerwacje"
      action={headerAction}
    >
      <div className="space-y-6">
        {/* Info box */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-primary-600 mt-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div>
              <p className="text-sm text-primary-800">
                <strong>Wskazówka:</strong> Kliknij i przeciągnij na kalendarzu, 
                aby wybrać przedział czasowy dla nowej rezerwacji. 
                Kliknij istniejącą rezerwację, aby zobaczyć szczegóły lub ją edytować.
              </p>
            </div>
          </div>
        </div>

        {/* Kalendarz */}
        <Calendar roomId={selectedRoomId} />
      </div>

      {/* Modal nowej rezerwacji */}
      {showNewModal && (
        <ReservationModal
          mode="create"
          defaultRoomId={selectedRoomId}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ReservationModal } from './ReservationModal';
import { useDeleteReservation } from '@/hooks/useReservations';
import { formatDateTime, getDurationInMinutes, formatDuration } from '@/lib/utils/date';
import type { Reservation } from '@/types';

interface ReservationDetailsProps {
  reservation: Reservation;
  onClose: () => void;
}

export function ReservationDetails({ reservation, onClose }: ReservationDetailsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteReservation();

  const duration = getDurationInMinutes(reservation.startTime, reservation.endTime);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(reservation.id);
      onClose();
    } catch {
      // Błąd obsługiwany przez hook
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onClose();
  };

  // Modal edycji
  if (showEditModal) {
    return (
      <ReservationModal
        mode="edit"
        reservation={reservation}
        onClose={() => setShowEditModal(false)}
      />
    );
  }

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Szczegóły rezerwacji"
      >
        <div className="space-y-4">
          {/* Informacje o sali */}
          <Card className="bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-primary-600" 
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
                <h4 className="font-medium text-gray-900">
                  {reservation.room.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Piętro {reservation.room.floor} • Max {reservation.room.capacity} osób
                </p>
              </div>
            </div>
          </Card>

          {/* Szczegóły rezerwacji */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Rezerwujący
              </label>
              <p className="text-gray-900">{reservation.reservedBy}</p>
            </div>
            
            {reservation.title && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tytuł spotkania
                </label>
                <p className="text-gray-900">{reservation.title}</p>
              </div>
            )}
          </div>

          {/* Czas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Rozpoczęcie
              </label>
              <p className="text-gray-900">{formatDateTime(reservation.startTime)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Zakończenie
              </label>
              <p className="text-gray-900">{formatDateTime(reservation.endTime)}</p>
            </div>
          </div>

          {/* Czas trwania */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Czas trwania
            </label>
            <p className="text-gray-900">{formatDuration(duration)}</p>
          </div>

          {/* Notatki */}
          {reservation.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Notatki
              </label>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {reservation.notes}
              </p>
            </div>
          )}

          {/* Data utworzenia */}
          <div className="text-sm text-gray-500 border-t pt-4">
            Utworzono: {formatDateTime(reservation.createdAt)}
          </div>

          {/* Akcje */}
          <div className="flex justify-between gap-3 pt-2 border-t">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Usuń rezerwację
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Zamknij
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowEditModal(true)}
              >
                Edytuj
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Potwierdzenie usunięcia */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Usuń rezerwację"
        message={`Czy na pewno chcesz usunąć rezerwację "${reservation.title || reservation.room.name}" zarezerwowaną przez ${reservation.reservedBy}?`}
        confirmText="Usuń"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

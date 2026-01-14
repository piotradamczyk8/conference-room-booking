'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api/reservations';
import { useToast } from '@/components/ui/Toast';
import type { 
  Reservation, 
  CreateReservationData, 
  UpdateReservationData,
  ReservationFilters 
} from '@/types';

// Query keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters?: ReservationFilters) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};

/**
 * Hook do pobierania listy rezerwacji z filtrami
 */
export function useReservations(filters?: ReservationFilters) {
  return useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: () => reservationsApi.getAll(filters),
    staleTime: 60 * 1000, // 60 sekund
  });
}

/**
 * Hook do pobierania pojedynczej rezerwacji
 */
export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook do tworzenia nowej rezerwacji
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReservationData) => reservationsApi.create(data),
    onSuccess: (newReservation) => {
      // Unieważnij cache listy rezerwacji
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      
      showToast({
        type: 'success',
        message: `Rezerwacja "${newReservation.title}" została utworzona`,
      });
    },
    onError: (error: any) => {
      // Sprawdź czy to błąd konfliktu (409)
      if (error.response?.status === 409) {
        const conflictMessage = error.response?.data?.message || 
          'Sala jest już zarezerwowana w wybranym terminie';
        
        showToast({
          type: 'error',
          message: conflictMessage,
        });
      } else {
        showToast({
          type: 'error',
          message: error.response?.data?.message || 'Nie udało się utworzyć rezerwacji',
        });
      }
    },
  });
}

/**
 * Hook do aktualizacji rezerwacji
 * UWAGA: invalidateQueries jest wyłączone - caller powinien samodzielnie wywołać refetch()
 * po zakończeniu mutacji, aby uniknąć race conditions
 */
export function useUpdateReservation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationData }) =>
      reservationsApi.update(id, data),
    onSuccess: (updatedReservation) => {
      // NIE wywołujemy invalidateQueries tutaj - caller zrobi refetch()
      // To zapobiega race conditions gdzie GET pobiera dane przed zapisem
      showToast({
        type: 'success',
        message: `Rezerwacja "${updatedReservation.title}" została zaktualizowana`,
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        showToast({
          type: 'error',
          message: error.response?.data?.message || 
            'Konflikt czasowy - sala jest już zarezerwowana',
        });
      } else {
        showToast({
          type: 'error',
          message: error.response?.data?.message || 'Nie udało się zaktualizować rezerwacji',
        });
      }
    },
  });
}

/**
 * Hook do usuwania rezerwacji
 */
export function useDeleteReservation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => reservationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      
      showToast({
        type: 'success',
        message: 'Rezerwacja została usunięta',
      });
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się usunąć rezerwacji',
      });
    },
  });
}

/**
 * Hook do pobierania rezerwacji dla kalendarza (z mapowaniem na format FullCalendar)
 */
export function useCalendarReservations(filters?: ReservationFilters) {
  const query = useReservations(filters);

  // Mapowanie rezerwacji na format FullCalendar events
  const events = query.data?.map((reservation) => ({
    id: reservation.id,
    title: `${reservation.room.name} - ${reservation.reservedBy}`,
    start: reservation.startTime,
    end: reservation.endTime,
    backgroundColor: getReservationColor(reservation),
    borderColor: getReservationColor(reservation),
    extendedProps: {
      reservation,
    },
  }));

  return {
    ...query,
    events,
  };
}

/**
 * Generuje kolor dla rezerwacji (można rozszerzyć o logikę per-sala)
 */
function getReservationColor(reservation: Reservation): string {
  // Prosty hash z nazwy sali dla różnych kolorów
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
  ];
  
  const hash = reservation.room.name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colors[hash % colors.length];
}

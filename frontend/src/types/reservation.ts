import type { Room } from './room';

/**
 * Interfejs reprezentujący rezerwację sali.
 */
export interface Reservation {
  id: string;
  room: Pick<Room, 'id' | 'name'>;
  reservedBy: string;
  title: string | null;
  startTime: string;
  endTime: string;
  notes: string | null;
  createdAt: string;
}

/**
 * Dane do utworzenia nowej rezerwacji.
 */
export interface CreateReservationData {
  roomId: string;
  reservedBy: string;
  title?: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

/**
 * Dane do aktualizacji rezerwacji.
 */
export interface UpdateReservationData extends Partial<CreateReservationData> {}

/**
 * Filtry dla listy rezerwacji.
 */
export interface ReservationFilters {
  roomId?: string;
  from?: string;
  to?: string;
}

import { apiClient } from './client';
import type { 
  Reservation, 
  CreateReservationData, 
  UpdateReservationData,
  ReservationFilters 
} from '@/types';

/**
 * API client dla rezerwacji
 */
export const reservationsApi = {
  /**
   * Pobiera listę rezerwacji z opcjonalnymi filtrami
   */
  getAll: async (filters?: ReservationFilters): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    
    if (filters?.roomId) {
      params.append('roomId', filters.roomId);
    }
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';
    
    const response = await apiClient.get<Reservation[]>(url);
    return response.data;
  },

  /**
   * Pobiera pojedynczą rezerwację po ID
   */
  getById: async (id: string): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  /**
   * Tworzy nową rezerwację
   */
  create: async (data: CreateReservationData): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations', data);
    return response.data;
  },

  /**
   * Aktualizuje istniejącą rezerwację
   */
  update: async (id: string, data: UpdateReservationData): Promise<Reservation> => {
    const response = await apiClient.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  /**
   * Usuwa rezerwację
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reservations/${id}`);
  },

  /**
   * Pobiera rezerwacje dla konkretnej sali
   */
  getByRoom: async (roomId: string, from?: string, to?: string): Promise<Reservation[]> => {
    return reservationsApi.getAll({ roomId, from, to });
  },

  /**
   * Pobiera rezerwacje dla danego zakresu dat
   */
  getByDateRange: async (from: string, to: string, roomId?: string): Promise<Reservation[]> => {
    return reservationsApi.getAll({ roomId, from, to });
  },
};

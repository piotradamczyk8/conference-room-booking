import { apiClient } from './client';
import type { Room, CreateRoomData, UpdateRoomData } from '@/types';

/**
 * API dla sal konferencyjnych.
 */
export const roomsApi = {
  /**
   * Pobiera listę wszystkich sal.
   */
  async getAll(): Promise<Room[]> {
    const { data } = await apiClient.get<Room[]>('/rooms');
    return data;
  },

  /**
   * Pobiera szczegóły sali.
   */
  async getById(id: string): Promise<Room> {
    const { data } = await apiClient.get<Room>(`/rooms/${id}`);
    return data;
  },

  /**
   * Tworzy nową salę.
   */
  async create(roomData: CreateRoomData): Promise<Room> {
    const { data } = await apiClient.post<Room>('/rooms', roomData);
    return data;
  },

  /**
   * Aktualizuje salę.
   */
  async update(id: string, roomData: UpdateRoomData): Promise<Room> {
    const { data } = await apiClient.put<Room>(`/rooms/${id}`, roomData);
    return data;
  },

  /**
   * Usuwa salę.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/rooms/${id}`);
  },
};

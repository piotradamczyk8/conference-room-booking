'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api/rooms';
import { useToast } from '@/components/ui/Toast';
import type { CreateRoomData, UpdateRoomData } from '@/types';

const ROOMS_QUERY_KEY = ['rooms'];

/**
 * Hook do pobierania listy sal.
 */
export function useRooms() {
  return useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: roomsApi.getAll,
  });
}

/**
 * Hook do pobierania pojedynczej sali.
 */
export function useRoom(id: string) {
  return useQuery({
    queryKey: [...ROOMS_QUERY_KEY, id],
    queryFn: () => roomsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook do tworzenia nowej sali.
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateRoomData) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      addToast('success', 'Sala została utworzona');
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Błąd podczas tworzenia sali');
    },
  });
}

/**
 * Hook do aktualizacji sali.
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomData }) =>
      roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      addToast('success', 'Sala została zaktualizowana');
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Błąd podczas aktualizacji sali');
    },
  });
}

/**
 * Hook do usuwania sali.
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      addToast('success', 'Sala została usunięta');
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Błąd podczas usuwania sali');
    },
  });
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useRooms } from '@/hooks/useRooms';
import { useCreateReservation, useUpdateReservation } from '@/hooks/useReservations';
import type { Reservation } from '@/types';

// Funkcje pomocnicze do formatowania daty/czasu
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`);
}

// Schema walidacji
const reservationSchema = z.object({
  roomId: z.string().min(1, 'Wybierz salę'),
  reservedBy: z.string().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki'),
  title: z.string().optional(),
  startDate: z.string().min(1, 'Wybierz datę rozpoczęcia'),
  startTime: z.string().min(1, 'Wybierz godzinę rozpoczęcia'),
  endDate: z.string().min(1, 'Wybierz datę zakończenia'),
  endTime: z.string().min(1, 'Wybierz godzinę zakończenia'),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const start = combineDateAndTime(data.startDate, data.startTime);
    const end = combineDateAndTime(data.endDate, data.endTime);
    return end > start;
  },
  {
    message: 'Czas zakończenia musi być późniejszy niż rozpoczęcia',
    path: ['endTime'],
  }
);

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  mode: 'create' | 'edit';
  reservation?: Reservation;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  defaultRoomId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReservationForm({
  mode,
  reservation,
  defaultStartTime,
  defaultEndTime,
  defaultRoomId,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Domyślne wartości formularza
  const getDefaultDate = (date?: Date | string): string => {
    if (!date) return toDateString(new Date());
    const d = typeof date === 'string' ? new Date(date) : date;
    return toDateString(d);
  };

  const getDefaultTime = (date?: Date | string, fallback: string = '09:00'): string => {
    if (!date) return fallback;
    const d = typeof date === 'string' ? new Date(date) : date;
    return toTimeString(d);
  };

  const defaultValues: ReservationFormData = {
    roomId: reservation?.room.id || defaultRoomId || '',
    reservedBy: reservation?.reservedBy || '',
    title: reservation?.title || '',
    startDate: getDefaultDate(reservation?.startTime || defaultStartTime),
    startTime: getDefaultTime(reservation?.startTime || defaultStartTime, '09:00'),
    endDate: getDefaultDate(reservation?.endTime || defaultEndTime),
    endTime: getDefaultTime(reservation?.endTime || defaultEndTime, '10:00'),
    notes: reservation?.notes || '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });

  const onSubmit = async (data: ReservationFormData) => {
    const startDateTime = combineDateAndTime(data.startDate, data.startTime);
    const endDateTime = combineDateAndTime(data.endDate, data.endTime);

    const payload = {
      roomId: data.roomId,
      reservedBy: data.reservedBy,
      title: data.title || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: data.notes || undefined,
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (reservation) {
        await updateMutation.mutateAsync({
          id: reservation.id,
          data: payload,
        });
      }
      onSuccess();
    } catch {
      // Błąd obsługiwany przez hook (toast)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Sala */}
      <div>
        <label 
          htmlFor="roomId" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Sala konferencyjna *
        </label>
        <select
          id="roomId"
          {...register('roomId')}
          disabled={roomsLoading}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${errors.roomId ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          <option value="">Wybierz salę...</option>
          {rooms?.filter(room => room.isActive).map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} (piętro {room.floor}, max {room.capacity} os.)
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="mt-1 text-sm text-red-600">{errors.roomId.message}</p>
        )}
      </div>

      {/* Rezerwujący */}
      <Input
        label="Imię i nazwisko *"
        {...register('reservedBy')}
        error={errors.reservedBy?.message}
        placeholder="Jan Kowalski"
      />

      {/* Tytuł spotkania */}
      <Input
        label="Tytuł spotkania"
        {...register('title')}
        error={errors.title?.message}
        placeholder="np. Spotkanie projektowe"
      />

      {/* Data i godzina rozpoczęcia */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Rozpoczęcie *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
              Data
            </label>
            <input
              type="date"
              id="startDate"
              {...register('startDate')}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.startDate ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="startTime" className="block text-xs text-gray-500 mb-1">
              Godzina
            </label>
            <input
              type="time"
              id="startTime"
              {...register('startTime')}
              step="900"
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.startTime ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data i godzina zakończenia */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Zakończenie *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
              Data
            </label>
            <input
              type="date"
              id="endDate"
              {...register('endDate')}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.endDate ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="endTime" className="block text-xs text-gray-500 mb-1">
              Godzina
            </label>
            <input
              type="time"
              id="endTime"
              {...register('endTime')}
              step="900"
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.endTime ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notatki */}
      <Textarea
        label="Notatki"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Dodatkowe informacje o spotkaniu..."
        rows={3}
      />

      {/* Przyciski */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          {mode === 'create' ? 'Utwórz rezerwację' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  );
}

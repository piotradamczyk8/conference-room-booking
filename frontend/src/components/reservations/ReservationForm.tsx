'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useRooms } from '@/hooks/useRooms';
import { useCreateReservation, useUpdateReservation } from '@/hooks/useReservations';
import { toDateTimeLocalString } from '@/lib/utils/date';
import type { Reservation } from '@/types';

// Schema walidacji
const reservationSchema = z.object({
  roomId: z.string().min(1, 'Wybierz salę'),
  reservedBy: z.string().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki'),
  title: z.string().optional(),
  startTime: z.string().min(1, 'Wybierz datę i godzinę rozpoczęcia'),
  endTime: z.string().min(1, 'Wybierz datę i godzinę zakończenia'),
  notes: z.string().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'Godzina zakończenia musi być późniejsza niż rozpoczęcia',
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
  const defaultValues: ReservationFormData = {
    roomId: reservation?.room.id || defaultRoomId || '',
    reservedBy: reservation?.reservedBy || '',
    title: reservation?.title || '',
    startTime: reservation?.startTime 
      ? toDateTimeLocalString(new Date(reservation.startTime))
      : defaultStartTime 
        ? toDateTimeLocalString(defaultStartTime)
        : '',
    endTime: reservation?.endTime 
      ? toDateTimeLocalString(new Date(reservation.endTime))
      : defaultEndTime 
        ? toDateTimeLocalString(defaultEndTime)
        : '',
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
    const payload = {
      roomId: data.roomId,
      reservedBy: data.reservedBy,
      title: data.title || undefined,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
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
      <div>
        <label 
          htmlFor="startTime" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data i godzina rozpoczęcia *
        </label>
        <input
          type="datetime-local"
          id="startTime"
          {...register('startTime')}
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

      {/* Data i godzina zakończenia */}
      <div>
        <label 
          htmlFor="endTime" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data i godzina zakończenia *
        </label>
        <input
          type="datetime-local"
          id="endTime"
          {...register('endTime')}
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
          isLoading={isLoading}
        >
          {mode === 'create' ? 'Utwórz rezerwację' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  );
}

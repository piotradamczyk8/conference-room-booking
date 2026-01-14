'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateRoom, useUpdateRoom } from '@/hooks/useRooms';
import type { Room } from '@/types';

// Schema walidacji
const roomSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(100, 'Nazwa nie może przekraczać 100 znaków'),
  description: z.string().max(1000, 'Opis nie może przekraczać 1000 znaków').optional(),
  capacity: z.coerce.number().min(1, 'Pojemność musi być większa od 0'),
  floor: z.string().max(50, 'Piętro nie może przekraczać 50 znaków').optional(),
  amenities: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormProps {
  room?: Room;
}

/**
 * Formularz tworzenia/edycji sali konferencyjnej.
 */
export function RoomForm({ room }: RoomFormProps) {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const isEditing = !!room;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: room?.name || '',
      description: room?.description || '',
      capacity: room?.capacity || 10,
      floor: room?.floor || '',
      amenities: room?.amenities?.join(', ') || '',
    },
  });

  const onSubmit = async (data: RoomFormData) => {
    const amenitiesArray = data.amenities
      ? data.amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const roomData = {
      name: data.name,
      description: data.description || undefined,
      capacity: data.capacity,
      floor: data.floor || undefined,
      amenities: amenitiesArray,
    };

    if (isEditing) {
      await updateRoom.mutateAsync({ id: room.id, data: roomData });
    } else {
      await createRoom.mutateAsync(roomData);
    }

    router.push('/rooms');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Nazwa sali *"
          placeholder="np. Sala A"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Opis"
          placeholder="Opcjonalny opis sali..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Pojemność *"
            type="number"
            min={1}
            placeholder="10"
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <Input
            label="Piętro"
            placeholder="np. 2"
            error={errors.floor?.message}
            {...register('floor')}
          />
        </div>

        <Input
          label="Udogodnienia"
          placeholder="np. Projektor, Klimatyzacja, Whiteboard"
          error={errors.amenities?.message}
          {...register('amenities')}
        />
        <p className="text-sm text-gray-500 -mt-4">
          Rozdziel udogodnienia przecinkami
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={isSubmitting || createRoom.isPending || updateRoom.isPending}
          >
            {isEditing ? 'Zapisz zmiany' : 'Dodaj salę'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/rooms')}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </Card>
  );
}

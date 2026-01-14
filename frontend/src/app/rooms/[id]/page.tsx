'use client';

import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { RoomForm } from '@/components/rooms/RoomForm';
import { Card } from '@/components/ui/Card';
import { useRoom } from '@/hooks/useRooms';

/**
 * Strona edycji sali.
 */
export default function EditRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const { data: room, isLoading, error } = useRoom(roomId);

  if (isLoading) {
    return (
      <PageWrapper title="Edycja sali">
        <div className="max-w-2xl">
          <Card className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="h-24 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (error || !room) {
    return (
      <PageWrapper title="Błąd">
        <Card className="text-center py-12">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sala nie znaleziona</h3>
          <p className="text-gray-500 mt-1">Nie udało się znaleźć sali o podanym ID</p>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Edycja: ${room.name}`}>
      <div className="max-w-2xl">
        <RoomForm room={room} />
      </div>
    </PageWrapper>
  );
}

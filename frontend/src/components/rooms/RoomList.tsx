'use client';

import Link from 'next/link';
import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from './RoomCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Lista sal konferencyjnych z obsługą stanów loading i empty.
 */
export function RoomList() {
  const { data: rooms, isLoading, error } = useRooms();

  if (isLoading) {
    return <RoomListSkeleton />;
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <div className="text-red-600 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Błąd ładowania</h3>
        <p className="text-gray-500 mt-1">Nie udało się pobrać listy sal</p>
      </Card>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Brak sal konferencyjnych</h3>
        <p className="text-gray-500 mt-1">Dodaj pierwszą salę, aby rozpocząć</p>
        <Link href="/rooms/new" className="inline-block mt-4">
          <Button>Dodaj salę</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

function RoomListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

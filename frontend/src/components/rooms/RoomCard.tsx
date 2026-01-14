'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/Modal';
import { useDeleteRoom } from '@/hooks/useRooms';
import type { Room } from '@/types';

interface RoomCardProps {
  room: Room;
}

/**
 * Karta pojedynczej sali konferencyjnej.
 */
export function RoomCard({ room }: RoomCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteRoom = useDeleteRoom();

  const handleDelete = async () => {
    await deleteRoom.mutateAsync(room.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
              {!room.isActive && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Nieaktywna
                </span>
              )}
            </div>
            
            {room.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {room.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              {/* Pojemność */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{room.capacity} osób</span>
              </div>

              {/* Piętro */}
              {room.floor && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Piętro {room.floor}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {room.amenities.slice(0, 4).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{room.amenities.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link href={`/rooms/${room.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Edytuj
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Usuń
          </Button>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Usuń salę"
        message={`Czy na pewno chcesz usunąć salę "${room.name}"? Ta operacja jest nieodwracalna.`}
        confirmText="Usuń"
        loading={deleteRoom.isPending}
      />
    </>
  );
}

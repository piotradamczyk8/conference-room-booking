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
 * Karta pojedynczej sali konferencyjnej - styl WIP.pl
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
      <Card className="group overflow-hidden">
        {/* Header z gradient overlay - styl konferencji WIP */}
        <div className="relative h-24 bg-gradient-to-br from-primary-700 to-primary-500 -m-6 mb-4">
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {room.isActive ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-success shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
                Aktywna
              </span>
            ) : (
              <span className="badge badge-gray text-xs">
                Nieaktywna
              </span>
            )}
          </div>
          
          {/* Room icon */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
            {room.name}
          </h3>
          
          {room.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Info badges */}
          <div className="flex items-center gap-3 mt-4">
            {/* Pojemność */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-medium">{room.capacity} osób</span>
            </div>

            {/* Piętro */}
            {room.floor !== undefined && room.floor !== null && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">Piętro {room.floor}</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {room.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="badge badge-primary"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="badge badge-gray">
                  +{room.amenities.length - 3} więcej
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
          <Link href={`/rooms/${room.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edytuj
            </Button>
          </Link>
          <Link href={`/reservations?roomId=${room.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Zarezerwuj
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-gray-400 hover:text-danger hover:bg-danger/5"
            title="Usuń salę"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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

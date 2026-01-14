'use client';

import { Modal } from '@/components/ui/Modal';
import { ReservationForm } from './ReservationForm';
import type { Reservation } from '@/types';

interface ReservationModalProps {
  mode: 'create' | 'edit';
  reservation?: Reservation;
  startTime?: Date;
  endTime?: Date;
  defaultRoomId?: string;
  onClose: () => void;
}

export function ReservationModal({
  mode,
  reservation,
  startTime,
  endTime,
  defaultRoomId,
  onClose,
}: ReservationModalProps) {
  const title = mode === 'create' ? 'Nowa rezerwacja' : 'Edycja rezerwacji';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={title}
    >
      <ReservationForm
        mode={mode}
        reservation={reservation}
        defaultStartTime={startTime}
        defaultEndTime={endTime}
        defaultRoomId={defaultRoomId}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}

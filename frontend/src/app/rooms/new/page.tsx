import { PageWrapper } from '@/components/layout/PageWrapper';
import { RoomForm } from '@/components/rooms/RoomForm';

/**
 * Strona tworzenia nowej sali.
 */
export default function NewRoomPage() {
  return (
    <PageWrapper title="Dodaj salę">
      <div className="max-w-2xl">
        <RoomForm />
      </div>
    </PageWrapper>
  );
}

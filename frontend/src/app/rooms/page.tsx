import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { RoomList } from '@/components/rooms/RoomList';
import { Button } from '@/components/ui/Button';

/**
 * Strona listy sal konferencyjnych.
 */
export default function RoomsPage() {
  return (
    <PageWrapper
      title="Sale konferencyjne"
      action={
        <Link href="/rooms/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dodaj salę
          </Button>
        </Link>
      }
    >
      <RoomList />
    </PageWrapper>
  );
}

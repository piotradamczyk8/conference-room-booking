<?php

declare(strict_types=1);

namespace App\Tests\Integration\Repository;

use App\Entity\Reservation;
use App\Entity\Room;
use App\Repository\ReservationRepository;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Testy integracyjne dla ReservationRepository.
 * Wymagają działającej bazy danych (PostgreSQL lub SQLite dla testów).
 */
final class ReservationRepositoryTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private ReservationRepository $reservationRepository;
    private RoomRepository $roomRepository;
    private Room $room;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();

        $this->reservationRepository = $this->entityManager->getRepository(Reservation::class);
        $this->roomRepository = $this->entityManager->getRepository(Room::class);

        // Utworzenie sali testowej
        $this->room = new Room();
        $this->room->setName('Sala Testowa');
        $this->room->setCapacity(10);
        $this->entityManager->persist($this->room);
        $this->entityManager->flush();
    }

    protected function tearDown(): void
    {
        // Czyszczenie po testach
        $connection = $this->entityManager->getConnection();
        $connection->executeStatement('DELETE FROM reservations');
        $connection->executeStatement('DELETE FROM rooms');

        parent::tearDown();
    }

    public function testFindOverlappingReturnsConflictingReservations(): void
    {
        // Istniejąca rezerwacja: 10:00 - 11:00
        $existingReservation = $this->createReservation('10:00', '11:00');
        $this->entityManager->persist($existingReservation);
        $this->entityManager->flush();

        // Szukamy konfliktu dla 09:30 - 10:30 (nachodzi na początek)
        $overlapping = $this->reservationRepository->findOverlapping(
            $this->room,
            new \DateTimeImmutable('2026-01-15 09:30:00'),
            new \DateTimeImmutable('2026-01-15 10:30:00')
        );

        $this->assertCount(1, $overlapping);
        $this->assertSame($existingReservation->getId()->toString(), $overlapping[0]->getId()->toString());
    }

    public function testFindOverlappingReturnsEmptyWhenNoConflict(): void
    {
        // Istniejąca rezerwacja: 10:00 - 11:00
        $existingReservation = $this->createReservation('10:00', '11:00');
        $this->entityManager->persist($existingReservation);
        $this->entityManager->flush();

        // Szukamy konfliktu dla 12:00 - 13:00 (po istniejącej)
        $overlapping = $this->reservationRepository->findOverlapping(
            $this->room,
            new \DateTimeImmutable('2026-01-15 12:00:00'),
            new \DateTimeImmutable('2026-01-15 13:00:00')
        );

        $this->assertCount(0, $overlapping);
    }

    public function testFindOverlappingExcludesSpecifiedReservation(): void
    {
        // Istniejąca rezerwacja: 10:00 - 11:00
        $existingReservation = $this->createReservation('10:00', '11:00');
        $this->entityManager->persist($existingReservation);
        $this->entityManager->flush();

        // Szukamy konfliktu dla tego samego czasu, ale wykluczając tę rezerwację
        // (symulacja edycji istniejącej rezerwacji)
        $overlapping = $this->reservationRepository->findOverlapping(
            $this->room,
            new \DateTimeImmutable('2026-01-15 10:00:00'),
            new \DateTimeImmutable('2026-01-15 11:00:00'),
            $existingReservation->getId()->toString()
        );

        $this->assertCount(0, $overlapping);
    }

    public function testFindOverlappingWithMultipleReservations(): void
    {
        // Pierwsza rezerwacja: 09:00 - 10:00
        $reservation1 = $this->createReservation('09:00', '10:00');
        $this->entityManager->persist($reservation1);

        // Druga rezerwacja: 10:30 - 11:30
        $reservation2 = $this->createReservation('10:30', '11:30');
        $this->entityManager->persist($reservation2);

        // Trzecia rezerwacja: 14:00 - 15:00
        $reservation3 = $this->createReservation('14:00', '15:00');
        $this->entityManager->persist($reservation3);

        $this->entityManager->flush();

        // Szukamy konfliktu dla 09:30 - 11:00 (nachodzi na obie pierwsze)
        $overlapping = $this->reservationRepository->findOverlapping(
            $this->room,
            new \DateTimeImmutable('2026-01-15 09:30:00'),
            new \DateTimeImmutable('2026-01-15 11:00:00')
        );

        $this->assertCount(2, $overlapping);
    }

    public function testFindByDateRange(): void
    {
        // Rezerwacja w styczniu
        $reservation1 = $this->createReservation('10:00', '11:00', '2026-01-15');
        $this->entityManager->persist($reservation1);

        // Rezerwacja w lutym
        $reservation2 = $this->createReservation('10:00', '11:00', '2026-02-15');
        $this->entityManager->persist($reservation2);

        $this->entityManager->flush();

        // Szukamy rezerwacji tylko ze stycznia
        $reservations = $this->reservationRepository->findByDateRange(
            new \DateTimeImmutable('2026-01-01 00:00:00'),
            new \DateTimeImmutable('2026-01-31 23:59:59')
        );

        $this->assertCount(1, $reservations);
    }

    private function createReservation(string $startTime, string $endTime, string $date = '2026-01-15'): Reservation
    {
        $reservation = new Reservation();
        $reservation->setRoom($this->room);
        $reservation->setReservedBy('Test User');
        $reservation->setTitle('Test Reservation');
        $reservation->setStartTime(new \DateTimeImmutable("{$date} {$startTime}:00"));
        $reservation->setEndTime(new \DateTimeImmutable("{$date} {$endTime}:00"));

        return $reservation;
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Reservation;
use App\Entity\Room;
use PHPUnit\Framework\TestCase;

/**
 * Testy jednostkowe dla encji Reservation.
 */
final class ReservationTest extends TestCase
{
    private Room $room;

    protected function setUp(): void
    {
        $this->room = new Room();
        $this->room->setName('Sala A');
        $this->room->setCapacity(10);
    }

    public function testOverlapsWithTimeRangeReturnsTrueForOverlapping(): void
    {
        $reservation = $this->createReservation('10:00', '11:00');

        // Zakres nachodzący na początek
        $this->assertTrue($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 09:30:00'),
            new \DateTimeImmutable('2026-01-15 10:30:00')
        ));

        // Zakres nachodzący na koniec
        $this->assertTrue($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 10:30:00'),
            new \DateTimeImmutable('2026-01-15 11:30:00')
        ));

        // Zakres wewnątrz rezerwacji
        $this->assertTrue($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 10:15:00'),
            new \DateTimeImmutable('2026-01-15 10:45:00')
        ));

        // Zakres obejmujący całą rezerwację
        $this->assertTrue($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 09:00:00'),
            new \DateTimeImmutable('2026-01-15 12:00:00')
        ));
    }

    public function testOverlapsWithTimeRangeReturnsFalseForNonOverlapping(): void
    {
        $reservation = $this->createReservation('10:00', '11:00');

        // Zakres przed rezerwacją
        $this->assertFalse($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 08:00:00'),
            new \DateTimeImmutable('2026-01-15 09:00:00')
        ));

        // Zakres po rezerwacji
        $this->assertFalse($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 12:00:00'),
            new \DateTimeImmutable('2026-01-15 13:00:00')
        ));
    }

    public function testOverlapsWithTimeRangeEdgeCases(): void
    {
        $reservation = $this->createReservation('10:00', '11:00');

        // Zakres kończący się dokładnie gdy rezerwacja się zaczyna
        // Nie powinno być konfliktu (back-to-back meetings)
        $this->assertFalse($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 09:00:00'),
            new \DateTimeImmutable('2026-01-15 10:00:00')
        ));

        // Zakres zaczynający się dokładnie gdy rezerwacja się kończy
        $this->assertFalse($reservation->overlapsWithTimeRange(
            new \DateTimeImmutable('2026-01-15 11:00:00'),
            new \DateTimeImmutable('2026-01-15 12:00:00')
        ));
    }

    public function testGetDurationInMinutes(): void
    {
        // 1 godzina = 60 minut
        $reservation = $this->createReservation('10:00', '11:00');
        $this->assertSame(60, $reservation->getDurationInMinutes());

        // 30 minut
        $shortReservation = $this->createReservation('10:00', '10:30');
        $this->assertSame(30, $shortReservation->getDurationInMinutes());

        // 2 godziny = 120 minut
        $longReservation = $this->createReservation('10:00', '12:00');
        $this->assertSame(120, $longReservation->getDurationInMinutes());
    }

    private function createReservation(string $startTime, string $endTime): Reservation
    {
        $reservation = new Reservation();
        $reservation->setRoom($this->room);
        $reservation->setReservedBy('Test User');
        $reservation->setStartTime(new \DateTimeImmutable("2026-01-15 {$startTime}:00"));
        $reservation->setEndTime(new \DateTimeImmutable("2026-01-15 {$endTime}:00"));

        return $reservation;
    }
}

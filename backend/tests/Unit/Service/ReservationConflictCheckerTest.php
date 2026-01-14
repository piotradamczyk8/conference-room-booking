<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Reservation;
use App\Entity\Room;
use App\Exception\ReservationConflictException;
use App\Repository\ReservationRepositoryInterface;
use App\Service\ReservationConflictChecker;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Testy jednostkowe dla ReservationConflictChecker.
 */
final class ReservationConflictCheckerTest extends TestCase
{
    private ReservationRepositoryInterface&MockObject $reservationRepository;
    private ReservationConflictChecker $checker;
    private Room $room;

    protected function setUp(): void
    {
        $this->reservationRepository = $this->createMock(ReservationRepositoryInterface::class);
        $this->checker = new ReservationConflictChecker($this->reservationRepository);
        
        $this->room = new Room();
        $this->room->setName('Sala A');
        $this->room->setCapacity(10);
    }

    public function testNoConflictWhenNoOverlappingReservations(): void
    {
        $startTime = new \DateTimeImmutable('2026-01-15 10:00:00');
        $endTime = new \DateTimeImmutable('2026-01-15 11:00:00');

        $this->reservationRepository
            ->expects($this->once())
            ->method('findOverlapping')
            ->with($this->room, $startTime, $endTime, null)
            ->willReturn([]);

        // Nie powinien rzucić wyjątku
        $this->checker->ensureNoConflict($this->room, $startTime, $endTime);
        
        $this->assertTrue(true); // Test przeszedł jeśli nie rzucono wyjątku
    }

    public function testThrowsExceptionWhenConflictExists(): void
    {
        $startTime = new \DateTimeImmutable('2026-01-15 10:00:00');
        $endTime = new \DateTimeImmutable('2026-01-15 11:00:00');

        $existingReservation = new Reservation();
        $existingReservation->setRoom($this->room);
        $existingReservation->setReservedBy('Jan Kowalski');
        $existingReservation->setStartTime(new \DateTimeImmutable('2026-01-15 09:30:00'));
        $existingReservation->setEndTime(new \DateTimeImmutable('2026-01-15 10:30:00'));

        $this->reservationRepository
            ->expects($this->once())
            ->method('findOverlapping')
            ->willReturn([$existingReservation]);

        $this->expectException(ReservationConflictException::class);
        $this->expectExceptionMessage('Sala "Sala A" jest już zarezerwowana');

        $this->checker->ensureNoConflict($this->room, $startTime, $endTime);
    }

    public function testHasConflictReturnsFalseWhenNoOverlapping(): void
    {
        $startTime = new \DateTimeImmutable('2026-01-15 10:00:00');
        $endTime = new \DateTimeImmutable('2026-01-15 11:00:00');

        $this->reservationRepository
            ->method('findOverlapping')
            ->willReturn([]);

        $result = $this->checker->hasConflict($this->room, $startTime, $endTime);

        $this->assertFalse($result);
    }

    public function testHasConflictReturnsTrueWhenOverlapping(): void
    {
        $startTime = new \DateTimeImmutable('2026-01-15 10:00:00');
        $endTime = new \DateTimeImmutable('2026-01-15 11:00:00');

        $existingReservation = new Reservation();
        $existingReservation->setRoom($this->room);
        $existingReservation->setReservedBy('Jan Kowalski');
        $existingReservation->setStartTime($startTime);
        $existingReservation->setEndTime($endTime);

        $this->reservationRepository
            ->method('findOverlapping')
            ->willReturn([$existingReservation]);

        $result = $this->checker->hasConflict($this->room, $startTime, $endTime);

        $this->assertTrue($result);
    }

    /**
     * @dataProvider overlappingScenarios
     */
    public function testDetectsVariousOverlappingScenarios(
        string $existingStart,
        string $existingEnd,
        string $newStart,
        string $newEnd,
        bool $shouldConflict
    ): void {
        $existingReservation = new Reservation();
        $existingReservation->setRoom($this->room);
        $existingReservation->setReservedBy('Jan Kowalski');
        $existingReservation->setStartTime(new \DateTimeImmutable($existingStart));
        $existingReservation->setEndTime(new \DateTimeImmutable($existingEnd));

        $this->reservationRepository
            ->method('findOverlapping')
            ->willReturn($shouldConflict ? [$existingReservation] : []);

        $result = $this->checker->hasConflict(
            $this->room,
            new \DateTimeImmutable($newStart),
            new \DateTimeImmutable($newEnd)
        );

        $this->assertSame($shouldConflict, $result);
    }

    /**
     * @return array<string, array{string, string, string, string, bool}>
     */
    public static function overlappingScenarios(): array
    {
        return [
            'nowa rezerwacja całkowicie przed istniejącą' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00', // istniejąca
                '2026-01-15 08:00:00', '2026-01-15 09:00:00', // nowa
                false,
            ],
            'nowa rezerwacja całkowicie po istniejącej' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 12:00:00', '2026-01-15 13:00:00',
                false,
            ],
            'nowa rezerwacja nachodzi na początek istniejącej' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 09:30:00', '2026-01-15 10:30:00',
                true,
            ],
            'nowa rezerwacja nachodzi na koniec istniejącej' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 10:30:00', '2026-01-15 11:30:00',
                true,
            ],
            'nowa rezerwacja wewnątrz istniejącej' => [
                '2026-01-15 10:00:00', '2026-01-15 12:00:00',
                '2026-01-15 10:30:00', '2026-01-15 11:30:00',
                true,
            ],
            'nowa rezerwacja obejmuje całą istniejącą' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 09:00:00', '2026-01-15 12:00:00',
                true,
            ],
            'dokładnie ten sam czas' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                true,
            ],
            'nowa kończy się dokładnie gdy istniejąca się zaczyna' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 09:00:00', '2026-01-15 10:00:00',
                false,
            ],
            'nowa zaczyna się dokładnie gdy istniejąca się kończy' => [
                '2026-01-15 10:00:00', '2026-01-15 11:00:00',
                '2026-01-15 11:00:00', '2026-01-15 12:00:00',
                false,
            ],
        ];
    }
}

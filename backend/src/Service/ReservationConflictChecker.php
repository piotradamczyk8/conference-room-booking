<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Room;
use App\Exception\ReservationConflictException;
use App\Repository\ReservationRepositoryInterface;

/**
 * Serwis odpowiedzialny za sprawdzanie konfliktów rezerwacji.
 * Zgodny z Single Responsibility Principle.
 */
final readonly class ReservationConflictChecker implements ReservationConflictCheckerInterface
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
    ) {}

    /**
     * Sprawdza czy istnieje konflikt i rzuca wyjątek jeśli tak.
     *
     * @throws ReservationConflictException
     */
    public function ensureNoConflict(
        Room $room,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime,
        ?string $excludeReservationId = null
    ): void {
        $overlapping = $this->reservationRepository->findOverlapping(
            $room,
            $startTime,
            $endTime,
            $excludeReservationId
        );

        if (count($overlapping) > 0) {
            throw ReservationConflictException::forTimeRange(
                $room->getName(),
                $startTime,
                $endTime,
                $overlapping[0]->getReservedBy()
            );
        }
    }

    /**
     * Sprawdza czy istnieje konflikt bez rzucania wyjątku.
     */
    public function hasConflict(
        Room $room,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime,
        ?string $excludeReservationId = null
    ): bool {
        $overlapping = $this->reservationRepository->findOverlapping(
            $room,
            $startTime,
            $endTime,
            $excludeReservationId
        );

        return count($overlapping) > 0;
    }
}

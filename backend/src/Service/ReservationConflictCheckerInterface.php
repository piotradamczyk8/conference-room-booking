<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Room;
use App\Exception\ReservationConflictException;

/**
 * Interfejs dla serwisu sprawdzającego konflikty rezerwacji.
 */
interface ReservationConflictCheckerInterface
{
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
    ): void;

    /**
     * Sprawdza czy istnieje konflikt (zwraca bool).
     */
    public function hasConflict(
        Room $room,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime,
        ?string $excludeReservationId = null
    ): bool;
}

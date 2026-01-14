<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Wyjątek rzucany gdy rezerwacja koliduje z istniejącą rezerwacją.
 */
final class ReservationConflictException extends \DomainException
{
    public static function forTimeRange(
        string $roomName,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime,
        string $existingReservedBy
    ): self {
        return new self(
            sprintf(
                'Sala "%s" jest już zarezerwowana w terminie %s - %s przez %s.',
                $roomName,
                $startTime->format('Y-m-d H:i'),
                $endTime->format('Y-m-d H:i'),
                $existingReservedBy
            )
        );
    }

    public static function forRoom(string $roomName): self
    {
        return new self(
            sprintf('Sala "%s" jest już zarezerwowana w wybranym terminie.', $roomName)
        );
    }
}

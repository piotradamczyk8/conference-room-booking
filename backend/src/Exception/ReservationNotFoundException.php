<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Wyjątek rzucany gdy rezerwacja nie została znaleziona.
 */
final class ReservationNotFoundException extends \RuntimeException
{
    public static function forId(string $id): self
    {
        return new self(
            sprintf('Rezerwacja o ID "%s" nie została znaleziona.', $id)
        );
    }
}

<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Wyjątek rzucany gdy sala konferencyjna nie została znaleziona.
 */
final class RoomNotFoundException extends \RuntimeException
{
    public static function forId(string $id): self
    {
        return new self(
            sprintf('Sala o ID "%s" nie została znaleziona.', $id)
        );
    }
}

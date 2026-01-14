<?php

declare(strict_types=1);

namespace App\Message;

/**
 * Wiadomość wysyłana do kolejki po utworzeniu rezerwacji.
 * Używana do asynchronicznych powiadomień (email, Slack, etc.).
 */
final readonly class ReservationCreatedMessage
{
    public function __construct(
        public string $reservationId,
        public string $roomName,
        public string $reservedBy,
        public string $startTime,
        public string $endTime,
    ) {}
}

<?php

declare(strict_types=1);

namespace App\DTO\Response;

use App\Entity\Reservation;

/**
 * DTO odpowiedzi dla rezerwacji.
 */
final readonly class ReservationResponse
{
    public function __construct(
        public string $id,
        public RoomSummary $room,
        public string $reservedBy,
        public ?string $title,
        public string $startTime,
        public string $endTime,
        public ?string $notes,
        public string $createdAt,
    ) {}

    /**
     * Tworzy DTO z encji Reservation.
     */
    public static function fromEntity(Reservation $reservation): self
    {
        // Konwertuj daty na UTC dla spójności z frontendem
        $utc = new \DateTimeZone('UTC');
        
        return new self(
            id: (string) $reservation->getId(),
            room: RoomSummary::fromEntity($reservation->getRoom()),
            reservedBy: $reservation->getReservedBy(),
            title: $reservation->getTitle(),
            startTime: $reservation->getStartTime()->setTimezone($utc)->format('Y-m-d\TH:i:s\Z'),
            endTime: $reservation->getEndTime()->setTimezone($utc)->format('Y-m-d\TH:i:s\Z'),
            notes: $reservation->getNotes(),
            createdAt: $reservation->getCreatedAt()->setTimezone($utc)->format('Y-m-d\TH:i:s\Z'),
        );
    }
}

/**
 * Skrócone informacje o sali (dla zagnieżdżania w odpowiedziach).
 */
final readonly class RoomSummary
{
    public function __construct(
        public string $id,
        public string $name,
    ) {}

    public static function fromEntity(\App\Entity\Room $room): self
    {
        return new self(
            id: (string) $room->getId(),
            name: $room->getName(),
        );
    }
}

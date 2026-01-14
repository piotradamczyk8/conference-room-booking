<?php

declare(strict_types=1);

namespace App\DTO\Response;

use App\Entity\Room;

/**
 * DTO odpowiedzi dla sali konferencyjnej.
 */
final readonly class RoomResponse
{
    /**
     * @param array<string> $amenities
     */
    public function __construct(
        public string $id,
        public string $name,
        public ?string $description,
        public int $capacity,
        public ?string $floor,
        public array $amenities,
        public bool $isActive,
        public string $createdAt,
        public string $updatedAt,
    ) {}

    /**
     * Tworzy DTO z encji Room.
     */
    public static function fromEntity(Room $room): self
    {
        return new self(
            id: (string) $room->getId(),
            name: $room->getName(),
            description: $room->getDescription(),
            capacity: $room->getCapacity(),
            floor: $room->getFloor(),
            amenities: $room->getAmenities(),
            isActive: $room->isActive(),
            createdAt: $room->getCreatedAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $room->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        );
    }
}

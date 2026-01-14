<?php

declare(strict_types=1);

namespace App\DTO\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO dla żądania aktualizacji sali konferencyjnej.
 */
final readonly class UpdateRoomRequest
{
    /**
     * @param array<string>|null $amenities
     */
    public function __construct(
        #[Assert\Length(max: 100, maxMessage: 'Nazwa nie może przekraczać {{ limit }} znaków')]
        public ?string $name = null,

        #[Assert\Positive(message: 'Pojemność musi być liczbą dodatnią')]
        public ?int $capacity = null,

        #[Assert\Length(max: 1000, maxMessage: 'Opis nie może przekraczać {{ limit }} znaków')]
        public ?string $description = null,

        #[Assert\Length(max: 50, maxMessage: 'Piętro nie może przekraczać {{ limit }} znaków')]
        public ?string $floor = null,

        public ?array $amenities = null,

        public ?bool $isActive = null,
    ) {}
}

<?php

declare(strict_types=1);

namespace App\DTO\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO dla żądania utworzenia sali konferencyjnej.
 */
final readonly class CreateRoomRequest
{
    /**
     * @param array<string> $amenities
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Nazwa sali jest wymagana')]
        #[Assert\Length(max: 100, maxMessage: 'Nazwa nie może przekraczać {{ limit }} znaków')]
        public string $name,

        #[Assert\Positive(message: 'Pojemność musi być liczbą dodatnią')]
        public int $capacity,

        #[Assert\Length(max: 1000, maxMessage: 'Opis nie może przekraczać {{ limit }} znaków')]
        public ?string $description = null,

        #[Assert\Length(max: 50, maxMessage: 'Piętro nie może przekraczać {{ limit }} znaków')]
        public ?string $floor = null,

        public array $amenities = [],
    ) {}
}

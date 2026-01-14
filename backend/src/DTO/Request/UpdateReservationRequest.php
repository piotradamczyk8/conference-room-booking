<?php

declare(strict_types=1);

namespace App\DTO\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO dla żądania aktualizacji rezerwacji.
 */
final readonly class UpdateReservationRequest
{
    public function __construct(
        #[Assert\Length(max: 100, maxMessage: 'Imię i nazwisko nie może przekraczać {{ limit }} znaków')]
        public ?string $reservedBy = null,

        public ?string $startTime = null,

        public ?string $endTime = null,

        #[Assert\Length(max: 200, maxMessage: 'Tytuł nie może przekraczać {{ limit }} znaków')]
        public ?string $title = null,

        #[Assert\Length(max: 2000, maxMessage: 'Notatki nie mogą przekraczać {{ limit }} znaków')]
        public ?string $notes = null,
    ) {}
}

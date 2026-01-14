<?php

declare(strict_types=1);

namespace App\DTO\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO dla żądania utworzenia rezerwacji.
 */
final readonly class CreateReservationRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'ID sali jest wymagane')]
        #[Assert\Uuid(message: 'Nieprawidłowy format ID sali')]
        public string $roomId,

        #[Assert\NotBlank(message: 'Imię i nazwisko rezerwującego jest wymagane')]
        #[Assert\Length(max: 100, maxMessage: 'Imię i nazwisko nie może przekraczać {{ limit }} znaków')]
        public string $reservedBy,

        #[Assert\NotBlank(message: 'Czas rozpoczęcia jest wymagany')]
        public string $startTime,

        #[Assert\NotBlank(message: 'Czas zakończenia jest wymagany')]
        public string $endTime,

        #[Assert\Length(max: 200, maxMessage: 'Tytuł nie może przekraczać {{ limit }} znaków')]
        public ?string $title = null,

        #[Assert\Length(max: 2000, maxMessage: 'Notatki nie mogą przekraczać {{ limit }} znaków')]
        public ?string $notes = null,
    ) {}
}

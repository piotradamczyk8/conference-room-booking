<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Encja reprezentująca rezerwację sali konferencyjnej.
 */
#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\Table(name: 'reservations')]
#[ORM\Index(name: 'idx_reservation_time_range', columns: ['room_id', 'start_time', 'end_time'])]
#[ORM\Index(name: 'idx_reservation_start_time', columns: ['start_time'])]
class Reservation
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: Room::class, inversedBy: 'reservations')]
    #[ORM\JoinColumn(name: 'room_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Sala jest wymagana')]
    private Room $room;

    #[ORM\Column(type: Types::STRING, length: 100)]
    #[Assert\NotBlank(message: 'Imię i nazwisko rezerwującego jest wymagane')]
    #[Assert\Length(max: 100, maxMessage: 'Imię i nazwisko nie może przekraczać {{ limit }} znaków')]
    private string $reservedBy;

    #[ORM\Column(type: Types::STRING, length: 200, nullable: true)]
    #[Assert\Length(max: 200, maxMessage: 'Tytuł nie może przekraczać {{ limit }} znaków')]
    private ?string $title = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Assert\NotNull(message: 'Czas rozpoczęcia jest wymagany')]
    private \DateTimeImmutable $startTime;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Assert\NotNull(message: 'Czas zakończenia jest wymagany')]
    #[Assert\GreaterThan(propertyPath: 'startTime', message: 'Czas zakończenia musi być późniejszy niż czas rozpoczęcia')]
    private \DateTimeImmutable $endTime;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getRoom(): Room
    {
        return $this->room;
    }

    public function setRoom(Room $room): self
    {
        $this->room = $room;
        return $this;
    }

    public function getReservedBy(): string
    {
        return $this->reservedBy;
    }

    public function setReservedBy(string $reservedBy): self
    {
        $this->reservedBy = $reservedBy;
        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getStartTime(): \DateTimeImmutable
    {
        return $this->startTime;
    }

    public function setStartTime(\DateTimeImmutable $startTime): self
    {
        $this->startTime = $startTime;
        return $this;
    }

    public function getEndTime(): \DateTimeImmutable
    {
        return $this->endTime;
    }

    public function setEndTime(\DateTimeImmutable $endTime): self
    {
        $this->endTime = $endTime;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * Sprawdza czy rezerwacja nakłada się z podanym zakresem czasowym.
     * Dwa zakresy nakładają się gdy: start1 < end2 AND end1 > start2
     */
    public function overlapsWithTimeRange(\DateTimeImmutable $start, \DateTimeImmutable $end): bool
    {
        return $this->startTime < $end && $this->endTime > $start;
    }

    /**
     * Zwraca czas trwania rezerwacji w minutach.
     */
    public function getDurationInMinutes(): int
    {
        return (int) (($this->endTime->getTimestamp() - $this->startTime->getTimestamp()) / 60);
    }
}

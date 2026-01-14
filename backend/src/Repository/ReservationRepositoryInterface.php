<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\Room;

/**
 * Interfejs repozytorium rezerwacji.
 * Abstrakcja nad warstwą persystencji zgodna z Repository Pattern.
 */
interface ReservationRepositoryInterface
{
    /**
     * Zapisuje rezerwację do bazy danych.
     */
    public function save(Reservation $reservation): void;

    /**
     * Usuwa rezerwację z bazy danych.
     */
    public function remove(Reservation $reservation): void;

    /**
     * Znajduje rezerwację po ID.
     */
    public function findById(string $id): ?Reservation;

    /**
     * Zwraca wszystkie rezerwacje dla danej sali.
     *
     * @return Reservation[]
     */
    public function findByRoom(Room $room): array;

    /**
     * Zwraca rezerwacje w podanym zakresie dat.
     *
     * @return Reservation[]
     */
    public function findByDateRange(\DateTimeImmutable $start, \DateTimeImmutable $end): array;

    /**
     * Znajduje rezerwacje nakładające się z podanym zakresem czasowym.
     * Kluczowa metoda do wykrywania konfliktów rezerwacji.
     *
     * @param Room $room Sala do sprawdzenia
     * @param \DateTimeImmutable $start Początek zakresu
     * @param \DateTimeImmutable $end Koniec zakresu
     * @param string|null $excludeId ID rezerwacji do wykluczenia (przy edycji)
     * @return Reservation[]
     */
    public function findOverlapping(
        Room $room,
        \DateTimeImmutable $start,
        \DateTimeImmutable $end,
        ?string $excludeId = null
    ): array;
}

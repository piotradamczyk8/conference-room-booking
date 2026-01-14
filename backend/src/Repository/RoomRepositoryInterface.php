<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Room;

/**
 * Interfejs repozytorium sal konferencyjnych.
 * Abstrakcja nad warstwą persystencji zgodna z Repository Pattern.
 */
interface RoomRepositoryInterface
{
    /**
     * Zapisuje salę do bazy danych.
     */
    public function save(Room $room): void;

    /**
     * Usuwa salę z bazy danych.
     */
    public function remove(Room $room): void;

    /**
     * Znajduje salę po ID.
     */
    public function findById(string $id): ?Room;

    /**
     * Zwraca wszystkie sale.
     *
     * @return Room[]
     */
    public function findAll(): array;

    /**
     * Zwraca tylko aktywne sale.
     *
     * @return Room[]
     */
    public function findActive(): array;
}

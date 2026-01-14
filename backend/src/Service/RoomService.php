<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\Request\CreateRoomRequest;
use App\DTO\Request\UpdateRoomRequest;
use App\Entity\Room;
use App\Exception\RoomNotFoundException;
use App\Repository\RoomRepositoryInterface;

/**
 * Serwis do zarządzania salami konferencyjnymi.
 */
final readonly class RoomService
{
    public function __construct(
        private RoomRepositoryInterface $roomRepository,
    ) {}

    /**
     * Tworzy nową salę konferencyjną.
     */
    public function createRoom(CreateRoomRequest $request): Room
    {
        $room = new Room();
        $room->setName($request->name);
        $room->setCapacity($request->capacity);
        $room->setDescription($request->description);
        $room->setFloor($request->floor);
        $room->setAmenities($request->amenities);

        $this->roomRepository->save($room);

        return $room;
    }

    /**
     * Aktualizuje istniejącą salę.
     *
     * @throws RoomNotFoundException
     */
    public function updateRoom(string $id, UpdateRoomRequest $request): Room
    {
        $room = $this->getRoom($id);

        if ($request->name !== null) {
            $room->setName($request->name);
        }
        if ($request->capacity !== null) {
            $room->setCapacity($request->capacity);
        }
        if ($request->description !== null) {
            $room->setDescription($request->description);
        }
        if ($request->floor !== null) {
            $room->setFloor($request->floor);
        }
        if ($request->amenities !== null) {
            $room->setAmenities($request->amenities);
        }
        if ($request->isActive !== null) {
            $room->setIsActive($request->isActive);
        }

        $this->roomRepository->save($room);

        return $room;
    }

    /**
     * Usuwa salę konferencyjną.
     *
     * @throws RoomNotFoundException
     */
    public function deleteRoom(string $id): void
    {
        $room = $this->getRoom($id);
        $this->roomRepository->remove($room);
    }

    /**
     * Pobiera salę po ID.
     *
     * @throws RoomNotFoundException
     */
    public function getRoom(string $id): Room
    {
        $room = $this->roomRepository->findById($id);

        if ($room === null) {
            throw RoomNotFoundException::forId($id);
        }

        return $room;
    }

    /**
     * Pobiera wszystkie sale.
     *
     * @return Room[]
     */
    public function getAllRooms(): array
    {
        return $this->roomRepository->findAll();
    }

    /**
     * Pobiera tylko aktywne sale.
     *
     * @return Room[]
     */
    public function getActiveRooms(): array
    {
        return $this->roomRepository->findActive();
    }
}

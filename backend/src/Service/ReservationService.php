<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\Request\CreateReservationRequest;
use App\DTO\Request\UpdateReservationRequest;
use App\Entity\Reservation;
use App\Exception\ReservationNotFoundException;
use App\Exception\ValidationException;
use App\Message\ReservationCreatedMessage;
use App\Repository\ReservationRepositoryInterface;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Serwis do zarządzania rezerwacjami sal konferencyjnych.
 */
final readonly class ReservationService
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private RoomService $roomService,
        private ReservationConflictChecker $conflictChecker,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * Tworzy nową rezerwację.
     *
     * @throws ValidationException
     * @throws \App\Exception\RoomNotFoundException
     * @throws \App\Exception\ReservationConflictException
     */
    public function createReservation(CreateReservationRequest $request): Reservation
    {
        $room = $this->roomService->getRoom($request->roomId);

        $startTime = new \DateTimeImmutable($request->startTime);
        $endTime = new \DateTimeImmutable($request->endTime);

        // Walidacja zakresu czasowego
        if ($endTime <= $startTime) {
            throw ValidationException::forInvalidTimeRange();
        }

        // Sprawdzenie konfliktów
        $this->conflictChecker->ensureNoConflict($room, $startTime, $endTime);

        // Tworzenie rezerwacji
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy($request->reservedBy);
        $reservation->setTitle($request->title);
        $reservation->setStartTime($startTime);
        $reservation->setEndTime($endTime);
        $reservation->setNotes($request->notes);

        $this->reservationRepository->save($reservation);

        // Wysłanie wiadomości do kolejki
        $this->messageBus->dispatch(new ReservationCreatedMessage(
            reservationId: (string) $reservation->getId(),
            roomName: $room->getName(),
            reservedBy: $reservation->getReservedBy(),
            startTime: $startTime->format(\DateTimeInterface::ATOM),
            endTime: $endTime->format(\DateTimeInterface::ATOM),
        ));

        return $reservation;
    }

    /**
     * Aktualizuje istniejącą rezerwację.
     *
     * @throws ReservationNotFoundException
     * @throws ValidationException
     * @throws \App\Exception\ReservationConflictException
     */
    public function updateReservation(string $id, UpdateReservationRequest $request): Reservation
    {
        $reservation = $this->getReservation($id);

        // Aktualizacja pól
        if ($request->reservedBy !== null) {
            $reservation->setReservedBy($request->reservedBy);
        }
        if ($request->title !== null) {
            $reservation->setTitle($request->title);
        }
        if ($request->notes !== null) {
            $reservation->setNotes($request->notes);
        }

        // Aktualizacja czasów z walidacją
        $startTime = $request->startTime !== null
            ? new \DateTimeImmutable($request->startTime)
            : $reservation->getStartTime();

        $endTime = $request->endTime !== null
            ? new \DateTimeImmutable($request->endTime)
            : $reservation->getEndTime();

        if ($endTime <= $startTime) {
            throw ValidationException::forInvalidTimeRange();
        }

        // Sprawdzenie konfliktów tylko jeśli zmieniono czasy
        if ($request->startTime !== null || $request->endTime !== null) {
            $this->conflictChecker->ensureNoConflict(
                $reservation->getRoom(),
                $startTime,
                $endTime,
                $id
            );

            $reservation->setStartTime($startTime);
            $reservation->setEndTime($endTime);
        }

        $this->reservationRepository->save($reservation);

        return $reservation;
    }

    /**
     * Usuwa rezerwację.
     *
     * @throws ReservationNotFoundException
     */
    public function deleteReservation(string $id): void
    {
        $reservation = $this->getReservation($id);
        $this->reservationRepository->remove($reservation);
    }

    /**
     * Pobiera rezerwację po ID.
     *
     * @throws ReservationNotFoundException
     */
    public function getReservation(string $id): Reservation
    {
        $reservation = $this->reservationRepository->findById($id);

        if ($reservation === null) {
            throw ReservationNotFoundException::forId($id);
        }

        return $reservation;
    }

    /**
     * Pobiera rezerwacje dla danej sali.
     *
     * @return Reservation[]
     * @throws \App\Exception\RoomNotFoundException
     */
    public function getReservationsByRoom(string $roomId): array
    {
        $room = $this->roomService->getRoom($roomId);
        return $this->reservationRepository->findByRoom($room);
    }

    /**
     * Pobiera rezerwacje w zakresie dat.
     *
     * @return Reservation[]
     */
    public function getReservationsByDateRange(\DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        return $this->reservationRepository->findByDateRange($start, $end);
    }
}

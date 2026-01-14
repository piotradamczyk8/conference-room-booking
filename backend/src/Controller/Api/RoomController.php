<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\DTO\Request\CreateRoomRequest;
use App\DTO\Request\UpdateRoomRequest;
use App\DTO\Response\RoomResponse;
use App\Service\RoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Kontroler REST API dla sal konferencyjnych.
 */
#[Route('/api/rooms')]
final class RoomController extends AbstractController
{
    public function __construct(
        private readonly RoomService $roomService,
    ) {}

    /**
     * Lista wszystkich sal.
     * GET /api/rooms
     */
    #[Route('', name: 'api_rooms_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $rooms = $this->roomService->getAllRooms();

        $response = array_map(
            fn ($room) => RoomResponse::fromEntity($room),
            $rooms
        );

        return $this->json($response);
    }

    /**
     * Szczegóły sali.
     * GET /api/rooms/{id}
     */
    #[Route('/{id}', name: 'api_rooms_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $room = $this->roomService->getRoom($id);

        return $this->json(RoomResponse::fromEntity($room));
    }

    /**
     * Tworzenie nowej sali.
     * POST /api/rooms
     */
    #[Route('', name: 'api_rooms_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreateRoomRequest $request
    ): JsonResponse {
        $room = $this->roomService->createRoom($request);

        return $this->json(
            RoomResponse::fromEntity($room),
            Response::HTTP_CREATED
        );
    }

    /**
     * Aktualizacja sali.
     * PUT /api/rooms/{id}
     */
    #[Route('/{id}', name: 'api_rooms_update', methods: ['PUT', 'PATCH'])]
    public function update(
        string $id,
        #[MapRequestPayload] UpdateRoomRequest $request
    ): JsonResponse {
        $room = $this->roomService->updateRoom($id, $request);

        return $this->json(RoomResponse::fromEntity($room));
    }

    /**
     * Usunięcie sali.
     * DELETE /api/rooms/{id}
     */
    #[Route('/{id}', name: 'api_rooms_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->roomService->deleteRoom($id);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Sprawdzenie dostępności sali w danym dniu.
     * GET /api/rooms/{id}/availability?date=YYYY-MM-DD
     *
     * Zwraca listę rezerwacji dla danego dnia.
     */
    #[Route('/{id}/availability', name: 'api_rooms_availability', methods: ['GET'])]
    public function availability(string $id, Request $request): JsonResponse
    {
        $room = $this->roomService->getRoom($id);

        $dateString = $request->query->get('date', date('Y-m-d'));
        $date = new \DateTimeImmutable($dateString);

        // Początek i koniec dnia
        $startOfDay = $date->setTime(0, 0, 0);
        $endOfDay = $date->setTime(23, 59, 59);

        // Pobieramy rezerwacje dla tego dnia i tej sali
        // Używamy ReservationRepository przez RoomService
        $reservations = $room->getReservations()->filter(
            fn ($reservation) => $reservation->overlapsWithTimeRange($startOfDay, $endOfDay)
        );

        // Sortowanie po czasie rozpoczęcia
        $reservationsArray = $reservations->toArray();
        usort($reservationsArray, fn ($a, $b) => $a->getStartTime() <=> $b->getStartTime());

        // Formatowanie odpowiedzi
        $slots = array_map(fn ($res) => [
            'id' => (string) $res->getId(),
            'title' => $res->getTitle(),
            'reservedBy' => $res->getReservedBy(),
            'startTime' => $res->getStartTime()->format(\DateTimeInterface::ATOM),
            'endTime' => $res->getEndTime()->format(\DateTimeInterface::ATOM),
        ], $reservationsArray);

        return $this->json([
            'date' => $date->format('Y-m-d'),
            'room' => [
                'id' => (string) $room->getId(),
                'name' => $room->getName(),
            ],
            'reservations' => $slots,
            'totalReservations' => count($slots),
        ]);
    }
}

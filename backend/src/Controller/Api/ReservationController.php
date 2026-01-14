<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\DTO\Request\CreateReservationRequest;
use App\DTO\Request\UpdateReservationRequest;
use App\DTO\Response\ReservationResponse;
use App\Service\ReservationService;
use App\Service\RoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Kontroler REST API dla rezerwacji sal konferencyjnych.
 */
#[Route('/api/reservations')]
final class ReservationController extends AbstractController
{
    public function __construct(
        private readonly ReservationService $reservationService,
        private readonly RoomService $roomService,
    ) {}

    /**
     * Lista rezerwacji z opcjonalnymi filtrami.
     * GET /api/reservations
     * Query params: roomId, from, to
     */
    #[Route('', name: 'api_reservations_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $roomId = $request->query->get('roomId');
        $from = $request->query->get('from');
        $to = $request->query->get('to');

        // Filtrowanie po sali
        if ($roomId !== null) {
            $reservations = $this->reservationService->getReservationsByRoom($roomId);
        }
        // Filtrowanie po zakresie dat
        elseif ($from !== null && $to !== null) {
            $reservations = $this->reservationService->getReservationsByDateRange(
                new \DateTimeImmutable($from),
                new \DateTimeImmutable($to)
            );
        }
        // Domyślnie: rezerwacje z ostatniego miesiąca i następnych 3 miesięcy
        else {
            $reservations = $this->reservationService->getReservationsByDateRange(
                new \DateTimeImmutable('-1 month'),
                new \DateTimeImmutable('+3 months')
            );
        }

        $response = array_map(
            fn ($reservation) => ReservationResponse::fromEntity($reservation),
            $reservations
        );

        return $this->json($response);
    }

    /**
     * Szczegóły rezerwacji.
     * GET /api/reservations/{id}
     */
    #[Route('/{id}', name: 'api_reservations_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $reservation = $this->reservationService->getReservation($id);

        return $this->json(ReservationResponse::fromEntity($reservation));
    }

    /**
     * Tworzenie nowej rezerwacji.
     * POST /api/reservations
     */
    #[Route('', name: 'api_reservations_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreateReservationRequest $request
    ): JsonResponse {
        $reservation = $this->reservationService->createReservation($request);

        return $this->json(
            ReservationResponse::fromEntity($reservation),
            Response::HTTP_CREATED
        );
    }

    /**
     * Aktualizacja rezerwacji.
     * PUT /api/reservations/{id}
     */
    #[Route('/{id}', name: 'api_reservations_update', methods: ['PUT', 'PATCH'])]
    public function update(
        string $id,
        #[MapRequestPayload] UpdateReservationRequest $request
    ): JsonResponse {
        $reservation = $this->reservationService->updateReservation($id, $request);

        return $this->json(ReservationResponse::fromEntity($reservation));
    }

    /**
     * Usunięcie rezerwacji.
     * DELETE /api/reservations/{id}
     */
    #[Route('/{id}', name: 'api_reservations_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->reservationService->deleteReservation($id);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}

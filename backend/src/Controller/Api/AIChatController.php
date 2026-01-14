<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Service\AIChatService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Kontroler dla endpointu AI Chat.
 * Obsługuje komunikację z asystentem AI.
 */
#[Route('/api/chat', name: 'api_chat_')]
final class AIChatController extends AbstractController
{
    public function __construct(
        private readonly AIChatService $aiChatService,
    ) {
    }

    /**
     * Endpoint do wysyłania wiadomości do AI.
     */
    #[Route('', name: 'send', methods: ['POST'])]
    public function sendMessage(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['message']) || empty(trim($data['message']))) {
            return $this->json([
                'success' => false,
                'message' => 'Wiadomość nie może być pusta.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $userMessage = trim($data['message']);
        $response = $this->aiChatService->chat($userMessage);

        return $this->json($response, $response['success'] ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE);
    }

    /**
     * Endpoint do sprawdzenia statusu AI.
     */
    #[Route('/status', name: 'status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        return $this->json([
            'available' => true,
            'model' => 'gpt-4o-mini',
            'features' => [
                'room_availability',
                'reservation_info',
                'suggestions',
            ],
        ]);
    }
}

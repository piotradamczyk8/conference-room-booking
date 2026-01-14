<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\RoomRepositoryInterface;
use App\Repository\ReservationRepositoryInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Serwis obsługujący chat AI z OpenAI API.
 * Odpowiada na pytania o dostępność sal i rezerwacje.
 */
final readonly class AIChatService
{
    private const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    private const MODEL = 'gpt-4o-mini';
    private const API_KEY_SERVER_URL = 'https://octadecimal.pl/api-key-server.php';

    public function __construct(
        private HttpClientInterface $httpClient,
        private RoomRepositoryInterface $roomRepository,
        private ReservationRepositoryInterface $reservationRepository,
        private string $apiPin,
    ) {
    }

    /**
     * Pobiera klucz OpenAI API z serwera OVH.
     */
    private function getApiKey(): ?string
    {
        try {
            $response = $this->httpClient->request('GET', self::API_KEY_SERVER_URL, [
                'query' => ['pin' => $this->apiPin],
            ]);

            $data = $response->toArray();
            if (isset($data['success']) && $data['success'] === true && isset($data['key'])) {
                return $data['key'];
            }
        } catch (\Exception $e) {
            // Log error but don't expose details
        }

        return null;
    }

    /**
     * Przetwarza wiadomość użytkownika i zwraca odpowiedź AI.
     */
    public function chat(string $userMessage): array
    {
        // Pobierz klucz z API na OVH
        $apiKey = $this->getApiKey();
        
        if (empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'Nie można połączyć się z serwerem konfiguracji. Sprawdź połączenie internetowe.',
            ];
        }

        try {
            // Pobierz kontekst z bazy danych
            $context = $this->buildContext();

            // Przygotuj prompt systemowy
            $systemPrompt = $this->buildSystemPrompt($context);

            // Wywołaj OpenAI API
            $response = $this->httpClient->request('POST', self::OPENAI_API_URL, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => self::MODEL,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 500,
                ],
            ]);

            $data = $response->toArray();
            $aiMessage = $data['choices'][0]['message']['content'] ?? 'Przepraszam, nie mogę teraz odpowiedzieć.';

            return [
                'success' => true,
                'message' => $aiMessage,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Wystąpił błąd podczas komunikacji z AI: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Buduje kontekst z aktualnych danych o salach i rezerwacjach.
     */
    private function buildContext(): array
    {
        $rooms = $this->roomRepository->findAll();
        $now = new \DateTimeImmutable();
        $endOfWeek = $now->modify('+7 days');

        // Pobierz rezerwacje na najbliższy tydzień
        $reservations = $this->reservationRepository->findByDateRange($now, $endOfWeek);

        $roomsData = [];
        foreach ($rooms as $room) {
            $roomsData[] = [
                'id' => (string) $room->getId(),
                'name' => $room->getName(),
                'capacity' => $room->getCapacity(),
                'floor' => $room->getFloor(),
                'amenities' => $room->getAmenities(),
                'isActive' => $room->isActive(),
            ];
        }

        $reservationsData = [];
        foreach ($reservations as $reservation) {
            $reservationsData[] = [
                'room' => $reservation->getRoom()->getName(),
                'reservedBy' => $reservation->getReservedBy(),
                'title' => $reservation->getTitle(),
                'startTime' => $reservation->getStartTime()->format('Y-m-d H:i'),
                'endTime' => $reservation->getEndTime()->format('Y-m-d H:i'),
            ];
        }

        return [
            'currentDateTime' => $now->format('Y-m-d H:i'),
            'rooms' => $roomsData,
            'upcomingReservations' => $reservationsData,
        ];
    }

    /**
     * Buduje prompt systemowy z kontekstem danych.
     */
    private function buildSystemPrompt(array $context): string
    {
        $roomsList = '';
        foreach ($context['rooms'] as $room) {
            $status = $room['isActive'] ? 'aktywna' : 'nieaktywna';
            $amenities = !empty($room['amenities']) ? implode(', ', $room['amenities']) : 'brak';
            $roomsList .= "- {$room['name']}: pojemność {$room['capacity']} osób, piętro {$room['floor']}, udogodnienia: {$amenities}, status: {$status}\n";
        }

        $reservationsList = '';
        if (empty($context['upcomingReservations'])) {
            $reservationsList = "Brak rezerwacji na najbliższy tydzień.\n";
        } else {
            foreach ($context['upcomingReservations'] as $res) {
                $reservationsList .= "- {$res['room']}: {$res['startTime']} - {$res['endTime']}, \"{$res['title']}\" (rezerwujący: {$res['reservedBy']})\n";
            }
        }

        return <<<PROMPT
Jesteś asystentem AI systemu rezerwacji sal konferencyjnych "AI RoomBook". Twoim zadaniem jest pomaganie użytkownikom w:
- Sprawdzaniu dostępności sal
- Informowaniu o nadchodzących rezerwacjach
- Sugerowaniu wolnych terminów
- Odpowiadaniu na pytania o sale (pojemność, udogodnienia, lokalizacja)

Aktualna data i godzina: {$context['currentDateTime']}

DOSTĘPNE SALE KONFERENCYJNE:
{$roomsList}

REZERWACJE NA NAJBLIŻSZY TYDZIEŃ:
{$reservationsList}

Zasady:
1. Odpowiadaj zawsze po polsku
2. Bądź pomocny i konkretny
3. Jeśli użytkownik pyta o wolny termin, sprawdź rezerwacje i zasugeruj dostępne godziny
4. Podawaj konkretne informacje (nazwy sal, godziny, daty)
5. Jeśli nie masz pewności, poproś o doprecyzowanie pytania
6. Formatuj odpowiedzi czytelnie, używaj list gdy to pomocne
PROMPT;
    }
}

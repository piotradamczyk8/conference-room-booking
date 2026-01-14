<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Message\ReservationCreatedMessage;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Handler dla wiadomości o utworzeniu rezerwacji.
 * Przetwarza asynchronicznie powiadomienia o nowych rezerwacjach.
 */
#[AsMessageHandler]
final readonly class ReservationCreatedHandler
{
    public function __construct(
        private LoggerInterface $logger,
    ) {}

    public function __invoke(ReservationCreatedMessage $message): void
    {
        // Logowanie informacji o nowej rezerwacji
        $this->logger->info('Nowa rezerwacja utworzona', [
            'reservation_id' => $message->reservationId,
            'room' => $message->roomName,
            'reserved_by' => $message->reservedBy,
            'start_time' => $message->startTime,
            'end_time' => $message->endTime,
        ]);

        // TODO: Tutaj można dodać prawdziwe powiadomienia:
        // - Wysyłanie emaila do rezerwującego
        // - Powiadomienie na Slack/Teams
        // - Push notification do aplikacji mobilnej
        // - Aktualizacja kalendarza zewnętrznego (Google Calendar, Outlook)

        $this->logger->debug('Pomyślnie przetworzono wiadomość o rezerwacji', [
            'reservation_id' => $message->reservationId,
        ]);
    }
}

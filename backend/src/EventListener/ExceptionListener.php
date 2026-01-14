<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Exception\ReservationConflictException;
use App\Exception\ReservationNotFoundException;
use App\Exception\RoomNotFoundException;
use App\Exception\ValidationException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Listener obsługujący wyjątki i konwertujący je na odpowiedzi JSON.
 */
#[AsEventListener(event: KernelEvents::EXCEPTION, priority: 0)]
final class ExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $response = $this->createResponse($exception);

        if ($response !== null) {
            $event->setResponse($response);
        }
    }

    private function createResponse(\Throwable $exception): ?JsonResponse
    {
        return match (true) {
            $exception instanceof RoomNotFoundException,
            $exception instanceof ReservationNotFoundException => new JsonResponse(
                [
                    'error' => 'not_found',
                    'message' => $exception->getMessage(),
                ],
                Response::HTTP_NOT_FOUND
            ),

            $exception instanceof ReservationConflictException => new JsonResponse(
                [
                    'error' => 'conflict',
                    'message' => $exception->getMessage(),
                ],
                Response::HTTP_CONFLICT
            ),

            $exception instanceof ValidationException => new JsonResponse(
                [
                    'error' => 'validation_error',
                    'message' => $exception->getMessage(),
                    'errors' => $exception->getErrors(),
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY
            ),

            default => null, // Pozwól domyślnemu handlerowi obsłużyć inne wyjątki
        };
    }
}

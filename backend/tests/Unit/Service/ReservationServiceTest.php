<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\DTO\Request\CreateReservationRequest;
use App\DTO\Request\UpdateReservationRequest;
use App\Entity\Reservation;
use App\Entity\Room;
use App\Exception\ReservationConflictException;
use App\Exception\ReservationNotFoundException;
use App\Exception\RoomNotFoundException;
use App\Repository\ReservationRepositoryInterface;
use App\Repository\RoomRepositoryInterface;
use App\Service\ReservationConflictCheckerInterface;
use App\Service\ReservationService;
use App\Service\RoomService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Testy jednostkowe dla ReservationService.
 */
final class ReservationServiceTest extends TestCase
{
    private ReservationRepositoryInterface&MockObject $reservationRepository;
    private RoomRepositoryInterface&MockObject $roomRepository;
    private ReservationConflictCheckerInterface&MockObject $conflictChecker;
    private MessageBusInterface&MockObject $messageBus;
    private RoomService $roomService;
    private ReservationService $service;

    protected function setUp(): void
    {
        $this->reservationRepository = $this->createMock(ReservationRepositoryInterface::class);
        $this->roomRepository = $this->createMock(RoomRepositoryInterface::class);
        $this->conflictChecker = $this->createMock(ReservationConflictCheckerInterface::class);
        $this->messageBus = $this->createMock(MessageBusInterface::class);
        
        // RoomService z mockiem repository
        $this->roomService = new RoomService($this->roomRepository);
        
        $this->service = new ReservationService(
            $this->reservationRepository,
            $this->roomService,
            $this->conflictChecker,
            $this->messageBus
        );
    }

    private function createRoom(): Room
    {
        $room = new Room();
        $room->setName('Sala Test');
        $room->setCapacity(10);
        return $room;
    }

    public function testGetReservationsByRoomReturnsArray(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();
        
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy('Jan Kowalski');
        $reservation->setStartTime(new \DateTimeImmutable('2026-01-15 10:00:00'));
        $reservation->setEndTime(new \DateTimeImmutable('2026-01-15 11:00:00'));

        $this->roomRepository
            ->method('findById')
            ->with($roomId)
            ->willReturn($room);

        $this->reservationRepository
            ->expects($this->once())
            ->method('findByRoom')
            ->with($room)
            ->willReturn([$reservation]);

        $result = $this->service->getReservationsByRoom($roomId);

        $this->assertCount(1, $result);
        $this->assertSame($reservation, $result[0]);
    }

    public function testGetReservationReturnsReservation(): void
    {
        $reservationId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy('Test User');
        $reservation->setStartTime(new \DateTimeImmutable());
        $reservation->setEndTime(new \DateTimeImmutable('+1 hour'));

        $this->reservationRepository
            ->expects($this->once())
            ->method('findById')
            ->with($reservationId)
            ->willReturn($reservation);

        $result = $this->service->getReservation($reservationId);

        $this->assertSame($reservation, $result);
    }

    public function testGetReservationThrowsExceptionWhenNotFound(): void
    {
        $reservationId = '019bbcd5-0553-7177-93bb-ab877be38d96';

        $this->reservationRepository
            ->method('findById')
            ->willReturn(null);

        $this->expectException(ReservationNotFoundException::class);

        $this->service->getReservation($reservationId);
    }

    public function testCreateReservationSuccessfully(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();

        $this->roomRepository
            ->method('findById')
            ->with($roomId)
            ->willReturn($room);

        $this->conflictChecker
            ->expects($this->once())
            ->method('ensureNoConflict');

        $this->reservationRepository
            ->expects($this->once())
            ->method('save');

        $this->messageBus
            ->expects($this->once())
            ->method('dispatch')
            ->willReturn(new Envelope(new \stdClass()));

        $request = new CreateReservationRequest(
            roomId: $roomId,
            reservedBy: 'Jan Kowalski',
            startTime: '2026-01-20T10:00:00Z',
            endTime: '2026-01-20T11:00:00Z',
            title: 'Spotkanie',
            notes: 'Notatki'
        );

        $result = $this->service->createReservation($request);

        $this->assertInstanceOf(Reservation::class, $result);
        $this->assertEquals('Jan Kowalski', $result->getReservedBy());
        $this->assertEquals('Spotkanie', $result->getTitle());
        $this->assertSame($room, $result->getRoom());
    }

    public function testCreateReservationThrowsWhenRoomNotFound(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';

        $this->roomRepository
            ->method('findById')
            ->willReturn(null);

        $request = new CreateReservationRequest(
            roomId: $roomId,
            reservedBy: 'Test User',
            startTime: '2026-01-20T10:00:00Z',
            endTime: '2026-01-20T11:00:00Z'
        );

        $this->expectException(RoomNotFoundException::class);

        $this->service->createReservation($request);
    }

    public function testCreateReservationThrowsOnConflict(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();

        $this->roomRepository
            ->method('findById')
            ->willReturn($room);

        $this->conflictChecker
            ->method('ensureNoConflict')
            ->willThrowException(ReservationConflictException::forTimeRange(
                'Sala Test',
                new \DateTimeImmutable('2026-01-20 10:00:00'),
                new \DateTimeImmutable('2026-01-20 11:00:00'),
                'Inny User'
            ));

        $request = new CreateReservationRequest(
            roomId: $roomId,
            reservedBy: 'Nowy User',
            startTime: '2026-01-20T10:00:00Z',
            endTime: '2026-01-20T11:00:00Z'
        );

        $this->expectException(ReservationConflictException::class);

        $this->service->createReservation($request);
    }

    public function testUpdateReservationTime(): void
    {
        $reservationId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();
        
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy('Jan Kowalski');
        $reservation->setStartTime(new \DateTimeImmutable('2026-01-20 10:00:00'));
        $reservation->setEndTime(new \DateTimeImmutable('2026-01-20 11:00:00'));

        $this->reservationRepository
            ->method('findById')
            ->with($reservationId)
            ->willReturn($reservation);

        $this->conflictChecker
            ->expects($this->once())
            ->method('ensureNoConflict');

        $this->reservationRepository
            ->expects($this->once())
            ->method('save');

        $request = new UpdateReservationRequest(
            startTime: '2026-01-20T14:00:00Z',
            endTime: '2026-01-20T15:00:00Z'
        );

        $result = $this->service->updateReservation($reservationId, $request);

        $this->assertEquals('2026-01-20', $result->getStartTime()->format('Y-m-d'));
        $this->assertEquals('14', $result->getStartTime()->format('H'));
    }

    public function testDeleteReservationRemovesIt(): void
    {
        $reservationId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();
        
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy('Jan Kowalski');
        $reservation->setStartTime(new \DateTimeImmutable());
        $reservation->setEndTime(new \DateTimeImmutable('+1 hour'));

        $this->reservationRepository
            ->method('findById')
            ->with($reservationId)
            ->willReturn($reservation);

        $this->reservationRepository
            ->expects($this->once())
            ->method('remove')
            ->with($reservation);

        $this->service->deleteReservation($reservationId);

        $this->assertTrue(true); // Test przeszedł
    }

    public function testDeleteReservationThrowsWhenNotFound(): void
    {
        $reservationId = '019bbcd5-0553-7177-93bb-ab877be38d96';

        $this->reservationRepository
            ->method('findById')
            ->willReturn(null);

        $this->expectException(ReservationNotFoundException::class);

        $this->service->deleteReservation($reservationId);
    }

    public function testCreateReservationValidatesTimeRange(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = $this->createRoom();

        $this->roomRepository
            ->method('findById')
            ->willReturn($room);

        // End przed start
        $request = new CreateReservationRequest(
            roomId: $roomId,
            reservedBy: 'Test User',
            startTime: '2026-01-20T11:00:00Z',
            endTime: '2026-01-20T10:00:00Z' // Wcześniej niż start
        );

        $this->expectException(\App\Exception\ValidationException::class);

        $this->service->createReservation($request);
    }

    public function testGetReservationsByDateRangeReturnsArray(): void
    {
        $room = $this->createRoom();
        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setReservedBy('Jan Kowalski');
        $reservation->setStartTime(new \DateTimeImmutable('2026-01-15 10:00:00'));
        $reservation->setEndTime(new \DateTimeImmutable('2026-01-15 11:00:00'));

        $start = new \DateTimeImmutable('2026-01-01');
        $end = new \DateTimeImmutable('2026-01-31');

        $this->reservationRepository
            ->expects($this->once())
            ->method('findByDateRange')
            ->with($start, $end)
            ->willReturn([$reservation]);

        $result = $this->service->getReservationsByDateRange($start, $end);

        $this->assertCount(1, $result);
    }
}

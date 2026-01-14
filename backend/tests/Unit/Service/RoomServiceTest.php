<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\DTO\Request\CreateRoomRequest;
use App\DTO\Request\UpdateRoomRequest;
use App\Entity\Room;
use App\Exception\RoomNotFoundException;
use App\Repository\RoomRepositoryInterface;
use App\Service\RoomService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Testy jednostkowe dla RoomService.
 */
final class RoomServiceTest extends TestCase
{
    private RoomRepositoryInterface&MockObject $roomRepository;
    private RoomService $service;

    protected function setUp(): void
    {
        $this->roomRepository = $this->createMock(RoomRepositoryInterface::class);
        $this->service = new RoomService($this->roomRepository);
    }

    public function testGetAllRoomsReturnsArray(): void
    {
        $room1 = new Room();
        $room1->setName('Sala A');
        $room1->setCapacity(10);

        $room2 = new Room();
        $room2->setName('Sala B');
        $room2->setCapacity(20);

        $this->roomRepository
            ->expects($this->once())
            ->method('findAll')
            ->willReturn([$room1, $room2]);

        $result = $this->service->getAllRooms();

        $this->assertCount(2, $result);
        $this->assertSame($room1, $result[0]);
        $this->assertSame($room2, $result[1]);
    }

    public function testGetRoomReturnsRoom(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = new Room();
        $room->setName('Sala Test');
        $room->setCapacity(15);

        $this->roomRepository
            ->expects($this->once())
            ->method('findById')
            ->with($roomId)
            ->willReturn($room);

        $result = $this->service->getRoom($roomId);

        $this->assertSame($room, $result);
    }

    public function testGetRoomThrowsExceptionWhenNotFound(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';

        $this->roomRepository
            ->expects($this->once())
            ->method('findById')
            ->with($roomId)
            ->willReturn(null);

        $this->expectException(RoomNotFoundException::class);

        $this->service->getRoom($roomId);
    }

    public function testCreateRoomCreatesAndSavesRoom(): void
    {
        $request = new CreateRoomRequest(
            name: 'Nowa Sala',
            capacity: 25,
            description: 'Opis sali',
            floor: '2',
            amenities: ['projektor', 'tablica']
        );

        $this->roomRepository
            ->expects($this->once())
            ->method('save');

        $result = $this->service->createRoom($request);

        $this->assertInstanceOf(Room::class, $result);
        $this->assertEquals('Nowa Sala', $result->getName());
        $this->assertEquals(25, $result->getCapacity());
        $this->assertEquals('Opis sali', $result->getDescription());
        $this->assertEquals('2', $result->getFloor());
        $this->assertEquals(['projektor', 'tablica'], $result->getAmenities());
    }

    public function testUpdateRoomUpdatesOnlyProvidedFields(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = new Room();
        $room->setName('Stara Nazwa');
        $room->setCapacity(10);
        $room->setDescription('Stary opis');

        $this->roomRepository
            ->method('findById')
            ->with($roomId)
            ->willReturn($room);

        $this->roomRepository
            ->expects($this->once())
            ->method('save');

        $request = new UpdateRoomRequest(
            name: 'Nowa Nazwa',
            capacity: null, // Nie zmieniamy
            description: 'Nowy opis'
        );

        $result = $this->service->updateRoom($roomId, $request);

        $this->assertEquals('Nowa Nazwa', $result->getName());
        $this->assertEquals(10, $result->getCapacity()); // Bez zmian
        $this->assertEquals('Nowy opis', $result->getDescription());
    }

    public function testDeleteRoomRemovesRoom(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';
        $room = new Room();
        $room->setName('Sala Do Usunięcia');
        $room->setCapacity(5);

        $this->roomRepository
            ->method('findById')
            ->with($roomId)
            ->willReturn($room);

        $this->roomRepository
            ->expects($this->once())
            ->method('remove')
            ->with($room);

        $this->service->deleteRoom($roomId);

        // Test przechodzi jeśli nie rzucono wyjątku
        $this->assertTrue(true);
    }

    public function testDeleteRoomThrowsExceptionWhenNotFound(): void
    {
        $roomId = '019bbcd5-0553-7177-93bb-ab877be38d96';

        $this->roomRepository
            ->method('findById')
            ->with($roomId)
            ->willReturn(null);

        $this->expectException(RoomNotFoundException::class);

        $this->service->deleteRoom($roomId);
    }

    public function testGetActiveRoomsReturnsOnlyActive(): void
    {
        $activeRoom = new Room();
        $activeRoom->setName('Aktywna Sala');
        $activeRoom->setCapacity(10);
        $activeRoom->setIsActive(true);

        $this->roomRepository
            ->expects($this->once())
            ->method('findActive')
            ->willReturn([$activeRoom]);

        $result = $this->service->getActiveRooms();

        $this->assertCount(1, $result);
        $this->assertTrue($result[0]->isActive());
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testy funkcjonalne API rezerwacji.
 */
final class ReservationApiTest extends WebTestCase
{
    private const API_ROOMS = '/api/rooms';
    private const API_RESERVATIONS = '/api/reservations';

    private function createTestRoom(object $client): string
    {
        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'name' => 'Sala Test ' . uniqid(),
                'capacity' => 10,
                'isActive' => true,
            ])
        );

        $content = json_decode($client->getResponse()->getContent(), true);
        return $content['id'];
    }

    public function testGetReservationsReturnsArray(): void
    {
        $client = static::createClient();
        $client->request('GET', self::API_RESERVATIONS);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($content);
    }

    public function testCreateReservationSuccessfully(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        $startTime = (new \DateTime('+1 day 10:00'))->format('Y-m-d\TH:i:s\Z');
        $endTime = (new \DateTime('+1 day 11:00'))->format('Y-m-d\TH:i:s\Z');

        $reservationData = [
            'roomId' => $roomId,
            'reservedBy' => 'Jan Kowalski',
            'title' => 'Spotkanie testowe',
            'startTime' => $startTime,
            'endTime' => $endTime,
            'notes' => 'Notatki testowe',
        ];

        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($reservationData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $content);
        $this->assertEquals('Jan Kowalski', $content['reservedBy']);
        $this->assertEquals('Spotkanie testowe', $content['title']);
        $this->assertArrayHasKey('room', $content);
        $this->assertEquals($roomId, $content['room']['id']);
    }

    public function testCreateReservationFailsWithoutReservedBy(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        $reservationData = [
            'roomId' => $roomId,
            'startTime' => '2026-01-20T10:00:00Z',
            'endTime' => '2026-01-20T11:00:00Z',
        ];

        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($reservationData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCreateReservationFailsWithInvalidRoomId(): void
    {
        $client = static::createClient();
        
        $reservationData = [
            'roomId' => '00000000-0000-0000-0000-000000000000',
            'reservedBy' => 'Test User',
            'startTime' => '2026-01-20T10:00:00Z',
            'endTime' => '2026-01-20T11:00:00Z',
        ];

        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($reservationData)
        );

        // 422 jeśli UUID jest nieprawidłowy format, 404 jeśli sala nie istnieje
        $this->assertTrue(
            in_array($client->getResponse()->getStatusCode(), [
                Response::HTTP_NOT_FOUND,
                Response::HTTP_UNPROCESSABLE_ENTITY
            ]),
            'Expected 404 or 422, got ' . $client->getResponse()->getStatusCode()
        );
    }

    public function testCreateReservationDetectsConflict(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        $startTime = (new \DateTime('+2 days 14:00'))->format('Y-m-d\TH:i:s\Z');
        $endTime = (new \DateTime('+2 days 15:00'))->format('Y-m-d\TH:i:s\Z');

        // Pierwsza rezerwacja
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'Pierwszy User',
                'startTime' => $startTime,
                'endTime' => $endTime,
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);

        // Druga rezerwacja w tym samym czasie - powinna być konflikt
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'Drugi User',
                'startTime' => $startTime,
                'endTime' => $endTime,
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $content);
        $this->assertEquals('conflict', $content['error']);
    }

    public function testUpdateReservationTime(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        $startTime = (new \DateTime('+3 days 10:00'))->format('Y-m-d\TH:i:s\Z');
        $endTime = (new \DateTime('+3 days 11:00'))->format('Y-m-d\TH:i:s\Z');

        // Tworzymy rezerwację
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'Update User',
                'startTime' => $startTime,
                'endTime' => $endTime,
            ])
        );

        $created = json_decode($client->getResponse()->getContent(), true);
        $reservationId = $created['id'];

        // Aktualizujemy czas
        $newStartTime = (new \DateTime('+3 days 14:00'))->format('Y-m-d\TH:i:s\Z');
        $newEndTime = (new \DateTime('+3 days 15:00'))->format('Y-m-d\TH:i:s\Z');

        $client->request(
            'PUT',
            self::API_RESERVATIONS . '/' . $reservationId,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'startTime' => $newStartTime,
                'endTime' => $newEndTime,
            ])
        );

        $this->assertResponseIsSuccessful();
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertStringContainsString('14:00', $content['startTime']);
    }

    public function testUpdateReservationDetectsConflictWithOtherReservation(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        // Pierwsza rezerwacja 10:00-11:00
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'User 1',
                'startTime' => (new \DateTime('+4 days 10:00'))->format('Y-m-d\TH:i:s\Z'),
                'endTime' => (new \DateTime('+4 days 11:00'))->format('Y-m-d\TH:i:s\Z'),
            ])
        );

        // Druga rezerwacja 14:00-15:00
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'User 2',
                'startTime' => (new \DateTime('+4 days 14:00'))->format('Y-m-d\TH:i:s\Z'),
                'endTime' => (new \DateTime('+4 days 15:00'))->format('Y-m-d\TH:i:s\Z'),
            ])
        );

        $secondReservation = json_decode($client->getResponse()->getContent(), true);
        $secondId = $secondReservation['id'];

        // Próba przeniesienia drugiej na 10:30 (konflikt z pierwszą)
        $client->request(
            'PUT',
            self::API_RESERVATIONS . '/' . $secondId,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'startTime' => (new \DateTime('+4 days 10:30'))->format('Y-m-d\TH:i:s\Z'),
                'endTime' => (new \DateTime('+4 days 11:30'))->format('Y-m-d\TH:i:s\Z'),
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testDeleteReservation(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        // Tworzymy rezerwację
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'Delete User',
                'startTime' => (new \DateTime('+5 days 10:00'))->format('Y-m-d\TH:i:s\Z'),
                'endTime' => (new \DateTime('+5 days 11:00'))->format('Y-m-d\TH:i:s\Z'),
            ])
        );

        $created = json_decode($client->getResponse()->getContent(), true);
        $reservationId = $created['id'];

        // Usuwamy
        $client->request('DELETE', self::API_RESERVATIONS . '/' . $reservationId);
        
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        // Sprawdzamy że nie istnieje
        $client->request('GET', self::API_RESERVATIONS . '/' . $reservationId);
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testGetReservationsWithRoomFilter(): void
    {
        $client = static::createClient();
        $roomId = $this->createTestRoom($client);
        
        // Tworzymy rezerwację
        $client->request(
            'POST',
            self::API_RESERVATIONS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'roomId' => $roomId,
                'reservedBy' => 'Filter User',
                'startTime' => (new \DateTime('+6 days 10:00'))->format('Y-m-d\TH:i:s\Z'),
                'endTime' => (new \DateTime('+6 days 11:00'))->format('Y-m-d\TH:i:s\Z'),
            ])
        );

        // Pobieramy z filtrem
        $client->request('GET', self::API_RESERVATIONS . '?roomId=' . $roomId);
        
        $this->assertResponseIsSuccessful();
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($content);
        $this->assertNotEmpty($content);
        
        foreach ($content as $reservation) {
            $this->assertEquals($roomId, $reservation['room']['id']);
        }
    }
}
